"use client";

import React from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from "recharts";
import { SECTOR_LABELS, SECTOR_COLORS } from "@/lib/bls";
import { useSimpleChartData, useMultiSeriesChartData } from "@/lib/useChartData";
import { useTouchTooltipTimeout } from "@/lib/useTouchTooltipTimeout";
import { ChartControls } from "./ChartControls";
import { UnemploymentTooltip, UnemploymentMultiTooltip } from "./ChartTooltip";

interface DataPoint {
  date: string;
  value: number;
}

interface MultiDataPoint {
  date: string;
  sector: string;
  value: number;
}

interface UnemploymentChartProps {
  data: DataPoint[];
  multiData?: MultiDataPoint[];
  selectedSectors?: string[];
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
}

// Map unemployment sector to display label (strip unemployment_ prefix)
function getUnemploymentLabel(sector: string): string {
  return SECTOR_LABELS[sector] || sector.replace("unemployment_", "").toUpperCase();
}

export function UnemploymentChart({
  data,
  multiData,
  selectedSectors = ["unemployment_rate"],
  selectedRange: controlledRange,
  onRangeChange,
}: UnemploymentChartProps) {
  const isMultiSector = multiData && selectedSectors.length > 0;
  const touchProps = useTouchTooltipTimeout();
  const [isMounted, setIsMounted] = React.useState(false);
  const [showChatGPTLine, setShowChatGPTLine] = React.useState(true);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Single-sector mode (original behavior)
  const singleSeriesResult = useSimpleChartData(data, {
    selectedRange: controlledRange,
    onRangeChange,
  });

  // Multi-sector mode
  const multiSeriesResult = useMultiSeriesChartData(multiData || [], selectedSectors, {
    selectedRange: controlledRange,
    onRangeChange,
    includeUnemploymentRate: true, // unemployment_rate serves as "total" in this view
    trendUnit: "pp",
  });

  // Use appropriate result based on mode
  const {
    chartData,
    selectedRange,
    setSelectedRange,
    yAxisDomain,
    dateRangeDisplay,
    trendInfo,
    showTrendline,
    setShowTrendline,
  } = isMultiSector ? multiSeriesResult : singleSeriesResult;

  if (chartData.length === 0) {
    return (
      <div className="chart-container flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground animate-pulse">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 flex flex-col h-full">
      <ChartControls
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        showTrendline={showTrendline}
        onTrendlineChange={setShowTrendline}
        trendInfo={trendInfo}
        dateRangeDisplay={dateRangeDisplay}
        trendColor="#06b6d4"
        chartLabel="Unemployment"
        invertTrendColors
        showChatGPTLine={showChatGPTLine}
        onChatGPTLineChange={setShowChatGPTLine}
      />

      <div 
        {...touchProps}
        className="rounded-lg overflow-hidden bg-linear-to-b from-black/20 to-black/40 border border-white/5 flex-1 min-h-[300px] outline-none"
        role="img"
        aria-label={`Unemployment rate chart${isMultiSector ? ` showing ${selectedSectors.map(s => getUnemploymentLabel(s)).join(", ")}` : ""} from ${dateRangeDisplay}`}
      >
        {isMounted ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
            debounce={1}
            initialDimension={{ width: 1, height: 1 }}
          >
            <ComposedChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
              <defs>
                {isMultiSector ? (
                  selectedSectors.map((sector) => (
                    <linearGradient key={sector} id={`gradient-${sector}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={SECTOR_COLORS[sector] || "#06b6d4"} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={SECTOR_COLORS[sector] || "#06b6d4"} stopOpacity={0.02} />
                    </linearGradient>
                  ))
                ) : (
                  <linearGradient id="gradient-unemployment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                )}
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.4} />

              {/* ChatGPT release: Nov 30, 2022 */}
              {showChatGPTLine && (
                <ReferenceLine
                  x="2022-11"
                  stroke="#10b981"
                  strokeDasharray="4 3"
                  strokeOpacity={0.7}
                  label={{
                    value: "ChatGPT",
                    position: "top",
                    fill: "#10b981",
                    fontSize: 9,
                    fontWeight: 500,
                  }}
                />
              )}

              <XAxis
                dataKey="date"
                stroke="#555"
                tick={{ fill: "#666", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
                tickFormatter={(value) => {
                  const [year, month] = value.split("-");
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                  if (["5Y", "10Y", "ALL"].includes(selectedRange)) {
                    return month === "01" ? year : "";
                  }
                  return month === "01" ? year : monthNames[parseInt(month, 10) - 1];
                }}
              />

              <YAxis
                stroke="#555"
                tick={{ fill: "#666", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={isMultiSector ? yAxisDomain : yAxisDomain}
                width={40}
              />

              <Tooltip 
                content={isMultiSector ? <UnemploymentMultiTooltip /> : <UnemploymentTooltip />} 
                cursor={{ stroke: '#555', strokeWidth: 1, strokeDasharray: '4 4' }} 
              />

              {isMultiSector ? (
                <>
                  {selectedSectors.map((sector) => (
                    <Area
                      key={sector}
                      type="monotone"
                      dataKey={sector}
                      stroke={SECTOR_COLORS[sector] || "#06b6d4"}
                      strokeWidth={2}
                      fill={`url(#gradient-${sector})`}
                      fillOpacity={1}
                      dot={false}
                      activeDot={{ r: 6, fill: SECTOR_COLORS[sector] || "#06b6d4", stroke: "#000", strokeWidth: 2 }}
                    />
                  ))}

                  {showTrendline && selectedSectors.map((sector) => (
                    <Line
                      key={`${sector}_trend`}
                      type="monotone"
                      dataKey={`${sector}_trend`}
                      stroke={SECTOR_COLORS[sector] || "#06b6d4"}
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      strokeOpacity={0.5}
                      dot={false}
                      activeDot={false}
                    />
                  ))}
                </>
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#gradient-unemployment)"
                    fillOpacity={1}
                    dot={false}
                    activeDot={{ r: 6, fill: "#06b6d4", stroke: "#000", strokeWidth: 2 }}
                  />

                  {showTrendline && (
                    <Line
                      type="monotone"
                      dataKey="trend"
                      stroke="#06b6d4"
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      strokeOpacity={0.5}
                      dot={false}
                      activeDot={false}
                    />
                  )}
                </>
              )}
              
              <Brush dataKey="date" height={20} stroke="#333" fill="rgba(0,0,0,0.2)" tickFormatter={() => ""} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
