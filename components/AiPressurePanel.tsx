"use client";

import { SECTOR_LABELS } from "@/lib/bls";

export type AiPressureSectorData = {
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
};

export function AiPressurePanel(props: {
  sector: string;
  days: number;
  data?: AiPressureSectorData;
}) {
  const { sector, days, data } = props;
  const sectorLabel = SECTOR_LABELS[sector] || sector.toUpperCase();

  return (
    <section
      className="shrink-0 rounded-lg border border-card-border bg-card/20 p-3"
      aria-label={`AI skill mentions from USAJOBS for ${sectorLabel}`}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-xs font-mono tracking-wider text-muted-foreground">
            USAJOBS AI SKILL MENTIONS · LAST {days} DAYS
          </h3>
          <p className="text-[11px] text-muted-foreground/70 font-mono mt-1">
            Federal job postings only. Keyword-based detection.
          </p>
        </div>

        <div className="font-mono text-xs shrink-0">
          {data?.aiShare !== null && data?.aiShare !== undefined ? (
            <span className="text-foreground">
              <span className="text-muted-foreground mr-2">{sectorLabel}</span>
              <span className="px-1.5 py-0.5 rounded bg-secondary/20 border border-white/10">
                AI {(data.aiShare * 100).toFixed(0)}%
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              <span className="text-muted-foreground mr-2">{sectorLabel}</span>
              <span className="px-1.5 py-0.5 rounded bg-secondary/10 border border-transparent">
                AI —
              </span>
            </span>
          )}
        </div>
      </div>

      {data?.error ? (
        <p className="mt-3 text-[11px] text-red-500/80 font-mono">
          {data.error}
        </p>
      ) : !data ? (
        <p className="mt-3 text-[11px] text-muted-foreground font-mono animate-pulse">
          Loading USAJOBS AI signal…
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded border border-white/5 bg-black/10 p-3">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>SAMPLE</span>
              <span>{data.total} postings</span>
            </div>
            <div className="mt-2 text-[11px] font-mono">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">AI matches</span>
                <span className="text-foreground">{data.aiCount}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">Share</span>
                <span className="text-foreground">
                  {data.aiShare === null ? "—" : `${(data.aiShare * 100).toFixed(1)}%`}
                </span>
              </div>
              {data.note && (
                <p className="mt-2 text-[10px] text-muted-foreground/80">
                  {data.note}
                </p>
              )}
            </div>
          </div>

          <div className="rounded border border-white/5 bg-black/10 p-3">
            <div className="text-[10px] font-mono text-muted-foreground">
              TOP KEYWORDS
            </div>
            {data.topKeywords.length === 0 ? (
              <p className="mt-2 text-[11px] font-mono text-muted-foreground">
                No AI keywords found in the current sample.
              </p>
            ) : (
              <ul className="mt-2 space-y-1 text-[11px] font-mono">
                {data.topKeywords.map((k) => (
                  <li key={k.keyword} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground truncate">{k.keyword}</span>
                    <span className="text-foreground">{k.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="md:col-span-2 rounded border border-white/5 bg-black/10 p-3">
            <div className="text-[10px] font-mono text-muted-foreground">
              EXAMPLES
            </div>
            {data.examples.length === 0 ? (
              <p className="mt-2 text-[11px] font-mono text-muted-foreground">
                No matching examples in this sample.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {data.examples.map((ex, idx) => (
                  <li key={`${ex.title}-${idx}`} className="text-[11px] font-mono">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {ex.url ? (
                          <a
                            href={ex.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-foreground hover:text-accent transition-colors underline decoration-white/10 hover:decoration-accent/60"
                          >
                            {ex.title}
                          </a>
                        ) : (
                          <span className="text-foreground">{ex.title}</span>
                        )}
                        <div className="text-[10px] text-muted-foreground/80 mt-1 truncate">
                          {[ex.department, ex.agency].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                      <div className="shrink-0 text-[10px] text-muted-foreground/80">
                        {ex.matchedKeywords.slice(0, 3).join(", ")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}


