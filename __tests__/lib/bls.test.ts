import { describe, it, expect } from "vitest";
import { parseBlsResponse } from "@/lib/bls-client";
import { SERIES, validateObservation } from "@/lib/bls";

const point = {
  year: "2026",
  period: "M07",
  value: "7271",
  footnotes: [{ code: "P", text: "preliminary" }],
};
const response = (data: unknown[], id: string = SERIES.total.id) => ({
  status: "REQUEST_SUCCEEDED",
  Results: { series: [{ seriesID: id, data }] },
});

describe("BLS response validation", () => {
  it("preserves source flags and reports missing series independently", () => {
    const result = parseBlsResponse(response([point]), [
      "total",
      "professional",
    ]);
    expect(result[0].points[0]).toEqual({
      date: "2026-07",
      value: 7271,
      preliminary: true,
      footnotes: ["preliminary"],
    });
    expect(result[1].error).toMatch(/missing/);
  });
  it("preserves documented missing values without converting them to zero", () => {
    const result = parseBlsResponse(
      response([
        point,
        {
          ...point,
          period: "M06",
          value: "-",
          footnotes: [{ text: "Unavailable" }],
        },
        { ...point, period: "M13" },
      ]),
      ["total"],
    )[0];
    expect(result.points).toHaveLength(1);
    expect(result.missing).toEqual([
      { date: "2026-06", footnotes: ["Unavailable"] },
    ]);
    expect(result.error).toBeUndefined();
  });
  it.each(["12abc", "Infinity", "NaN", "", "-1"])(
    "rejects malformed number %s",
    (value) => {
      expect(
        parseBlsResponse(response([{ ...point, value }]), ["total"])[0].error,
      ).toBeDefined();
    },
  );
  it.each(["M00", "M14", "M1", "Q01"])(
    "rejects malformed period %s",
    (period) => {
      expect(
        parseBlsResponse(response([{ ...point, period }]), ["total"])[0].error,
      ).toBeDefined();
    },
  );
  it("allows zero and rejects percentages above 100", () => {
    expect(() =>
      validateObservation("unemployment_rate", "2026-07", 0),
    ).not.toThrow();
    expect(() =>
      validateObservation("unemployment_rate", "2026-07", 101),
    ).toThrow();
  });
  it("does not treat a top-level failure or malformed response as an empty success", () => {
    expect(() =>
      parseBlsResponse({ status: "REQUEST_FAILED" }, ["total"]),
    ).toThrow();
    expect(() => parseBlsResponse({}, ["total"])).toThrow();
  });
  it("retains warnings and rejects duplicate observations", () => {
    const input = {
      ...response([point, point]),
      message: [`Warning for ${SERIES.total.id}`],
    };
    const result = parseBlsResponse(input, ["total"])[0];
    expect(result.warnings).toHaveLength(1);
    expect(result.error).toMatch(/Duplicate/);
  });
});

it("uses professional-services observations, not the education and health aggregate", () => {
  const source = {
    status: "REQUEST_SUCCEEDED",
    Results: {
      series: [
        {
          seriesID: "JTS540099000000000JOL",
          data: [{ ...point, value: "1138" }],
        },
        {
          seriesID: "JTS600000000000000JOL",
          data: [{ ...point, value: "1553" }],
        },
      ],
    },
  };
  expect(parseBlsResponse(source, ["professional"])[0].points[0].value).toBe(
    1138,
  );
});
