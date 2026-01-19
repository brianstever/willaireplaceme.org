import { findAiMatches } from "./ai-keywords";

export interface UsaJobsHeaders {
  authorizationKey: string;
  userAgent: string;
}

export interface UsaJobsSearchItem {
  announcementNumber?: string;
  positionTitle?: string;
  organizationName?: string;
  departmentName?: string;
  positionUri?: string;
  publishedDate?: string;
  matchText: string;
}

// USAJOBS API response types (partial, fields we care about)
interface UsaJobsDetails {
  MajorDuties?: string;
  MajorDutiesList?: string[];
  Requirements?: string;
  RequirementsSummary?: string;
  KeyRequirements?: string;
  AnnouncementNumber?: string;
}

interface UsaJobsUserArea {
  Details?: UsaJobsDetails;
}

interface UsaJobsMatchedObject {
  PositionTitle?: string;
  PositionID?: string;
  MatchedObjectId?: string;
  OrganizationName?: string;
  DepartmentName?: string;
  PositionURI?: string;
  PublicationStartDate?: string;
  PositionStartDate?: string;
  PositionOpenDate?: string;
  QualificationSummary?: string;
  UserArea?: UsaJobsUserArea;
}

interface UsaJobsSearchResultItem {
  MatchedObjectDescriptor?: UsaJobsMatchedObject;
}

interface UsaJobsSearchResponse {
  SearchResult?: {
    SearchResultCount?: number;
    SearchResultCountAll?: number;
    SearchResultItems?: UsaJobsSearchResultItem[];
  };
}

const USAJOBS_BASE = "https://data.usajobs.gov";

function requiredHeaders(h: UsaJobsHeaders): Record<string, string> {
  return {
    Host: "data.usajobs.gov",
    "User-Agent": h.userAgent,
    "Authorization-Key": h.authorizationKey,
    Accept: "application/json",
  };
}

export async function searchPostings(args: {
  headers: UsaJobsHeaders;
  jobCategoryCodes: string[];
  days: number;
  pageLimit?: number;
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
      if (items.length === 0) break;

      for (const item of items) {
        const mod = item.MatchedObjectDescriptor;
        if (!mod) continue;

        const details = mod.UserArea?.Details;

        // Build match text from title + summaries/duties
        const pieces: string[] = [];
        if (mod.PositionTitle) pieces.push(mod.PositionTitle);
        if (mod.QualificationSummary) pieces.push(mod.QualificationSummary);
        if (details?.MajorDuties) pieces.push(details.MajorDuties);
        if (details?.MajorDutiesList) pieces.push(details.MajorDutiesList.join(" "));
        if (details?.Requirements) pieces.push(details.Requirements);
        if (details?.RequirementsSummary) pieces.push(details.RequirementsSummary);
        if (details?.KeyRequirements) pieces.push(details.KeyRequirements);

        allItems.push({
          announcementNumber: mod.PositionID ?? mod.MatchedObjectId ?? details?.AnnouncementNumber,
          positionTitle: mod.PositionTitle,
          organizationName: mod.OrganizationName,
          departmentName: mod.DepartmentName,
          positionUri: mod.PositionURI,
          publishedDate: mod.PublicationStartDate ?? mod.PositionStartDate ?? mod.PositionOpenDate,
          matchText: pieces.join("\n"),
        });
      }
    }
  }

  return allItems;
}

export interface AiPressureExample {
  title: string;
  agency?: string;
  department?: string;
  url?: string;
  matchedKeywords: string[];
}

export interface AiPressureResult {
  total: number;
  aiCount: number;
  aiShare: number | null;
  topKeywords: Array<{ keyword: string; count: number }>;
  examples: AiPressureExample[];
  note?: string;
}

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
