import { findAiMatches } from "./ai-keywords";

export type UsaJobsHeaders = {
  authorizationKey: string;
  userAgent: string;
};

export type UsaJobsSearchItem = {
  /** May be undefined; not always exposed consistently across fields. */
  announcementNumber?: string;
  positionTitle?: string;
  organizationName?: string;
  departmentName?: string;
  positionUri?: string;
  publishedDate?: string;
  /** Text blob used for keyword matching (title + summary + duties, if present). */
  matchText: string;
};

export type UsaJobsSearchResponse = {
  SearchResult?: {
    SearchResultCount?: number;
    SearchResultCountAll?: number;
    SearchResultItems?: unknown[];
  };
};

const USAJOBS_BASE = "https://data.usajobs.gov";

function requiredHeaders(h: UsaJobsHeaders): Record<string, string> {
  return {
    Host: "data.usajobs.gov",
    "User-Agent": h.userAgent,
    "Authorization-Key": h.authorizationKey,
    Accept: "application/json",
  };
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function pickFirstString(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    const s = asString(v);
    if (s) return s;
    if (Array.isArray(v)) {
      for (const inner of v) {
        const ss = asString(inner);
        if (ss) return ss;
      }
    }
  }
  return undefined;
}

function safeJsonStringify(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return "";
  }
}

/**
 * Fetch open job postings via USAJOBS Search API.
 * Note: DatePosted is 0–60 (days). We intentionally keep paging bounded.
 */
export async function searchPostings(args: {
  headers: UsaJobsHeaders;
  /** USAJOBS JobCategoryCode values (e.g. 2200 for IT). */
  jobCategoryCodes: string[];
  /** Days back for DatePosted (0–60). */
  days: number;
  /** Maximum number of pages to request (each page up to resultsPerPage). */
  pageLimit?: number;
  /** Results per page (USAJOBS supports up to 500). */
  resultsPerPage?: number;
}): Promise<UsaJobsSearchItem[]> {
  const { headers, jobCategoryCodes, days } = args;
  const pageLimit = Math.max(1, Math.min(args.pageLimit ?? 2, 10));
  const resultsPerPage = Math.max(25, Math.min(args.resultsPerPage ?? 250, 500));

  const allItems: UsaJobsSearchItem[] = [];

  for (const code of jobCategoryCodes) {
    for (let page = 1; page <= pageLimit; page += 1) {
      const url = new URL("/api/search", USAJOBS_BASE);
      url.searchParams.set("JobCategoryCode", code);
      url.searchParams.set("DatePosted", String(days));
      url.searchParams.set("ResultsPerPage", String(resultsPerPage));
      url.searchParams.set("Page", String(page));
      url.searchParams.set("Fields", "Full");

      const resp = await fetch(url.toString(), {
        method: "GET",
        headers: requiredHeaders(headers),
      });

      if (!resp.ok) {
        throw new Error(`USAJOBS /api/search error (${resp.status})`);
      }

      const json = (await resp.json()) as UsaJobsSearchResponse;
      const items = json.SearchResult?.SearchResultItems ?? [];
      if (!Array.isArray(items) || items.length === 0) break;

      for (const raw of items) {
        // Most fields live under MatchedObjectDescriptor.
        const mod = (raw as any)?.MatchedObjectDescriptor ?? (raw as any) ?? {};
        const userArea = mod?.UserArea ?? {};
        const details = userArea?.Details ?? {};

        const positionTitle = pickFirstString(mod?.PositionTitle, mod?.PositionTitle?.[0]);
        const departmentName = pickFirstString(mod?.DepartmentName);
        const organizationName = pickFirstString(mod?.OrganizationName);
        const positionUri = pickFirstString(mod?.PositionURI, mod?.PositionURI?.[0]);
        const publishedDate = pickFirstString(mod?.PublicationStartDate, mod?.PositionStartDate, mod?.PositionOpenDate);

        // Identifier is inconsistent across responses; we try a few likely places.
        const announcementNumber =
          pickFirstString(
            mod?.PositionID,
            mod?.MatchedObjectId,
            mod?.MatchedObjectId?.toString?.(),
            details?.AnnouncementNumber,
            mod?.PositionID?.toString?.()
          ) ?? undefined;

        // Build match text from title + any provided summaries/duties.
        const pieces: string[] = [];
        if (positionTitle) pieces.push(positionTitle);
        if (asString(mod?.QualificationSummary)) pieces.push(mod.QualificationSummary);
        if (asString(details?.MajorDuties)) pieces.push(details.MajorDuties);
        if (Array.isArray(details?.MajorDutiesList)) pieces.push(details.MajorDutiesList.join(" "));
        if (asString(details?.Requirements)) pieces.push(details.Requirements);
        if (asString(details?.RequirementsSummary)) pieces.push(details.RequirementsSummary);
        if (asString(details?.KeyRequirements)) pieces.push(details.KeyRequirements);

        // As a fallback, stringify a small subset of the descriptor.
        if (pieces.length === 0) {
          pieces.push(safeJsonStringify({ PositionTitle: mod?.PositionTitle, QualificationSummary: mod?.QualificationSummary, UserArea: userArea }));
        }

        allItems.push({
          announcementNumber,
          positionTitle,
          organizationName,
          departmentName,
          positionUri,
          publishedDate,
          matchText: pieces.join("\n"),
        });
      }
    }
  }

  return allItems;
}

export type AiPressureExample = {
  title: string;
  agency?: string;
  department?: string;
  url?: string;
  matchedKeywords: string[];
};

export type AiPressureResult = {
  total: number;
  aiCount: number;
  aiShare: number | null;
  topKeywords: Array<{ keyword: string; count: number }>;
  examples: AiPressureExample[];
  note?: string;
};

export function computeAiPressureFromSearchItems(args: {
  items: UsaJobsSearchItem[];
  maxExamples?: number;
  minSampleForShare?: number;
}): AiPressureResult {
  const maxExamples = Math.max(1, Math.min(args.maxExamples ?? 5, 10));
  const minSampleForShare = Math.max(1, args.minSampleForShare ?? 20);

  const keywordCounts = new Map<string, number>();
  const examples: AiPressureExample[] = [];

  let aiCount = 0;
  for (const item of args.items) {
    const matches = findAiMatches(item.matchText).map((m) => m.keyword);
    if (matches.length === 0) continue;

    aiCount += 1;
    for (const kw of matches) {
      keywordCounts.set(kw, (keywordCounts.get(kw) ?? 0) + 1);
    }

    if (examples.length < maxExamples && item.positionTitle) {
      examples.push({
        title: item.positionTitle,
        agency: item.organizationName,
        department: item.departmentName,
        url: item.positionUri,
        matchedKeywords: matches.slice(0, 6),
      });
    }
  }

  const total = args.items.length;
  const aiShare = total >= minSampleForShare ? aiCount / total : null;

  const topKeywords = Array.from(keywordCounts.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    total,
    aiCount,
    aiShare,
    topKeywords,
    examples,
    note: total < minSampleForShare ? `Low sample (${total} postings)` : undefined,
  };
}


