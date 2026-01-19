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
import { useSimpleChartData } from "@/lib/useChartData";
import { useTouchTooltipTimeout } from "@/lib/useTouchTooltipTimeout";
import { ChartControls } from "./ChartControls";
import { ParticipationTooltip } from "./ChartTooltip";

interface DataPoint {
  date: string;
  value: number;
}

interface ParticipationChartProps {
  data: DataPoint[];
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
}

export function ParticipationChart({
  data,
  selectedRange: controlledRange,
  onRangeChange,
}: ParticipationChartProps) {
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
  } = useSimpleChartData(data, {
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
        trendColor="#a855f7"
        chartLabel="Participation"
        showChatGPTLine={showChatGPTLine}
        onChatGPTLineChange={setShowChatGPTLine}
      />

      <div 
        {...touchProps}
        className="rounded-lg overflow-hidden bg-linear-to-b from-black/20 to-black/40 border border-white/5 flex-1 min-h-[300px] outline-none"
        role="img"
        aria-label={`Labor force participation rate chart from ${dateRangeDisplay}`}
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
                <linearGradient id="gradient-participation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
                </linearGradient>
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
                domain={yAxisDomain}
                width={40}
              />

              <Tooltip content={<ParticipationTooltip />} cursor={{ stroke: '#555', strokeWidth: 1, strokeDasharray: '4 4' }} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#gradient-participation)"
                fillOpacity={1}
                dot={false}
                activeDot={{ r: 6, fill: "#a855f7", stroke: "#000", strokeWidth: 2 }}
              />

              {showTrendline && (
                <Line
                  type="monotone"
                  dataKey="trend"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  strokeOpacity={0.5}
                  dot={false}
                  activeDot={false}
                />
              )}
              
              <Brush dataKey="date" height={20} stroke="#333" fill="rgba(0,0,0,0.2)" tickFormatter={() => ""} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : null}
      </div>
    </div>
  );
}
