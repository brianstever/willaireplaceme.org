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
import { AiPressurePanel, type AiPressureSectorData } from "@/app/_components/AiPressurePanel";
import { AiSkillsToggle } from "@/app/_components/AiSkillsToggle";
import { SECTOR_LABELS } from "@/lib/bls";
import { formatDateAbbreviated } from "@/lib/chart-utils";

// Aggregate AI pressure data across multiple sectors
function aggregateAiPressure(
  sectors: string[],
  data: Record<string, AiPressureSectorData> | undefined
): AiPressureSectorData | undefined {
  if (!data) return undefined;
  
  // Get all available sector keys (excluding "total" for aggregation)
  const sectorKeys = sectors.includes("total") 
    ? Object.keys(data).filter(k => k !== "total")
    : sectors;
  
  const validSectors = sectorKeys.filter(k => data[k]);
  if (validSectors.length === 0) return undefined;
  
  let totalPostings = 0;
  let totalAiCount = 0;
  const keywordCounts = new Map<string, number>();
  const allExamples: AiPressureSectorData["examples"] = [];
  
  for (const sector of validSectors) {
    const sectorData = data[sector];
    if (!sectorData) continue;
    
    totalPostings += sectorData.total;
    totalAiCount += sectorData.aiCount;
    
    for (const kw of sectorData.topKeywords) {
      keywordCounts.set(kw.keyword, (keywordCounts.get(kw.keyword) ?? 0) + kw.count);
    }
    
    for (const ex of sectorData.examples) {
      allExamples.push({
        ...ex,
        agency: ex.agency ? `${ex.agency} (${SECTOR_LABELS[sector] || sector})` : SECTOR_LABELS[sector] || sector,
      });
    }
  }
  
  const topKeywords = Array.from(keywordCounts.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  
  return {
    total: totalPostings,
    aiCount: totalAiCount,
    aiShare: totalPostings >= 20 ? totalAiCount / totalPostings : null,
    topKeywords,
    examples: allExamples.slice(0, 5),
    note: totalPostings < 20 ? `Low sample (${totalPostings} postings)` : undefined,
  };
}

export default function Home() {
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["total"]);
  const [selectedUnemploymentSectors, setSelectedUnemploymentSectors] = useState<string[]>(["unemployment_rate"]);
  const [selectedParticipationSectors, setSelectedParticipationSectors] = useState<string[]>(["participation_rate"]);
  const [viewMode, setViewMode] = useState<ViewMode>("openings");
  const [timeRange, setTimeRange] = useState<string>("3Y");
  const [aiEnabled, setAiEnabled] = useState(true);

  // --- BLS Data ---
  const jobData = useQuery(api.jobs.getJobOpenings, {});
  const latestData = useQuery(api.jobs.getLatestBySector, {});
  const peakData = useQuery(api.jobs.getPeakValue, { sector: "total" });
  const metadata = useQuery(api.jobs.getMetadata, { key: "lastUpdated" });
  const analysis = useQuery(api.jobs.getDataAnalysis, {});
  const unemploymentRate = useQuery(api.jobs.getUnemploymentRate, {});
  const participationRate = useQuery(api.jobs.getParticipationRate, {});
  const unemploymentByIndustry = useQuery(api.jobs.getUnemploymentByIndustry, {});
  const unemploymentSectors = useQuery(api.jobs.getUnemploymentSectors, {});

  // --- USAJOBS AI Skills Data (from Convex) ---
  const aiSkillsData = useQuery(api.usajobsQueries.getLatestAiSkills, {});
  const aiSkillsLoading = aiSkillsData === undefined;

  const jobDataItems = useMemo(
    () => jobData?.filter((item): item is NonNullable<typeof item> => item !== null) ?? [],
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

  // --- Derived: aggregated AI pressure for selected sectors ---
  const aggregatedAiData = useMemo(() => {
    if (!aiSkillsData || Object.keys(aiSkillsData).length === 0) return undefined;
    
    // Convert Convex data to match expected format
    const formattedData: Record<string, AiPressureSectorData> = {};
    for (const [sector, data] of Object.entries(aiSkillsData)) {
      formattedData[sector] = {
        total: data.total,
        aiCount: data.aiCount,
        aiShare: data.aiShare,
        topKeywords: data.topKeywords,
        examples: data.examples.map(ex => ({
          title: ex.title,
          agency: ex.agency,
          url: ex.url,
          matchedKeywords: ex.matchedKeywords,
        })),
      };
    }
    
    // If only one non-total sector selected, show that sector's data directly
    if (selectedSectors.length === 1 && selectedSectors[0] !== "total") {
      return formattedData[selectedSectors[0]];
    }
    
    // Otherwise aggregate (for "total" or multiple sectors)
    return aggregateAiPressure(selectedSectors, formattedData);
  }, [selectedSectors, aiSkillsData]);

  // AI pressure data formatted for sector filter badges
  const aiPressureBySector = useMemo(() => {
    if (!aiEnabled || !aiSkillsData) return undefined;
    
    return Object.fromEntries(
      Object.entries(aiSkillsData).map(([k, v]) => [
        k,
        { aiShare: v.aiShare, total: v.total },
      ])
    );
  }, [aiEnabled, aiSkillsData]);

  // Label for the AI panel based on selection
  const aiPanelLabel = useMemo(() => {
    if (selectedSectors.includes("total")) return "All Sectors";
    if (selectedSectors.length === 1) return SECTOR_LABELS[selectedSectors[0]] || selectedSectors[0];
    return `${selectedSectors.length} Sectors`;
  }, [selectedSectors]);

  const handleSectorToggle = (sector: string) => {
    setSelectedSectors((prev) => {
      // If clicking "total", select only total
      if (sector === "total") {
        return ["total"];
      }
      
      // If clicking a specific sector, deselect "total" and toggle the sector
      if (prev.includes(sector)) {
        // Deselecting - keep at least one, or fall back to total
        const remaining = prev.filter((s) => s !== sector);
        return remaining.length === 0 ? ["total"] : remaining;
      }
      
      // Adding a sector - remove "total" if present
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

  const handleAiToggle = () => {
    setAiEnabled(!aiEnabled);
  };

  const handleAiClose = () => {
    setAiEnabled(false);
  };

  const lastUpdated = metadata?.value
    ? new Date(metadata.value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const isLoading = !jobData || !latestData || !peakData || !unemploymentRate || !participationRate;

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

          {/* View Toggle + AI Skills Toggle */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
            {viewMode === "openings" && (
              <AiSkillsToggle 
                enabled={aiEnabled} 
                onToggle={handleAiToggle}
                isLoading={aiSkillsLoading}
              />
            )}
          </div>

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
            isLoading={isLoading}
            sectors={sectors}
            selectedSectors={selectedSectors}
            onSectorToggle={handleSectorToggle}
            unemploymentSectors={unemploymentSectors}
            selectedUnemploymentSectors={selectedUnemploymentSectors}
            onUnemploymentSectorToggle={handleUnemploymentSectorToggle}
            selectedParticipationSectors={selectedParticipationSectors}
            onParticipationSectorToggle={(sector) => setSelectedParticipationSectors([sector])}
            aiPressureBySector={aiPressureBySector}
          />

          {/* AI Pressure Panel - shows aggregated data for selected sectors */}
          {viewMode === "openings" && aiEnabled && (
            <AiPressurePanel
              sector={aiPanelLabel}
              days={14}
              data={aggregatedAiData}
              onClose={handleAiClose}
            />
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
