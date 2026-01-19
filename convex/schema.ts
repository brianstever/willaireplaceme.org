import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  job_openings: defineTable({
    date: v.string(),   // "2024-01"
    sector: v.string(), // "total", "manufacturing", etc. or "unemployment_rate"
    value: v.number(),  // thousands for jobs (7744 = 7.744M), percentage for unemployment
    rate: v.optional(v.number()),
  })
    .index("by_sector", ["sector"])
    .index("by_date", ["date"])
    .index("by_sector_date", ["sector", "date"]),

  // USAJOBS AI skill snapshots - daily snapshots of AI skill mentions in federal job postings
  ai_skill_snapshots: defineTable({
    date: v.string(),        // "2026-01-19"
    sector: v.string(),      // "total", "information", "healthcare", etc.
    total: v.number(),       // total postings sampled
    aiCount: v.number(),     // postings mentioning AI skills
    aiShare: v.union(v.number(), v.null()), // percentage (0-1) or null if low sample
    topKeywords: v.array(v.object({
      keyword: v.string(),
      count: v.number(),
    })),
    examples: v.array(v.object({
      title: v.string(),
      agency: v.optional(v.string()),
      url: v.optional(v.string()),
      matchedKeywords: v.array(v.string()),
    })),
  })
    .index("by_sector", ["sector"])
    .index("by_date", ["date"])
    .index("by_sector_date", ["sector", "date"]),

  metadata: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});
