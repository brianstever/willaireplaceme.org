"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SERIES, isSector } from "@/lib/bls";

export function DataStatus({ sectors }: { sectors: string[] }) {
  const statuses = useQuery(api.jobs.getSeriesStatus, {});
  const [now] = useState(() => Date.now());
  if (statuses === undefined) return null;
  const selected = sectors.filter(isSector);
  const needsAttention = selected.some((sector) => {
    const status = statuses.find((row) => row.sector === sector);
    return (
      !status?.succeededAt ||
      !!status.error ||
      now - Date.parse(status.succeededAt) > 48 * 60 * 60 * 1000
    );
  });
  return (
    <details className="text-xs text-muted-foreground">
      <summary className="cursor-pointer py-1">
        Source and refresh status
        {needsAttention ? " · Some data needs a refresh" : ""}
      </summary>
      <ul className="space-y-3 mt-2">
        {selected.map((sector) => {
          const definition = SERIES[sector];
          const status = statuses.find((row) => row.sector === sector);
          const stale = status?.succeededAt
            ? now - Date.parse(status.succeededAt) > 48 * 60 * 60 * 1000
            : false;
          return (
            <li key={sector}>
              <p>
                {definition.title} ·{" "}
                {definition.unit === "percent" ? "Percent" : "Thousands"} ·{" "}
                {definition.seasonallyAdjusted
                  ? "Seasonally adjusted"
                  : "Not seasonally adjusted"}
              </p>
              <p className="mt-1">
                {status?.latestObservation
                  ? `Latest observation: ${status.latestObservation}. `
                  : "No verified refresh recorded. "}
                {status?.succeededAt &&
                  `Last successful fetch: ${status.succeededAt.slice(0, 16).replace("T", " ")} UTC.`}
              </p>
              {(status?.error || stale) && (
                <p role="status" className="text-amber-400">
                  {status?.error
                    ? "The latest refresh failed. Previously collected values are retained."
                    : "The last successful refresh is more than two days old."}
                </p>
              )}
              {status?.preliminary && <p>Latest observation is preliminary.</p>}
              {!!status?.footnotes.length && (
                <p>
                  {status.footnotes
                    .filter((note) => note.toLowerCase() !== "preliminary")
                    .join(" ")}
                </p>
              )}
              {!!status?.warnings.length && <p>{status.warnings.join(" ")}</p>}
              {!!status?.missing?.length && (
                <p>
                  Unavailable observations:{" "}
                  {status.missing
                    .map(
                      (row) =>
                        `${row.date}${row.footnotes.length ? ` (${row.footnotes.join("; ")})` : ""}`,
                    )
                    .join(", ")}
                  .
                </p>
              )}
              <a
                className="underline"
                href={`https://data.bls.gov/timeseries/${definition.id}`}
              >
                {definition.id}
              </a>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
