import { v } from "convex/values";
import { WorkflowManager } from "@convex-dev/workflow";
import { components, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { STAGES, vStage } from "./shared";

/**
 * The six-stage coaching loop as a DURABLE WORKFLOW. Each stage is a step;
 * between stages the workflow parks on awaitEvent — consuming nothing,
 * surviving deploys and restarts — until the human finishes the stage
 * (projects.advanceStage sends the event). The reactive projects.stage field
 * mirrors it so a closed tab reopens exactly where the student left off.
 */
export const workflow = new WorkflowManager(components.workflow, {
  workpoolOptions: {
    maxParallelism: 10,
    defaultRetryBehavior: { maxAttempts: 3, initialBackoffMs: 200, base: 2 },
    retryActionsByDefault: true,
  },
});

export const coachingLoop = workflow.define({
  args: { projectId: v.id("projects") },
  handler: async (step, { projectId }): Promise<void> => {
    for (const stage of STAGES) {
      // Persist the stage pointer (idempotent with advanceStage's patch —
      // the workflow is the durable record, the field is the reactive mirror).
      await step.runMutation(internal.workflows.setStage, {
        projectId,
        stage,
      });
      // Park — for minutes or weeks — until the human completes the stage.
      await step.awaitEvent({
        name: `stageComplete:${stage}`,
        validator: v.object({ advancedAt: v.number() }),
      });
    }
    await step.runMutation(internal.workflows.markLoopDone, { projectId });
  },
});

export const setStage = internalMutation({
  args: { projectId: v.id("projects"), stage: vStage },
  handler: async (ctx, { projectId, stage }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return;
    // Only move forward: the reactive field may already be ahead (advanceStage
    // patches it synchronously; this step replays after).
    const order = STAGES.indexOf(project.stage as (typeof STAGES)[number]);
    const target = STAGES.indexOf(stage);
    if (target > order) {
      await ctx.db.patch(projectId, { stage, updatedAt: Date.now() });
    }
  },
});

export const markLoopDone = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (project && project.status === "active") {
      // The loop is traversed; completion (and write-back) is student-triggered
      // via projects.completeProject. Nothing to force here.
      await ctx.db.patch(projectId, { updatedAt: Date.now() });
    }
  },
});
