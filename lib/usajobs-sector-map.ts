import type { Sector } from "./bls";

/**
 * Map BLS sector keys (used in the UI) to USAJOBS JobCategoryCode values.
 *
 * Notes:
 * - USAJOBS is federal-only, so certain “private-sector shaped” buckets like
 *   `retail` may return low sample sizes. The UI should handle that gracefully.
 * - This is an intentionally small v1 mapping; refine over time based on what
 *   produces useful samples and intuitive results.
 */
export const USAJOBS_JOB_CATEGORY_CODES_BY_SECTOR: Record<Sector | "total" | "government" | "retail", string[]> = {
  // Broad federal categories (approximate)
  total: ["0000"],

  // BLS sectors (approximate mappings)
  information: ["2200"], // Information Technology
  healthcare: ["0600"], // Medical, Hospital, Dental, Public Health
  professional: ["0300", "0500", "0900", "1100"], // Admin/Clerical, Accounting/Finance, Legal, Business/Industry
  manufacturing: ["0800", "1600", "1700"], // Engineering/Architecture, Equipment/Facilities, Transportation/Mobile Equipment
  government: ["0000"], // Broad; federal postings are inherently gov, but keep for parity
  retail: ["0300"], // Sparse; closest proxy is clerical/admin
};


