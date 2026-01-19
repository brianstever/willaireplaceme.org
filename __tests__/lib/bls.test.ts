import { describe, it, expect } from "vitest";
import {
  BLS_SERIES,
  SECTOR_LABELS,
  transformBLSData,
} from "@/lib/bls";

describe("BLS_SERIES", () => {
  it("contains all expected sectors", () => {
    const sectors = Object.keys(BLS_SERIES);
    expect(sectors).toContain("total");
    expect(sectors).toContain("manufacturing");
    expect(sectors).toContain("healthcare");
    expect(sectors).toContain("retail");
    expect(sectors).toContain("professional");
    expect(sectors).toContain("information");
    expect(sectors).toContain("government");
  });

  it("has correct series ID format for JOLTS data", () => {
    // All JOLTS series IDs start with JTS
    Object.values(BLS_SERIES).forEach((seriesId) => {
      expect(seriesId).toMatch(/^JTS/);
    });
  });

  it("total nonfarm has correct series ID", () => {
    expect(BLS_SERIES.total).toBe("JTS000000000000000JOL");
  });

  it("information sector has correct series ID", () => {
    expect(BLS_SERIES.information).toBe("JTS510000000000000JOL");
  });
});

describe("SECTOR_LABELS", () => {
  it("has labels for all BLS_SERIES sectors", () => {
    Object.keys(BLS_SERIES).forEach((sector) => {
      expect(SECTOR_LABELS[sector]).toBeDefined();
      expect(typeof SECTOR_LABELS[sector]).toBe("string");
    });
  });

  it("has label for unemployment_rate", () => {
    // unemployment_rate serves as "ALL INDUSTRIES" in unemployment industry filter
    expect(SECTOR_LABELS.unemployment_rate).toBe("ALL INDUSTRIES");
  });

  it("labels are uppercase", () => {
    Object.values(SECTOR_LABELS).forEach((label) => {
      expect(label).toBe(label.toUpperCase());
    });
  });

  it("total label is TOTAL NONFARM", () => {
    expect(SECTOR_LABELS.total).toBe("TOTAL NONFARM");
  });
});

describe("transformBLSData", () => {
  it("transforms BLS response to our format", () => {
    const mockResponse = {
      status: "REQUEST_SUCCEEDED",
      Results: {
        series: [
          {
            seriesID: "JTS000000000000000JOL",
            data: [
              { year: "2024", period: "M01", periodName: "January", value: "8500" },
              { year: "2024", period: "M02", periodName: "February", value: "8600" },
            ],
          },
        ],
      },
    };

    const seriesIdToSector = {
      JTS000000000000000JOL: "total",
    };

    const result = transformBLSData(mockResponse, seriesIdToSector);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ date: "2024-01", sector: "total", value: 8500 });
    expect(result[1]).toEqual({ date: "2024-02", sector: "total", value: 8600 });
  });

  it("handles multiple series", () => {
    const mockResponse = {
      status: "REQUEST_SUCCEEDED",
      Results: {
        series: [
          {
            seriesID: "JTS000000000000000JOL",
            data: [
              { year: "2024", period: "M01", periodName: "January", value: "8500" },
            ],
          },
          {
            seriesID: "JTS510000000000000JOL",
            data: [
              { year: "2024", period: "M01", periodName: "January", value: "500" },
            ],
          },
        ],
      },
    };

    const seriesIdToSector = {
      JTS000000000000000JOL: "total",
      JTS510000000000000JOL: "information",
    };

    const result = transformBLSData(mockResponse, seriesIdToSector);

    expect(result).toHaveLength(2);
    expect(result.find(r => r.sector === "total")).toEqual({
      date: "2024-01",
      sector: "total",
      value: 8500,
    });
    expect(result.find(r => r.sector === "information")).toEqual({
      date: "2024-01",
      sector: "information",
      value: 500,
    });
  });

  it("skips unknown series IDs", () => {
    const mockResponse = {
      status: "REQUEST_SUCCEEDED",
      Results: {
        series: [
          {
            seriesID: "UNKNOWN_SERIES",
            data: [
              { year: "2024", period: "M01", periodName: "January", value: "100" },
            ],
          },
        ],
      },
    };

    const seriesIdToSector = {
      JTS000000000000000JOL: "total",
    };

    const result = transformBLSData(mockResponse, seriesIdToSector);
    expect(result).toHaveLength(0);
  });

  it("skips invalid numeric values", () => {
    const mockResponse = {
      status: "REQUEST_SUCCEEDED",
      Results: {
        series: [
          {
            seriesID: "JTS000000000000000JOL",
            data: [
              { year: "2024", period: "M01", periodName: "January", value: "8500" },
              { year: "2024", period: "M02", periodName: "February", value: "N/A" },
              { year: "2024", period: "M03", periodName: "March", value: "8700" },
            ],
          },
        ],
      },
    };

    const seriesIdToSector = {
      JTS000000000000000JOL: "total",
    };

    const result = transformBLSData(mockResponse, seriesIdToSector);
    expect(result).toHaveLength(2);
    expect(result[0].date).toBe("2024-01");
    expect(result[1].date).toBe("2024-03");
  });

  it("pads single-digit months correctly", () => {
    const mockResponse = {
      status: "REQUEST_SUCCEEDED",
      Results: {
        series: [
          {
            seriesID: "JTS000000000000000JOL",
            data: [
              { year: "2024", period: "M1", periodName: "January", value: "8500" },
              { year: "2024", period: "M9", periodName: "September", value: "8600" },
            ],
          },
        ],
      },
    };

    const seriesIdToSector = {
      JTS000000000000000JOL: "total",
    };

    const result = transformBLSData(mockResponse, seriesIdToSector);
    expect(result[0].date).toBe("2024-01");
    expect(result[1].date).toBe("2024-09");
  });

  it("handles empty series data", () => {
    const mockResponse = {
      status: "REQUEST_SUCCEEDED",
      Results: {
        series: [
          {
            seriesID: "JTS000000000000000JOL",
            data: [],
          },
        ],
      },
    };

    const seriesIdToSector = {
      JTS000000000000000JOL: "total",
    };

    const result = transformBLSData(mockResponse, seriesIdToSector);
    expect(result).toHaveLength(0);
  });

  it("handles decimal values", () => {
    const mockResponse = {
      status: "REQUEST_SUCCEEDED",
      Results: {
        series: [
          {
            seriesID: "LNS14000000",
            data: [
              { year: "2024", period: "M01", periodName: "January", value: "3.7" },
            ],
          },
        ],
      },
    };

    const seriesIdToSector = {
      LNS14000000: "unemployment_rate",
    };

    const result = transformBLSData(mockResponse, seriesIdToSector);
    expect(result[0].value).toBe(3.7);
  });
});
