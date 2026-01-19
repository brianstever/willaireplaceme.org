"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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

      {/* Main */}
      <main className="flex-1 px-4 py-8 md:py-12">
        <article className="max-w-3xl mx-auto space-y-10">
          <header className="space-y-4 pb-8 border-b border-card-border">
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">
              About This Dashboard
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
              An interactive visualization of U.S. labor market dynamics through the lens of 
              the Bureau of Labor Statistics&apos; Job Openings and Labor Turnover Survey.
            </p>
          </header>

          {/* What is JOLTS? */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-accent font-mono text-xs">01</span>
              <h2 className="text-lg font-medium tracking-wide">What is JOLTS?</h2>
            </div>
            <div className="pl-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                The <strong className="text-foreground">Job Openings and Labor Turnover Survey (JOLTS)</strong> is 
                a monthly survey conducted by the U.S. Bureau of Labor Statistics (BLS) that measures job vacancies, 
                hires, and separations across the U.S. economy. First published in December 2000, JOLTS has become 
                one of the most closely watched indicators of labor market health.
              </p>
              <p>
                The survey collects data from approximately 21,000 nonfarm business and government establishments, 
                providing insights into labor demand that complement the more widely known Employment Situation report 
                (commonly known as the &quot;jobs report&quot;).
              </p>
              <div className="bg-card/50 border border-card-border rounded p-4 font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Survey Frequency:</span>
                  <span className="text-foreground">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sample Size:</span>
                  <span className="text-foreground">~21,000 establishments</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Release Lag:</span>
                  <span className="text-foreground">~5 weeks after reference period</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Available:</span>
                  <span className="text-foreground">December 2000 – Present</span>
                </div>
              </div>
            </div>
          </section>

          {/* Economic Significance */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-accent font-mono text-xs">02</span>
              <h2 className="text-lg font-medium tracking-wide">Economic Significance</h2>
            </div>
            <div className="pl-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Job openings serve as a leading indicator of labor demand. When openings rise, it typically 
                signals employer confidence and economic expansion. Conversely, declining openings often 
                precede broader economic slowdowns and rising unemployment.
              </p>
              <p>
                The Federal Reserve closely monitors JOLTS data when making monetary policy decisions. 
                The ratio of job openings to unemployed workers (the &quot;vacancy-to-unemployment ratio&quot;) 
                is particularly significant—a high ratio suggests a tight labor market with employers 
                competing for workers, while a low ratio indicates labor market slack.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-card/30 border border-card-border rounded p-4">
                  <h3 className="font-mono text-xs text-accent mb-2">HIGH OPENINGS</h3>
                  <ul className="text-xs space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">↑</span>
                      <span>Strong labor demand</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">↑</span>
                      <span>Wage pressure (inflation risk)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">↑</span>
                      <span>Worker bargaining power</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-card/30 border border-card-border rounded p-4">
                  <h3 className="font-mono text-xs text-accent mb-2">LOW OPENINGS</h3>
                  <ul className="text-xs space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">↓</span>
                      <span>Weak labor demand</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">↓</span>
                      <span>Potential recession signal</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500">↓</span>
                      <span>Higher unemployment risk</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Data Source */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-accent font-mono text-xs">03</span>
              <h2 className="text-lg font-medium tracking-wide">Data Source & Methodology</h2>
            </div>
            <div className="pl-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                This dashboard pulls data directly from the Bureau of Labor Statistics public API. 
                The data is refreshed automatically via scheduled background jobs using Convex, 
                ensuring you always see the most current figures.
              </p>
              <div className="bg-card/50 border border-card-border rounded p-4 space-y-3">
                <h3 className="font-mono text-xs text-foreground">DATA SERIES USED</h3>
                <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-accent">JTS000000000000000JOL</span>
                    <span className="text-muted-foreground">— Total Nonfarm Job Openings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent">JTS510000000000000JOL</span>
                    <span className="text-muted-foreground">— Information Sector</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent">JTS540000000000000JOL</span>
                    <span className="text-muted-foreground">— Professional & Business Services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-accent">LNS14000000</span>
                    <span className="text-muted-foreground">— Unemployment Rate (Seasonally Adjusted)</span>
                  </div>
                </div>
              </div>
              <p className="text-xs">
                All job openings values are seasonally adjusted and expressed in thousands. 
                The dashboard converts these to millions for readability (e.g., 7,500 thousand = 7.50M).
              </p>
            </div>
          </section>

          {/* How to Use */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-accent font-mono text-xs">04</span>
              <h2 className="text-lg font-medium tracking-wide">Using This Dashboard</h2>
            </div>
            <div className="pl-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>The dashboard provides two primary views:</p>
              <div className="space-y-4">
                <div className="border-l-2 border-accent pl-4">
                  <h3 className="font-mono text-xs text-foreground mb-1">JOB OPENINGS VIEW</h3>
                  <p className="text-xs">
                    Displays total nonfarm job openings over time with the ability to overlay 
                    specific sectors for comparison. Use the sector filters at the bottom to 
                    toggle different industries on/off.
                  </p>
                </div>
                <div className="border-l-2 border-cyan-500 pl-4">
                  <h3 className="font-mono text-xs text-foreground mb-1">UNEMPLOYMENT VIEW</h3>
                  <p className="text-xs">
                    Shows the national unemployment rate trend alongside job openings data, 
                    helping visualize the inverse relationship between labor demand and unemployment.
                  </p>
                </div>
              </div>
              <p>
                The rotating insights at the top right provide automatically generated analysis 
                of notable patterns in the data, including peak comparisons, sector-specific 
                changes, and pre-pandemic benchmarks.
              </p>
            </div>
          </section>

          {/* Technical */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-accent font-mono text-xs">05</span>
              <h2 className="text-lg font-medium tracking-wide">Technical Implementation</h2>
            </div>
            <div className="pl-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Built with modern web technologies to deliver real-time data updates 
                without manual page refreshes:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-card/30 border border-card-border rounded p-3 text-center">
                  <span className="text-foreground">Next.js 16</span>
                  <p className="text-muted-foreground text-[10px] mt-1">Framework</p>
                </div>
                <div className="bg-card/30 border border-card-border rounded p-3 text-center">
                  <span className="text-foreground">Convex</span>
                  <p className="text-muted-foreground text-[10px] mt-1">Backend & Realtime</p>
                </div>
                <div className="bg-card/30 border border-card-border rounded p-3 text-center">
                  <span className="text-foreground">Recharts</span>
                  <p className="text-muted-foreground text-[10px] mt-1">Visualization</p>
                </div>
                <div className="bg-card/30 border border-card-border rounded p-3 text-center">
                  <span className="text-foreground">BLS API</span>
                  <p className="text-muted-foreground text-[10px] mt-1">Data Source</p>
                </div>
              </div>
              <p className="text-xs">
                Data is fetched via scheduled Convex cron jobs and stored in a reactive database, 
                enabling instant UI updates when new BLS releases become available.
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="space-y-4 pt-6 border-t border-card-border">
            <h2 className="font-mono text-xs text-muted-foreground tracking-wider">DISCLAIMER</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This dashboard is provided for educational and informational purposes only. 
              While data is sourced directly from the Bureau of Labor Statistics, this is 
              not an official BLS product. The visualizations and analysis presented here 
              should not be used as the sole basis for investment, policy, or business decisions. 
              Always refer to official BLS releases for authoritative data.
            </p>
          </section>

          {/* References */}
          <section className="space-y-4">
            <h2 className="font-mono text-xs text-muted-foreground tracking-wider">REFERENCES</h2>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-accent">→</span>
                <a 
                  href="https://www.bls.gov/jlt/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors underline underline-offset-2"
                >
                  BLS JOLTS Overview
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">→</span>
                <a 
                  href="https://www.bls.gov/jlt/jltover.htm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors underline underline-offset-2"
                >
                  JOLTS Technical Notes
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">→</span>
                <a 
                  href="https://www.bls.gov/developers/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors underline underline-offset-2"
                >
                  BLS Public Data API
                </a>
              </li>
            </ul>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 border-t border-card-border shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono tracking-wider">
          <span>BUREAU OF LABOR STATISTICS DATA</span>
          <Link href="/" className="hover:text-accent transition-colors">← DASHBOARD</Link>
        </div>
      </footer>
    </div>
  );
}
