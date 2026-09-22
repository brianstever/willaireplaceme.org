import { afterEach, expect, it, vi } from "vitest";
import {
  collectAnnouncements,
  summarizeAnnouncements,
  type Announcement,
} from "@/lib/usajobs";

function raw(id: string, title = "General office work") {
  return {
    MatchedObjectId: id,
    MatchedObjectDescriptor: {
      PositionTitle: title,
      OrganizationName: "Agency",
      PositionURI: `https://www.usajobs.gov/job/${id}`,
      JobCategory: [{ Code: "0301", Name: "Administration" }],
    },
  };
}
const page = (items: ReturnType<typeof raw>[], count: number) =>
  new Response(
    JSON.stringify({
      SearchResult: {
        SearchResultCountAll: String(count),
        SearchResultItems: items,
      },
    }),
  );
const args = {
  authorizationKey: "test",
  userAgent: "test@example.com",
  days: 14,
};
afterEach(() => vi.unstubAllGlobals());

it("retrieves subsequent pages and requests an unfiltered baseline", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      page(
        Array.from({ length: 500 }, (_, i) => raw(String(i))),
        501,
      ),
    )
    .mockResolvedValueOnce(page([raw("500", "Machine learning")], 501));
  vi.stubGlobal("fetch", fetcher);
  const result = await collectAnnouncements(args);
  expect(result.complete).toBe(true);
  expect(result.items).toHaveLength(501);
  expect(summarizeAnnouncements(result.items)[0].matches).toBe(1);
  expect(
    summarizeAnnouncements(result.items).find((group) => group.code === "0301")
      ?.total,
  ).toBe(501);
  const urls = fetcher.mock.calls.map((call) => new URL(call[0]));
  expect(urls[1].searchParams.get("Page")).toBe("2");
  expect(urls[0].searchParams.has("JobCategoryCode")).toBe(false);
});

it("withholds completion when a page repeats announcements", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        page(
          Array.from({ length: 500 }, (_, i) => raw(String(i))),
          501,
        ),
      )
      .mockResolvedValueOnce(page([raw("0")], 501)),
  );
  const result = await collectAnnouncements(args);
  expect(result.complete).toBe(false);
  expect(result.items).toHaveLength(500);
});
it("withholds completion when capped or the population changes", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      page(
        Array.from({ length: 500 }, (_, i) => raw(String(i))),
        501,
      ),
    ),
  );
  expect((await collectAnnouncements({ ...args, maxPages: 1 })).complete).toBe(
    false,
  );
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        page(
          Array.from({ length: 500 }, (_, i) => raw(String(i))),
          501,
        ),
      )
      .mockResolvedValueOnce(page([raw("500")], 502)),
  );
  expect((await collectAnnouncements(args)).complete).toBe(false);
});
it("fails promptly on invalid credentials or malformed responses", async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response("", { status: 401 }));
  vi.stubGlobal("fetch", fetcher);
  await expect(collectAnnouncements(args)).rejects.toThrow("401");
  expect(fetcher).toHaveBeenCalledTimes(1);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
  await expect(collectAnnouncements(args)).rejects.toThrow();
});
it("deduplicates announcements and overlapping occupations before counting", () => {
  const item: Announcement = {
    id: "1",
    title: "Engineer",
    agency: "Agency",
    url: "https://www.usajobs.gov/job/1",
    text: "machine learning",
    occupations: [{ code: "0801", label: "Engineering" }],
  };
  const result = summarizeAnnouncements([
    item,
    {
      ...item,
      occupations: [{ code: "2210", label: "Information technology" }],
    },
  ]);
  expect(result[0].total).toBe(1);
  expect(result[0].matches).toBe(1);
  expect(result.find((g) => g.code === "0801")?.total).toBe(1);
  expect(result.find((g) => g.code === "2210")?.total).toBe(1);
});
it("accepts a genuinely empty collection", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(page([], 0)));
  expect(await collectAnnouncements(args)).toMatchObject({
    available: 0,
    complete: true,
    items: [],
  });
});
