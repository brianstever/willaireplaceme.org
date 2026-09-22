"use client";

import { SectorFilter } from "./SectorFilter";
import { FilterSkeleton } from "./StatsSkeleton";
import { ViewMode } from "./ViewToggle";

interface DashboardSectorFiltersProps {
  viewMode: ViewMode;
  isLoading: boolean;
  sectors: string[];
  selectedSectors: string[];
  onSectorToggle: (sector: string) => void;
  unemploymentSectors: string[] | undefined;
  selectedUnemploymentSectors: string[];
  onUnemploymentSectorToggle: (sector: string) => void;
  selectedParticipationSectors: string[];
  onParticipationSectorToggle: (sector: string) => void;
}

export function DashboardSectorFilters({
  viewMode,
  isLoading,
  sectors,
  selectedSectors,
  onSectorToggle,
  unemploymentSectors,
  selectedUnemploymentSectors,
  onUnemploymentSectorToggle,
  selectedParticipationSectors,
  onParticipationSectorToggle,
}: DashboardSectorFiltersProps) {
  if (isLoading) {
    return (
      <section className="shrink-0">
        <FilterSkeleton />
      </section>
    );
  }

  return (
    <>
      {viewMode === "openings" && sectors.length > 0 && (
        <section className="shrink-0">
          <SectorFilter
            sectors={sectors}
            selectedSectors={selectedSectors}
            onToggle={onSectorToggle}
            accentColor="#ef4444"
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
