"use client";

export function ChartSkeleton() {
  return (
    <div className="space-y-2 flex flex-col h-full">
      {/* Controls skeleton - matches ChartControls layout */}
      <div className="flex items-center justify-between flex-wrap gap-2 shrink-0 animate-pulse">
        {/* Time range buttons */}
        <div className="flex items-center bg-secondary/20 p-0.5 rounded">
          {["1Y", "3Y", "5Y", "10Y", "ALL"].map((label, i) => (
            <div 
              key={label} 
              className={`px-2 py-0.5 text-[10px] rounded-sm ${i === 1 ? "bg-background/50" : ""}`}
            >
              <span className="opacity-30">{label}</span>
            </div>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end min-w-0 flex-1">
          {/* Trend toggle */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-secondary/30 border border-white/10">
            <div className="w-6 h-0.5 bg-card-border/40 rounded" />
            <span className="opacity-30">Trend</span>
          </div>
          {/* ChatGPT toggle */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-secondary/30 border border-white/10">
            <div className="w-0.5 h-3 bg-card-border/40 rounded" />
            <span className="opacity-30">ChatGPT Release Date</span>
          </div>
          {/* Trend indicator */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-card-border/20 bg-card-border/10">
            <div className="w-2 h-2 bg-card-border/30 rounded-sm" />
            <div className="w-8 h-3 bg-card-border/30 rounded" />
          </div>
          {/* Date range */}
          <div className="w-28 h-3 bg-card-border/20 rounded hidden sm:block" />
        </div>
      </div>

      {/* Chart container with animated shimmer */}
      <div className="rounded-lg overflow-hidden bg-linear-to-b from-black/20 to-black/40 border border-white/5 flex-1 min-h-[300px] relative">
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] chart-skeleton-shimmer" />
        
        {/* Subtle glass texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      </div>

    </div>
  );
}
