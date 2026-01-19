"use client";

import { formatDateShort } from "@/lib/chart-utils";
import { SECTOR_LABELS, SECTOR_COLORS } from "@/lib/bls";

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  /** Format for displaying values */
  valueFormatter?: (value: number, name: string) => string;
  /** Label to show for each entry (defaults to SECTOR_LABELS lookup) */
  labelFormatter?: (name: string) => string;
  /** Filter to exclude certain entries (e.g., trendlines) */
  filter?: (entry: TooltipPayloadItem) => boolean;
}

// Default: filter out trendline entries
const defaultFilter = (entry: TooltipPayloadItem) => !entry.dataKey?.includes("_trend") && !entry.dataKey?.includes("trend");

// Default: format as millions for job data
const defaultValueFormatter = (value: number) => `${(value / 1000).toFixed(2)}M`;

// Default: use sector labels
const defaultLabelFormatter = (name: string) => SECTOR_LABELS[name] || name;

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = defaultValueFormatter,
  labelFormatter = defaultLabelFormatter,
  filter = defaultFilter,
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const filtered = payload.filter(filter);
  if (filtered.length === 0) return null;

  return (
    <div className="bg-popover/95 border border-border p-3 rounded-md shadow-lg backdrop-blur-sm text-xs">
      <p className="font-medium text-muted-foreground mb-2 pb-2 border-b border-border">
        {formatDateShort(label || "")}
      </p>
      {filtered.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || SECTOR_COLORS[entry.name] || "#ef4444" }}
            />
            <span className="text-muted-foreground font-medium">
              {labelFormatter(entry.name)}
            </span>
          </div>
          <span className="font-mono text-foreground font-medium">
            {valueFormatter(entry.value, entry.name)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Pre-configured tooltip for job openings chart
export function JobChartTooltip(props: ChartTooltipProps) {
  return (
    <ChartTooltip
      {...props}
      valueFormatter={(value) => `${(value / 1000).toFixed(2)}M`}
      labelFormatter={(name) => SECTOR_LABELS[name] || name}
    />
  );
}

// Pre-configured tooltip for unemployment chart
export function UnemploymentTooltip(props: ChartTooltipProps) {
  return (
    <ChartTooltip
      {...props}
      valueFormatter={(value) => `${value.toFixed(1)}%`}
      labelFormatter={() => "Unemployment Rate"}
    />
  );
}

// Map unemployment sector to display label (strip unemployment_ prefix)
function getUnemploymentLabel(sector: string): string {
  // unemployment_manufacturing -> MANUFACTURING
  const baseSector = sector.replace("unemployment_", "");
  return SECTOR_LABELS[sector] || SECTOR_LABELS[baseSector] || baseSector.toUpperCase();
}

// Pre-configured tooltip for multi-industry unemployment chart
export function UnemploymentMultiTooltip(props: ChartTooltipProps) {
  return (
    <ChartTooltip
      {...props}
      valueFormatter={(value) => `${value.toFixed(1)}%`}
      labelFormatter={getUnemploymentLabel}
    />
  );
}

// Pre-configured tooltip for participation rate chart
export function ParticipationTooltip(props: ChartTooltipProps) {
  return (
    <ChartTooltip
      {...props}
      valueFormatter={(value) => `${value.toFixed(1)}%`}
      labelFormatter={() => "Participation Rate"}
    />
  );
}