"use client";

import { useId, useState } from "react";
import { SECTOR_LABELS } from "@/lib/bls";

const SECTOR_DESCRIPTIONS: Record<string, string> = {
  total: "All nonfarm job openings across all industries in the United States",
  manufacturing: "Durable and nondurable goods production, factories, and assembly plants",
  healthcare: "Hospitals, physician offices, nursing facilities, and ambulatory care",
  retail: "Stores, e-commerce, motor vehicle dealers, and food/beverage retailers",
  professional: "Legal, accounting, architecture, engineering, consulting, and technical services",
  information: "Software, data processing, telecommunications, publishing, and broadcasting",
  government: "Federal, state, and local government positions excluding military",
};

interface SectorFilterProps {
  sectors: string[];
  selectedSectors: string[];
  onToggle: (sector: string) => void;
}

export function SectorFilter({ sectors, selectedSectors, onToggle }: SectorFilterProps) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const descriptionId = useId();

  // "total" first, then alphabetical; skip unemployment (different unit)
  const sortedSectors = [...sectors]
    .filter((s) => s !== "unemployment_rate")
    .sort((a, b) => {
      if (a === "total") return -1;
      if (b === "total") return 1;
      return a.localeCompare(b);
    });

  return (
    <div className="space-y-2">
      <div 
        role="group" 
        aria-label="Filter by economic sector"
        className="flex flex-wrap gap-2"
      >
        {sortedSectors.map((sector) => {
          const isSelected = selectedSectors.includes(sector);
          const sectorDescId = `${descriptionId}-${sector}`;
          
          return (
            <button
              key={sector}
              onClick={() => onToggle(sector)}
              onMouseEnter={() => setHoveredSector(sector)}
              onMouseLeave={() => setHoveredSector(null)}
              onFocus={() => setHoveredSector(sector)}
              onBlur={() => setHoveredSector(null)}
              aria-pressed={isSelected}
              aria-describedby={sectorDescId}
              className={`sector-pill ${isSelected ? "active" : ""}`}
            >
              {SECTOR_LABELS[sector] || sector}
              <span id={sectorDescId} className="sr-only">
                {SECTOR_DESCRIPTIONS[sector] || `${sector} sector data`}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Hover tooltip */}
      <div 
        className="h-5 overflow-hidden" 
        aria-hidden="true"
        data-testid="tooltip-container"
      >
        <p 
          className={`text-[10px] text-muted-foreground/70 font-mono transition-opacity duration-200 ${
            hoveredSector ? "opacity-100" : "opacity-0"
          }`}
          data-testid="tooltip-text"
        >
          {hoveredSector && SECTOR_DESCRIPTIONS[hoveredSector]}
        </p>
      </div>
    </div>
  );
}
