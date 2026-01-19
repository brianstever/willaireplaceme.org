import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Upsert data points (used by cron fetch)
export const storeData = internalMutation({
  args: {
    data: v.array(
      v.object({
        date: v.string(),
        sector: v.string(),
        value: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.data) {
      const existing = await ctx.db
        .query("job_openings")
        .withIndex("by_sector_date", (q) => q.eq("sector", item.sector).eq("date", item.date))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { value: item.value });
      } else {
        await ctx.db.insert("job_openings", item);
      }
    }
  },
});

// Batch insert (used by historical backfill)
export const insertBatch = internalMutation({
  args: {
    data: v.array(
      v.object({
        date: v.string(),
        sector: v.string(),
        value: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.data) {
      await ctx.db.insert("job_openings", item);
    }
    return { inserted: args.data.length };
  },
});

// Clear all data (for full refresh)
export const clearAllData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("job_openings").collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
    return { deleted: existing.length };
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
