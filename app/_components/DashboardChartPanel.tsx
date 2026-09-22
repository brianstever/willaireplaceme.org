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

  const loading =
    viewMode === "openings"
      ? jobData === undefined
      : viewMode === "unemployment"
        ? unemploymentByIndustry === undefined
        : participationRate === undefined;
  const hasData =
    viewMode === "openings"
      ? jobData?.some((row) => selectedSectors.includes(row.sector))
      : viewMode === "unemployment"
        ? unemploymentByIndustry?.some((row) =>
            selectedUnemploymentSectors.includes(row.sector),
          )
        : !!participationRate?.history.length;

  return (
    <section
      id="chart-panel"
      role="tabpanel"
      aria-labelledby={`tab-${viewMode}`}
      className="h-[550px] md:h-[600px] flex flex-col"
    >
      <ChartErrorBoundary chartName={chartName}>
        {loading ? (
          <ChartSkeleton />
        ) : !hasData ? (
          <p
            role="status"
            className="flex-1 flex items-center justify-center text-sm text-muted-foreground"
          >
            No data is available for this selection.
          </p>
        ) : viewMode === "openings" ? (
          <JobChart
            data={jobData!}
            selectedSectors={selectedSectors}
            selectedRange={selectedRange}
            onRangeChange={onRangeChange}
          />
        ) : viewMode === "unemployment" ? (
          <UnemploymentChart
            data={unemploymentRate?.history ?? []}
            multiData={unemploymentByIndustry}
            selectedSectors={selectedUnemploymentSectors}
            selectedRange={selectedRange}
            onRangeChange={onRangeChange}
          />
        ) : (
          <ParticipationChart
            data={participationRate!.history}
            selectedRange={selectedRange}
            onRangeChange={onRangeChange}
          />
        )}
      </ChartErrorBoundary>
    </section>
  );
}
