import { query, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";

import {
  ALL_SECTORS,
  JOB_OPENING_SECTORS,
  UNEMPLOYMENT_SECTORS,
  isSector,
} from "../lib/bls";

export const getJobOpenings = query({
  args: {
    sector: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sectors = args.sector
      ? isSector(args.sector)
        ? [args.sector]
        : []
      : ALL_SECTORS;
    const rows = await Promise.all(
      sectors.map((sector) =>
        ctx.db
          .query("job_openings")
          .withIndex("by_sector_date", (q) => {
            const range = q.eq("sector", sector);
            if (args.startDate && args.endDate)
              return range
                .gte("date", args.startDate)
                .lte("date", args.endDate);
            if (args.startDate) return range.gte("date", args.startDate);
            if (args.endDate) return range.lte("date", args.endDate);
            return range;
          })
          .collect(),
      ),
    );
    const data = rows.flat();

    return data
      .filter((point) => isSector(point.sector))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getLatestBySector = query({
  args: {},
  handler: async (ctx) => {
    const results = await Promise.all(
      ALL_SECTORS.map((sector) =>
        ctx.db
          .query("job_openings")
          .withIndex("by_sector_date", (q) => q.eq("sector", sector))
          .order("desc")
          .first(),
      ),
    );

    return results.filter((item) => item !== null);
  },
});

export const getPeakValue = query({
  args: { sector: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("job_openings")
      .withIndex("by_sector", (q) => q.eq("sector", args.sector))
      .collect();

    if (data.length === 0) return null;
    return data.reduce(
      (max, item) => (item.value > max.value ? item : max),
      data[0],
    );
  },
});

export const getSectors = query({
  args: {},
  handler: async () => {
    return [...ALL_SECTORS].sort();
  },
});

export const getMetadata = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("metadata")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});

async function getRate(
  ctx: QueryCtx,
  sector: "unemployment_rate" | "participation_rate",
) {
  const data = await ctx.db
    .query("job_openings")
    .withIndex("by_sector_date", (q) => q.eq("sector", sector))
    .collect();
  if (!data.length) return null;
  const latest = data[data.length - 1];
  const yearAgoDate = `${Number(latest.date.slice(0, 4)) - 1}${latest.date.slice(4)}`;
  const yearAgo = data.find((point) => point.date === yearAgoDate);
  const history = data.map(({ date, value }) => ({ date, value }));
  const peak = history.reduce((max, point) =>
    point.value > max.value ? point : max,
  );
  const lowest = history.reduce((min, point) =>
    point.value < min.value ? point : min,
  );
  return {
    current: latest.value,
    date: latest.date,
    yearAgoValue: yearAgo?.value ?? null,
    changeFromYearAgo: yearAgo ? latest.value - yearAgo.value : null,
    sparkline: history.slice(-12),
    history,
    peak,
    lowest,
  };
}

export const getUnemploymentRate = query({
  args: {},
  handler: (ctx) => getRate(ctx, "unemployment_rate"),
});

export const getParticipationRate = query({
  args: {},
  handler: (ctx) => getRate(ctx, "participation_rate"),
});

export const getUnemploymentByIndustry = query({
  args: {},
  handler: async (ctx) => {
    const sectorResults = await Promise.all(
      UNEMPLOYMENT_SECTORS.map((sector) =>
        ctx.db
          .query("job_openings")
          .withIndex("by_sector", (q) => q.eq("sector", sector))
          .collect(),
      ),
    );

    return sectorResults.flat().sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getUnemploymentSectors = query({
  args: {},
  handler: async (ctx) => {
    const available = await Promise.all(
      UNEMPLOYMENT_SECTORS.map(async (sector) => {
        const point = await ctx.db
          .query("job_openings")
          .withIndex("by_sector_date", (q) => q.eq("sector", sector))
          .first();
        return point ? sector : null;
      }),
    );
    return available.filter(
      (sector): sector is NonNullable<typeof sector> => sector !== null,
    );
  },
});

export const getDataAnalysis = query({
  args: {},
  handler: async (ctx) => {
    const sectorResults = await Promise.all(
      JOB_OPENING_SECTORS.map((sector) =>
        ctx.db
          .query("job_openings")
          .withIndex("by_sector", (q) => q.eq("sector", sector))
          .collect(),
      ),
    );
    const jobData = sectorResults.flat();

    if (jobData.length === 0) return null;

    const totalData = jobData
      .filter((d) => d.sector === "total")
      .sort((a, b) => a.date.localeCompare(b.date));

    if (totalData.length === 0) return null;

    const peak = totalData.reduce(
      (max, d) => (d.value > max.value ? d : max),
      totalData[0],
    );
    const latest = totalData[totalData.length - 1];

    // Dec 2019 as pre-pandemic baseline
    const prePandemic =
      totalData.find((d) => d.date === "2019-12") ||
      totalData.filter((d) => d.date.startsWith("2019")).pop();

    // per-sector peak-to-current changes
    const sectorChanges: Array<{
      sector: string;
      peakValue: number;
      peakDate: string;
      latestValue: number;
      latestDate: string;
      changePercent: number;
    }> = [];

    const sectors = [...new Set(jobData.map((d) => d.sector))].filter(
      (s) => s !== "total",
    );

    for (const sector of sectors) {
      const sectorData = jobData
        .filter((d) => d.sector === sector)
        .sort((a, b) => a.date.localeCompare(b.date));
      if (sectorData.length === 0) continue;

      const sectorPeak = sectorData.reduce(
        (max, d) => (d.value > max.value ? d : max),
        sectorData[0],
      );
      const sectorLatest = sectorData[sectorData.length - 1];
      const changePercent =
        ((sectorLatest.value - sectorPeak.value) / sectorPeak.value) * 100;

      sectorChanges.push({
        sector,
        peakValue: sectorPeak.value,
        peakDate: sectorPeak.date,
        latestValue: sectorLatest.value,
        latestDate: sectorLatest.date,
        changePercent,
      });
    }

    // worst decline first
    sectorChanges.sort((a, b) => a.changePercent - b.changePercent);

    return {
      peak: { value: peak.value, date: peak.date },
      latest: { value: latest.value, date: latest.date },
      prePandemic: prePandemic
        ? { value: prePandemic.value, date: prePandemic.date }
        : null,
      changeFromPeak: ((latest.value - peak.value) / peak.value) * 100,
      changeFromPrePandemic: prePandemic
        ? ((latest.value - prePandemic.value) / prePandemic.value) * 100
        : null,
      sectorChanges,
      // guard for empty arrays when only "total" data exists
      steepestDecline: sectorChanges.length > 0 ? sectorChanges[0] : null,
      mostResilient:
        sectorChanges.length > 0
          ? sectorChanges[sectorChanges.length - 1]
          : null,
    };
  },
});

export const getSeriesStatus = query({
  args: {},
  handler: async (ctx) => {
    const statuses = await ctx.db.query("series_status").collect();
    return Promise.all(
      statuses.map(async (status) => {
        const latest = await ctx.db
          .query("job_openings")
          .withIndex("by_sector_date", (q) => q.eq("sector", status.sector))
          .order("desc")
          .first();
        return {
          ...status,
          preliminary: latest?.preliminary ?? false,
          footnotes: latest?.footnotes ?? [],
        };
      }),
    );
  },
});
