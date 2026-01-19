import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const storeAiSkillSnapshots = internalMutation({
  args: {
    snapshots: v.array(v.object({
      date: v.string(),
      sector: v.string(),
      total: v.number(),
      aiCount: v.number(),
      aiShare: v.union(v.number(), v.null()),
      topKeywords: v.array(v.object({
        keyword: v.string(),
        count: v.number(),
      })),
      examples: v.array(v.object({
        title: v.string(),
        agency: v.optional(v.string()),
        url: v.optional(v.string()),
        matchedKeywords: v.array(v.string()),
      })),
    })),
  },
  handler: async (ctx, args) => {
    for (const snapshot of args.snapshots) {
      // Upsert - check if we already have data for this date/sector
      const existing = await ctx.db
        .query("ai_skill_snapshots")
        .withIndex("by_sector_date", (q) => 
          q.eq("sector", snapshot.sector).eq("date", snapshot.date)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          total: snapshot.total,
          aiCount: snapshot.aiCount,
          aiShare: snapshot.aiShare,
          topKeywords: snapshot.topKeywords,
          examples: snapshot.examples,
        });
      } else {
        await ctx.db.insert("ai_skill_snapshots", snapshot);
      }
    }
  },
});

export const updateMetadata = internalMutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("metadata")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("metadata", args);
    }
  },
});

// Clean up snapshots older than retention period
export const cleanupOldSnapshots = internalMutation({
  args: { retentionDays: v.number() },
  handler: async (ctx, args) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - args.retentionDays);
    const cutoff = cutoffDate.toISOString().split("T")[0];

    const oldSnapshots = await ctx.db
      .query("ai_skill_snapshots")
      .withIndex("by_date")
      .filter((q) => q.lt(q.field("date"), cutoff))
      .collect();

    for (const snapshot of oldSnapshots) {
      await ctx.db.delete(snapshot._id);
    }

    return { deleted: oldSnapshots.length, cutoffDate: cutoff };
  },
});