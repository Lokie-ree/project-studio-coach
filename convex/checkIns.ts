import { v } from "convex/values";
import { saveMessage } from "@convex-dev/agent";
import { internalMutation, mutation } from "./_generated/server";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * The 48-hour Milestone Zero check-in. Scheduled atomically with the
 * commitment (coachData.commitMilestoneZero); a daily cron sweep backstops
 * anything the scheduler missed.
 */

export const milestoneZeroCheckIn = internalMutation({
  args: { milestoneZeroId: v.id("milestoneZeros") },
  handler: async (ctx, { milestoneZeroId }) => {
    const m0 = await ctx.db.get(milestoneZeroId);
    if (!m0 || m0.status !== "committed") return; // already done or revised
    const project = await ctx.db.get(m0.projectId);
    if (!project?.threadId || project.status !== "active") return;

    await ctx.db.patch(milestoneZeroId, { checkedInAt: Date.now() });
    // A persisted coach message the student sees on return. Honest, unhurried,
    // all three answers useful — this is a check-in, not a deadline klaxon.
    await saveMessage(ctx, components.agent, {
      threadId: project.threadId,
      message: {
        role: "assistant",
        content:
          `It's been a couple of days since you said: "${m0.text}"\n\n` +
          `How'd it go — done, partly, or not started? All three are useful answers. ` +
          `If it's not started, that usually means it was bigger than it looked, and we can cut it in half.`,
      },
    });
  },
});

/**
 * Student commits their Milestone Zero from the Shape screen — typed by them,
 * in their words, by construction. Same path as the coach tool.
 */
export const commitMilestoneZero = mutation({
  args: {
    projectId: v.id("projects"),
    text: v.string(),
    hoursUntilDue: v.number(),
  },
  handler: async (
    ctx,
    { projectId, text, hoursUntilDue },
  ): Promise<Id<"milestoneZeros">> => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (text.trim().length < 10) {
      throw new Error("Write the whole sentence — what, by when, so that what.");
    }
    const clamped = Math.max(1, Math.min(96, hoursUntilDue));
    return await ctx.runMutation(internal.coachData.commitMilestoneZero, {
      projectId,
      studentId: project.studentId,
      text,
      dueAt: Date.now() + clamped * 60 * 60 * 1000,
    });
  },
});

/** Student marks their M0 done (or asks to revise it). */
export const resolveMilestoneZero = mutation({
  args: {
    milestoneZeroId: v.id("milestoneZeros"),
    outcome: v.union(v.literal("done"), v.literal("revised")),
  },
  handler: async (ctx, { milestoneZeroId, outcome }) => {
    const m0 = await ctx.db.get(milestoneZeroId);
    if (!m0) throw new Error("Not found");
    await ctx.db.patch(milestoneZeroId, { status: outcome });
    if (m0.checkInScheduledId && outcome === "done") {
      await ctx.scheduler.cancel(m0.checkInScheduledId);
    }
  },
});

/** Daily sweep: catch overdue, never-checked-in commitments. */
export const sweepOverdueCheckIns = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const committed = await ctx.db
      .query("milestoneZeros")
      .withIndex("by_status", (q) => q.eq("status", "committed"))
      .collect();
    for (const m0 of committed) {
      if (m0.dueAt < now && !m0.checkedInAt) {
        await ctx.scheduler.runAfter(0, internal.checkIns.milestoneZeroCheckIn, {
          milestoneZeroId: m0._id,
        });
      }
    }
  },
});
