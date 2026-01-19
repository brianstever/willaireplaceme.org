import Link from "next/link";

export function AboutFooter() {
  return (
    <footer className="px-4 py-4 border-t border-card-border shrink-0">
      <div className="max-w-3xl mx-auto flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono tracking-wider">
        <span>BUREAU OF LABOR STATISTICS DATA</span>
        <Link href="/" className="hover:text-accent transition-colors">← DASHBOARD</Link>
      </div>
    </footer>
  );
}
