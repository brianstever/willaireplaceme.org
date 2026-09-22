"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { collectAnnouncements, summarizeAnnouncements } from "../lib/usajobs";
import { FEDERAL_METHOD_VERSION, FEDERAL_LOOKBACK_DAYS } from "../lib/federal";

export const fetchAiSkillSnapshot = internalAction({
  args: {},
  handler: async (ctx) => {
    const attemptedAt = new Date().toISOString();
    const authorizationKey = process.env.USAJOBS_AUTH_KEY;
    const userAgent = process.env.USAJOBS_USER_AGENT;
    if (!authorizationKey || !userAgent) {
      await ctx.runMutation(internal.usajobsMutations.recordAttempt, {
        attemptedAt,
        state: "unconfigured",
        retrieved: 0,
        message: "USAJOBS collection is not configured.",
      });
      return { state: "unconfigured" };
    }
    try {
      const result = await collectAnnouncements({
        authorizationKey,
        userAgent,
        days: FEDERAL_LOOKBACK_DAYS,
      });
      if (!result.complete) {
        await ctx.runMutation(internal.usajobsMutations.recordAttempt, {
          attemptedAt,
          state: "incomplete",
          retrieved: result.items.length,
          available: result.available,
          message: result.reason,
        });
        return { state: "incomplete" };
      }
      const date = attemptedAt.slice(0, 10);
      const start = new Date(attemptedAt);
      start.setUTCDate(start.getUTCDate() - FEDERAL_LOOKBACK_DAYS);
      await ctx.runMutation(internal.usajobsMutations.storeSnapshot, {
        date,
        collectedAt: attemptedAt,
        windowStart: start.toISOString().slice(0, 10),
        windowEnd: date,
        methodVersion: FEDERAL_METHOD_VERSION,
        available: result.available,
        groups: summarizeAnnouncements(result.items),
      });
      return { state: "complete", total: result.items.length };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "USAJOBS collection failed";
      await ctx.runMutation(internal.usajobsMutations.recordAttempt, {
        attemptedAt,
        state: "error",
        retrieved: 0,
        message:
          "USAJOBS collection failed. The previous snapshot is retained.",
      });
      throw new Error(message);
    }
  },
});
