"use client";

import { AboutHeader } from "@/app/about/_components/AboutHeader";
import { AboutFooter } from "@/app/about/_components/AboutFooter";
import { AboutSection } from "@/app/about/_components/AboutSection";
import { KeyValueGrid } from "@/app/about/_components/KeyValueGrid";
import { IndicatorCard } from "@/app/about/_components/IndicatorCard";
import { FeatureBlock } from "@/app/about/_components/FeatureBlock";
import { ExternalLinks } from "@/app/about/_components/ExternalLinks";
import {
  SURVEY_STATS,
  TECH_STACK,
  HIGH_OPENINGS_INDICATORS,
  LOW_OPENINGS_INDICATORS,
  VIEW_FEATURES,
  CHART_FEATURES,
  REFERENCE_LINKS,
} from "@/lib/about-content";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AboutHeader />

      <main className="flex-1 px-4 py-8 md:py-12">
        <article className="max-w-3xl mx-auto space-y-10">
          <header className="space-y-4 pb-8 border-b border-card-border">
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">
              About This Dashboard
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
              An interactive visualization of U.S. labor market dynamics through the lens of 
              the Bureau of Labor Statistics&apos; Job Openings and Labor Turnover Survey, 
              unemployment rate, and labor force participation rate.
            </p>
            <a 
              href="https://github.com/brianstever/willaireplaceme.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-accent transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View source on GitHub
            </a>
          </header>

          <AboutSection number="01" title="What is JOLTS?">
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
            <KeyValueGrid items={SURVEY_STATS} />
          </AboutSection>

          <AboutSection number="02" title="Economic Significance">
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
              <IndicatorCard title="HIGH OPENINGS" items={HIGH_OPENINGS_INDICATORS} variant="positive" />
              <IndicatorCard title="LOW OPENINGS" items={LOW_OPENINGS_INDICATORS} variant="negative" />
            </div>
          </AboutSection>

          <AboutSection number="03" title="Data Source & Methodology">
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
                <div className="flex items-center gap-2">
                  <span className="text-accent">LNS11300000</span>
                  <span className="text-muted-foreground">— Labor Force Participation Rate</span>
                </div>
              </div>
            </div>
            <p className="text-xs">
              All job openings values are seasonally adjusted and expressed in thousands. 
              The dashboard converts these to millions for readability (e.g., 7,500 thousand = 7.50M).
            </p>
          </AboutSection>

          <AboutSection number="04" title="Using This Dashboard">
            <p>The dashboard provides three primary views:</p>
            <div className="space-y-4">
              {VIEW_FEATURES.map((feature) => (
                <FeatureBlock key={feature.title} {...feature} />
              ))}
            </div>
            <p>
              The rotating insights at the top right provide automatically generated analysis 
              of notable patterns in the data, including peak comparisons, sector-specific 
              changes, and pre-pandemic benchmarks.
            </p>

            <h3 className="font-mono text-xs text-muted-foreground tracking-wider mt-8 mb-4">CHART CONTROLS</h3>
            <div className="space-y-4">
              {CHART_FEATURES.map((feature) => (
                <FeatureBlock key={feature.title} {...feature} />
              ))}
            </div>
          </AboutSection>

          <AboutSection number="05" title="Why USAJOBS AI Signal?">
            <p>
              Contributed by{" "}
              <a
                href="https://github.com/grandSpecial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground hover:underline"
              >
                @grandSpecial
              </a>
              , this feature pulls live federal job postings from{" "}
              <a
                href="https://www.usajobs.gov/"
                target="_blank"
                rel="noreferrer"
                className="text-foreground/70 hover:text-foreground hover:underline"
              >
                USAJOBS.gov
              </a>{" "}
              and scans them for AI-related skills. It answers a question central to this 
              project: <em className="text-foreground">how is AI changing the job market?</em>
            </p>
            <p>
              While JOLTS data shows us aggregate trends in job openings, it doesn&apos;t tell us 
              what skills employers are actually looking for. By scanning federal job postings 
              for keywords like &quot;machine learning,&quot; &quot;LLM,&quot; &quot;prompt engineering,&quot; 
              and other AI-related terms, we can see in real-time how AI skills are becoming 
              embedded in workforce requirements.
            </p>
            <p>
              The significance goes beyond just &quot;AI jobs.&quot; When employers add AI skills to 
              existing roles, they&apos;re betting that AI-augmented workers will be more productive—
              potentially reducing the need for additional hiring. A single employee who can 
              leverage AI tools effectively might do the work that previously required two or three. 
              This is the productivity story that could reshape labor demand even as job openings 
              appear stable.
            </p>
            <div className="bg-card/30 border border-card-border rounded p-4 space-y-3">
              <h3 className="font-mono text-xs text-accent">WHY FEDERAL JOBS?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Federal job postings are publicly accessible via the USAJOBS API and provide 
                a consistent, structured dataset. While they represent only a slice of the 
                overall labor market, federal hiring often reflects broader workforce trends 
                and policy priorities. When the government starts requiring AI skills for 
                positions that previously didn&apos;t need them, it signals a fundamental shift 
                in what &quot;job readiness&quot; means.
              </p>
            </div>
            <div className="bg-card/30 border border-card-border rounded p-4 space-y-3">
              <h3 className="font-mono text-xs text-accent">LIMITATIONS</h3>
              <ul className="text-xs text-muted-foreground leading-relaxed space-y-1">
                <li>• Federal jobs only — private sector not included</li>
                <li>• Keyword-based detection may miss some relevant postings</li>
                <li>• Sample sizes vary by sector (some sectors have few federal jobs)</li>
                <li>• Refreshed periodically, not real-time</li>
              </ul>
            </div>
            <p className="text-xs">
              This feature is experimental and meant to provide directional insight rather 
              than precise measurement. Think of it as one more signal in understanding 
              how AI is reshaping the workforce.
            </p>
          </AboutSection>

          <AboutSection number="06" title="Technical Implementation">
            <p>
              Built with modern web technologies to deliver real-time data updates 
              without manual page refreshes:
            </p>
            <KeyValueGrid items={TECH_STACK} columns={4} variant="grid" />
            <p className="text-xs">
              Data is fetched via scheduled Convex cron jobs and stored in a reactive database, 
              enabling instant UI updates when new BLS releases become available.
            </p>
          </AboutSection>

          {/* Contributors */}
          <section className="space-y-4 pt-6 border-t border-card-border">
            <h2 className="font-mono text-xs text-muted-foreground tracking-wider">CONTRIBUTORS</h2>
            <ul className="text-xs text-muted-foreground leading-relaxed space-y-2">
              <li>
                <a
                  href="https://github.com/grandSpecial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-foreground hover:underline"
                >
                  @grandSpecial
                </a>
                {" — "}USAJOBS AI skill mentions feature
              </li>
              <li>
                <a
                  href="https://x.com/igorzmitrovich"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-foreground hover:underline"
                >
                  @igorzmitrovich
                </a>
                {" — "}suggested the ChatGPT release date marker
              </li>
              <li>
                <a
                  href="https://x.com/DaveShapi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-foreground hover:underline"
                >
                  @DaveShapi
                </a>
                {" — "}requested the labor force participation rate view
              </li>
            </ul>
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
            <p className="text-xs text-muted-foreground leading-relaxed">
              I&apos;m Brian Stever, a student studying Applied AI at the University of Arizona. 
              I built this as a personal project to explore labor market data—it&apos;s not affiliated 
              with or endorsed by my school. The code is open source and available on{" "}
              <a 
                href="https://github.com/brianstever/willaireplaceme.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 hover:text-foreground hover:underline"
              >
                GitHub
              </a>.
            </p>
          </section>

          <ExternalLinks title="REFERENCES" links={REFERENCE_LINKS} />
        </article>
      </main>

      <AboutFooter />
    </div>
  );
}
