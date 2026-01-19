import { NextResponse } from "next/server";
import { searchPostings, computeAiPressureFromSearchItems } from "@/lib/usajobs";
import { USAJOBS_JOB_CATEGORY_CODES_BY_SECTOR } from "@/lib/usajobs-sector-map";

export const runtime = "nodejs";

// Cache for 6 hours at the edge/CDN (and we also keep an in-memory cache below).
export const revalidate = 21600;

type SectorKey = keyof typeof USAJOBS_JOB_CATEGORY_CODES_BY_SECTOR;

type ApiResponse = {
  days: number;
  generatedAt: string;
  sectors: Record<
    SectorKey,
    {
      total: number;
      aiCount: number;
      aiShare: number | null;
      topKeywords: Array<{ keyword: string; count: number }>;
      examples: Array<{
        title: string;
        agency?: string;
        department?: string;
        url?: string;
        matchedKeywords: string[];
      }>;
      note?: string;
      error?: string;
    }
  >;
};

const TTL_MS = 1000 * 60 * 60 * 6;
let cache:
  | { key: string; expiresAt: number; payload: ApiResponse }
  | null = null;

function getEnvOrEmpty(name: string): string {
  return process.env[name] ?? "";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const daysParam = url.searchParams.get("days");
  const days = Math.max(1, Math.min(Number(daysParam ?? 14) || 14, 60));

  const cacheKey = `days=${days}`;
  const now = Date.now();
  if (cache && cache.key === cacheKey && cache.expiresAt > now) {
    return NextResponse.json(cache.payload, {
      headers: {
        "Cache-Control": `public, s-maxage=${TTL_MS / 1000}, stale-while-revalidate=3600`,
      },
    });
  }

  const authorizationKey = getEnvOrEmpty("USAJOBS_AUTH_KEY");
  const userAgent = getEnvOrEmpty("USAJOBS_USER_AGENT");

  if (!authorizationKey || !userAgent) {
    return NextResponse.json(
      {
        error:
          "Missing USAJOBS configuration. Set USAJOBS_AUTH_KEY and USAJOBS_USER_AGENT.",
      },
      { status: 501 }
    );
  }

  const sectorKeys = Object.keys(
    USAJOBS_JOB_CATEGORY_CODES_BY_SECTOR
  ) as SectorKey[];

  const sectors: ApiResponse["sectors"] = {} as any;

  for (const sector of sectorKeys) {
    try {
      const jobCategoryCodes = USAJOBS_JOB_CATEGORY_CODES_BY_SECTOR[sector];
      const items = await searchPostings({
        headers: { authorizationKey, userAgent },
        jobCategoryCodes,
        days,
        pageLimit: sector === "total" ? 1 : 2,
        resultsPerPage: 250,
      });

      const result = computeAiPressureFromSearchItems({
        items,
        maxExamples: 3,
        minSampleForShare: 20,
      });

      sectors[sector] = {
        total: result.total,
        aiCount: result.aiCount,
        aiShare: result.aiShare,
        topKeywords: result.topKeywords.slice(0, 2),
        examples: result.examples,
        note: result.note,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      sectors[sector] = {
        total: 0,
        aiCount: 0,
        aiShare: null,
        topKeywords: [],
        examples: [],
        error: msg,
      };
    }
  }

  const payload: ApiResponse = {
    days,
    generatedAt: new Date().toISOString(),
    sectors,
  };

  cache = { key: cacheKey, expiresAt: now + TTL_MS, payload };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": `public, s-maxage=${TTL_MS / 1000}, stale-while-revalidate=3600`,
    },
  });
}


