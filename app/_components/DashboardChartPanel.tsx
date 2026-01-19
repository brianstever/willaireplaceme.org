"use client";
import { ChartErrorBoundary } from "./ChartErrorBoundary";
import { ChartSkeleton } from "./ChartSkeleton";
import { JobChart } from "./JobChart";
import { UnemploymentChart } from "./UnemploymentChart";
import { ParticipationChart } from "./ParticipationChart";
import { ViewMode } from "./ViewToggle";

interface JobDataPoint {
  date: string;
  sector: string;
  value: number;
}

interface RateHistoryPoint {
  date: string;
  value: number;
}

interface RateSeries {
  history: RateHistoryPoint[];
}

interface MultiSectorPoint {
  date: string;
  sector: string;
  value: number;
}

interface DashboardChartPanelProps {
  viewMode: ViewMode;
  jobData: JobDataPoint[] | undefined;
  selectedSectors: string[];
  unemploymentRate: RateSeries | null | undefined;
  unemploymentByIndustry: MultiSectorPoint[] | undefined;
  selectedUnemploymentSectors: string[];
  participationRate: RateSeries | null | undefined;
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

export function DashboardChartPanel({
  viewMode,
  jobData,
  selectedSectors,
  unemploymentRate,
  unemploymentByIndustry,
  selectedUnemploymentSectors,
  participationRate,
  selectedRange,
  onRangeChange,
}: DashboardChartPanelProps) {
  const chartName =
    viewMode === "openings"
      ? "Job Openings"
      : viewMode === "unemployment"
      ? "Unemployment Rate"
      : "Participation Rate";

  return (
    <section
      id="chart-panel"
      role="tabpanel"
      className="flex-1 min-h-0 flex flex-col"
      aria-label="Data visualization"
    >
      <ChartErrorBoundary chartName={chartName}>
        {viewMode === "openings" ? (
          jobData && jobData.length > 0 ? (
            <JobChart
              data={jobData}
              selectedSectors={selectedSectors}
              selectedRange={selectedRange}
              onRangeChange={onRangeChange}
            />
          ) : (
            <ChartSkeleton />
          )
        ) : viewMode === "unemployment" ? (
          unemploymentRate?.history && unemploymentRate.history.length > 0 ? (
            <UnemploymentChart
              data={unemploymentRate.history}
              multiData={unemploymentByIndustry}
              selectedSectors={selectedUnemploymentSectors}
              selectedRange={selectedRange}
              onRangeChange={onRangeChange}
            />
          ) : (
            <ChartSkeleton />
          )
        ) : participationRate?.history && participationRate.history.length > 0 ? (
          <ParticipationChart
            data={participationRate.history}
            selectedRange={selectedRange}
            onRangeChange={onRangeChange}
          />
        ) : (
          <ChartSkeleton />
        )}
      </ChartErrorBoundary>
    </section>
  );
}
