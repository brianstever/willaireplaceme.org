import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run on 7th of each month - both JOLTS (first Tue) and unemployment (first Fri) are out by then
crons.monthly(
  "fetch-bls-data",
  { day: 7, hourUTC: 14, minuteUTC: 0 },
  internal.blsFetch.fetchLatestData
);

// Daily historical backfill (idempotent upsert) to ensure any late revisions are reflected.
crons.daily(
  "fetch-bls-historical",
  { hourUTC: 6, minuteUTC: 10 },
  internal.blsFetch.fetchHistoricalData
);

export default crons;
