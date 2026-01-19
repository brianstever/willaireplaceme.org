"use client";

import { AnimatedCounter } from "./AnimatedCounter";

export interface Stats {
  currentValue: number;
  peakValue: number;
  peakDate: string;
  changeFromPeak: number;
  latestDate: string;
  sparkline: Array<{ date: string; value: number }>;
}

export interface RateData {
  current: number;
  changeFromYearAgo: number | null;
  sparkline: Array<{ date: string; value: number }>;
}

export interface StatsBarProps {
  stats: Stats | null;
  unemploymentRate: RateData | null;
  participationRate: RateData | null;
}

export function StatsBar({ stats, unemploymentRate, participationRate }: StatsBarProps) {
  return (
    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 w-full sm:w-auto">
      {/* Job Openings */}
      {stats && (
        <StatCard
          value={stats.currentValue / 1000}
          decimals={2}
          suffix="M"
          label="OPENINGS"
          change={stats.changeFromPeak}
          sparkline={stats.sparkline}
          sparklineColor="#ef4444"
          // Lower openings = bad (red), higher = good (green)
          invertColors={false}
        />
      )}

      {/* Unemployment */}
      {unemploymentRate && (
        <StatCard
          value={unemploymentRate.current}
          decimals={1}
          suffix="%"
          label="UNEMPLOYMENT"
          change={unemploymentRate.changeFromYearAgo}
          sparkline={unemploymentRate.sparkline}
          sparklineColor="#06b6d4"
          // Higher unemployment = bad (red), lower = good (green)
          invertColors={true}
          hasBorder
        />
      )}

      {/* Participation Rate */}
      {participationRate && (
        <StatCard
          value={participationRate.current}
          decimals={1}
          suffix="%"
          label="PARTICIPATION"
          change={participationRate.changeFromYearAgo}
          sparkline={participationRate.sparkline}
          sparklineColor="#a855f7"
          // Higher participation = good (green), lower = bad (red)
          invertColors={false}
          hasBorder
        />
      )}
    </div>
  );
}

// --- Unified StatCard ---

interface StatCardProps {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
  change: number | null;
  sparkline?: Array<{ date: string; value: number }>;
  sparklineColor?: string;
  invertColors?: boolean;
  hasBorder?: boolean;
  className?: string;
}

function StatCard({
  value,
  decimals,
  suffix,
  label,
  change,
  sparkline,
  sparklineColor = "#06b6d4",
  invertColors = false,
  hasBorder = false,
  className = "",
}: StatCardProps) {
  const getChangeColor = (val: number) => {
    if (val === 0) return "bg-muted text-muted-foreground";
    const isPositive = val > 0;
    const isGood = invertColors ? !isPositive : isPositive;
    return isGood
      ? "bg-green-500/10 text-green-500"
      : "bg-red-500/10 text-red-500";
  };

  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 ${
        hasBorder ? "sm:pl-6 sm:border-l sm:border-card-border" : ""
      } ${className}`}
    >
      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline gap-1 sm:gap-2">
          <span
            className="text-2xl font-light tracking-tight"
            style={{ fontFamily: "var(--font-family-mono)" }}
          >
            <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
          </span>
          {change !== null && (
            <span
              className={`text-[10px] font-mono px-1 py-0.5 rounded shrink-0 ${getChangeColor(change)}`}
            >
              {change > 0 ? "+" : ""}
              <AnimatedCounter value={change} decimals={1} />
            </span>
          )}
        </div>
        <span className="text-[11px] sm:text-[10px] text-muted-foreground font-mono tracking-wide">
          {label}
        </span>
      </div>

      {sparkline && sparkline.length > 1 && (
        <Sparkline
          data={sparkline}
          color={sparklineColor}
          label={`${label} trend, currently ${value.toFixed(decimals)}${suffix}`}
        />
      )}
    </div>
  );
}

// --- Sparkline helper ---

interface SparklineProps {
  data: Array<{ value: number }>;
  color: string;
  label: string;
}

function Sparkline({ data, color, label }: SparklineProps) {
  const minVal = Math.min(...data.map((d) => d.value));
  const maxVal = Math.max(...data.map((d) => d.value));
  const range = maxVal - minVal || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 58 + 1;
      const y = 22 - ((d.value - minVal) / range) * 20;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 60 24"
      className="w-[60px] h-[24px] opacity-60 shrink-0 hidden sm:block"
      role="img"
      aria-label={label}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
