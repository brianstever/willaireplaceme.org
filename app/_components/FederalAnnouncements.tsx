"use client";

import { useId, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { FederalData } from "@/lib/federal";

export function FederalAnnouncements() {
  const data = useQuery(api.usajobsQueries.getFederalAnnouncements, {});
  if (data === undefined)
    return (
      <p className="text-xs text-muted-foreground">
        Loading federal announcements…
      </p>
    );
  return <FederalAnnouncementsPanel data={data} />;
}

export function FederalAnnouncementsPanel({ data }: { data: FederalData }) {
  const [expanded, setExpanded] = useState(true);
  const [occupation, setOccupation] = useState("all");
  const [now] = useState(() => Date.now());
  const id = useId();
  const { snapshot, status } = data;
  const group =
    snapshot?.groups.find((row) => row.code === occupation) ??
    snapshot?.groups[0];
  const stale = snapshot
    ? now - Date.parse(snapshot.collectedAt) > 48 * 60 * 60 * 1000
    : false;
  const incomplete = status && status.state !== "complete";
  return (
    <section
      className="rounded-lg border border-card-border bg-card/40 p-4 space-y-4"
      aria-label="AI mentions in federal announcements"
    >
      <button
        className="flex w-full items-center justify-between text-left gap-4"
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xs font-mono tracking-wide">
          AI MENTIONS IN FEDERAL ANNOUNCEMENTS
        </span>
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <div id={id} hidden={!expanded} className="space-y-4">
        {!snapshot || !group ? (
          <p className="text-sm text-muted-foreground">
            {status?.state === "unconfigured"
              ? "Federal announcement collection is not configured."
              : "A complete federal announcement collection is not available yet."}
          </p>
        ) : (
          <>
            {(stale || incomplete) && (
              <p role="status" className="text-xs text-amber-400">
                {incomplete
                  ? "The latest collection did not complete. "
                  : "This collection is more than two days old. "}
                Showing the last complete collection from {snapshot.date}.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Currently open announcements posted within the 14-day lookback
              ending {snapshot.windowEnd}. Collected{" "}
              {snapshot.collectedAt.slice(0, 16).replace("T", " ")} UTC.
            </p>
            <label
              className="block text-xs text-muted-foreground"
              htmlFor={`${id}-occupation`}
            >
              Federal occupation
            </label>
            <select
              id={`${id}-occupation`}
              value={group.code}
              onChange={(event) => setOccupation(event.target.value)}
              className="w-full bg-background border border-card-border rounded px-3 py-2 text-sm"
            >
              {snapshot.groups.map((row) => (
                <option key={row.code} value={row.code}>
                  {row.label}
                  {row.code === "all" ? "" : ` (${row.code})`}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-6 font-mono text-sm">
              <p>
                <strong>{group.total.toLocaleString()}</strong> announcements
              </p>
              <p>
                <strong>{group.matches.toLocaleString()}</strong> mention AI
              </p>
              <p>
                <strong>
                  {group.total >= 20
                    ? `${((group.matches / group.total) * 100).toFixed(1)}%`
                    : "—"}
                </strong>{" "}
                share
              </p>
            </div>
            {group.total < 20 && (
              <p className="text-xs text-muted-foreground">
                Percentage withheld for groups with fewer than 20 announcements.
              </p>
            )}
            {group.keywords.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Terms:{" "}
                {group.keywords
                  .slice(0, 8)
                  .map((row) => `${row.keyword} (${row.count})`)
                  .join(", ")}
              </p>
            )}
            {group.examples.length > 0 && (
              <ul className="space-y-3">
                {group.examples.map((example) => (
                  <li key={example.id} className="text-xs">
                    <a
                      className="underline underline-offset-4"
                      href={example.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {example.title}
                    </a>
                    <p className="mt-1 text-muted-foreground">
                      {example.agency} · {example.keywords.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Keyword mentions can include optional skills or other references. They
          do not establish a requirement, adoption, or job displacement. Federal
          occupations are separate from the BLS industry categories above; one
          announcement can cover multiple occupations or vacancies.
        </p>
        <p className="text-xs text-muted-foreground">
          Source:{" "}
          <a href="https://www.usajobs.gov" className="underline">
            USAJOBS
          </a>
          . Original feature contributed by{" "}
          <a href="https://github.com/grandSpecial" className="underline">
            @grandSpecial
          </a>
          .
        </p>
      </div>
    </section>
  );
}
