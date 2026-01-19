interface DashboardHeaderProps {
  lastUpdated: string | null;
}

export function DashboardHeader({ lastUpdated }: DashboardHeaderProps) {
  return (
    <header className="px-4 py-3 border-b border-card-border shrink-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-medium tracking-wide">
            <span className="hidden sm:inline">Job Openings & Labor Turnover Survey</span>
            <span className="sm:hidden">JOLTS</span>
          </h1>
          <span className="hidden sm:inline text-[10px] text-muted-foreground font-mono tracking-wider">
            JOLTS
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono tracking-wider">
          <span>BLS DATA</span>
          {lastUpdated && (
            <span className="hidden sm:inline opacity-60">{lastUpdated.toUpperCase()}</span>
          )}
        </div>
      </div>
    </header>
  );
}
