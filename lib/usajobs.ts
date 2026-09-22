import { z } from "zod";
import { findAiKeywords } from "./ai-keywords";
import type { FederalGroup } from "./federal";

const detailsSchema = z
  .object({
    MajorDuties: z.union([z.string(), z.array(z.string())]).optional(),
    MajorDutiesList: z.array(z.string()).optional(),
    Requirements: z.string().optional(),
    RequirementsSummary: z.string().optional(),
    KeyRequirements: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .passthrough();
const responseSchema = z.object({
  SearchResult: z.object({
    SearchResultCountAll: z.coerce.number().int().nonnegative(),
    SearchResultItems: z.array(
      z.object({
        MatchedObjectId: z.string().min(1),
        MatchedObjectDescriptor: z.object({
          PositionTitle: z.string(),
          OrganizationName: z.string(),
          PositionURI: z.string().url(),
          QualificationSummary: z.string().optional(),
          PositionCategory: z
            .array(z.object({ Code: z.string(), Name: z.string().optional() }))
            .optional()
            .default([]),
          UserArea: z.object({ Details: detailsSchema.optional() }).optional(),
        }),
      }),
    ),
  }),
});

export interface Announcement {
  id: string;
  title: string;
  agency: string;
  url: string;
  occupations: Array<{ code: string; label: string }>;
  text: string;
}
export interface Collection {
  items: Announcement[];
  available: number;
  complete: boolean;
  reason?: string;
}

async function fetchPage(
  url: URL,
  headers: Record<string, string>,
  deadline: number,
): Promise<unknown> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      throw new Error("USAJOBS collection exceeded its time limit");
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(Math.min(20_000, remaining)),
    });
    if (response.ok) return response.json();
    if ((response.status !== 429 && response.status < 500) || attempt === 2) {
      throw new Error(`USAJOBS request failed (${response.status})`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }
  throw new Error("USAJOBS request failed");
}

export async function collectAnnouncements(args: {
  authorizationKey: string;
  userAgent: string;
  days: number;
  maxPages?: number;
}): Promise<Collection> {
  const maxPages = Math.max(1, Math.min(args.maxPages ?? 20, 20));
  const deadline = Date.now() + 180_000;
  const items = new Map<string, Announcement>();
  let available: number | undefined;
  for (let page = 1; page <= maxPages; page++) {
    const url = new URL("https://data.usajobs.gov/api/search");
    url.search = new URLSearchParams({
      DatePosted: String(args.days),
      ResultsPerPage: "500",
      Page: String(page),
      Fields: "Full",
      SortField: "opendate",
      SortDirection: "Desc",
    }).toString();
    const result = responseSchema.parse(
      await fetchPage(
        url,
        {
          Host: "data.usajobs.gov",
          "User-Agent": args.userAgent,
          "Authorization-Key": args.authorizationKey,
          Accept: "application/json",
        },
        deadline,
      ),
    ).SearchResult;
    if (available !== undefined && available !== result.SearchResultCountAll) {
      return {
        items: [...items.values()],
        available: result.SearchResultCountAll,
        complete: false,
        reason: "The result count changed during collection.",
      };
    }
    available = result.SearchResultCountAll;
    for (const raw of result.SearchResultItems) {
      const item = raw.MatchedObjectDescriptor;
      const parsedUrl = new URL(item.PositionURI);
      if (
        parsedUrl.protocol !== "https:" ||
        !["www.usajobs.gov", "usajobs.gov"].includes(parsedUrl.hostname)
      ) {
        throw new Error("Unexpected announcement URL");
      }
      const details = item.UserArea?.Details;
      const text = [
        item.PositionTitle,
        item.QualificationSummary,
        details?.MajorDuties,
        details?.MajorDutiesList,
        details?.Requirements,
        details?.RequirementsSummary,
        details?.KeyRequirements,
      ]
        .flat()
        .filter(Boolean)
        .join("\n");
      const occupations = item.PositionCategory.map((category) => ({
        code: category.Code,
        label: category.Name || `Occupational series ${category.Code}`,
      }));
      const existing = items.get(raw.MatchedObjectId);
      if (existing) {
        existing.occupations = [
          ...new Map(
            [...existing.occupations, ...occupations].map((o) => [o.code, o]),
          ).values(),
        ];
      } else {
        items.set(raw.MatchedObjectId, {
          id: raw.MatchedObjectId,
          title: item.PositionTitle,
          agency: item.OrganizationName,
          url: parsedUrl.href,
          occupations,
          text,
        });
      }
    }
    if (items.size === available)
      return { items: [...items.values()], available, complete: true };
    if (items.size > available || result.SearchResultItems.length < 500) {
      return {
        items: [...items.values()],
        available,
        complete: false,
        reason:
          "The unique announcement count does not match the available count.",
      };
    }
  }
  return {
    items: [...items.values()],
    available: available ?? 0,
    complete: false,
    reason: "The collection reached its page limit.",
  };
}

export function summarizeAnnouncements(
  announcements: Announcement[],
): FederalGroup[] {
  const unique = new Map<string, Announcement>();
  for (const item of announcements) {
    const previous = unique.get(item.id);
    unique.set(
      item.id,
      previous
        ? {
            ...previous,
            occupations: [
              ...new Map(
                [...previous.occupations, ...item.occupations].map((o) => [
                  o.code,
                  o,
                ]),
              ).values(),
            ],
          }
        : item,
    );
  }
  const groups = new Map<string, { label: string; items: Announcement[] }>([
    [
      "all",
      { label: "All federal announcements", items: [...unique.values()] },
    ],
  ]);
  for (const item of unique.values()) {
    const occupations = item.occupations.length
      ? item.occupations
      : [{ code: "unspecified", label: "Occupation not specified" }];
    for (const occupation of new Map(
      occupations.map((o) => [o.code, o]),
    ).values()) {
      const group = groups.get(occupation.code) ?? {
        label: occupation.label,
        items: [],
      };
      group.items.push(item);
      groups.set(occupation.code, group);
    }
  }
  return [...groups]
    .map(([code, group]) => {
      const matched = group.items
        .map((item) => ({ item, keywords: findAiKeywords(item.text) }))
        .filter((row) => row.keywords.length);
      const counts = new Map<string, number>();
      for (const row of matched)
        for (const keyword of row.keywords)
          counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
      return {
        code,
        label: group.label,
        total: group.items.length,
        matches: matched.length,
        announcementIds: group.items.map((item) => item.id).sort(),
        keywords: [...counts]
          .map(([keyword, count]) => ({ keyword, count }))
          .sort(
            (a, b) => b.count - a.count || a.keyword.localeCompare(b.keyword),
          ),
        examples: matched
          .slice(0, 5)
          .map(({ item, keywords }) => ({
            id: item.id,
            title: item.title,
            agency: item.agency,
            url: item.url,
            keywords,
          })),
      };
    })
    .sort((a, b) =>
      a.code === "all"
        ? -1
        : b.code === "all"
          ? 1
          : a.label.localeCompare(b.label),
    );
}
