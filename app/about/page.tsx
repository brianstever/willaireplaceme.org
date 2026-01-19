"use client";

import { AboutHeader } from "@/components/AboutHeader";
import { AboutFooter } from "@/components/AboutFooter";
import { AboutSection } from "@/components/AboutSection";
import { KeyValueGrid } from "@/components/KeyValueGrid";
import { IndicatorCard } from "@/components/IndicatorCard";
import { FeatureBlock } from "@/components/FeatureBlock";
import { ExternalLinks } from "@/components/ExternalLinks";
import {
  SURVEY_STATS,
  TECH_STACK,
  HIGH_OPENINGS_INDICATORS,
  LOW_OPENINGS_INDICATORS,
  VIEW_FEATURES,
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
            <div className="bg-card/30 border border-card-border rounded p-4">
              <h3 className="font-mono text-xs text-accent mb-2">AI SKILL MENTIONS (EXPERIMENTAL)</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                The dashboard may also display an optional, live “AI skill mentions” signal sourced from{" "}
                <a
                  href="https://www.usajobs.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline decoration-white/10 hover:decoration-accent/60"
                >
                  USAJOBS
                </a>{" "}
                (federal job postings) over the most recent period. This signal is keyword-based.
              </p>
            </div>
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
          </AboutSection>

          <AboutSection number="05" title="Technical Implementation">
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
                className="text-accent hover:underline"
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
