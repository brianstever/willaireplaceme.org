export type ViewMode = "openings" | "unemployment" | "participation";
const VIEWS: Array<{ value: ViewMode; label: string }> = [
  { value: "openings", label: "JOB OPENINGS" },
  { value: "unemployment", label: "UNEMPLOYMENT" },
  { value: "participation", label: "PARTICIPATION" },
];

export function ViewToggle({
  viewMode,
  onViewChange,
}: {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Select data view"
      className="shrink-0 flex items-center gap-1 bg-secondary/20 p-0.5 rounded w-fit"
    >
      {VIEWS.map((view, index) => (
        <button
          key={view.value}
          id={`tab-${view.value}`}
          role="tab"
          aria-selected={viewMode === view.value}
          aria-controls="chart-panel"
          tabIndex={viewMode === view.value ? 0 : -1}
          onClick={() => onViewChange(view.value)}
          onKeyDown={(event) => {
            const target =
              event.key === "ArrowRight"
                ? (index + 1) % VIEWS.length
                : event.key === "ArrowLeft"
                  ? (index + VIEWS.length - 1) % VIEWS.length
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? VIEWS.length - 1
                      : null;
            if (target !== null) {
              event.preventDefault();
              onViewChange(VIEWS[target].value);
              document.getElementById(`tab-${VIEWS[target].value}`)?.focus();
            }
          }}
          className={`px-3 py-1 text-[10px] font-mono rounded-sm transition-all ${viewMode === view.value ? "bg-background text-foreground shadow-sm ring-1 ring-white/30" : "text-muted-foreground hover:text-foreground"}`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
