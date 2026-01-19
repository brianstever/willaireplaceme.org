export interface KeyValueItem {
  label: string;
  value: string;
}

export interface IndicatorItem {
  icon: "up" | "down";
  text: string;
}

export interface ViewFeature {
  title: string;
  description: string;
  borderColor: string;
}

export interface ReferenceLink {
  href: string;
  label: string;
}

export const SURVEY_STATS: KeyValueItem[] = [
  { label: "Survey Frequency", value: "Monthly" },
  { label: "Sample Size", value: "~21,000 establishments" },
  { label: "Release Lag", value: "~5 weeks after reference period" },
  { label: "Data Available", value: "December 2000 – Present" },
];

export const TECH_STACK: KeyValueItem[] = [
  { label: "Framework", value: "Next.js 16" },
  { label: "Backend & Realtime", value: "Convex" },
  { label: "Visualization", value: "Recharts" },
  { label: "Data Source", value: "BLS API" },
];

export const HIGH_OPENINGS_INDICATORS: IndicatorItem[] = [
  { icon: "up", text: "Strong labor demand" },
  { icon: "up", text: "Wage pressure (inflation risk)" },
  { icon: "up", text: "Worker bargaining power" },
];

export const LOW_OPENINGS_INDICATORS: IndicatorItem[] = [
  { icon: "down", text: "Weak labor demand" },
  { icon: "down", text: "Potential recession signal" },
  { icon: "down", text: "Higher unemployment risk" },
];

export const VIEW_FEATURES: ViewFeature[] = [
  {
    title: "JOB OPENINGS VIEW",
    description:
      "Displays total nonfarm job openings over time with the ability to overlay specific sectors for comparison. Use the sector filters at the bottom to toggle different industries on/off.",
    borderColor: "border-accent",
  },
  {
    title: "UNEMPLOYMENT VIEW",
    description:
      "Shows the national unemployment rate trend, helping visualize the inverse relationship between labor demand and unemployment.",
    borderColor: "border-cyan-500",
  },
  {
    title: "PARTICIPATION VIEW",
    description:
      "Displays the labor force participation rate—the percentage of the working-age population that is either employed or actively seeking work. This metric helps contextualize unemployment figures by showing how many people are in the workforce.",
    borderColor: "border-purple-500",
  },
];

export const CHART_FEATURES: ViewFeature[] = [
  {
    title: "TIME RANGE CONTROLS",
    description:
      "Filter data by time period: 1Y, 3Y, 5Y, 10Y, or ALL. Each view remembers your selection independently.",
    borderColor: "border-white/20",
  },
  {
    title: "TRENDLINE TOGGLE",
    description:
      "Enable a linear regression trendline to visualize the overall direction of the data. The trend indicator shows the percentage change over the selected period.",
    borderColor: "border-white/20",
  },
  {
    title: "CHATGPT RELEASE DATE",
    description:
      "A vertical reference line marks November 2022—when ChatGPT launched. Notably, this coincides with the local maximum of job openings before the subsequent decline. Toggle this marker on/off via the chart controls.",
    borderColor: "border-emerald-500",
  },
];

export const REFERENCE_LINKS: ReferenceLink[] = [
  { href: "https://www.bls.gov/jlt/", label: "BLS JOLTS Overview" },
  { href: "https://www.bls.gov/jlt/jltover.htm", label: "JOLTS Technical Notes" },
  { href: "https://www.bls.gov/developers/", label: "BLS Public Data API" },
];
