import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSimpleChartData, useMultiSeriesChartData } from "@/lib/useChartData";

describe("useSimpleChartData", () => {
  const mockData = [
    { date: "2023-01", value: 3.5 },
    { date: "2023-02", value: 3.6 },
    { date: "2023-03", value: 3.4 },
    { date: "2023-04", value: 3.5 },
    { date: "2023-05", value: 3.7 },
    { date: "2023-06", value: 3.6 },
    { date: "2024-01", value: 3.8 },
    { date: "2024-02", value: 3.9 },
    { date: "2024-03", value: 4.0 },
    { date: "2024-04", value: 4.1 },
    { date: "2024-05", value: 4.0 },
    { date: "2024-06", value: 4.2 },
    { date: "2025-01", value: 4.3 },
    { date: "2025-02", value: 4.4 },
    { date: "2025-03", value: 4.5 },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns filtered data based on time range", () => {
    const { result } = renderHook(() => useSimpleChartData(mockData, { defaultRange: "1Y" }));

    // 1Y should filter to last 12 months from 2025-06
    expect(result.current.chartData.length).toBeLessThan(mockData.length);
    expect(result.current.chartData[0].date).toBe("2024-06");
  });

  it("returns all data when range is ALL", () => {
    const { result } = renderHook(() => useSimpleChartData(mockData, { defaultRange: "ALL" }));

    expect(result.current.chartData.length).toBe(mockData.length);
  });

  it("adds trendline data to chart data", () => {
    const { result } = renderHook(() => useSimpleChartData(mockData));

    expect(result.current.chartData[0]).toHaveProperty("trend");
    expect(typeof result.current.chartData[0].trend).toBe("number");
  });

  it("calculates Y-axis domain with padding", () => {
    const { result } = renderHook(() => useSimpleChartData(mockData, { defaultRange: "ALL" }));

    const [min, max] = result.current.yAxisDomain;
    expect(min).toBeLessThanOrEqual(3.5);
    expect(max).toBeGreaterThanOrEqual(4.5);
  });

  it("formats date range display correctly", () => {
    const { result } = renderHook(() => useSimpleChartData(mockData, { defaultRange: "ALL" }));

    expect(result.current.dateRangeDisplay).toMatch(/Jan 2023.*Mar 2025/);
  });

  it("calculates trend info correctly", () => {
    const { result } = renderHook(() => useSimpleChartData(mockData, { defaultRange: "ALL" }));

    expect(result.current.trendInfo).not.toBeNull();
    expect(result.current.trendInfo?.direction).toBe("up");
    expect(result.current.trendInfo?.percentChange).toMatch(/\d+\.\d%/);
  });

  it("allows toggling trendline visibility", () => {
    const { result } = renderHook(() => useSimpleChartData(mockData));

    expect(result.current.showTrendline).toBe(true);

    act(() => {
      result.current.setShowTrendline(false);
    });

    expect(result.current.showTrendline).toBe(false);
  });

  it("allows changing time range in uncontrolled mode", () => {
    const { result } = renderHook(() => useSimpleChartData(mockData));

    expect(result.current.selectedRange).toBe("3Y");

    act(() => {
      result.current.setSelectedRange("5Y");
    });

    expect(result.current.selectedRange).toBe("5Y");
  });

  it("uses controlled range when provided", () => {
    const onRangeChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ range }) => useSimpleChartData(mockData, { selectedRange: range, onRangeChange }),
      { initialProps: { range: "1Y" } }
    );

    expect(result.current.selectedRange).toBe("1Y");

    act(() => {
      result.current.setSelectedRange("5Y");
    });

    expect(onRangeChange).toHaveBeenCalledWith("5Y");
    
    // Rerender with new controlled value
    rerender({ range: "5Y" });
    expect(result.current.selectedRange).toBe("5Y");
  });

  it("handles empty data gracefully", () => {
    const { result } = renderHook(() => useSimpleChartData([]));

    expect(result.current.chartData).toEqual([]);
    expect(result.current.dateRangeDisplay).toBe("");
    expect(result.current.trendInfo).toBeNull();
  });

  it("handles single data point", () => {
    const singlePoint = [{ date: "2025-01", value: 4.0 }];
    const { result } = renderHook(() => useSimpleChartData(singlePoint));

    expect(result.current.chartData.length).toBe(1);
    expect(result.current.trendInfo).toBeNull();
  });
});

describe("useMultiSeriesChartData", () => {
  const mockData = [
    { date: "2024-01", sector: "total", value: 8000 },
    { date: "2024-01", sector: "healthcare", value: 1500 },
    { date: "2024-02", sector: "total", value: 7800 },
    { date: "2024-02", sector: "healthcare", value: 1550 },
    { date: "2024-03", sector: "total", value: 7600 },
    { date: "2024-03", sector: "healthcare", value: 1600 },
    { date: "2025-01", sector: "total", value: 7200 },
    { date: "2025-01", sector: "healthcare", value: 1700 },
    { date: "2025-02", sector: "total", value: 7000 },
    { date: "2025-02", sector: "healthcare", value: 1750 },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pivots data by date with sector columns", () => {
    const { result } = renderHook(() =>
      useMultiSeriesChartData(mockData, ["total", "healthcare"], { defaultRange: "ALL" })
    );

    expect(result.current.chartData[0]).toHaveProperty("date");
    expect(result.current.chartData[0]).toHaveProperty("total");
    expect(result.current.chartData[0]).toHaveProperty("healthcare");
  });

  it("filters out unemployment_rate from sectors", () => {
    const { result } = renderHook(() =>
      useMultiSeriesChartData(mockData, ["total", "unemployment_rate"], { defaultRange: "ALL" })
    );

    expect(result.current.chartData[0]).not.toHaveProperty("unemployment_rate");
  });

  it("adds trendlines for each sector", () => {
    const { result } = renderHook(() =>
      useMultiSeriesChartData(mockData, ["total", "healthcare"], { defaultRange: "ALL" })
    );

    expect(result.current.chartData[0]).toHaveProperty("total_trend");
    expect(result.current.chartData[0]).toHaveProperty("healthcare_trend");
  });

  it("calculates Y-axis domain across all sectors", () => {
    const { result } = renderHook(() =>
      useMultiSeriesChartData(mockData, ["total", "healthcare"], { defaultRange: "ALL" })
    );

    const [min, max] = result.current.yAxisDomain;
    // Should encompass both total (7000-8000) and healthcare (1500-1750)
    expect(min).toBeLessThanOrEqual(1500);
    expect(max).toBeGreaterThanOrEqual(8000);
  });

  it("calculates aggregate trend info for multiple sectors", () => {
    const { result } = renderHook(() =>
      useMultiSeriesChartData(mockData, ["total", "healthcare"], { defaultRange: "ALL" })
    );

    expect(result.current.trendInfo).not.toBeNull();
    expect(result.current.trendInfo?.isAggregate).toBe(true);
  });

  it("does not mark as aggregate for single sector", () => {
    const { result } = renderHook(() =>
      useMultiSeriesChartData(mockData, ["total"], { defaultRange: "ALL" })
    );

    expect(result.current.trendInfo?.isAggregate).toBe(false);
  });

  it("handles empty selected sectors", () => {
    const { result } = renderHook(() =>
      useMultiSeriesChartData(mockData, [], { defaultRange: "ALL" })
    );

    expect(result.current.chartData.length).toBe(0);
  });

  it("handles sectors not in data", () => {
    const { result } = renderHook(() =>
      useMultiSeriesChartData(mockData, ["nonexistent"], { defaultRange: "ALL" })
    );

    expect(result.current.chartData.length).toBe(0);
  });
});
