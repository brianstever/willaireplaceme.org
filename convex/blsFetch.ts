"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// BLS series IDs - JOLTS job openings + CPS rates
const BLS_SERIES: Record<string, string> = {
  total: "JTS000000000000000JOL",
  manufacturing: "JTS300000000000000JOL",
  healthcare: "JTS620000000000000JOL",
  retail: "JTS440000000000000JOL",
  professional: "JTS540000000000000JOL",
  information: "JTS510000000000000JOL",
  government: "JTS900000000000000JOL",
  unemployment_rate: "LNS14000000", // from CPS, released first Friday (also serves as "total" unemployment)
  participation_rate: "LNS11300000", // Labor Force Participation Rate
  // Industry-specific unemployment rates (CPS)
  // Note: unemployment_rate serves as the "total" unemployment, industry-specific below
  unemployment_manufacturing: "LNU04032300",
  unemployment_healthcare: "LNU04032622",
  unemployment_retail: "LNU04032400",
  unemployment_professional: "LNU04032540",
  unemployment_information: "LNU04032500",
  unemployment_government: "LNU04032900",
};

interface BLSDataPoint {
  year: string;
  period: string;
  periodName: string;
  value: string;
}

interface BLSSeriesResult {
  seriesID: string;
  data: BLSDataPoint[];
}

interface BLSResponse {
  status: string;
  message?: string[];
  Results?: {
    series: BLSSeriesResult[];
  };
}

// Called by cron - fetches last 2 years of data
export const fetchLatestData = internalAction({
  args: {},
  handler: async (ctx) => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const seriesIds = Object.values(BLS_SERIES);
    const seriesIdToSector: Record<string, string> = {};
    for (const [sector, seriesId] of Object.entries(BLS_SERIES)) {
      seriesIdToSector[seriesId] = sector;
    }

    // v1 API is public, no key needed
    const response = await fetch("https://api.bls.gov/publicAPI/v1/timeseries/data/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: seriesIds,
        startyear: lastYear.toString(),
        endyear: currentYear.toString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`BLS API error: ${response.status}`);
    }

    const blsData: BLSResponse = await response.json();

    if (blsData.status !== "REQUEST_SUCCEEDED") {
      throw new Error(`BLS API failed: ${blsData.status}`);
    }

    const dataToInsert: Array<{ date: string; sector: string; value: number }> = [];

    for (const series of blsData.Results?.series || []) {
      const sector = seriesIdToSector[series.seriesID];
      if (!sector) continue;

      for (const dp of series.data) {
        // M01-M12 = months, skip M13 (annual)
        if (!dp.period.startsWith("M") || dp.period === "M13") continue;

        const month = dp.period.replace("M", "").padStart(2, "0");
        const date = `${dp.year}-${month}`;
        const value = parseFloat(dp.value);

        if (!isNaN(value)) {
          dataToInsert.push({ date, sector, value });
        }
      }
    }

    await ctx.runMutation(internal.jobMutations.storeData, { data: dataToInsert });
    await ctx.runMutation(internal.jobMutations.updateMetadata, {
      key: "lastUpdated",
      value: new Date().toISOString(),
    });

    return { inserted: dataToInsert.length };
  },
});

// One-time historical backfill (2015-present)
export const fetchHistoricalData = internalAction({
  args: {},
  handler: async (ctx) => {
    const allData: Array<{ date: string; sector: string; value: number }> = [];
    
    const seriesIds = Object.values(BLS_SERIES);
    const seriesIdToSector: Record<string, string> = {};
    for (const [sector, seriesId] of Object.entries(BLS_SERIES)) {
      seriesIdToSector[seriesId] = sector;
    }

    // v1 API: max 10 years per request - calculate dynamically
    const currentYear = new Date().getFullYear();
    const startYear = 2015;
    const yearRanges: Array<{ start: number; end: number }> = [];
    
    for (let year = startYear; year <= currentYear; year += 10) {
      yearRanges.push({
        start: year,
        end: Math.min(year + 9, currentYear),
      });
    }

    for (const range of yearRanges) {
      console.log(`Fetching ${range.start}-${range.end}...`);

      const response = await fetch("https://api.bls.gov/publicAPI/v1/timeseries/data/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesid: seriesIds,
          startyear: range.start.toString(),
          endyear: range.end.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`BLS API error: ${response.status}`);
      }

      const blsData: BLSResponse = await response.json();

      if (blsData.status !== "REQUEST_SUCCEEDED") {
        console.error("BLS error:", blsData.message);
        throw new Error(`BLS API failed: ${blsData.status}`);
      }

      for (const series of blsData.Results?.series || []) {
        const sector = seriesIdToSector[series.seriesID];
        if (!sector) continue;

        for (const dp of series.data) {
          if (!dp.period.startsWith("M") || dp.period === "M13") continue;

          const month = dp.period.replace("M", "").padStart(2, "0");
          const date = `${dp.year}-${month}`;
          const value = parseFloat(dp.value);

          if (!isNaN(value)) {
            allData.push({ date, sector, value });
          }
        }
      }

      // be nice to the API
      if (yearRanges.indexOf(range) < yearRanges.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    console.log(`Fetched ${allData.length} data points`);

    if (allData.length > 0) {
      await ctx.runMutation(internal.jobMutations.clearAllData, {});

      // batch inserts to avoid timeout
      const batchSize = 100;
      for (let i = 0; i < allData.length; i += batchSize) {
        const batch = allData.slice(i, i + batchSize);
        await ctx.runMutation(internal.jobMutations.insertBatch, { data: batch });
      }

      await ctx.runMutation(internal.jobMutations.updateMetadata, {
        key: "lastUpdated",
        value: new Date().toISOString(),
      });
    }

    return { status: "success", dataPoints: allData.length };
  },
});
