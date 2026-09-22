import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { SERIES, isSector, validateObservation } from "../lib/bls";

export const storeSeries = internalMutation({
  args: {
    sector: v.string(),
    attemptedAt: v.string(),
    points: v.array(
      v.object({
        date: v.string(),
        value: v.number(),
        preliminary: v.boolean(),
        footnotes: v.array(v.string()),
      }),
    ),
    missing: v.array(
      v.object({ date: v.string(), footnotes: v.array(v.string()) }),
    ),
    warnings: v.array(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!isSector(args.sector)) throw new Error("Unknown BLS series");
    const sector = args.sector;
    const status = await ctx.db
      .query("series_status")
      .withIndex("by_sector", (q) => q.eq("sector", sector))
      .unique();
    if (status && status.attemptedAt > args.attemptedAt) return;
    if (args.error) {
      const failure = {
        sector,
        attemptedAt: args.attemptedAt,
        error: args.error,
        warnings: args.warnings,
      };
      if (status) await ctx.db.patch(status._id, failure);
      else await ctx.db.insert("series_status", failure);
      return;
    }
    if (!args.points.length) throw new Error("Cannot publish an empty series");
    for (const point of args.points) {
      validateObservation(sector, point.date, point.value);
      const existing = await ctx.db
        .query("job_openings")
        .withIndex("by_sector_date", (q) =>
          q.eq("sector", sector).eq("date", point.date),
        )
        .unique();
      const value = { ...point, sector, seriesId: SERIES[sector].id };
      if (existing) await ctx.db.patch(existing._id, value);
      else await ctx.db.insert("job_openings", value);
    }
    // A withdrawn observation must not retain an older numeric value.
    for (const missing of args.missing) {
      validateObservation(sector, missing.date, 0);
      const existing = await ctx.db
        .query("job_openings")
        .withIndex("by_sector_date", (q) =>
          q.eq("sector", sector).eq("date", missing.date),
        )
        .unique();
      if (existing) await ctx.db.delete(existing._id);
    }
    const latest = await ctx.db
      .query("job_openings")
      .withIndex("by_sector_date", (q) => q.eq("sector", sector))
      .order("desc")
      .first();
    const next = {
      sector,
      attemptedAt: args.attemptedAt,
      succeededAt: args.attemptedAt,
      latestObservation: latest!.date,
      error: undefined,
      warnings: args.warnings,
      missing: [
        ...(status?.missing ?? []).filter(
          (item) =>
            !args.points.some((p) => p.date === item.date) &&
            !args.missing.some((p) => p.date === item.date),
        ),
        ...args.missing,
      ],
    };
    if (status) await ctx.db.patch(status._id, next);
    else await ctx.db.insert("series_status", next);
  },
});

export const updateMetadata = internalMutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("metadata")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing && existing.value > args.value) return;
    if (existing) await ctx.db.patch(existing._id, args);
    else await ctx.db.insert("metadata", args);
  },
});
