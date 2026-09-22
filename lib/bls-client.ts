import { z } from "zod";
import { SERIES, type Sector, validateObservation } from "./bls";

const responseSchema = z.object({
  status: z.string(),
  message: z.array(z.string()).optional().default([]),
  Results: z
    .object({
      series: z.array(z.object({ seriesID: z.string(), data: z.unknown() })),
    })
    .optional(),
});
const pointSchema = z.object({
  year: z.string().regex(/^\d{4}$/),
  period: z.string(),
  value: z.string(),
  footnotes: z
    .array(
      z.object({ code: z.string().optional(), text: z.string().optional() }),
    )
    .optional()
    .default([]),
});

export interface Observation {
  date: string;
  value: number;
  preliminary: boolean;
  footnotes: string[];
}
export interface SeriesResult {
  sector: Sector;
  points: Observation[];
  missing: Array<{ date: string; footnotes: string[] }>;
  warnings: string[];
  error?: string;
}

export function parseBlsResponse(
  input: unknown,
  sectors: Sector[],
): SeriesResult[] {
  const response = responseSchema.parse(input);
  if (response.status !== "REQUEST_SUCCEEDED" || !response.Results)
    throw new Error("BLS request failed");
  return sectors.map((sector) => {
    const id = SERIES[sector].id;
    const warnings = response.message.filter((message) => message.includes(id));
    try {
      const series = response.Results!.series.filter(
        (row) => row.seriesID === id,
      );
      if (series.length !== 1)
        throw new Error("Expected series missing or repeated");
      const rows = z.array(pointSchema).parse(series[0].data);
      const points: Observation[] = [];
      const missing: SeriesResult["missing"] = [];
      const dates = new Set<string>();
      for (const row of rows) {
        if (row.period === "M13") continue;
        if (!/^M(0[1-9]|1[0-2])$/.test(row.period))
          throw new Error("Invalid BLS period");
        const date = `${row.year}-${row.period.slice(1)}`;
        if (dates.has(date)) throw new Error("Duplicate BLS observation");
        dates.add(date);
        const footnotes = row.footnotes.flatMap((note) =>
          note.text ? [note.text] : [],
        );
        if (["-", "(S)", "(NA)"].includes(row.value.trim())) {
          missing.push({ date, footnotes });
          continue;
        }
        if (!/^\d+(\.\d+)?$/.test(row.value.trim()))
          throw new Error("Invalid BLS number");
        const value = Number(row.value);
        validateObservation(sector, date, value);
        points.push({
          date,
          value,
          preliminary: row.footnotes.some((note) => note.code === "P"),
          footnotes,
        });
      }
      if (points.length === 0)
        throw new Error("No numeric observations returned");
      return { sector, points, missing, warnings };
    } catch (error) {
      return {
        sector,
        points: [],
        missing: [],
        warnings,
        error: error instanceof Error ? error.message : "Invalid BLS series",
      };
    }
  });
}

export async function fetchBlsRange(
  sectors: Sector[],
  startYear: number,
  endYear: number,
) {
  const response = await fetch(
    "https://api.bls.gov/publicAPI/v1/timeseries/data/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: sectors.map((key) => SERIES[key].id),
        startyear: String(startYear),
        endyear: String(endYear),
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) throw new Error(`BLS request failed (${response.status})`);
  return parseBlsResponse(await response.json(), sectors);
}
