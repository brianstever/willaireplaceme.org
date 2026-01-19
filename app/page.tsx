"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardFooter } from "@/components/DashboardFooter";
import { DashboardStatsSection } from "@/components/DashboardStatsSection";
import { DashboardChartPanel } from "@/components/DashboardChartPanel";
import { DashboardSectorFilters } from "@/components/DashboardSectorFilters";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { AiPressurePanel, type AiPressureSectorData } from "@/components/AiPressurePanel";
import { SECTOR_LABELS } from "@/lib/bls";
import { formatDateAbbreviated } from "@/lib/chart-utils";

export default function Home() {
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["total"]);
  const [selectedUnemploymentSectors, setSelectedUnemploymentSectors] = useState<string[]>(["unemployment_rate"]);
  const [selectedParticipationSectors, setSelectedParticipationSectors] = useState<string[]>(["participation_rate"]);
  const [viewMode, setViewMode] = useState<ViewMode>("openings");
  const [timeRange, setTimeRange] = useState<string>("3Y");
  const [aiDays] = useState<number>(14);
  const [aiPressure, setAiPressure] = useState<{
    days: number;
    generatedAt: string;
    sectors: Record<string, AiPressureSectorData>;
  } | null>(null);

  // --- Data ---
  const jobData = useQuery(api.jobs.getJobOpenings, {});
  const latestData = useQuery(api.jobs.getLatestBySector, {});
  const peakData = useQuery(api.jobs.getPeakValue, { sector: "total" });
  const metadata = useQuery(api.jobs.getMetadata, { key: "lastUpdated" });
  const analysis = useQuery(api.jobs.getDataAnalysis, {});
  const unemploymentRate = useQuery(api.jobs.getUnemploymentRate, {});
  const participationRate = useQuery(api.jobs.getParticipationRate, {});
  const unemploymentByIndustry = useQuery(api.jobs.getUnemploymentByIndustry, {});
  const unemploymentSectors = useQuery(api.jobs.getUnemploymentSectors, {});

  const jobDataItems = useMemo(
    () =>
      jobData?.filter((item): item is NonNullable<typeof item> => item !== null) ?? [],
    [jobData]
  );

  // --- Derived: rotating insights ---
  const insights = useMemo(() => {
    if (!analysis) return [];
    
    const result: string[] = [];
    
    if (analysis.peak && analysis.latest) {
      result.push(
        `Peak ${(analysis.peak.value / 1000).toFixed(1)}M (${formatDateAbbreviated(analysis.peak.date)}) → Now ${(analysis.latest.value / 1000).toFixed(1)}M`
      );
    }
    
    if (analysis.steepestDecline) {
      const s = analysis.steepestDecline;
      const sectorName = SECTOR_LABELS[s.sector] || s.sector;
      result.push(
        `${sectorName} down ${Math.abs(s.changePercent).toFixed(0)}%: ${(s.peakValue / 1000).toFixed(2)}M → ${(s.latestValue / 1000).toFixed(2)}M`
      );
    }
    
    if (analysis.mostResilient && analysis.mostResilient.sector !== analysis.steepestDecline?.sector) {
      const s = analysis.mostResilient;
      const sectorName = SECTOR_LABELS[s.sector] || s.sector;
      result.push(
        `${sectorName} ${s.changePercent >= 0 ? "up" : "down"} ${Math.abs(s.changePercent).toFixed(0)}%: ${(s.peakValue / 1000).toFixed(2)}M → ${(s.latestValue / 1000).toFixed(2)}M`
      );
    }
    
    if (analysis.prePandemic && analysis.changeFromPrePandemic !== null) {
      const dir = analysis.changeFromPrePandemic > 0 ? "above" : "below";
      result.push(
        `${Math.abs(analysis.changeFromPrePandemic).toFixed(0)}% ${dir} pre-pandemic (${formatDateAbbreviated(analysis.prePandemic.date)})`
      );
    }
    
    return result;
  }, [analysis]);

  // --- USAJOBS AI signal (cached API route) ---
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/ai-skill-pressure?days=${aiDays}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.sectors) {
          setAiPressure(json);
        }
      } catch {
        // ignore; feature degrades gracefully if API/env not configured
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [aiDays]);
  const sectors = useMemo(() => {
    if (jobDataItems.length === 0) return [];

    return [...new Set(jobDataItems.map((d) => d.sector))].filter(
      (s) => !s.startsWith("unemployment_") && s !== "participation_rate"
    );
  }, [jobDataItems]);

  // --- Derived: headline stats ---
  const stats = useMemo(() => {
    if (!latestData || !peakData || jobDataItems.length === 0) return null;
    const latestItems = latestData.filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    const totalLatest = latestItems.find((d) => d.sector === "total");
    if (!totalLatest) return null;

    const currentValue = totalLatest.value;
    const peakValue = peakData.value;
    const changeFromPeak = ((currentValue - peakValue) / peakValue) * 100;

    // Last 12 months of total openings for sparkline
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
      if (prev.includes(sector)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter((s) => s !== sector);
      }
      return [...prev, sector];
    });
  };

  const handleUnemploymentSectorToggle = (sector: string) => {
    setSelectedUnemploymentSectors((prev) => {
      if (prev.includes(sector)) {
        if (prev.length === 1) return prev; // keep at least one
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

  const isLoading = !jobData || !latestData;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <DashboardHeader lastUpdated={lastUpdated} />

      {/* Main */}
      <main id="main-content" className="flex-1 px-4 py-4 min-h-0 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex flex-col flex-1 min-h-0 gap-4">
          <DashboardStatsSection
            isLoading={isLoading}
            stats={stats}
            unemploymentRate={unemploymentRate ?? null}
            participationRate={participationRate ?? null}
            insights={insights}
          />

          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />

          <DashboardChartPanel
            viewMode={viewMode}
            jobData={jobDataItems}
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
            sectors={sectors}
            selectedSectors={selectedSectors}
            onSectorToggle={handleSectorToggle}
            unemploymentSectors={unemploymentSectors}
            selectedUnemploymentSectors={selectedUnemploymentSectors}
            onUnemploymentSectorToggle={handleUnemploymentSectorToggle}
            selectedParticipationSectors={selectedParticipationSectors}
            onParticipationSectorToggle={(sector) => setSelectedParticipationSectors([sector])}
            aiPressureBySector={
              aiPressure?.sectors
                ? Object.fromEntries(
                    Object.entries(aiPressure.sectors).map(([k, v]) => [
                      k,
                      { aiShare: v.aiShare, total: v.total, note: v.note, error: v.error },
                    ])
                  )
                : undefined
            }
          />

          {viewMode === "openings" && (
            <AiPressurePanel
              sector={selectedSectors[0] || "total"}
              days={aiPressure?.days ?? aiDays}
              data={aiPressure?.sectors?.[selectedSectors[0] || "total"]}
            />
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
