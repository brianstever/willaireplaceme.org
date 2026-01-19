import Link from "next/link";

export function AboutHeader() {
  return (
    <header className="px-4 py-3 border-b border-card-border shrink-0">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link 
          href="/"
          className="flex items-baseline gap-2 hover:opacity-80 transition-opacity"
        >
          <h1 className="text-sm font-medium tracking-wide">
            Job Openings & Labor Turnover Survey
          </h1>
          <span className="text-[10px] text-muted-foreground font-mono tracking-wider">
            JOLTS
          </span>
        </Link>
        <Link 
          href="/"
          className="text-muted-foreground hover:text-accent transition-colors"
        >
          <span className="sm:hidden text-lg">←</span>
          <span className="hidden sm:inline text-[10px] font-mono tracking-wider">← BACK TO DASHBOARD</span>
        </Link>
      </div>
    </header>
  );
}
