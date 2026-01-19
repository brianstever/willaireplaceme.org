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
import { useMultiSeriesChartData } from "@/lib/useChartData";
import { useTouchTooltipTimeout } from "@/lib/useTouchTooltipTimeout";
import { ChartControls } from "./ChartControls";
import { JobChartTooltip } from "./ChartTooltip";

interface DataPoint {
  date: string;
  sector: string;
  value: number;
}

interface JobChartProps {
  data: DataPoint[];
  selectedSectors: string[];
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
}

export function JobChart({
  data,
  selectedSectors,
  selectedRange: controlledRange,
  onRangeChange,
}: JobChartProps) {
  const chartSectors = selectedSectors.filter(s => s !== "unemployment_rate");
  const touchProps = useTouchTooltipTimeout();
  const [isMounted, setIsMounted] = React.useState(false);
  const [showChatGPTLine, setShowChatGPTLine] = React.useState(true);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const {
    chartData,
    selectedRange,
    setSelectedRange,
    yAxisDomain,
    dateRangeDisplay,
    trendInfo,
    showTrendline,
    setShowTrendline,
  } = useMultiSeriesChartData(data, selectedSectors, {
    selectedRange: controlledRange,
    onRangeChange,
  });

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
        trendColor="#ef4444"
        chartLabel="Job openings"
        showChatGPTLine={showChatGPTLine}
        onChatGPTLineChange={setShowChatGPTLine}
      />

      <div 
        {...touchProps}
        className="rounded-lg overflow-hidden bg-linear-to-b from-black/20 to-black/40 border border-white/5 flex-1 min-h-[300px] outline-none"
        role="img"
        aria-label={`Job openings chart showing ${chartSectors.map(s => SECTOR_LABELS[s] || s).join(", ")} from ${dateRangeDisplay}`}
        ref={(el) => {
          // Forward to touchProps ref
          if (touchProps.ref) (touchProps.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
        }}
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
                {chartSectors.map((sector) => (
                  <linearGradient key={sector} id={`gradient-${sector}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SECTOR_COLORS[sector] || "#ef4444"} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={SECTOR_COLORS[sector] || "#ef4444"} stopOpacity={0.02} />
                  </linearGradient>
                ))}
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
                tick={({ x, y, payload }) => {
                  const [year, month] = payload.value.split("-");
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const monthName = monthNames[parseInt(month, 10) - 1];
                  
                  let text = "";
                  let isYear = false;

                  // long ranges: years only; short ranges: months too
                  if (["5Y", "10Y", "ALL"].includes(selectedRange)) {
                    if (month === "01") {
                      text = year;
                      isYear = true;
                    }
                  } else {
                    if (month === "01") {
                      text = year;
                      isYear = true;
                    } else {
                      text = monthName;
                    }
                  }

                  if (!text) return null;

                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={12}
                        textAnchor="middle"
                        fill={isYear ? "#ef4444" : "#666"}
                        fontSize={9}
                        fontWeight={isYear ? 600 : 400}
                      >
                        {text}
                      </text>
                    </g>
                  );
                }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
                interval="preserveStartEnd"
              />

              <YAxis
                stroke="#555"
                tick={{ fill: "#666", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}M` : `${value}K`}
                domain={yAxisDomain}
                width={40}
              />

              <Tooltip content={<JobChartTooltip />} cursor={{ stroke: '#555', strokeWidth: 1, strokeDasharray: '4 4' }} />

              {chartSectors.map((sector) => (
                <Area
                  key={sector}
                  type="monotone"
                  dataKey={sector}
                  stroke={SECTOR_COLORS[sector] || "#ef4444"}
                  strokeWidth={2}
                  fill={`url(#gradient-${sector})`}
                  fillOpacity={1}
                  dot={false}
                  activeDot={{ r: 6, fill: SECTOR_COLORS[sector] || "#ef4444", stroke: "#000", strokeWidth: 2 }}
                />
              ))}

              {showTrendline && chartSectors.map((sector) => (
                <Line
                  key={`${sector}_trend`}
                  type="monotone"
                  dataKey={`${sector}_trend`}
                  stroke={SECTOR_COLORS[sector] || "#ef4444"}
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  strokeOpacity={0.5}
                  dot={false}
                  activeDot={false}
                />
              ))}
              
              <Brush dataKey="date" height={20} stroke="#333" fill="rgba(0,0,0,0.2)" tickFormatter={() => ""} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
