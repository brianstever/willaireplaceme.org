"use client";

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
} from "recharts";
import { useSimpleChartData } from "@/lib/useChartData";
import { ChartControls } from "./ChartControls";
import { UnemploymentTooltip } from "./ChartTooltip";

interface DataPoint {
  date: string;
  value: number;
}

interface UnemploymentChartProps {
  data: DataPoint[];
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
}

export function UnemploymentChart({
  data,
  selectedRange: controlledRange,
  onRangeChange,
}: UnemploymentChartProps) {
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
        trendColor="#06b6d4"
        chartLabel="Unemployment"
        invertTrendColors
      />

      <div 
        className="rounded-lg overflow-hidden bg-linear-to-b from-black/20 to-black/40 border border-white/5 flex-1 min-h-0"
        role="img"
        aria-label={`Unemployment rate chart from ${dateRangeDisplay}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="gradient-unemployment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.4} />

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

            <Tooltip content={<UnemploymentTooltip />} cursor={{ stroke: '#555', strokeWidth: 1, strokeDasharray: '4 4' }} />

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
            
            <Brush dataKey="date" height={20} stroke="#333" fill="rgba(0,0,0,0.2)" tickFormatter={() => ""} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
