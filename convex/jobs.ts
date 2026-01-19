import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

    if (args.startDate || args.endDate) {
      data = data.filter((d) => {
        if (args.startDate && d.date < args.startDate) return false;
        if (args.endDate && d.date > args.endDate) return false;
        return true;
      });
    }

    return data.sort((a, b) => a.date.localeCompare(b.date));
  },
});

export const getLatestBySector = query({
  args: {},
  handler: async (ctx) => {
    const allData = await ctx.db.query("job_openings").collect();

    const latestBySector: Record<
      string,
      { date: string; sector: string; value: number; rate?: number }
    > = {};

    for (const item of allData) {
      if (!latestBySector[item.sector] || item.date > latestBySector[item.sector].date) {
        latestBySector[item.sector] = item;
      }
    }

    return Object.values(latestBySector);
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
  handler: async (ctx) => {
    const allData = await ctx.db.query("job_openings").collect();
    return [...new Set(allData.map((d) => d.sector))].sort();
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

export const getDataAnalysis = query({
  args: {},
  handler: async (ctx) => {
    const allData = await ctx.db.query("job_openings").collect();
    const jobData = allData.filter(d => d.sector !== "unemployment_rate");
    
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
      steepestDecline: sectorChanges[0],
      mostResilient: sectorChanges[sectorChanges.length - 1],
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
