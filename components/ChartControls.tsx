"use client";

import { TIME_RANGES } from "@/lib/chart-utils";

interface TrendInfo {
  direction: "up" | "down";
  percentChange: string;
  absoluteChange?: string;
  isAggregate?: boolean;
}

interface ChartControlsProps {
  /** Current selected time range */
  selectedRange: string;
  /** Callback when range changes */
  onRangeChange: (range: string) => void;
  /** Whether trendline is visible */
  showTrendline: boolean;
  /** Callback when trendline visibility changes */
  onTrendlineChange: (show: boolean) => void;
  /** Trend direction and change info */
  trendInfo: TrendInfo | null;
  /** Display string for date range */
  dateRangeDisplay: string;
  /** Color for the trend toggle icon */
  trendColor?: string;
  /** Label for the chart type (used in aria-label) */
  chartLabel?: string;
  /** Whether to invert trend colors (for unemployment, up is bad) */
  invertTrendColors?: boolean;
}

export function ChartControls({
  selectedRange,
  onRangeChange,
  showTrendline,
  onTrendlineChange,
  trendInfo,
  dateRangeDisplay,
  trendColor = "#ef4444",
  chartLabel = "data",
  invertTrendColors = false,
}: ChartControlsProps) {
  // For unemployment, up is bad (red), down is good (green)
  // For job openings, up is good (green), down is bad (red)
  const isPositive = invertTrendColors
    ? trendInfo?.direction === "down"
    : trendInfo?.direction === "up";

  return (
    <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
      {/* Time Range Buttons */}
      <div className="flex items-center bg-secondary/20 p-0.5 rounded">
        {TIME_RANGES.map((range) => (
          <button
            key={range.label}
            onClick={() => onRangeChange(range.label)}
            className={`px-2 py-0.5 text-[10px] rounded-sm transition-all ${
              selectedRange === range.label
                ? "bg-background text-foreground shadow-sm font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-2 flex-wrap justify-end min-w-0 flex-1">
        {/* Trendline Toggle */}
        <button
          onClick={() => onTrendlineChange(!showTrendline)}
          aria-pressed={showTrendline}
          aria-label={showTrendline ? "Hide trendline" : "Show trendline"}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] transition-all border shrink-0 ${
            showTrendline 
              ? "bg-secondary/30 border-white/10 text-foreground" 
              : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary/10"
          }`}
        >
          <svg width="24" height="2" viewBox="0 0 24 2" fill="none" aria-hidden="true">
            <line 
              x1="0" y1="1" x2="24" y2="1" 
              stroke={showTrendline ? trendColor : "#737373"} 
              strokeWidth="2" 
              strokeDasharray="4 2" 
              strokeLinecap="round"
            />
          </svg>
          Trend
        </button>

        {/* Trend Indicator */}
        {trendInfo && (
          <div
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] shrink-0 ${
              isPositive
                ? "bg-green-500/10 border-green-500/20 text-green-500"
                : "bg-red-500/10 border-red-500/20 text-red-500"
            }`}
            aria-label={`${chartLabel} ${trendInfo.direction === "up" ? "increased" : "decreased"} by ${trendInfo.percentChange}${trendInfo.isAggregate ? " (avg)" : ""}`}
          >
            {trendInfo.isAggregate && (
              <span className="text-muted-foreground mr-0.5">avg</span>
            )}
            <span aria-hidden="true">{trendInfo.direction === "up" ? "▲" : "▼"}</span>
            <span className="font-mono font-medium">{trendInfo.percentChange}</span>
          </div>
        )}

        {/* Date Range Display */}
        <span className="text-[10px] text-muted-foreground hidden sm:block font-mono shrink-0">
          {dateRangeDisplay}
        </span>
      </div>
    </div>
  );
}
