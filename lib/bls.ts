export const SERIES = {
  total: {
    id: "JTS000000000000000JOL",
    title: "Total nonfarm job openings",
    label: "TOTAL NONFARM",
    view: "openings",
    unit: "thousands",
    seasonallyAdjusted: true,
    color: "#ef4444",
  },
  manufacturing: {
    id: "JTS300000000000000JOL",
    title: "Manufacturing job openings",
    label: "MANUFACTURING",
    view: "openings",
    unit: "thousands",
    seasonallyAdjusted: true,
    color: "#f59e0b",
  },
  healthcare: {
    id: "JTS620000000000000JOL",
    title: "Health care and social assistance job openings",
    label: "HEALTHCARE",
    view: "openings",
    unit: "thousands",
    seasonallyAdjusted: true,
    color: "#22c55e",
  },
  retail: {
    id: "JTS440000000000000JOL",
    title: "Retail trade job openings",
    label: "RETAIL",
    view: "openings",
    unit: "thousands",
    seasonallyAdjusted: true,
    color: "#3b82f6",
  },
  professional: {
    id: "JTS540099000000000JOL",
    title: "Professional and business services job openings",
    label: "PROFESSIONAL SERVICES",
    view: "openings",
    unit: "thousands",
    seasonallyAdjusted: true,
    color: "#a855f7",
  },
  information: {
    id: "JTS510000000000000JOL",
    title: "Information job openings",
    label: "INFORMATION",
    view: "openings",
    unit: "thousands",
    seasonallyAdjusted: true,
    color: "#ec4899",
  },
  government: {
    id: "JTS900000000000000JOL",
    title: "Government job openings",
    label: "GOVERNMENT",
    view: "openings",
    unit: "thousands",
    seasonallyAdjusted: true,
    color: "#06b6d4",
  },
  unemployment_rate: {
    id: "LNS14000000",
    title: "Civilian unemployment rate",
    label: "ALL INDUSTRIES",
    view: "unemployment",
    unit: "percent",
    seasonallyAdjusted: true,
    color: "#06b6d4",
  },
  participation_rate: {
    id: "LNS11300000",
    title: "Civilian labor force participation rate",
    label: "ALL INDUSTRIES",
    view: "participation",
    unit: "percent",
    seasonallyAdjusted: true,
    color: "#a855f7",
  },
  unemployment_manufacturing: {
    id: "LNU04032300",
    title: "Unemployment rate, manufacturing wage and salary workers",
    label: "MANUFACTURING",
    view: "unemployment",
    unit: "percent",
    seasonallyAdjusted: false,
    color: "#f59e0b",
  },
} as const;

export type Sector = keyof typeof SERIES;
export const ALL_SECTORS = Object.keys(SERIES) as Sector[];
export const JOB_OPENING_SECTORS = ALL_SECTORS.filter(
  (key) => SERIES[key].view === "openings",
);
export const UNEMPLOYMENT_SECTORS = ALL_SECTORS.filter(
  (key) => SERIES[key].view === "unemployment",
);
export const SECTOR_LABELS: Record<string, string> = Object.fromEntries(
  ALL_SECTORS.map((key) => [key, SERIES[key].label]),
);
export const SECTOR_COLORS: Record<string, string> = Object.fromEntries(
  ALL_SECTORS.map((key) => [key, SERIES[key].color]),
);

export function isSector(value: string): value is Sector {
  return Object.hasOwn(SERIES, value);
}

export function validateObservation(
  sector: string,
  date: string,
  value: number,
) {
  if (!isSector(sector)) throw new Error("Unknown BLS series");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(date))
    throw new Error("Invalid observation month");
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    (SERIES[sector].unit === "percent" && value > 100)
  ) {
    throw new Error("Invalid observation value");
  }
}
