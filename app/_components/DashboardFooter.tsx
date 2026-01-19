import Link from "next/link";

export function DashboardFooter() {
  return (
    <footer className="px-4 py-2 border-t border-card-border shrink-0">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono tracking-wider">
        <span className="hidden sm:inline">BUREAU OF LABOR STATISTICS</span>
        <span className="sm:hidden">
          <a 
            href="https://github.com/brianstever/willaireplaceme.org"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors"
          >
            @brianstever
          </a>
        </span>
        <div className="flex items-center gap-3">
          <Link 
            href="/about" 
            className="hidden sm:inline hover:text-accent transition-colors"
          >
            ABOUT
          </Link>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="hidden sm:inline">UPDATED MONTHLY</span>
          <a 
            href="https://github.com/brianstever/willaireplaceme.org"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden hover:text-accent transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
