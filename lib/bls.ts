// BLS JOLTS series IDs
export const BLS_SERIES = {
  total: "JTS000000000000000JOL",
  manufacturing: "JTS300000000000000JOL",
  healthcare: "JTS620000000000000JOL",
  retail: "JTS440000000000000JOL",
  professional: "JTS540000000000000JOL",
  information: "JTS510000000000000JOL",
  government: "JTS900000000000000JOL",
} as const;

export const UNEMPLOYMENT_SERIES = "LNS14000000";
export const PARTICIPATION_SERIES = "LNS11300000";

// Industry-specific unemployment rates (CPS)
// Note: unemployment_rate (LNS14000000) serves as the "total" unemployment
export const UNEMPLOYMENT_BY_INDUSTRY = {
  unemployment_rate: "LNS14000000", // Total (same as UNEMPLOYMENT_SERIES)
  unemployment_manufacturing: "LNU04032300",
  unemployment_healthcare: "LNU04032622",
  unemployment_retail: "LNU04032400",
  unemployment_professional: "LNU04032540",
  unemployment_information: "LNU04032500",
  unemployment_government: "LNU04032900",
} as const;

export const SECTOR_LABELS: Record<string, string> = {
  total: "TOTAL NONFARM",
  manufacturing: "MANUFACTURING",
  healthcare: "HEALTHCARE",
  retail: "RETAIL",
  professional: "PROFESSIONAL SERVICES",
  information: "INFORMATION/TECH",
  government: "GOVERNMENT",
  unemployment_rate: "ALL INDUSTRIES", // Used as "total" in unemployment filter
  participation_rate: "ALL INDUSTRIES", // Used as "total" in participation filter
  // Industry unemployment labels
  unemployment_manufacturing: "MANUFACTURING",
  unemployment_healthcare: "HEALTHCARE",
  unemployment_retail: "RETAIL",
  unemployment_professional: "PROFESSIONAL SERVICES",
  unemployment_information: "INFORMATION/TECH",
  unemployment_government: "GOVERNMENT",
};

export const SECTOR_COLORS: Record<string, string> = {
  total: "#ef4444",
  manufacturing: "#f59e0b",
  healthcare: "#22c55e",
  retail: "#3b82f6",
  professional: "#a855f7",
  information: "#ec4899",
  government: "#06b6d4",
  unemployment_rate: "#06b6d4", // Also used as "total" in unemployment filter
  participation_rate: "#a855f7",
  // Industry unemployment colors (match job openings)
  unemployment_manufacturing: "#f59e0b",
  unemployment_healthcare: "#22c55e",
  unemployment_retail: "#3b82f6",
  unemployment_professional: "#a855f7",
  unemployment_information: "#ec4899",
  unemployment_government: "#06b6d4",
};

export type Sector = keyof typeof BLS_SERIES;

// BLS API response types
export interface BLSDataPoint {
  year: string;
  period: string; // M01-M12 for months, M13 for annual
  periodName: string;
  value: string;
}

export interface BLSSeriesResult {
  seriesID: string;
  data: BLSDataPoint[];
}

export interface BLSResponse {
  status: string;
  message?: string[];
  Results?: {
    series: BLSSeriesResult[];
  };
}

// v2 requires API key, v1 is public (but limited to 10 years per request)
export async function fetchBLSData(
  seriesIds: string[],
  startYear: number,
  endYear: number,
  apiKey?: string
): Promise<BLSResponse> {
  const url = apiKey
    ? "https://api.bls.gov/publicAPI/v2/timeseries/data/"
    : "https://api.bls.gov/publicAPI/v1/timeseries/data/";

  const body: Record<string, unknown> = {
    seriesid: seriesIds,
    startyear: startYear.toString(),
    endyear: endYear.toString(),
  };

  if (apiKey) {
    body.registrationkey = apiKey;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`BLS API error: ${response.status}`);
  }

  return response.json();
}

export function transformBLSData(
  blsResponse: BLSResponse,
  seriesIdToSector: Record<string, string>
): Array<{ date: string; sector: string; value: number }> {
  const results: Array<{ date: string; sector: string; value: number }> = [];

  if (!blsResponse.Results) return results;

  for (const series of blsResponse.Results.series) {
    const sector = seriesIdToSector[series.seriesID];
    if (!sector) continue;

    for (const dataPoint of series.data) {
      // M01-M12 are months, skip M13 (annual)
      if (!dataPoint.period.startsWith("M") || dataPoint.period === "M13") continue;

      const month = dataPoint.period.replace("M", "").padStart(2, "0");
      const date = `${dataPoint.year}-${month}`;
      const value = parseFloat(dataPoint.value);

      if (!isNaN(value)) {
        results.push({ date, sector, value });
      }
    }
  }

  return results;
}

export async function fetchAllSectors(
  startYear: number,
  endYear: number,
  apiKey?: string
): Promise<Array<{ date: string; sector: string; value: number }>> {
  const seriesIds = Object.values(BLS_SERIES);
  const seriesIdToSector: Record<string, string> = {};

  for (const [sector, seriesId] of Object.entries(BLS_SERIES)) {
    seriesIdToSector[seriesId] = sector;
  }

  // v1 API limits to 10 years per request
  const maxYearsPerRequest = apiKey ? 20 : 10;
  const allData: Array<{ date: string; sector: string; value: number }> = [];

  for (let year = startYear; year <= endYear; year += maxYearsPerRequest) {
    const reqEndYear = Math.min(year + maxYearsPerRequest - 1, endYear);
    const response = await fetchBLSData(seriesIds, year, reqEndYear, apiKey);
    const transformed = transformBLSData(response, seriesIdToSector);
    allData.push(...transformed);
  }

  return allData;
}
