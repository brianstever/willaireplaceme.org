import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const JOB_OPENING_SECTORS = [
  "total",
  "manufacturing",
  "healthcare",
  "retail",
  "professional",
  "information",
  "government",
];

// Industry unemployment sectors for filtering
// Note: unemployment_rate serves as the "total" unemployment
const UNEMPLOYMENT_SECTORS = [
  "unemployment_rate",
  "unemployment_manufacturing",
  "unemployment_healthcare",
  "unemployment_retail",
  "unemployment_professional",
  "unemployment_information",
  "unemployment_government",
];

const ALL_SECTORS = Array.from(
  new Set([...JOB_OPENING_SECTORS, "participation_rate", ...UNEMPLOYMENT_SECTORS])
);

// --- Queries ---

export const getJobOpenings = query({
  args: {
    sector: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let data;

    if (args.sector) {
      data = await ctx.db
        .query("job_openings")
        .withIndex("by_sector", (q) => q.eq("sector", args.sector!))
        .collect();
    } else {
      data = await ctx.db.query("job_openings").collect();
    }

    // filter by date range in memory
    if (args.startDate) {
      data = data.filter((d) => d.date >= args.startDate!);
    }
    if (args.endDate) {
      data = data.filter((d) => d.date <= args.endDate!);
    }

    return data.sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getLatestBySector = query({
  args: {},
  handler: async (ctx) => {
    const results = await Promise.all(
      ALL_SECTORS.map(async (sector) => {
        const data = await ctx.db
          .query("job_openings")
          .withIndex("by_sector", (q) => q.eq("sector", sector))
          .collect();

        if (data.length === 0) return null;
        return data.reduce((latest, item) =>
          item.date > latest.date ? item : latest
        );
      })
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
    return data.reduce((max, item) => (item.value > max.value ? item : max), data[0]);
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

export const getUnemploymentRate = query({
  args: {},
  handler: async (ctx) => {
    const data = await ctx.db
      .query("job_openings")
      .withIndex("by_sector", (q) => q.eq("sector", "unemployment_rate"))
      .collect();
    
    if (data.length === 0) return null;
    
    const sorted = data.sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    
    // last 12 months for header sparkline
    const sparkline = sorted.slice(-12);
    const history = sorted.map(d => ({ date: d.date, value: d.value }));
    
    // find year-ago value for YoY comparison
    const yearAgo = sorted.find(d => {
      const latestDate = new Date(latest.date + "-01");
      const compareDate = new Date(d.date + "-01");
      const diffMonths = (latestDate.getFullYear() - compareDate.getFullYear()) * 12 + 
                         (latestDate.getMonth() - compareDate.getMonth());
      return diffMonths === 12;
    });
    
    const peak = sorted.reduce((max, d) => d.value > max.value ? d : max, sorted[0]);
    const lowest = sorted.reduce((min, d) => d.value < min.value ? d : min, sorted[0]);
    
    return {
      current: latest.value,
      date: latest.date,
      yearAgoValue: yearAgo?.value || null,
      changeFromYearAgo: yearAgo ? latest.value - yearAgo.value : null,
      sparkline: sparkline.map(d => ({ date: d.date, value: d.value })),
      history,
      peak: { value: peak.value, date: peak.date },
      lowest: { value: lowest.value, date: lowest.date },
    };
  },
});

export const getParticipationRate = query({
  args: {},
  handler: async (ctx) => {
    const data = await ctx.db
      .query("job_openings")
      .withIndex("by_sector", (q) => q.eq("sector", "participation_rate"))
      .collect();
    
    if (data.length === 0) return null;
    
    const sorted = data.sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    
    // last 12 months for header sparkline
    const sparkline = sorted.slice(-12);
    const history = sorted.map(d => ({ date: d.date, value: d.value }));
    
    // find year-ago value for YoY comparison
    const yearAgo = sorted.find(d => {
      const latestDate = new Date(latest.date + "-01");
      const compareDate = new Date(d.date + "-01");
      const diffMonths = (latestDate.getFullYear() - compareDate.getFullYear()) * 12 + 
                         (latestDate.getMonth() - compareDate.getMonth());
      return diffMonths === 12;
    });
    
    const peak = sorted.reduce((max, d) => d.value > max.value ? d : max, sorted[0]);
    const lowest = sorted.reduce((min, d) => d.value < min.value ? d : min, sorted[0]);
    
    return {
      current: latest.value,
      date: latest.date,
      yearAgoValue: yearAgo?.value || null,
      changeFromYearAgo: yearAgo ? latest.value - yearAgo.value : null,
      sparkline: sparkline.map(d => ({ date: d.date, value: d.value })),
      history,
      peak: { value: peak.value, date: peak.date },
      lowest: { value: lowest.value, date: lowest.date },
    };
  },
});

export const getUnemploymentByIndustry = query({
  args: {},
  handler: async (ctx) => {
    const sectorResults = await Promise.all(
      UNEMPLOYMENT_SECTORS.map((sector) =>
        ctx.db
          .query("job_openings")
          .withIndex("by_sector", (q) => q.eq("sector", sector))
          .collect()
      )
    );

    return sectorResults
      .flat()
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getUnemploymentSectors = query({
  args: {},
  handler: async () => {
    return [...UNEMPLOYMENT_SECTORS];
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
          .collect()
      )
    );
    const jobData = sectorResults.flat();
    
    if (jobData.length === 0) return null;

    const totalData = jobData
      .filter(d => d.sector === "total")
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (totalData.length === 0) return null;

    const peak = totalData.reduce((max, d) => d.value > max.value ? d : max, totalData[0]);
    const latest = totalData[totalData.length - 1];
    
    // Dec 2019 as pre-pandemic baseline
    const prePandemic = totalData.find(d => d.date === "2019-12") || 
                        totalData.filter(d => d.date.startsWith("2019")).pop();
    
    // per-sector peak-to-current changes
    const sectorChanges: Array<{
      sector: string;
      peakValue: number;
      peakDate: string;
      latestValue: number;
      latestDate: string;
      changePercent: number;
    }> = [];
    
    const sectors = [...new Set(jobData.map(d => d.sector))].filter(s => s !== "total");
    
    for (const sector of sectors) {
      const sectorData = jobData.filter(d => d.sector === sector).sort((a, b) => a.date.localeCompare(b.date));
      if (sectorData.length === 0) continue;
      
      const sectorPeak = sectorData.reduce((max, d) => d.value > max.value ? d : max, sectorData[0]);
      const sectorLatest = sectorData[sectorData.length - 1];
      const changePercent = ((sectorLatest.value - sectorPeak.value) / sectorPeak.value) * 100;
      
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
      prePandemic: prePandemic ? { value: prePandemic.value, date: prePandemic.date } : null,
      changeFromPeak: ((latest.value - peak.value) / peak.value) * 100,
      changeFromPrePandemic: prePandemic 
        ? ((latest.value - prePandemic.value) / prePandemic.value) * 100 
        : null,
      sectorChanges,
      // guard for empty arrays when only "total" data exists
      steepestDecline: sectorChanges.length > 0 ? sectorChanges[0] : null,
      mostResilient: sectorChanges.length > 0 ? sectorChanges[sectorChanges.length - 1] : null,
    };
  },
});

// --- Mutations ---

export const insertJobOpening = mutation({
  args: {
    date: v.string(),
    sector: v.string(),
    value: v.number(),
    rate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("job_openings")
      .withIndex("by_sector_date", (q) => q.eq("sector", args.sector).eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value, rate: args.rate });
      return existing._id;
    }

    return await ctx.db.insert("job_openings", args);
  },
});

export const bulkInsertJobOpenings = mutation({
  args: {
    data: v.array(
      v.object({
        date: v.string(),
        sector: v.string(),
        value: v.number(),
        rate: v.optional(v.number()),
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
        await ctx.db.patch(existing._id, { value: item.value, rate: item.rate });
      } else {
        await ctx.db.insert("job_openings", item);
      }
    }

    return args.data.length;
  },
});

export const setMetadata = mutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("metadata")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
      return existing._id;
    }

    return await ctx.db.insert("metadata", args);
  },
});
