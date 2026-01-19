"use client";

import { useId, useState, type CSSProperties } from "react";
import { SECTOR_LABELS } from "@/lib/bls";

const SECTOR_DESCRIPTIONS: Record<string, string> = {
  // Job openings sectors
  total: "All nonfarm job openings across all industries in the United States",
  manufacturing: "Durable and nondurable goods production, factories, and assembly plants",
  healthcare: "Hospitals, physician offices, nursing facilities, and ambulatory care",
  retail: "Stores, e-commerce, motor vehicle dealers, and food/beverage retailers",
  professional: "Legal, accounting, architecture, engineering, consulting, and technical services",
  information: "Software, data processing, telecommunications, publishing, and broadcasting",
  government: "Federal, state, and local government positions excluding military",
  // Unemployment rate sectors (unemployment_rate is "total" for this view)
  unemployment_rate: "Civilian unemployment rate across all industries",
  unemployment_manufacturing: "Unemployment rate in manufacturing sector",
  unemployment_healthcare: "Unemployment rate in healthcare and social assistance",
  unemployment_retail: "Unemployment rate in retail trade",
  unemployment_professional: "Unemployment rate in professional and business services",
  unemployment_information: "Unemployment rate in information sector",
  unemployment_government: "Unemployment rate in public administration",
  // Participation rate
  participation_rate: "Labor force participation rate across all industries",
};

interface SectorFilterProps {
  sectors: string[];
  selectedSectors: string[];
  onToggle: (sector: string) => void;
  accentColor?: string;
  aiPressureBySector?: Record<
    string,
    { aiShare: number | null; total: number; note?: string; error?: string }
  >;
}

export function SectorFilter({
  sectors,
  selectedSectors,
  onToggle,
  accentColor = "#ef4444",
  aiPressureBySector,
}: SectorFilterProps) {
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const descriptionId = useId();

  // Detect view mode based on sectors passed
  const isUnemploymentMode = sectors.some(s => s.startsWith("unemployment_"));
  const isParticipationMode = sectors.includes("participation_rate");
  const isRateMode = isUnemploymentMode || isParticipationMode;
  
  // Sort: total/unemployment_rate/participation_rate first, then alphabetical
  const sortedSectors = [...sectors]
    .sort((a, b) => {
      // "Total" sectors come first
      if (a === "total" || a === "unemployment_rate" || a === "participation_rate") return -1;
      if (b === "total" || b === "unemployment_rate" || b === "participation_rate") return 1;
      return a.localeCompare(b);
    });

  return (
    <div className="space-y-2">
      <div 
        role="group" 
        aria-label={
          isUnemploymentMode ? "Filter unemployment by industry" : 
          isParticipationMode ? "Filter participation by industry" :
          "Filter by economic sector"
        }
        className="flex flex-wrap gap-2"
      >
        {sortedSectors.map((sector) => {
          const isSelected = selectedSectors.includes(sector);
          const isHovered = hoveredSector === sector;
          const sectorDescId = `${descriptionId}-${sector}`;
          const ai = aiPressureBySector?.[sector];
          
          // Build style based on state
          const buttonStyle: CSSProperties | undefined = 
            isSelected ? { 
              backgroundColor: `${accentColor}15`,
              borderColor: accentColor,
              color: accentColor,
              boxShadow: `0 0 0 1px ${accentColor}30`
            } : isHovered ? {
              borderColor: accentColor,
              color: accentColor,
            } : undefined;
          
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
              style={buttonStyle}
            >
              <span className="flex items-center gap-2">
                <span>{SECTOR_LABELS[sector] || sector}</span>
                {ai && !ai.error && (
                  <span
                    className="text-[9px] font-mono px-1 py-0.5 rounded border border-white/10 bg-secondary/20 text-muted-foreground"
                    aria-label={
                      ai.aiShare === null
                        ? `AI skill mentions unavailable due to low sample (${ai.total} postings)`
                        : `AI skill mentions ${(ai.aiShare * 100).toFixed(0)}% of ${ai.total} postings`
                    }
                  >
                    AI {ai.aiShare === null ? "—" : `${Math.round(ai.aiShare * 100)}%`}
                  </span>
                )}
              </span>
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
