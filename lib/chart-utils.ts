// Chart helpers

export const TIME_RANGES = [
  { label: "1Y", months: 12 },
  { label: "3Y", months: 36 },
  { label: "5Y", months: 60 },
  { label: "10Y", months: 120 },
  { label: "ALL", months: 0 }, // 0 = no filter
] as const;

export type TimeRangeLabel = (typeof TIME_RANGES)[number]["label"];

// Simple linear regression for trendlines
export function linearRegression(
  data: { x: number; y: number }[]
): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (const point of data) {
    sumX += point.x;
    sumY += point.y;
    sumXY += point.x * point.y;
    sumX2 += point.x * point.x;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2024-01" -> "Jan 2024"
export function formatDateShort(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} ${year}`;
}

// "2024-01" -> "Jan '24"
export function formatDateAbbreviated(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  return `${MONTH_NAMES[parseInt(month, 10) - 1]} '${year.slice(2)}`;
}
