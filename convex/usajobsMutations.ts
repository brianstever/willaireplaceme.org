import { internalMutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { snapshotFields, statusFields } from "./federalValidators";
import { FEDERAL_METHOD_VERSION, type FederalStatus } from "../lib/federal";

async function saveStatus(ctx: MutationCtx, status: FederalStatus) {
  const existing = await ctx.db.query("federal_status").first();
  if (existing && existing.attemptedAt > status.attemptedAt) return;
  if (existing) await ctx.db.replace(existing._id, status);
  else await ctx.db.insert("federal_status", status);
}

export const recordAttempt = internalMutation({
  args: statusFields,
  handler: (ctx, args) => saveStatus(ctx, args),
});

export const storeSnapshot = internalMutation({
  args: snapshotFields,
  handler: async (ctx, args) => {
    const all = args.groups.find((group) => group.code === "all");
    if (
      args.methodVersion !== FEDERAL_METHOD_VERSION ||
      !all ||
      all.total !== args.available
    )
      throw new Error("Incomplete federal snapshot");
    for (const group of args.groups) {
      if (
        group.total !== new Set(group.announcementIds).size ||
        group.matches < 0 ||
        group.matches > group.total
      )
        throw new Error("Invalid announcement counts");
    }
    const existing = await ctx.db
      .query("federal_snapshots")
      .withIndex("by_method_date", (q) =>
        q.eq("methodVersion", args.methodVersion).eq("date", args.date),
      )
      .unique();
    if (existing && existing.collectedAt > args.collectedAt) return;
    if (existing) await ctx.db.replace(existing._id, args);
    else await ctx.db.insert("federal_snapshots", args);
    await saveStatus(ctx, {
      attemptedAt: args.collectedAt,
      state: "complete",
      retrieved: args.available,
      available: args.available,
    });
  },
});

export const cleanupOldSnapshots = internalMutation({
  args: { retentionDays: v.number() },
  handler: async (ctx, args) => {
    if (!Number.isInteger(args.retentionDays) || args.retentionDays < 90)
      throw new Error("Retention must be at least 90 days");
    const cutoff = new Date(Date.now() - args.retentionDays * 86_400_000)
      .toISOString()
      .slice(0, 10);
    const old = await ctx.db
      .query("ai_skill_snapshots")
      .withIndex("by_date", (q) => q.lt("date", cutoff))
      .collect();
    const snapshots = await ctx.db
      .query("federal_snapshots")
      .withIndex("by_date", (q) => q.lt("date", cutoff))
      .collect();
    for (const row of [...old, ...snapshots]) await ctx.db.delete(row._id);
  },
});
