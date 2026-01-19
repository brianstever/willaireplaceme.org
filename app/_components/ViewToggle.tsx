export type ViewMode = "openings" | "unemployment" | "participation";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  return (
    <div 
      role="tablist" 
      aria-label="Select data view"
      className="shrink-0 flex items-center gap-1 bg-secondary/20 p-0.5 rounded w-fit"
    >
      <button
        role="tab"
        aria-selected={viewMode === "openings"}
        aria-controls="chart-panel"
        onClick={() => onViewChange("openings")}
        className={`px-3 py-1 text-[10px] font-mono rounded-sm transition-all ${
          viewMode === "openings"
            ? "bg-background text-foreground shadow-sm ring-1 ring-red-500/30"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        JOB OPENINGS
      </button>
      <button
        role="tab"
        aria-selected={viewMode === "unemployment"}
        aria-controls="chart-panel"
        onClick={() => onViewChange("unemployment")}
        className={`px-3 py-1 text-[10px] font-mono rounded-sm transition-all ${
          viewMode === "unemployment"
            ? "bg-background text-foreground shadow-sm ring-1 ring-cyan-500/30"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        UNEMPLOYMENT
      </button>
      <button
        role="tab"
        aria-selected={viewMode === "participation"}
        aria-controls="chart-panel"
        onClick={() => onViewChange("participation")}
        className={`px-3 py-1 text-[10px] font-mono rounded-sm transition-all ${
          viewMode === "participation"
            ? "bg-background text-foreground shadow-sm ring-1 ring-purple-500/30"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        PARTICIPATION
      </button>
    </div>
  );
}
