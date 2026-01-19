"use client";

import { SectorFilter } from "./SectorFilter";
import { ViewMode } from "./ViewToggle";

interface DashboardSectorFiltersProps {
  viewMode: ViewMode;
  sectors: string[];
  selectedSectors: string[];
  onSectorToggle: (sector: string) => void;
  unemploymentSectors: string[] | undefined;
  selectedUnemploymentSectors: string[];
  onUnemploymentSectorToggle: (sector: string) => void;
  selectedParticipationSectors: string[];
  onParticipationSectorToggle: (sector: string) => void;
  aiPressureBySector?: Record<
    string,
    { aiShare: number | null; total: number; note?: string; error?: string }
  >;
}

export function DashboardSectorFilters({
  viewMode,
  sectors,
  selectedSectors,
  onSectorToggle,
  unemploymentSectors,
  selectedUnemploymentSectors,
  onUnemploymentSectorToggle,
  selectedParticipationSectors,
  onParticipationSectorToggle,
  aiPressureBySector,
}: DashboardSectorFiltersProps) {
  return (
    <>
      {viewMode === "openings" && sectors.length > 0 && (
        <section className="shrink-0">
          <SectorFilter
            sectors={sectors}
            selectedSectors={selectedSectors}
            onToggle={onSectorToggle}
            accentColor="#ef4444"
            aiPressureBySector={aiPressureBySector}
          />
        </section>
      )}
      {viewMode === "unemployment" &&
        unemploymentSectors &&
        unemploymentSectors.length > 0 && (
          <section className="shrink-0">
            <SectorFilter
              sectors={unemploymentSectors}
              selectedSectors={selectedUnemploymentSectors}
              onToggle={onUnemploymentSectorToggle}
              accentColor="#06b6d4"
            />
          </section>
        )}
      {viewMode === "participation" && (
        <section className="shrink-0">
          <SectorFilter
            sectors={["participation_rate"]}
            selectedSectors={selectedParticipationSectors}
            onToggle={onParticipationSectorToggle}
            accentColor="#a855f7"
          />
        </section>
      )}
    </>
  );
}
