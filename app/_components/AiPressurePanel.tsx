"use client";

import { useState } from "react";
import { SECTOR_LABELS } from "@/lib/bls";

export interface AiPressureSectorData {
  total: number;
  aiCount: number;
  aiShare: number | null;
  topKeywords: Array<{ keyword: string; count: number }>;
  examples: Array<{
    title: string;
    agency?: string;
    department?: string;
    url?: string;
    matchedKeywords: string[];
  }>;
  note?: string;
  error?: string;
}

interface AiPressurePanelProps {
  sector: string;
  days: number;
  data?: AiPressureSectorData;
  onClose: () => void;
}

export function AiPressurePanel({ sector, days, data, onClose }: AiPressurePanelProps) {
  // Start expanded when data is available
  const hasValidData = data && !data.error && data.total > 0;
  const [userCollapsed, setUserCollapsed] = useState(false);
  const expanded = hasValidData && !userCollapsed;
  const sectorLabel = SECTOR_LABELS[sector] || sector;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    setUserCollapsed(!userCollapsed);
  };

  return (
    <section
      className="rounded-lg border border-accent/20 bg-card/40 backdrop-blur-sm cursor-pointer"
      aria-label={`AI skill mentions from USAJOBS for ${sectorLabel}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-accent/10 text-accent shrink-0">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-mono tracking-wider text-foreground">
              USAJOBS AI SKILLS · {sectorLabel}
            </h3>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
              Federal job postings mentioning AI keywords (last {days} days)
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* AI Share Badge */}
          {data?.aiShare !== null && data?.aiShare !== undefined && (
            <span className="px-2 py-1 rounded bg-accent/10 border border-accent/20 text-accent text-xs font-mono">
              {(data.aiShare * 100).toFixed(0)}% mention AI
            </span>
          )}
          
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1.5 rounded hover:bg-card-border/30 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close AI skills panel"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {!data && (
        <div className="px-3 pb-3">
          <p className="text-[11px] text-muted-foreground font-mono animate-pulse">
            Fetching USAJOBS data...
          </p>
        </div>
      )}

      {/* Error State */}
      {data?.error && (
        <div className="px-3 pb-3">
          <p className="text-[11px] text-red-400/80 font-mono">{data.error}</p>
        </div>
      )}

      {/* Collapsed Summary */}
      {data && !data.error && !expanded && (
        <div className="px-3 pb-3 text-[10px] font-mono text-muted-foreground">
          {data.total} postings sampled · {data.aiCount} mention AI skills · 
          <span className="text-muted-foreground/50"> click to expand</span>
          <span className="block mt-1 text-muted-foreground/40">
            Feature by{" "}
            <a 
              href="https://github.com/grandSpecial" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              @grandSpecial
            </a>
          </span>
        </div>
      )}

      {/* Expanded Content */}
      {data && !data.error && (
        <div className={`overflow-hidden transition-all duration-200 ${expanded ? "max-h-[800px]" : "max-h-0"}`}>
          <div className="px-3 pb-3 space-y-3 border-t border-card-border/30 pt-3">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded bg-black/20 p-2">
                <div className="text-lg font-mono text-foreground">{data.total}</div>
                <div className="text-[9px] text-muted-foreground font-mono">POSTINGS</div>
              </div>
              <div className="rounded bg-black/20 p-2">
                <div className="text-lg font-mono text-foreground">{data.aiCount}</div>
                <div className="text-[9px] text-muted-foreground font-mono">AI MATCHES</div>
              </div>
              <div className="rounded bg-black/20 p-2">
                <div className="text-lg font-mono text-foreground">
                  {data.aiShare === null ? "—" : `${(data.aiShare * 100).toFixed(1)}%`}
                </div>
                <div className="text-[9px] text-muted-foreground font-mono">AI SHARE</div>
              </div>
            </div>

            {data.note && (
              <p className="text-[10px] text-muted-foreground/70 font-mono">{data.note}</p>
            )}

            {/* Top Keywords */}
            {data.topKeywords.length > 0 && (
              <div>
                <div className="text-[10px] font-mono text-muted-foreground mb-2">TOP KEYWORDS</div>
                <div className="flex flex-wrap gap-1.5">
                  {data.topKeywords.map((k) => (
                    <span 
                      key={k.keyword} 
                      className="px-2 py-0.5 rounded bg-card-border/30 text-[10px] font-mono text-muted-foreground"
                    >
                      {k.keyword} ({k.count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Example Jobs */}
            {data.examples.length > 0 && (
              <div>
                <div className="text-[10px] font-mono text-muted-foreground mb-2">
                  SAMPLE POSTINGS <span className="text-muted-foreground/50">(showing {Math.min(5, data.examples.length)} of {data.aiCount} matches)</span>
                </div>
                <ul className="space-y-2">
                  {data.examples.slice(0, 5).map((ex, idx) => (
                    <li key={`${ex.title}-${idx}`} className="text-[11px] font-mono">
                      {ex.url ? (
                        <a
                          href={ex.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ex.title}
                        </a>
                      ) : (
                        <span className="text-foreground">{ex.title}</span>
                      )}
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {[ex.agency, ex.matchedKeywords.slice(0, 2).join(", ")].filter(Boolean).join(" · ")}
                      </div>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.usajobs.gov/Search/Results?k=artificial%20intelligence%20OR%20machine%20learning"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-2 text-[10px] font-mono text-muted-foreground hover:text-accent hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Search all AI jobs on USAJOBS →
                </a>
              </div>
            )}

            {/* Why this exists */}
            <div className="pt-3 mt-1 border-t border-card-border space-y-2">
              <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                <span className="text-foreground/80 font-medium">Why track this?</span> JOLTS tells us how many jobs exist, 
                but not what skills employers want. When AI keywords start appearing in job descriptions that 
                didn&apos;t have them before, it signals a shift in what &quot;qualified&quot; means — and 
                potentially fewer humans needed per role.
              </p>
              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                Data from{" "}
                <a 
                  href="https://www.usajobs.gov/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-foreground/70 hover:text-foreground hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  USAJOBS.gov
                </a>
                {" "}API (federal jobs only). Feature contributed by{" "}
                <a 
                  href="https://github.com/grandSpecial" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-foreground/70 hover:text-foreground hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  @grandSpecial
                </a>.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
