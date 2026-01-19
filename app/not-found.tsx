import Link from "next/link";
import { DashboardHeader } from "@/app/_components/DashboardHeader";
import { DashboardFooter } from "@/app/_components/DashboardFooter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader lastUpdated={null} />

      <main id="main-content" className="flex-1 px-4 py-10 flex items-center">
        <div className="max-w-3xl mx-auto w-full">
          <div className="card-glass p-6 md:p-8 space-y-4">
            <p className="text-xs font-mono text-muted-foreground tracking-wider">
              ERROR 404
            </p>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">
              Page not found
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or it moved.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <Link href="/" className="sector-pill">
                Back to dashboard
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                About this project
              </Link>
            </div>
          </div>
          <p className="mt-4 text-[10px] font-mono text-muted-foreground/60 tracking-wider">
            If you followed a link, it may be outdated.
          </p>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
