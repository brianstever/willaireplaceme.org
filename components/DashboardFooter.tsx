import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="px-4 py-2 border-t border-card-border shrink-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono tracking-wider">
        <span className="hidden sm:inline">BUREAU OF LABOR STATISTICS</span>
        <Link 
          href="/about" 
          className="sm:hidden text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          Read about this data →
        </Link>
        <div className="flex items-center gap-3">
          <Link 
            href="/about" 
            className="hidden sm:inline hover:text-accent transition-colors"
          >
            ABOUT
          </Link>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="hidden sm:inline">UPDATED MONTHLY</span>
        </div>
      </div>
    </footer>
  );
}
