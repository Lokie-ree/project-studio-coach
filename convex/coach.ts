import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import {
  createThread,
  saveMessage,
  listUIMessages,
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import { components, internal } from "./_generated/api";
import {
  mutation,
  query,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { coachAgent } from "./agent";
import { buildInstructions } from "./instructions";
import { rateLimiter, estimateTokens } from "./rateLimits";

/**
 * The coached conversation. All model calls are server-side (internalAction);
 * the browser only ever calls mutations/queries. Every send is gated on the
 * pacing limit, the student token budget, and the class token budget — all
 * in one mutation so a rejection rolls the whole thing back.
 */

export const sendMessage = mutation({
  args: { projectId: v.id("projects"), prompt: v.string() },
  handler: async (ctx, { projectId, prompt }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (!project.threadId) throw new Error("Project has no thread");
    if (prompt.trim().length === 0) throw new Error("Empty message");
    if (prompt.length > 4000) throw new Error("Message too long");

    // Gate 1: pacing. Throws ConvexError { kind: "RateLimited", retryAfter }.
    await rateLimiter.limit(ctx, "studentRequests", {
      key: project.studentId,
      throws: true,
    });
    // Gates 2 + 3: token budgets — check estimates only; actuals are debited
    // post-hoc in usage.record. A student in debt from a previous reserve
    // debit gets rejected here.
    const estimated = estimateTokens(prompt);
    await rateLimiter.check(ctx, "studentTokens", {
      key: project.studentId,
      count: estimated,
      throws: true,
    });
    await rateLimiter.check(ctx, "classTokens", {
      key: "the-club",
      count: estimated,
      reserve: true,
      throws: true,
    });

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: project.threadId,
      prompt,
    });
    await ctx.db.patch(projectId, { updatedAt: Date.now() });
    await ctx.scheduler.runAfter(0, internal.coach.streamResponse, {
      threadId: project.threadId,
      promptMessageId: messageId,
    });
  },
});

/** Server-side LLM call with per-student dynamic instructions. */
export const streamResponse = internalAction({
  args: { threadId: v.string(), promptMessageId: v.string() },
  handler: async (ctx, { threadId, promptMessageId }) => {
    const dyn = await ctx.runQuery(internal.coach.getDynamicContext, {
      threadId,
    });
    if (!dyn) throw new Error("No project for thread");

    try {
      const result = await coachAgent.streamText(
        ctx,
        { threadId, userId: dyn.studentId },
        {
          promptMessageId,
          system: buildInstructions({
            stage: dyn.stage,
            studentName: dyn.studentName,
            teacherNotes: dyn.teacherNotes,
            worksBetweenMeetings: dyn.worksBetweenMeetings,
            projectTitle: dyn.projectTitle,
            sparkText: dyn.sparkText,
            archetypeName: dyn.archetypeName,
          }),
        },
        { saveStreamDeltas: { chunking: "word", throttleMs: 250 } },
      );
      await result.consumeStream();
    } catch (e) {
      // Never leave a student staring at "coach is thinking…". Be honest.
      console.error("Coach LLM call failed:", e);
      await saveMessage(ctx, components.agent, {
        threadId,
        message: {
          role: "assistant",
          content:
            "I hit a technical snag on my end just now — that one's on me, not you. " +
            "Give it another try in a minute, and if I keep doing this, tell Mr. L the coach is down.",
        },
      });
    }
  },
});

/**
 * Everything buildInstructions needs, in one internal query.
 * teacherNotes are read here, injected into the system prompt, and NEVER
 * surfaced anywhere client-visible. INTERNAL — a public version of this
 * query would hand teacher notes to any client with a threadId.
 */
export const getDynamicContext = internalQuery({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const link = await ctx.db
      .query("coachThreads")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .first();
    if (!link) return null;
    const project = await ctx.db.get(link.projectId);
    const student = await ctx.db.get(link.studentId);
    if (!project || !student) return null;
    const note = await ctx.db
      .query("teacherNotes")
      .withIndex("by_student", (q) => q.eq("studentId", link.studentId))
      .first();
    const archetype = project.archetypeId
      ? await ctx.db.get(project.archetypeId)
      : null;
    return {
      studentId: link.studentId,
      studentName: student.name,
      stage: project.stage,
      teacherNotes: note?.text ?? null,
      worksBetweenMeetings: student.worksBetweenMeetings ?? null,
      projectTitle: project.title ?? null,
      sparkText: project.sparkText ?? null,
      archetypeName: archetype?.name ?? null,
    };
  },
});

/** Reactive message list + live stream deltas. */
export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const paginated = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);
    return { ...paginated, streams };
  },
});

/** Creates the agent thread for a new project (called from projects.create). */
export const createCoachThread = internalMutation({
  args: { projectId: v.id("projects"), studentId: v.id("students") },
  returns: v.string(),
  handler: async (ctx, { projectId, studentId }) => {
    const threadId = await createThread(ctx, components.agent, {
      userId: studentId,
      title: "Project coaching",
    });
    await ctx.db.insert("coachThreads", { studentId, projectId, threadId });
    await ctx.db.patch(projectId, { threadId, updatedAt: Date.now() });
    return threadId;
  },
});
