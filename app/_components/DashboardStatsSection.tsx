"use client";

import { InsightRotator } from "./InsightRotator";
import { StatsBar, Stats, RateData } from "./StatsBar";
import { StatsSkeleton, InsightSkeleton } from "./StatsSkeleton";

interface DashboardStatsSectionProps {
  isLoading: boolean;
  stats: Stats | null;
  unemploymentRate: RateData | null;
  participationRate: RateData | null;
  insights: string[];
}

export function DashboardStatsSection({
  isLoading,
  stats,
  unemploymentRate,
  participationRate,
  insights,
}: DashboardStatsSectionProps) {
  return (
    <section className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <StatsBar
          stats={stats}
          unemploymentRate={unemploymentRate}
          participationRate={participationRate}
        />
      )}

      {isLoading ? (
        <div className="hidden sm:block">
          <InsightSkeleton />
        </div>
      ) : (
        <>
          <div className="sm:hidden">
            <InsightRotator insights={insights} />
          </div>
          <div className="hidden sm:block">
            <InsightRotator insights={insights} />
          </div>
        </>
      )}
    </section>
  );
}
