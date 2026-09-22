// @vitest-environment node
/// <reference types="vite/client" />
import { afterEach, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { makeFunctionReference } from "convex/server";
import schema from "@/convex/schema";
import { api, internal } from "@/convex/_generated/api";
import { ALL_SECTORS, SERIES } from "@/lib/bls";

const modules = import.meta.glob("../../convex/**/*.{ts,js}");
const fresh = () => convexTest(schema, modules);
const row = {
  date: "2026-07",
  value: 7271,
  preliminary: true,
  footnotes: ["preliminary"],
};
const batch = {
  sector: "total",
  attemptedAt: "2026-09-22T06:00:00.000Z",
  points: [row],
  missing: [],
  warnings: [],
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it.each(["insertJobOpening", "bulkInsertJobOpenings", "setMetadata"])(
  "does not register the public write endpoint %s",
  async (name) => {
    await expect(
      fresh().mutation(makeFunctionReference<"mutation">(`jobs:${name}`), {}),
    ).rejects.toThrow();
  },
);
it("upserts internally and retains prior values and success time after failure", async () => {
  const t = fresh();
  await t.mutation(internal.jobMutations.storeSeries, batch);
  await t.mutation(internal.jobMutations.storeSeries, batch);
  expect(await t.query(api.jobs.getJobOpenings, {})).toHaveLength(1);
  await t.mutation(internal.jobMutations.storeSeries, {
    ...batch,
    attemptedAt: "2026-09-23T06:00:00.000Z",
    error: "Missing source series",
    points: [],
  });
  expect((await t.query(api.jobs.getJobOpenings, {}))[0].value).toBe(7271);
  expect((await t.query(api.jobs.getSeriesStatus, {}))[0]).toMatchObject({
    succeededAt: batch.attemptedAt,
    error: "Missing source series",
  });
});
it.each([
  { sector: "unknown" },
  { points: [{ ...row, date: "2099-99" }] },
  { points: [{ ...row, value: -1 }] },
])("rejects invalid internal data atomically", async (change) => {
  const t = fresh();
  await expect(
    t.mutation(internal.jobMutations.storeSeries, { ...batch, ...change }),
  ).rejects.toThrow();
  expect(await t.query(api.jobs.getJobOpenings, {})).toEqual([]);
});
it("imports valid series but does not advance global success after a missing series", async () => {
  const t = fresh();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "REQUEST_SUCCEEDED",
          Results: {
            series: ALL_SECTORS.filter((key) => key !== "professional").map(
              (key) => ({
                seriesID: SERIES[key].id,
                data: [{ year: "2026", period: "M07", value: "4" }],
              }),
            ),
          },
        }),
      ),
    ),
  );
  await expect(t.action(internal.blsFetch.fetchLatestData, {})).rejects.toThrow(
    "professional",
  );
  expect(await t.query(api.jobs.getJobOpenings, {})).toHaveLength(
    ALL_SECTORS.length - 1,
  );
  expect(
    await t.query(api.jobs.getMetadata, { key: "lastUpdated" }),
  ).toBeNull();
  expect(
    (await t.query(api.jobs.getSeriesStatus, {})).find(
      (row) => row.sector === "professional",
    )?.succeededAt,
  ).toBeUndefined();
});
it("publishes complete BLS imports through the scheduled action", async () => {
  const t = fresh();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            status: "REQUEST_SUCCEEDED",
            Results: {
              series: ALL_SECTORS.map((key) => ({
                seriesID: SERIES[key].id,
                data: [{ year: "2026", period: "M07", value: "4" }],
              })),
            },
          }),
        ),
    ),
  );
  await t.action(internal.blsFetch.fetchLatestData, {});
  expect(await t.query(api.jobs.getJobOpenings, {})).toHaveLength(
    ALL_SECTORS.length,
  );
  expect(
    await t.query(api.jobs.getMetadata, { key: "lastUpdated" }),
  ).not.toBeNull();
  expect(await t.query(api.jobs.getUnemploymentSectors, {})).toEqual([
    "unemployment_rate",
    "unemployment_manufacturing",
  ]);
});
it("preserves the last complete federal snapshot on credential failure", async () => {
  const t = fresh();
  await t.mutation(internal.usajobsMutations.storeSnapshot, {
    date: "2026-09-21",
    collectedAt: "2026-09-21T08:00:00.000Z",
    windowStart: "2026-09-07",
    windowEnd: "2026-09-21",
    methodVersion: 2,
    available: 0,
    groups: [
      {
        code: "all",
        label: "All federal announcements",
        total: 0,
        matches: 0,
        announcementIds: [],
        keywords: [],
        examples: [],
      },
    ],
  });
  vi.stubEnv("USAJOBS_AUTH_KEY", "test");
  vi.stubEnv("USAJOBS_USER_AGENT", "test@example.com");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("", { status: 401 })),
  );
  await expect(
    t.action(internal.usajobsFetch.fetchAiSkillSnapshot, {}),
  ).rejects.toThrow("401");
  const result = await t.query(api.usajobsQueries.getFederalAnnouncements, {});
  expect(result.snapshot?.date).toBe("2026-09-21");
  expect(result.status?.state).toBe("error");
});
it("publishes federal counts through the scheduled action without legacy snapshots", async () => {
  const t = fresh();
  vi.stubEnv("USAJOBS_AUTH_KEY", "test");
  vi.stubEnv("USAJOBS_USER_AGENT", "test@example.com");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          SearchResult: {
            SearchResultCountAll: 1,
            SearchResultItems: [
              {
                MatchedObjectId: "123",
                MatchedObjectDescriptor: {
                  PositionTitle: "Machine learning engineer",
                  OrganizationName: "Agency",
                  PositionURI: "https://www.usajobs.gov/job/123",
                  JobCategory: [{ Code: "2210", Name: "IT Management" }],
                },
              },
            ],
          },
        }),
      ),
    ),
  );
  await t.action(internal.usajobsFetch.fetchAiSkillSnapshot, {});
  const result = await t.query(api.usajobsQueries.getFederalAnnouncements, {});
  expect(result.status?.state).toBe("complete");
  expect(result.snapshot?.groups[0]).toMatchObject({ total: 1, matches: 1 });
  expect(
    result.snapshot?.groups.find((group) => group.code === "2210")?.total,
  ).toBe(1);
  expect(
    await t.run((ctx) => ctx.db.query("ai_skill_snapshots").collect()),
  ).toHaveLength(0);
});

it("removes a withdrawn observation while retaining its source explanation", async () => {
  const t = fresh();
  await t.mutation(internal.jobMutations.storeSeries, batch);
  await t.mutation(internal.jobMutations.storeSeries, {
    ...batch,
    attemptedAt: "2026-09-23T06:00:00.000Z",
    points: [{ ...row, date: "2026-08", value: 7300 }],
    missing: [{ date: row.date, footnotes: ["Observation unavailable"] }],
  });
  expect(
    (await t.query(api.jobs.getJobOpenings, {})).map((point) => point.date),
  ).toEqual(["2026-08"]);
  expect((await t.query(api.jobs.getSeriesStatus, {}))[0].missing).toEqual([
    { date: row.date, footnotes: ["Observation unavailable"] },
  ]);
});
it("keeps a newer refresh when an older import finishes late", async () => {
  const t = fresh();
  await t.mutation(internal.jobMutations.storeSeries, {
    ...batch,
    attemptedAt: "2026-09-23T06:00:00.000Z",
    points: [{ ...row, value: 7500 }],
  });
  await t.mutation(internal.jobMutations.storeSeries, batch);
  expect((await t.query(api.jobs.getJobOpenings, {}))[0].value).toBe(7500);
});
it("applies inclusive date bounds to supported series", async () => {
  const t = fresh();
  await t.mutation(internal.jobMutations.storeSeries, {
    ...batch,
    points: [row, { ...row, date: "2026-08" }],
  });
  expect(
    await t.query(api.jobs.getJobOpenings, { sector: "unsupported" }),
  ).toEqual([]);
  expect(
    (
      await t.query(api.jobs.getJobOpenings, {
        sector: "total",
        startDate: "2026-07",
        endDate: "2026-07",
      })
    ).map((point) => point.date),
  ).toEqual(["2026-07"]);
});
