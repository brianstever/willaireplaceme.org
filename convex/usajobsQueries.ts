import { query } from "./_generated/server";
import { v } from "convex/values";
import { FEDERAL_METHOD_VERSION } from "../lib/federal";

// Get latest AI skill snapshot for all sectors
export const getLatestAiSkills = query({
  args: {},
  handler: async (ctx) => {
    const sectors = [
      "total",
      "information",
      "healthcare",
      "professional",
      "manufacturing",
      "government",
      "retail",
    ];

    const results = await Promise.all(
      sectors.map((sector) =>
        ctx.db
          .query("ai_skill_snapshots")
          .withIndex("by_sector_date", (q) => q.eq("sector", sector))
          .order("desc")
          .first(),
      ),
    );

    const bySector: Record<
      string,
      {
        date: string;
        total: number;
        aiCount: number;
        aiShare: number | null;
        topKeywords: Array<{ keyword: string; count: number }>;
        examples: Array<{
          title: string;
          agency?: string;
          url?: string;
          matchedKeywords: string[];
        }>;
      }
    > = {};

    for (const result of results) {
      if (result) {
        bySector[result.sector] = {
          date: result.date,
          total: result.total,
          aiCount: result.aiCount,
          aiShare: result.aiShare,
          topKeywords: result.topKeywords,
          examples: result.examples,
        };
      }
    }

    return bySector;
  },
});

// Get AI skill history for a sector (for charting trends)
export const getAiSkillHistory = query({
  args: { sector: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("ai_skill_snapshots")
      .withIndex("by_sector", (q) => q.eq("sector", args.sector))
      .collect();

    return data
      .map((d) => ({
        date: d.date,
        total: d.total,
        aiCount: d.aiCount,
        aiShare: d.aiShare,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

// Get metadata (like last updated time)
export const getAiSkillsMetadata = query({
  args: {},
  handler: async (ctx) => {
    const lastUpdated = await ctx.db
      .query("metadata")
      .withIndex("by_key", (q) => q.eq("key", "aiSkillsLastUpdated"))
      .first();

    return {
      lastUpdated: lastUpdated?.value ?? null,
    };
  },
});

export const getFederalAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("federal_snapshots")
      .withIndex("by_method_date", (q) =>
        q.eq("methodVersion", FEDERAL_METHOD_VERSION),
      )
      .order("desc")
      .first();
    const status = await ctx.db.query("federal_status").first();
    // IDs are retained for collection checks, but not needed by the dashboard.
    const snapshot = row
      ? {
          ...row,
          groups: row.groups.map((group) => ({
            ...group,
            announcementIds: [],
          })),
        }
      : null;
    return { snapshot, status };
  },
});
