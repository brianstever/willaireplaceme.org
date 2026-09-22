"use node";

import { internalAction, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { ALL_SECTORS } from "../lib/bls";
import { fetchBlsRange, type SeriesResult } from "../lib/bls-client";

async function refresh(ctx: ActionCtx, startYear: number, endYear: number) {
  const attemptedAt = new Date().toISOString();
  const combined = new Map(
    ALL_SECTORS.map((sector) => [
      sector,
      { sector, points: [], missing: [], warnings: [] } as SeriesResult,
    ]),
  );
  try {
    for (let year = startYear; year <= endYear; year += 10) {
      const results = await fetchBlsRange(
        ALL_SECTORS,
        year,
        Math.min(year + 9, endYear),
      );
      for (const result of results) {
        const entry = combined.get(result.sector)!;
        entry.points.push(...result.points);
        entry.missing.push(...result.missing);
        entry.warnings.push(...result.warnings);
        if (result.error) entry.error = result.error;
      }
    }
  } catch (error) {
    for (const entry of combined.values())
      entry.error =
        error instanceof Error ? error.message : "BLS refresh failed";
  }
  const failed: string[] = [];
  for (const result of combined.values()) {
    await ctx.runMutation(internal.jobMutations.storeSeries, {
      ...result,
      attemptedAt,
    });
    if (result.error) failed.push(result.sector);
  }
  if (failed.length)
    throw new Error(`BLS refresh incomplete: ${failed.join(", ")}`);
  await ctx.runMutation(internal.jobMutations.updateMetadata, {
    key: "lastUpdated",
    value: attemptedAt,
  });
  return { series: combined.size };
}

export const fetchLatestData = internalAction({
  args: {},
  handler: (ctx) => {
    const year = new Date().getUTCFullYear();
    return refresh(ctx, year - 1, year);
  },
});

export const fetchHistoricalData = internalAction({
  args: {},
  handler: (ctx) => refresh(ctx, 2015, new Date().getUTCFullYear()),
});
