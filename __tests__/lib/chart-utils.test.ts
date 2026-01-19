import { describe, it, expect } from "vitest";
import {
  linearRegression,
  formatDateShort,
  formatDateAbbreviated,
  TIME_RANGES,
} from "@/lib/chart-utils";

describe("linearRegression", () => {
  it("returns slope 0 and intercept 0 for empty array", () => {
    const result = linearRegression([]);
    expect(result).toEqual({ slope: 0, intercept: 0 });
  });

  it("calculates correct regression for simple line y = x", () => {
    const data = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
    ];
    const result = linearRegression(data);
    expect(result.slope).toBeCloseTo(1, 5);
    expect(result.intercept).toBeCloseTo(0, 5);
  });

  it("calculates correct regression for line y = 2x + 1", () => {
    const data = [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 3, y: 7 },
    ];
    const result = linearRegression(data);
    expect(result.slope).toBeCloseTo(2, 5);
    expect(result.intercept).toBeCloseTo(1, 5);
  });

  it("handles horizontal line (slope = 0)", () => {
    const data = [
      { x: 0, y: 5 },
      { x: 1, y: 5 },
      { x: 2, y: 5 },
    ];
    const result = linearRegression(data);
    expect(result.slope).toBeCloseTo(0, 5);
    expect(result.intercept).toBeCloseTo(5, 5);
  });

  it("handles single point", () => {
    const data = [{ x: 2, y: 5 }];
    const result = linearRegression(data);
    // With single point, slope is 0 and intercept is the y value
    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(5);
  });

  it("handles negative slope", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 8 },
      { x: 2, y: 6 },
      { x: 3, y: 4 },
    ];
    const result = linearRegression(data);
    expect(result.slope).toBeCloseTo(-2, 5);
    expect(result.intercept).toBeCloseTo(10, 5);
  });

  it("handles data with noise (approximate fit)", () => {
    const data = [
      { x: 0, y: 1.1 },
      { x: 1, y: 2.9 },
      { x: 2, y: 5.2 },
      { x: 3, y: 6.8 },
    ];
    const result = linearRegression(data);
    // Should be approximately y = 2x + 1
    expect(result.slope).toBeCloseTo(1.93, 1);
    expect(result.intercept).toBeCloseTo(1.05, 1);
  });
});

describe("formatDateShort", () => {
  it("formats January date correctly", () => {
    expect(formatDateShort("2024-01")).toBe("Jan 2024");
  });

  it("formats December date correctly", () => {
    expect(formatDateShort("2023-12")).toBe("Dec 2023");
  });

  it("formats middle of year date correctly", () => {
    expect(formatDateShort("2022-06")).toBe("Jun 2022");
  });

  it("handles single digit months", () => {
    expect(formatDateShort("2024-03")).toBe("Mar 2024");
  });

  it("handles all months correctly", () => {
    const expectedMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    expectedMonths.forEach((month, index) => {
      const monthNum = String(index + 1).padStart(2, "0");
      expect(formatDateShort(`2024-${monthNum}`)).toBe(`${month} 2024`);
    });
  });
});

describe("formatDateAbbreviated", () => {
  it("formats date with abbreviated year", () => {
    expect(formatDateAbbreviated("2024-01")).toBe("Jan '24");
  });

  it("formats date from 2000s correctly", () => {
    expect(formatDateAbbreviated("2005-06")).toBe("Jun '05");
  });

  it("formats date from 2020s correctly", () => {
    expect(formatDateAbbreviated("2023-12")).toBe("Dec '23");
  });

  it("handles all months correctly", () => {
    const expectedMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    expectedMonths.forEach((month, index) => {
      const monthNum = String(index + 1).padStart(2, "0");
      expect(formatDateAbbreviated(`2022-${monthNum}`)).toBe(`${month} '22`);
    });
  });
});

describe("TIME_RANGES", () => {
  it("contains expected number of ranges", () => {
    expect(TIME_RANGES).toHaveLength(5);
  });

  it("has correct labels", () => {
    const labels = TIME_RANGES.map(r => r.label);
    expect(labels).toEqual(["1Y", "3Y", "5Y", "10Y", "ALL"]);
  });

  it("has correct month values", () => {
    expect(TIME_RANGES.find(r => r.label === "1Y")?.months).toBe(12);
    expect(TIME_RANGES.find(r => r.label === "3Y")?.months).toBe(36);
    expect(TIME_RANGES.find(r => r.label === "5Y")?.months).toBe(60);
    expect(TIME_RANGES.find(r => r.label === "10Y")?.months).toBe(120);
    expect(TIME_RANGES.find(r => r.label === "ALL")?.months).toBe(0);
  });

  it("ALL range has 0 months (meaning no filter)", () => {
    const allRange = TIME_RANGES.find(r => r.label === "ALL");
    expect(allRange?.months).toBe(0);
  });
});
