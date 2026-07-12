import { v } from "convex/values";
import { saveMessage } from "@convex-dev/agent";
import { mutation, query, internalMutation } from "./_generated/server";
import { components, internal } from "./_generated/api";
import { nextStage, PROFILE_VERSION, type Stage } from "./shared";
import { workflow } from "./workflows";
import type { WorkflowId } from "@convex-dev/workflow";

/**
 * Projects and the stage machine. The stage pointer lives in the DB (reactive
 * resume: close the tab at Narrow, reopen at Narrow), mirrored by the durable
 * coaching workflow whose steps gate on stage-complete events.
 *
 * Evidence capture happens HERE, from structured student-typed inputs — the
 * student's own words by construction, never the model's restatement.
 */

export const create = mutation({
  args: { studentId: v.id("students") },
  handler: async (ctx, { studentId }) => {
    const student = await ctx.db.get(studentId);
    if (!student) throw new Error("Student not found");
    const projectId = await ctx.db.insert("projects", {
      studentId,
      stage: "spark",
      status: "active",
      planRevealed: false,
      updatedAt: Date.now(),
    });
    await ctx.runMutation(internal.coach.createCoachThread, {
      projectId,
      studentId,
    });
    const workflowId = await workflow.start(
      ctx,
      internal.workflows.coachingLoop,
      { projectId },
      { startAsync: true },
    );
    await ctx.db.patch(projectId, { coachWorkflowId: workflowId });
    return projectId;
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return null;
    const m0 = await ctx.db
      .query("milestoneZeros")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .order("desc")
      .first();
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    return {
      ...project,
      milestoneZero: m0,
      milestoneList: milestones.sort((a, b) => a.order - b.order),
    };
  },
});

export const listByStudent = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, { studentId }) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .order("desc")
      .collect();
  },
});

/** Spark: the student's raw first idea. Evidence: learner 1.1, pre-coaching. */
export const setSpark = mutation({
  args: { projectId: v.id("projects"), text: v.string() },
  handler: async (ctx, { projectId, text }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (text.trim().length === 0) throw new Error("Say it messy, but say something");
    await ctx.db.patch(projectId, {
      sparkText: text,
      title: text.length > 60 ? text.slice(0, 57) + "..." : text,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("profileEvidence", {
      studentId: project.studentId,
      projectId,
      stage: "spark",
      roleId: "learner",
      skillCode: "1.1",
      profileVersion: PROFILE_VERSION,
      studentWords: text,
      createdAt: Date.now(),
      sharedWithTeacher: false,
    });
    // The spark is also the first message to the coach.
    await ctx.runMutation(internal.projects.sendSparkToCoach, {
      projectId,
      text,
    });
  },
});

export const sendSparkToCoach = internalMutation({
  args: { projectId: v.id("projects"), text: v.string() },
  handler: async (ctx, { projectId, text }) => {
    const project = await ctx.db.get(projectId);
    if (!project?.threadId) return;
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: project.threadId,
      prompt: text,
    });
    await ctx.scheduler.runAfter(0, internal.coach.streamResponse, {
      threadId: project.threadId,
      promptMessageId: messageId,
    });
  },
});

/**
 * Expand: the shape they picked (or didn't — keeping their own is allowed),
 * plus what they considered and rejected, with reasons.
 * Evidence: problem_solver 9.1.
 */
export const chooseArchetype = mutation({
  args: {
    projectId: v.id("projects"),
    archetypeId: v.optional(v.id("archetypes")),
    consideredAndRejected: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    await ctx.db.patch(args.projectId, {
      archetypeId: args.archetypeId,
      updatedAt: Date.now(),
    });
    if (
      args.consideredAndRejected &&
      args.consideredAndRejected.trim().length > 0
    ) {
      await ctx.db.insert("profileEvidence", {
        studentId: project.studentId,
        projectId: args.projectId,
        stage: "expand",
        roleId: "problem_solver",
        skillCode: "9.1",
        profileVersion: PROFILE_VERSION,
        studentWords: args.consideredAndRejected,
        createdAt: Date.now(),
        sharedWithTeacher: false,
      });
    }
  },
});

/**
 * Narrow: the before → after, in the student's words.
 * Evidence: problem_solver 8.1 AND learner 1.1 (the thesis skill).
 */
export const saveScopeRewrite = mutation({
  args: {
    projectId: v.id("projects"),
    before: v.string(),
    after: v.string(),
  },
  handler: async (ctx, { projectId, before, after }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    await ctx.db.insert("scopeRewrites", {
      projectId,
      studentId: project.studentId,
      before,
      after,
    });
    const words = `Before: ${before}\nAfter: ${after}`;
    for (const [roleId, skillCode] of [
      ["problem_solver", "8.1"],
      ["learner", "1.1"],
    ] as const) {
      await ctx.db.insert("profileEvidence", {
        studentId: project.studentId,
        projectId,
        stage: "narrow",
        roleId,
        skillCode,
        profileVersion: PROFILE_VERSION,
        studentWords: words,
        createdAt: Date.now(),
        sharedWithTeacher: false,
      });
    }
    await ctx.db.patch(projectId, { updatedAt: Date.now() });
  },
});

/** Shape: goal, non-goals, milestones — all student-authored. */
export const saveShape = mutation({
  args: {
    projectId: v.id("projects"),
    goal: v.string(),
    nonGoals: v.array(v.string()),
    milestones: v.array(v.string()),
  },
  handler: async (ctx, { projectId, goal, nonGoals, milestones }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    await ctx.db.patch(projectId, {
      goal,
      nonGoals: nonGoals.filter((n) => n.trim().length > 0),
      updatedAt: Date.now(),
    });
    // Replace milestone list (idempotent editing).
    const existing = await ctx.db
      .query("milestones")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
    for (const m of existing) await ctx.db.delete(m._id);
    let order = 0;
    for (const text of milestones.filter((m) => m.trim().length > 0)) {
      await ctx.db.insert("milestones", {
        projectId,
        order: order++,
        text,
        done: false,
      });
    }
  },
});

/** Checkpoint: the known risk and where they're stuck. Evidence: learner 2.1/2.2. */
export const saveCheckpoint = mutation({
  args: {
    projectId: v.id("projects"),
    knownRisk: v.string(),
    stuckOn: v.optional(v.string()),
  },
  handler: async (ctx, { projectId, knownRisk, stuckOn }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    await ctx.db.patch(projectId, { knownRisk, updatedAt: Date.now() });
    await ctx.db.insert("profileEvidence", {
      studentId: project.studentId,
      projectId,
      stage: "checkpoint",
      roleId: "learner",
      skillCode: "2.1",
      profileVersion: PROFILE_VERSION,
      studentWords: knownRisk,
      createdAt: Date.now(),
      sharedWithTeacher: false,
    });
    if (stuckOn && stuckOn.trim().length > 0) {
      await ctx.db.insert("profileEvidence", {
        studentId: project.studentId,
        projectId,
        stage: "checkpoint",
        roleId: "learner",
        skillCode: "2.2",
        profileVersion: PROFILE_VERSION,
        studentWords: stuckOn,
        createdAt: Date.now(),
        sharedWithTeacher: false,
      });
    }
  },
});

/** Export: the ninety-second pitch. Evidence: storyteller 12.1. */
export const savePitch = mutation({
  args: { projectId: v.id("projects"), pitch: v.string() },
  handler: async (ctx, { projectId, pitch }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    await ctx.db.patch(projectId, { pitch, updatedAt: Date.now() });
    await ctx.db.insert("profileEvidence", {
      studentId: project.studentId,
      projectId,
      stage: "export",
      roleId: "storyteller",
      skillCode: "12.1",
      profileVersion: PROFILE_VERSION,
      studentWords: pitch,
      createdAt: Date.now(),
      sharedWithTeacher: false,
    });
  },
});

/** The reveal comparison, in their words. Evidence: synthesizer 7.1. */
export const saveRevealComparison = mutation({
  args: { projectId: v.id("projects"), comparison: v.string() },
  handler: async (ctx, { projectId, comparison }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (!project.planRevealed) {
      throw new Error("The reveal hasn't happened yet");
    }
    await ctx.db.insert("profileEvidence", {
      studentId: project.studentId,
      projectId,
      stage: "export",
      roleId: "synthesizer",
      skillCode: "7.1",
      profileVersion: PROFILE_VERSION,
      studentWords: comparison,
      createdAt: Date.now(),
      sharedWithTeacher: false,
    });
  },
});

/** The earned reveal, student-triggered from the Export screen. */
type RevealedPlan = {
  name: string;
  goal?: string;
  nonGoals?: string[];
  milestones?: string[];
  m0?: string;
} | null;

export const revealPlan = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }): Promise<RevealedPlan> => {
    return await ctx.runMutation(internal.archetypes.revealAtExport, {
      projectId,
    });
  },
});

/**
 * Advance the stage: patch the reactive pointer AND signal the durable
 * workflow, which is parked on an awaitEvent for exactly this transition.
 */
export const advanceStage = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    const next = nextStage(project.stage as Stage);
    if (!next) throw new Error(`Cannot advance past ${project.stage}`);

    // Guardrails: don't let stages be skipped hollow.
    if (project.stage === "spark" && !project.sparkText) {
      throw new Error("Spark needs the idea first");
    }
    if (project.stage === "shape") {
      const m0 = await ctx.db
        .query("milestoneZeros")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .first();
      if (!m0) throw new Error("Shape isn't done until Milestone Zero is committed");
    }

    await ctx.db.patch(projectId, { stage: next, updatedAt: Date.now() });
    if (project.coachWorkflowId) {
      await workflow.sendEvent(ctx, {
        workflowId: project.coachWorkflowId as WorkflowId,
        name: `stageComplete:${project.stage}`,
        value: { advancedAt: Date.now() },
        validator: v.object({ advancedAt: v.number() }),
      });
    }
    return next;
  },
});

/** Mark complete (post-export) — kicks off the write-back draft. */
export const completeProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (project.stage !== "export") {
      throw new Error("Projects complete from Export");
    }
    await ctx.db.patch(projectId, {
      status: "completed",
      updatedAt: Date.now(),
    });
    if (project.coachWorkflowId) {
      await workflow.sendEvent(ctx, {
        workflowId: project.coachWorkflowId as WorkflowId,
        name: "stageComplete:export",
        value: { advancedAt: Date.now() },
        validator: v.object({ advancedAt: v.number() }),
      });
    }
    await ctx.scheduler.runAfter(0, internal.writeback.draftContributions, {
      projectId,
    });
  },
});

/** Student-owned evidence view. */
export const myEvidence = query({
  args: { studentId: v.id("students"), projectId: v.optional(v.id("projects")) },
  handler: async (ctx, { studentId, projectId }) => {
    let rows = await ctx.db
      .query("profileEvidence")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .collect();
    if (projectId) rows = rows.filter((r) => r.projectId === projectId);
    return rows.sort((a, b) => a.createdAt - b.createdAt);
  },
});
