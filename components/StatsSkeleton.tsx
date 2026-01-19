"use client";

export function StatsSkeleton() {
  return (
    <div className="flex items-center gap-3 sm:gap-6 animate-pulse">
      {/* Job Openings skeleton */}
      <div className="flex items-baseline gap-2 sm:gap-3">
        <div className="h-12 w-28 bg-card-border/30 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-card-border/20 rounded" />
          <div className="h-5 w-12 bg-card-border/20 rounded" />
        </div>
      </div>

      {/* Unemployment skeleton */}
      <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-6 border-l border-card-border">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1 sm:gap-2">
            <div className="h-7 w-14 bg-card-border/30 rounded" />
            <div className="h-4 w-8 bg-card-border/20 rounded" />
          </div>
          <div className="h-3 w-20 bg-card-border/20 rounded" />
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
