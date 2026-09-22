import { v } from "convex/values";

export const snapshotFields = {
  date: v.string(),
  collectedAt: v.string(),
  windowStart: v.string(),
  windowEnd: v.string(),
  methodVersion: v.number(),
  available: v.number(),
  groups: v.array(
    v.object({
      code: v.string(),
      label: v.string(),
      total: v.number(),
      matches: v.number(),
      announcementIds: v.array(v.string()),
      keywords: v.array(v.object({ keyword: v.string(), count: v.number() })),
      examples: v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          agency: v.string(),
          url: v.string(),
          keywords: v.array(v.string()),
        }),
      ),
    }),
  ),
};
export const statusFields = {
  attemptedAt: v.string(),
  state: v.union(
    v.literal("complete"),
    v.literal("incomplete"),
    v.literal("error"),
    v.literal("unconfigured"),
  ),
  retrieved: v.number(),
  available: v.optional(v.number()),
  message: v.optional(v.string()),
};
