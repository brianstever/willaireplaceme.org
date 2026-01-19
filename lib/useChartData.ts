"use client";

import { useMemo, useState } from "react";
import { TIME_RANGES, linearRegression, formatDateShort } from "./chart-utils";

interface UseChartDataOptions {
  /** Controlled time range value */
  selectedRange?: string;
  /** Callback when range changes (for controlled mode) */
  onRangeChange?: (range: string) => void;
  /** Default range for uncontrolled mode */
  defaultRange?: string;
  /** Skip filtering out unemployment_rate (for unemployment chart) */
  includeUnemploymentRate?: boolean;
  /** How trend values should be expressed */
  trendUnit?: "%" | "pp";
}

interface TrendInfo {
  direction: "up" | "down";
  percentChange: string;
  absoluteChange?: string;
  isAggregate?: boolean;
  unit?: "%" | "pp"; // percent vs percentage points
}

interface ChartDataResult<T> {
  /** Filtered and processed data with trendlines */
  chartData: T[];
  /** Current time range selection */
  selectedRange: string;
  /** Update time range */
  setSelectedRange: (range: string) => void;
  /** Y-axis domain [min, max] */
  yAxisDomain: [number, number];
  /** Display string for date range */
  dateRangeDisplay: string;
  /** Trend direction and change info */
  trendInfo: TrendInfo | null;
  /** Whether trendline is visible */
  showTrendline: boolean;
  /** Toggle trendline visibility */
  setShowTrendline: (show: boolean) => void;
}

// Filter data by time range, anchored to latest data point (not system date)
function filterByTimeRange<T extends { date: string }>(
  data: T[],
  rangeLabel: string
): T[] {
  if (data.length === 0) return [];
  
  const range = TIME_RANGES.find(r => r.label === rangeLabel);
  if (!range || range.months === 0) return data;
  
  // anchor to latest data point, not today
  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const latestDate = new Date(sorted[sorted.length - 1].date + "-01");
  
  const cutoffDate = new Date(latestDate);
  cutoffDate.setMonth(cutoffDate.getMonth() - range.months);
  const cutoffStr = cutoffDate.toISOString().slice(0, 7);
  
  return data.filter(d => d.date >= cutoffStr);
}

// Single value series (unemployment rate)
export function useSimpleChartData(
  data: Array<{ date: string; value: number }>,
  options: UseChartDataOptions = {}
): ChartDataResult<{ date: string; value: number; trend?: number }> {
  const { selectedRange: controlledRange, onRangeChange, defaultRange = "3Y" } = options;
  
  const [internalRange, setInternalRange] = useState(defaultRange);
  const selectedRange = controlledRange ?? internalRange;
  const setSelectedRange = (range: string) => {
    if (onRangeChange) {
      onRangeChange(range);
    } else {
      setInternalRange(range);
    }
  };
  
  const [showTrendline, setShowTrendline] = useState(true);

  const filteredData = useMemo(
    () => filterByTimeRange(data, selectedRange),
    [data, selectedRange]
  );

  const chartData = useMemo(() => {
    if (filteredData.length < 2) return filteredData;

    const points = filteredData.map((d, i) => ({ x: i, y: d.value }));
    const { slope, intercept } = linearRegression(points);

    return filteredData.map((d, i) => ({
      ...d,
      trend: slope * i + intercept,
    }));
  }, [filteredData]);

  const yAxisDomain = useMemo((): [number, number] => {
    if (chartData.length === 0) return [0, 10];

    const values = chartData.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    
    const padding = (maxVal - minVal) * 0.2;
    return [
      Math.max(0, Math.floor((minVal - padding) * 10) / 10),
      Math.ceil((maxVal + padding) * 10) / 10
    ];
  }, [chartData]);

  const dateRangeDisplay = useMemo(() => {
    if (chartData.length === 0) return "";
    return `${formatDateShort(chartData[0].date)} — ${formatDateShort(chartData[chartData.length - 1].date)}`;
  }, [chartData]);

  const trendInfo = useMemo((): TrendInfo | null => {
    if (chartData.length < 2) return null;
    
    // for rate data (unemployment, participation), change is in percentage points
    const change = chartData[chartData.length - 1].value - chartData[0].value;
    return {
      direction: change > 0 ? "up" : "down",
      percentChange: `${Math.abs(change).toFixed(1)} pp`,
      absoluteChange: Math.abs(change).toFixed(1),
      unit: "pp",
    };
  }, [chartData]);

  return {
    chartData,
    selectedRange,
    setSelectedRange,
    yAxisDomain,
    dateRangeDisplay,
    trendInfo,
    showTrendline,
    setShowTrendline,
  };
}

// Multi-sector series (job openings and unemployment by industry)
export function useMultiSeriesChartData(
  data: Array<{ date: string; sector: string; value: number }>,
  selectedSectors: string[],
  options: UseChartDataOptions = {}
): ChartDataResult<Record<string, unknown>> {
  const {
    selectedRange: controlledRange,
    onRangeChange,
    defaultRange = "3Y",
    includeUnemploymentRate = false,
    trendUnit = "%",
  } = options;
  
  const [internalRange, setInternalRange] = useState(defaultRange);
  const selectedRange = controlledRange ?? internalRange;
  const setSelectedRange = (range: string) => {
    if (onRangeChange) {
      onRangeChange(range);
    } else {
      setInternalRange(range);
    }
  };
  
  const [showTrendline, setShowTrendline] = useState(true);

  // Filter out unemployment_rate from job openings sectors (unless explicitly included)
  const chartSectors = useMemo(
    () => includeUnemploymentRate 
      ? selectedSectors 
      : selectedSectors.filter(s => s !== "unemployment_rate"),
    [selectedSectors, includeUnemploymentRate]
  );

  // Pivot data: group by date, spread sector values as columns
  const allChartData = useMemo(() => {
    const dateMap = new Map<string, { date: string } & Record<string, string | number>>();
    for (const point of data) {
      if (!chartSectors.includes(point.sector)) continue;
      if (!dateMap.has(point.date)) {
        dateMap.set(point.date, { date: point.date });
      }
      dateMap.get(point.date)![point.sector] = point.value;
    }
    return Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [data, chartSectors]);

  const filteredData = useMemo(
    () => filterByTimeRange(allChartData, selectedRange),
    [allChartData, selectedRange]
  );

  // Add trendlines per sector
  const chartData = useMemo(() => {
    if (filteredData.length < 2) return filteredData;

    const trendlines: Record<string, { slope: number; intercept: number }> = {};
    
    for (const sector of chartSectors) {
      const points = filteredData
        .map((d, i) => ({ x: i, y: d[sector] as number }))
        .filter(p => p.y !== undefined && !isNaN(p.y));
      
      if (points.length >= 2) {
        trendlines[sector] = linearRegression(points);
      }
    }

    return filteredData.map((d, i) => {
      const withTrend: Record<string, unknown> = { ...d };
      for (const sector of chartSectors) {
        if (trendlines[sector]) {
          const { slope, intercept } = trendlines[sector];
          withTrend[`${sector}_trend`] = slope * i + intercept;
        }
      }
      return withTrend;
    });
  }, [filteredData, chartSectors]);

  const yAxisDomain = useMemo((): [number, number] => {
    if (chartData.length === 0 || chartSectors.length === 0) return [0, 12000];

    let maxValue = 0;
    let minValue = Infinity;

    for (const point of chartData) {
      for (const sector of chartSectors) {
        const val = point[sector] as number;
        if (val !== undefined && val !== null && !isNaN(val)) {
          if (val > maxValue) maxValue = val;
          if (val < minValue) minValue = val;
        }
      }
    }

    if (minValue === Infinity) minValue = 0;
    if (maxValue === 0) return [0, 12000];

    const range = maxValue - minValue;
    const padding = range * 0.15;
    
    // Only zoom in if data is clustered away from zero
    const domainMin = minValue > range * 0.5 ? Math.max(0, minValue - padding) : 0;
    const domainMax = maxValue + padding;

    return [Math.floor(domainMin), Math.ceil(domainMax)];
  }, [chartData, chartSectors]);

  const dateRangeDisplay = useMemo(() => {
    if (chartData.length === 0) return "";
    const first = chartData[0].date as string;
    const last = chartData[chartData.length - 1].date as string;
    return `${formatDateShort(first)} — ${formatDateShort(last)}`;
  }, [chartData]);

  const trendInfo = useMemo((): TrendInfo | null => {
    if (chartData.length < 2) return null;

    if (trendUnit === "pp") {
      const changes: number[] = [];

      for (const sector of chartSectors) {
        const firstVal = chartData[0][sector] as number;
        const lastVal = chartData[chartData.length - 1][sector] as number;

        if (firstVal !== undefined && lastVal !== undefined && !isNaN(firstVal) && !isNaN(lastVal)) {
          changes.push(lastVal - firstVal);
        }
      }

      if (changes.length === 0) return null;

      const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

      return {
        direction: avgChange >= 0 ? "up" : "down",
        percentChange: `${Math.abs(avgChange).toFixed(1)} pp`,
        absoluteChange: Math.abs(avgChange).toFixed(1),
        isAggregate: chartSectors.length > 1,
        unit: "pp",
      };
    }
    
    const percentChanges: number[] = [];
    
    for (const sector of chartSectors) {
      const firstVal = chartData[0][sector] as number;
      const lastVal = chartData[chartData.length - 1][sector] as number;
      
      if (firstVal !== undefined && lastVal !== undefined && !isNaN(firstVal) && !isNaN(lastVal) && firstVal !== 0) {
        const percentChange = ((lastVal - firstVal) / firstVal) * 100;
        percentChanges.push(percentChange);
      }
    }
    
    if (percentChanges.length === 0) return null;
    
    const avgPercentChange = percentChanges.reduce((a, b) => a + b, 0) / percentChanges.length;
    
    // job openings use true percent change
    return {
      direction: avgPercentChange >= 0 ? "up" : "down",
      percentChange: `${Math.abs(avgPercentChange).toFixed(1)}%`,
      isAggregate: chartSectors.length > 1,
      unit: "%",
    };
  }, [chartData, chartSectors, trendUnit]);

  return {
    chartData,
    selectedRange,
    setSelectedRange,
    yAxisDomain,
    dateRangeDisplay,
    trendInfo,
    showTrendline,
    setShowTrendline,
  };
}
