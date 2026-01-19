"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { JobChart } from "@/components/JobChart";
import { UnemploymentChart } from "@/components/UnemploymentChart";
import { SectorFilter } from "@/components/SectorFilter";
import { ChartErrorBoundary } from "@/components/ChartErrorBoundary";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { StatsSkeleton, InsightSkeleton } from "@/components/StatsSkeleton";
import { SECTOR_LABELS } from "@/lib/bls";
import { formatDateAbbreviated } from "@/lib/chart-utils";

export default function Home() {
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["total"]);
  const [currentInsight, setCurrentInsight] = useState(0);
  const [insightVisible, setInsightVisible] = useState(true);
  const [viewMode, setViewMode] = useState<"openings" | "unemployment">("openings");
  const [timeRange, setTimeRange] = useState<string>("3Y");

  // --- Data ---
  const jobData = useQuery(api.jobs.getJobOpenings, {});
  const latestData = useQuery(api.jobs.getLatestBySector, {});
  const peakData = useQuery(api.jobs.getPeakValue, { sector: "total" });
  const metadata = useQuery(api.jobs.getMetadata, { key: "lastUpdated" });
  const analysis = useQuery(api.jobs.getDataAnalysis, {});
  const unemploymentRate = useQuery(api.jobs.getUnemploymentRate, {});

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

  // Cycle through insights every 6s with fade
  useEffect(() => {
    if (insights.length === 0) return;
    
    const interval = setInterval(() => {
      setInsightVisible(false);
      setTimeout(() => {
        setCurrentInsight((prev) => (prev + 1) % insights.length);
        setInsightVisible(true);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, [insights.length]);

  const sectors = useMemo(() => {
    if (!jobData) return [];
    return [...new Set(jobData.map((d) => d.sector))];
  }, [jobData]);

  // --- Derived: headline stats ---
  const stats = useMemo(() => {
    if (!latestData || !peakData) return null;

    const totalLatest = latestData.find((d) => d.sector === "total");
    if (!totalLatest) return null;

    const currentValue = totalLatest.value;
    const peakValue = peakData.value;
    const changeFromPeak = ((currentValue - peakValue) / peakValue) * 100;

    return {
      currentValue,
      peakValue,
      peakDate: peakData.date,
      changeFromPeak,
      latestDate: totalLatest.date,
    };
  }, [latestData, peakData]);

  const handleSectorToggle = (sector: string) => {
    setSelectedSectors((prev) => {
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
      {/* Header */}
      <header className="px-4 py-3 border-b border-card-border shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-medium tracking-wide">
              <span className="hidden sm:inline">Job Openings & Labor Turnover Survey</span>
              <span className="sm:hidden">JOLTS</span>
            </h1>
            <span className="hidden sm:inline text-[10px] text-muted-foreground font-mono tracking-wider">
              JOLTS
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono tracking-wider">
            <span>BLS DATA</span>
            {lastUpdated && (
              <span className="hidden sm:inline opacity-60">{lastUpdated.toUpperCase()}</span>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="flex-1 px-4 py-4 min-h-0 flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex flex-col flex-1 min-h-0 gap-4">
          {/* Stats */}
          <section className="shrink-0 flex items-center justify-between gap-4 sm:gap-6 flex-wrap">
            {isLoading ? (
              <StatsSkeleton />
            ) : (
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Job Openings */}
              <div className="flex items-baseline gap-2 sm:gap-3">
                {stats ? (
                  <>
                    <span
                      className="text-4xl md:text-5xl font-light tracking-tight"
                      style={{ fontFamily: "var(--font-family-mono)" }}
                    >
                      <AnimatedCounter
                        value={stats.currentValue / 1000}
                        decimals={2}
                        suffix="M"
                      />
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono tracking-wide">
                        OPENINGS
                      </span>
                      <span
                        className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                          stats.changeFromPeak < 0
                            ? "bg-red-500/10 text-red-500"
                            : "bg-green-500/10 text-green-500"
                        }`}
                      >
                        {stats.changeFromPeak > 0 ? "+" : ""}
                        {stats.changeFromPeak.toFixed(1)}%
                      </span>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Unemployment */}
              {unemploymentRate && (
                <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-card-border">
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <span
                        className="text-lg sm:text-2xl font-light tracking-tight"
                        style={{ fontFamily: "var(--font-family-mono)" }}
                      >
                        {unemploymentRate.current.toFixed(1)}%
                      </span>
                      {unemploymentRate.changeFromYearAgo !== null && (
                        <span
                          className={`text-[10px] font-mono px-1 py-0.5 rounded shrink-0 ${
                            unemploymentRate.changeFromYearAgo > 0
                              ? "bg-red-500/10 text-red-500"
                              : unemploymentRate.changeFromYearAgo < 0
                              ? "bg-green-500/10 text-green-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {unemploymentRate.changeFromYearAgo > 0 ? "+" : ""}
                          {unemploymentRate.changeFromYearAgo.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono tracking-wide">
                      UNEMPLOYMENT
                    </span>
                  </div>
                  
                  {/* Sparkline - hidden on mobile */}
                  {unemploymentRate.sparkline && unemploymentRate.sparkline.length > 1 && (
                    <svg 
                      viewBox="0 0 60 24" 
                      className="hidden sm:block w-[60px] h-[24px] opacity-60 shrink-0"
                      role="img"
                      aria-label={`Unemployment rate trend over last 12 months, currently ${unemploymentRate.current.toFixed(1)}%`}
                    >
                      <polyline
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={unemploymentRate.sparkline.map((d, i) => {
                          const minVal = Math.min(...unemploymentRate.sparkline.map(h => h.value));
                          const maxVal = Math.max(...unemploymentRate.sparkline.map(h => h.value));
                          const range = maxVal - minVal || 1;
                          const x = (i / (unemploymentRate.sparkline.length - 1)) * 58 + 1;
                          const y = 22 - ((d.value - minVal) / range) * 20;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                    </svg>
                  )}
                </div>
              )}
            </div>
            )}

            {/* Insight (rotates) - announces changes to screen readers */}
            {isLoading ? (
              <InsightSkeleton />
            ) : insights.length > 0 && (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className={`text-[11px] text-muted-foreground font-mono max-w-[300px] text-right leading-relaxed transition-opacity duration-300 ${
                  insightVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="text-accent/60 mr-1.5" aria-hidden="true">●</span>
                {insights[currentInsight % insights.length]}
              </div>
            )}
          </section>

          {/* View Toggle */}
          <div 
            role="tablist" 
            aria-label="Select data view"
            className="shrink-0 flex items-center gap-1 bg-secondary/20 p-0.5 rounded w-fit"
          >
            <button
              role="tab"
              aria-selected={viewMode === "openings"}
              aria-controls="chart-panel"
              onClick={() => setViewMode("openings")}
              className={`px-3 py-1 text-[10px] font-mono rounded-sm transition-all ${
                viewMode === "openings"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              JOB OPENINGS
            </button>
            <button
              role="tab"
              aria-selected={viewMode === "unemployment"}
              aria-controls="chart-panel"
              onClick={() => setViewMode("unemployment")}
              className={`px-3 py-1 text-[10px] font-mono rounded-sm transition-all ${
                viewMode === "unemployment"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              UNEMPLOYMENT
            </button>
          </div>

          {/* Chart */}
          <section id="chart-panel" role="tabpanel" className="flex-1 min-h-0 flex flex-col" aria-label="Data visualization">
            <ChartErrorBoundary chartName={viewMode === "openings" ? "Job Openings" : "Unemployment Rate"}>
              {viewMode === "openings" ? (
                jobData && jobData.length > 0 ? (
                  <JobChart
                    data={jobData}
                    selectedSectors={selectedSectors}
                    selectedRange={timeRange}
                    onRangeChange={setTimeRange}
                  />
                ) : (
                  <ChartSkeleton />
                )
              ) : (
                unemploymentRate?.history && unemploymentRate.history.length > 0 ? (
                  <UnemploymentChart 
                    data={unemploymentRate.history}
                    selectedRange={timeRange}
                    onRangeChange={setTimeRange}
                  />
                ) : (
                  <ChartSkeleton />
                )
              )}
            </ChartErrorBoundary>
          </section>

          {/* Sector Filter */}
          {viewMode === "openings" && sectors.length > 0 && (
            <section className="shrink-0">
              <SectorFilter
                sectors={sectors}
                selectedSectors={selectedSectors}
                onToggle={handleSectorToggle}
              />
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-2 border-t border-card-border shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono tracking-wider">
          <span className="hidden sm:inline">BUREAU OF LABOR STATISTICS</span>
          <Link 
            href="/about" 
            className="sm:hidden text-xs text-muted-foreground hover:text-accent transition-colors"
          >
            Read about this data →
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href="/about" 
              className="hidden sm:inline hover:text-accent transition-colors"
            >
              ABOUT
            </Link>
            <span className="hidden sm:inline opacity-40">|</span>
            <span className="hidden sm:inline">UPDATED MONTHLY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
