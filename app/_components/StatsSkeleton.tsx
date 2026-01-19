"use client";

export function StatsSkeleton() {
  return (
    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 w-full sm:w-auto animate-pulse">
      {/* Job Openings skeleton */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1 sm:gap-2">
            {/* text-2xl = 32px line height */}
            <div className="h-8 w-16 bg-card-border/30 rounded" />
            {/* change badge */}
            <div className="h-5 w-12 bg-card-border/20 rounded" />
          </div>
          {/* label text-[11px]/[10px] */}
          <div className="h-4 w-16 bg-card-border/20 rounded" />
        </div>
        <div className="hidden sm:block w-[60px] h-[24px] bg-card-border/20 rounded" />
      </div>

      {/* Unemployment skeleton */}
      <div className="flex items-center gap-2 sm:gap-3 sm:pl-6 sm:border-l sm:border-card-border">
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <div className="h-8 w-12 bg-card-border/30 rounded" />
            <div className="h-5 w-12 bg-card-border/20 rounded" />
          </div>
          <div className="h-4 w-24 bg-card-border/20 rounded" />
        </div>
        <div className="hidden sm:block w-[60px] h-[24px] bg-card-border/20 rounded" />
      </div>

      {/* Participation skeleton */}
      <div className="flex items-center gap-2 sm:gap-3 sm:pl-6 sm:border-l sm:border-card-border">
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <div className="h-8 w-12 bg-card-border/30 rounded" />
            <div className="h-5 w-12 bg-card-border/20 rounded" />
          </div>
          <div className="h-4 w-24 bg-card-border/20 rounded" />
        </div>
        <div className="hidden sm:block w-[60px] h-[24px] bg-card-border/20 rounded" />
      </div>
    </div>
  );
}

export function InsightSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-1.5 max-w-[300px]">
      <div className="w-2 h-2 rounded-full bg-accent/20" />
      <div className="h-3 w-48 bg-card-border/20 rounded" />
    </div>
  );
}

export function FilterSkeleton() {
  // ~7 placeholder pills matching sector-pill dimensions (padding + font + border ≈ 30px)
  const pillWidths = [48, 80, 72, 56, 88, 72, 80];
  
  return (
    <div className="space-y-2 animate-pulse">
      <div className="flex flex-wrap gap-2 min-h-[68px]">
        {pillWidths.map((width, i) => (
          <div
            key={i}
            className="h-[30px] bg-card-border/20 rounded-sm"
            style={{ width }}
          />
        ))}
      </div>
      {/* Tooltip placeholder */}
      <div className="h-5" />
    </div>
  );
}
