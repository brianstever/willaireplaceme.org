export const FEDERAL_METHOD_VERSION = 2;
export const FEDERAL_LOOKBACK_DAYS = 14;

export interface FederalExample {
  id: string;
  title: string;
  agency: string;
  url: string;
  keywords: string[];
}

export interface FederalGroup {
  code: string;
  label: string;
  total: number;
  matches: number;
  announcementIds: string[];
  keywords: Array<{ keyword: string; count: number }>;
  examples: FederalExample[];
}

export interface FederalSnapshot {
  date: string;
  collectedAt: string;
  windowStart: string;
  windowEnd: string;
  methodVersion: number;
  available: number;
  groups: FederalGroup[];
}

export interface FederalStatus {
  attemptedAt: string;
  state: "complete" | "incomplete" | "error" | "unconfigured";
  retrieved: number;
  available?: number;
  message?: string;
}

export interface FederalData {
  snapshot: FederalSnapshot | null;
  status: FederalStatus | null;
}
