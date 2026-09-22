"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import { DashboardHeader } from "@/app/_components/DashboardHeader";
import { DashboardFooter } from "@/app/_components/DashboardFooter";
import { DashboardStatsSection } from "@/app/_components/DashboardStatsSection";
import { DashboardChartPanel } from "@/app/_components/DashboardChartPanel";
import { DashboardSectorFilters } from "@/app/_components/DashboardSectorFilters";
import { ViewToggle, ViewMode } from "@/app/_components/ViewToggle";
import { FederalAnnouncements } from "@/app/_components/FederalAnnouncements";
import { DataStatus } from "@/app/_components/DataStatus";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SECTOR_LABELS, JOB_OPENING_SECTORS } from "@/lib/bls";
import { formatDateAbbreviated } from "@/lib/chart-utils";

export default function Home() {
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["total"]);
  const [selectedUnemploymentSectors, setSelectedUnemploymentSectors] =
    useState<string[]>(["unemployment_rate"]);
  const [selectedParticipationSectors, setSelectedParticipationSectors] =
    useState<string[]>(["participation_rate"]);
  const [viewMode, setViewMode] = useState<ViewMode>("openings");
  const [timeRange, setTimeRange] = useState<string>("3Y");

  const jobData = useQuery(api.jobs.getJobOpenings, {});
  const latestData = useQuery(api.jobs.getLatestBySector, {});
  const peakData = useQuery(api.jobs.getPeakValue, { sector: "total" });
  const metadata = useQuery(api.jobs.getMetadata, { key: "lastUpdated" });
  const analysis = useQuery(api.jobs.getDataAnalysis, {});
  const unemploymentRate = useQuery(api.jobs.getUnemploymentRate, {});
  const participationRate = useQuery(api.jobs.getParticipationRate, {});
  const unemploymentByIndustry = useQuery(
    api.jobs.getUnemploymentByIndustry,
    {},
  );
  const unemploymentSectors = useQuery(api.jobs.getUnemploymentSectors, {});

  const jobDataItems = useMemo(
    () =>
      jobData?.filter(
        (item): item is NonNullable<typeof item> => item !== null,
      ) ?? [],
    [jobData],
  );

  const insights = useMemo(() => {
    if (!analysis) return [];

    const result: string[] = [];

    if (analysis.peak && analysis.latest) {
      result.push(
        `Peak ${(analysis.peak.value / 1000).toFixed(1)}M (${formatDateAbbreviated(analysis.peak.date)}) → Now ${(analysis.latest.value / 1000).toFixed(1)}M`,
      );
    }

    if (analysis.steepestDecline) {
      const s = analysis.steepestDecline;
      const sectorName = SECTOR_LABELS[s.sector] || s.sector;
      result.push(
        `${sectorName} down ${Math.abs(s.changePercent).toFixed(0)}%: ${(s.peakValue / 1000).toFixed(2)}M → ${(s.latestValue / 1000).toFixed(2)}M`,
      );
    }

    if (
      analysis.mostResilient &&
      analysis.mostResilient.sector !== analysis.steepestDecline?.sector
    ) {
      const s = analysis.mostResilient;
      const sectorName = SECTOR_LABELS[s.sector] || s.sector;
      result.push(
        `${sectorName} ${s.changePercent >= 0 ? "up" : "down"} ${Math.abs(s.changePercent).toFixed(0)}%: ${(s.peakValue / 1000).toFixed(2)}M → ${(s.latestValue / 1000).toFixed(2)}M`,
      );
    }

    if (analysis.prePandemic && analysis.changeFromPrePandemic !== null) {
      const dir = analysis.changeFromPrePandemic > 0 ? "above" : "below";
      result.push(
        `${Math.abs(analysis.changeFromPrePandemic).toFixed(0)}% ${dir} pre-pandemic (${formatDateAbbreviated(analysis.prePandemic.date)})`,
      );
    }

    return result;
  }, [analysis]);

  const sectors = useMemo(() => {
    if (jobDataItems.length === 0) return [];
    return [...new Set(jobDataItems.map((d) => d.sector))].filter((s) =>
      JOB_OPENING_SECTORS.some((key) => key === s),
    );
  }, [jobDataItems]);

  const stats = useMemo(() => {
    if (!latestData || !peakData || jobDataItems.length === 0) return null;
    const latestItems = latestData.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );

    const totalLatest = latestItems.find((d) => d.sector === "total");
    if (!totalLatest) return null;

    const currentValue = totalLatest.value;
    const peakValue = peakData.value;
    const changeFromPeak = ((currentValue - peakValue) / peakValue) * 100;

    const totalData = jobDataItems
      .filter((d) => d.sector === "total")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12)
      .map((d) => ({ date: d.date, value: d.value }));

    return {
      currentValue,
      peakValue,
      peakDate: peakData.date,
      changeFromPeak,
      latestDate: totalLatest.date,
      sparkline: totalData,
    };
  }, [latestData, peakData, jobDataItems]);

  const handleSectorToggle = (sector: string) => {
    setSelectedSectors((prev) => {
      if (sector === "total") {
        return ["total"];
      }

      if (prev.includes(sector)) {
        const remaining = prev.filter((s) => s !== sector);
        return remaining.length === 0 ? ["total"] : remaining;
      }

      return [...prev.filter((s) => s !== "total"), sector];
    });
  };

  const handleUnemploymentSectorToggle = (sector: string) => {
    setSelectedUnemploymentSectors((prev) => {
      if (prev.includes(sector)) {
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== sector);
      }
      return [...prev, sector];
    });
  };

  const lastUpdated = metadata?.value
    ? new Date(metadata.value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const isLoading =
    jobData === undefined &&
    unemploymentRate === undefined &&
    participationRate === undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader lastUpdated={lastUpdated} />

      <main id="main-content" className="flex-1 px-4 py-4">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-4">
          <DashboardStatsSection
            isLoading={isLoading}
            stats={stats}
            unemploymentRate={unemploymentRate ?? null}
            participationRate={participationRate ?? null}
            insights={insights}
          />

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          </div>

          <DashboardChartPanel
            viewMode={viewMode}
            jobData={jobData === undefined ? undefined : jobDataItems}
            selectedSectors={selectedSectors}
            unemploymentRate={unemploymentRate}
            unemploymentByIndustry={unemploymentByIndustry}
            selectedUnemploymentSectors={selectedUnemploymentSectors}
            participationRate={participationRate}
            selectedRange={timeRange}
            onRangeChange={setTimeRange}
          />

          <DashboardSectorFilters
            viewMode={viewMode}
            isLoading={isLoading}
            sectors={sectors}
            selectedSectors={selectedSectors}
            onSectorToggle={handleSectorToggle}
            unemploymentSectors={unemploymentSectors}
            selectedUnemploymentSectors={selectedUnemploymentSectors}
            onUnemploymentSectorToggle={handleUnemploymentSectorToggle}
            selectedParticipationSectors={selectedParticipationSectors}
            onParticipationSectorToggle={(sector) =>
              setSelectedParticipationSectors([sector])
            }
          />

          <ErrorBoundary>
            <DataStatus
              sectors={
                viewMode === "openings"
                  ? selectedSectors
                  : viewMode === "unemployment"
                    ? selectedUnemploymentSectors
                    : ["participation_rate"]
              }
            />
          </ErrorBoundary>
          <p className="text-xs text-muted-foreground">
            These indicators describe the U.S. labor market. They do not
            identify changes caused by AI.
          </p>
          {viewMode === "openings" && (
            <ErrorBoundary>
              <FederalAnnouncements />
            </ErrorBoundary>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
