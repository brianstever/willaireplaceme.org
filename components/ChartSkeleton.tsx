"use client";

export function ChartSkeleton() {
  return (
    <div className="space-y-2 flex flex-col h-full animate-pulse">
      {/* Controls skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-secondary/20 p-0.5 rounded">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-8 h-5 bg-card-border/30 rounded-sm" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-5 bg-card-border/30 rounded" />
          <div className="w-12 h-5 bg-card-border/30 rounded" />
          <div className="w-24 h-4 bg-card-border/20 rounded hidden sm:block" />
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="rounded-lg overflow-hidden bg-linear-to-b from-black/20 to-black/40 border border-white/5 flex-1 min-h-0 relative">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-4 bottom-8 flex flex-col justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-6 h-2 bg-card-border/20 rounded" />
          ))}
        </div>
        
        {/* Grid lines */}
        <div className="absolute left-10 right-4 top-4 bottom-8 flex flex-col justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-px bg-card-border/10 w-full" />
          ))}
        </div>
        
        {/* Fake chart area */}
        <div className="absolute left-10 right-4 top-8 bottom-12">
          <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,30 Q10,28 20,25 T40,20 T60,22 T80,18 T100,15"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-card-border/30"
            />
            <path
              d="M0,30 Q10,28 20,25 T40,20 T60,22 T80,18 T100,15 L100,40 L0,40 Z"
              className="fill-card-border/10"
            />
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="absolute left-10 right-4 bottom-2 flex justify-between">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-6 h-2 bg-card-border/20 rounded" />
          ))}
        </div>
        
        {/* Brush skeleton */}
        <div className="absolute left-10 right-4 bottom-6 h-5 bg-card-border/10 rounded" />
      </div>
    </div>
  );
}
