"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { findAiKeywords } from "../lib/ai-keywords";
import { USAJOBS_JOB_CATEGORY_CODES_BY_SECTOR } from "../lib/usajobs-sector-map";

interface SearchItem {
  title?: string;
  agency?: string;
  url?: string;
  matchText: string;
}

async function fetchUSAJobs(
  authKey: string,
  userAgent: string,
  categoryCodes: string[],
  days: number
): Promise<SearchItem[]> {
  const items: SearchItem[] = [];
  
  for (const code of categoryCodes) {
    const url = new URL("https://data.usajobs.gov/api/search");
    url.searchParams.set("JobCategoryCode", code);
    url.searchParams.set("DatePosted", String(days));
    url.searchParams.set("ResultsPerPage", "250");
    url.searchParams.set("Page", "1");
    url.searchParams.set("Fields", "Full");

    const resp = await fetch(url.toString(), {
      headers: {
        Host: "data.usajobs.gov",
        "User-Agent": userAgent,
        "Authorization-Key": authKey,
        Accept: "application/json",
      },
    });

    if (!resp.ok) continue;

    const json = await resp.json();
    const results = json?.SearchResult?.SearchResultItems ?? [];

    for (const raw of results) {
      const mod = raw?.MatchedObjectDescriptor ?? raw ?? {};
      const userArea = mod?.UserArea ?? {};
      const details = userArea?.Details ?? {};

      const pieces: string[] = [];
      if (mod?.PositionTitle) pieces.push(String(mod.PositionTitle));
      if (mod?.QualificationSummary) pieces.push(String(mod.QualificationSummary));
      if (details?.MajorDuties) pieces.push(String(details.MajorDuties));
      if (details?.Requirements) pieces.push(String(details.Requirements));

      items.push({
        title: mod?.PositionTitle ? String(mod.PositionTitle) : undefined,
        agency: mod?.OrganizationName ? String(mod.OrganizationName) : undefined,
        url: mod?.PositionURI ? String(mod.PositionURI) : undefined,
        matchText: pieces.join("\n"),
      });
    }
  }

  return items;
}

// Fetch and store daily USAJOBS AI skill snapshot
export const fetchAiSkillSnapshot = internalAction({
  args: {},
  handler: async (ctx) => {
    const authKey = process.env.USAJOBS_AUTH_KEY;
    const userAgent = process.env.USAJOBS_USER_AGENT;

    if (!authKey || !userAgent) {
      console.log("USAJOBS credentials not configured, skipping fetch");
      return { status: "skipped", reason: "no credentials" };
    }

    const today = new Date().toISOString().split("T")[0]; // "2026-01-19"
    const days = 14; // Look back 14 days
    const snapshots: Array<{
      date: string;
      sector: string;
      total: number;
      aiCount: number;
      aiShare: number | null;
      topKeywords: Array<{ keyword: string; count: number }>;
      examples: Array<{ title: string; agency?: string; url?: string; matchedKeywords: string[] }>;
    }> = [];

    for (const [sector, codes] of Object.entries(USAJOBS_JOB_CATEGORY_CODES_BY_SECTOR)) {
      try {
        const items = await fetchUSAJobs(authKey, userAgent, codes, days);
        
        const keywordCounts = new Map<string, number>();
        const examples: Array<{ title: string; agency?: string; url?: string; matchedKeywords: string[] }> = [];
        let aiCount = 0;

        for (const item of items) {
          const keywords = findAiKeywords(item.matchText);
          if (keywords.length === 0) continue;

          aiCount++;
          for (const kw of keywords) {
            keywordCounts.set(kw, (keywordCounts.get(kw) ?? 0) + 1);
          }

          if (examples.length < 5 && item.title) {
            examples.push({
              title: item.title,
              agency: item.agency,
              url: item.url,
              matchedKeywords: keywords.slice(0, 3),
            });
          }
        }

        const total = items.length;
        const topKeywords = Array.from(keywordCounts.entries())
          .map(([keyword, count]) => ({ keyword, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        snapshots.push({
          date: today,
          sector,
          total,
          aiCount,
          aiShare: total >= 20 ? aiCount / total : null,
          topKeywords,
          examples,
        });

        // Rate limit - be nice to the API
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.error(`Error fetching ${sector}:`, e);
      }
    }

    // Store all snapshots
    await ctx.runMutation(internal.usajobsMutations.storeAiSkillSnapshots, {
      snapshots,
    });

    await ctx.runMutation(internal.usajobsMutations.updateMetadata, {
      key: "aiSkillsLastUpdated",
      value: new Date().toISOString(),
    });

    return { status: "success", sectors: snapshots.length, date: today };
  },
});
