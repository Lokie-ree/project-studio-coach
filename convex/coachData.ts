import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { vStage } from "./shared";

/** Internal data functions backing the coach's tools. */

export const getThreadContext = internalQuery({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const link = await ctx.db
      .query("coachThreads")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .first();
    if (!link) return null;
    const project = await ctx.db.get(link.projectId);
    if (!project) return null;
    const student = await ctx.db.get(link.studentId);
    return {
      projectId: link.projectId,
      studentId: link.studentId,
      stage: project.stage,
      archetypeId: project.archetypeId ?? null,
      studentName: student?.name ?? "the student",
    };
  },
});

export const commitMilestoneZero = internalMutation({
  args: {
    projectId: v.id("projects"),
    studentId: v.id("students"),
    text: v.string(),
    dueAt: v.number(),
  },
  handler: async (ctx, { projectId, studentId, text, dueAt }) => {
    const m0Id = await ctx.db.insert("milestoneZeros", {
      projectId,
      studentId,
      text,
      committedAt: Date.now(),
      dueAt,
      status: "committed",
    });
    // The check-in fires when the commitment comes due (not a fixed 48h —
    // dueAt can be sooner), atomic with this commitment.
    const jobId = await ctx.scheduler.runAt(
      dueAt,
      internal.checkIns.milestoneZeroCheckIn,
      { milestoneZeroId: m0Id },
    );
    await ctx.db.patch(m0Id, { checkInScheduledId: jobId });

    // Evidence: the Milestone Zero the student authored. learner 1.1.
    await ctx.db.insert("profileEvidence", {
      studentId,
      projectId,
      stage: "shape",
      roleId: "learner",
      skillCode: "1.1",
      profileVersion: "2026.07",
      studentWords: text,
      createdAt: Date.now(),
      sharedWithTeacher: false,
    });
    return m0Id;
  },
});

export const insertStallFlag = internalMutation({
  args: {
    projectId: v.id("projects"),
    studentId: v.id("students"),
    stage: vStage,
    minutes: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stallFlags", { ...args, resolved: false });
  },
});

export const insertDefection = internalMutation({
  args: {
    projectId: v.id("projects"),
    studentId: v.id("students"),
    stage: vStage,
    request: v.string(),
    honored: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("defections", args);
  },
});

/** Everything the student has authored so far, for the export summary. */
export const getProjectSummary = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return null;
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    const m0 = await ctx.db
      .query("milestoneZeros")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .first();
    const rewrite = await ctx.db
      .query("scopeRewrites")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .first();
    return {
      title: project.title ?? null,
      stage: project.stage,
      sparkText: project.sparkText ?? null,
      goal: project.goal ?? null,
      nonGoals: project.nonGoals ?? null,
      knownRisk: project.knownRisk ?? null,
      pitch: project.pitch ?? null,
      milestones: milestones
        .sort((a, b) => a.order - b.order)
        .map((m) => m.text),
      milestoneZero: m0 ? { text: m0.text, dueAt: m0.dueAt, status: m0.status } : null,
      scopeRewrite: rewrite ? { before: rewrite.before, after: rewrite.after } : null,
    };
  },
});
