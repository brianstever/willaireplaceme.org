import Link from "next/link";

interface DashboardHeaderProps {
  lastUpdated: string | null;
}

export function DashboardHeader({ lastUpdated }: DashboardHeaderProps) {
  return (
    <header className="px-4 py-3 border-b border-card-border shrink-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-medium tracking-wide">
            Will AI Replace Me?
            <span className="text-muted-foreground font-normal mx-1.5 hidden sm:inline">|</span>
            <span className="hidden lg:inline text-muted-foreground font-normal">Job Openings & Labor Turnover Survey</span>
            <span className="hidden sm:inline lg:hidden text-muted-foreground font-normal">JOLTS</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono tracking-wider">
          <Link 
            href="/about" 
            className="sm:hidden text-xs hover:text-accent transition-colors"
          >
            About
          </Link>
          <span className="hidden sm:inline">BLS DATA</span>
          {lastUpdated && (
            <span className="hidden sm:inline opacity-60">{lastUpdated.toUpperCase()}</span>
          )}
        </div>
      </div>
    </header>
  );
}
