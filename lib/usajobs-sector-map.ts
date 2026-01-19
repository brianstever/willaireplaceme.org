import type { Sector } from "./bls";

// Map BLS sectors to USAJOBS JobCategoryCode values
// Federal-only data, so private-sector buckets like retail may have low samples
export const USAJOBS_JOB_CATEGORY_CODES_BY_SECTOR: Record<Sector | "total" | "government" | "retail", string[]> = {
  total: ["0000"],
  information: ["2200"], // IT
  healthcare: ["0600"], // Medical/Hospital/Public Health
  professional: ["0300", "0500", "0900", "1100"], // Admin/Accounting/Legal/Business
  manufacturing: ["0800", "1600", "1700"], // Engineering/Equipment/Transportation
  government: ["0000"],
  retail: ["0300"], // sparse - closest proxy is clerical/admin
};
