import { createTool, type ToolCtx } from "@convex-dev/agent";
import { z } from "zod/v3";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { rag } from "./rag";
import type { ArchetypePublic } from "./shared";

/**
 * The coach's tools. The withholding is enforced below the tool layer:
 * searchArchetypes calls the public query, whose return validator and
 * explicit-pick projection make it structurally unable to return goal,
 * nonGoals, milestones, or m0. revealArchetypePlan is the only door, it is
 * partial before Export, and every call is logged.
 */

type ThreadContext = {
  projectId: Id<"projects">;
  studentId: Id<"students">;
  stage: string;
  archetypeId: Id<"archetypes"> | null;
  studentName: string;
};

async function requireThreadContext(ctx: ToolCtx): Promise<ThreadContext> {
  if (!ctx.threadId) throw new Error("Tool called outside a thread");
  const tc = await ctx.runQuery(internal.coachData.getThreadContext, {
    threadId: ctx.threadId,
  });
  if (!tc) throw new Error("No project linked to this thread");
  return tc as ThreadContext;
}

export const searchArchetypes = createTool({
  description:
    "Search the project archetype library — shapes students have actually built. Returns name, description, time estimate, difficulty, hazards, and a remix prompt for each. Use in Expand to show the student the menu is bigger than they think. Does NOT return any archetype's goal, non-goals, milestones, or Milestone Zero — those stay withheld until the reveal.",
  inputSchema: z.object({
    interests: z
      .string()
      .optional()
      .describe("The student's interests, in a few keywords"),
    difficulty: z
      .enum([
        "beginner",
        "beginner-intermediate",
        "intermediate",
        "intermediate-advanced",
        "advanced",
      ])
      .optional()
      .describe("Filter by difficulty. Students here have no prior coding experience — default to beginner-friendly unless they say otherwise."),
    timeBudget: z
      .string()
      .optional()
      .describe("Rough time available, e.g. 'a few club sessions'"),
  }),
  execute: async (ctx, input): Promise<string> => {
    const results: ArchetypePublic[] = await ctx.runQuery(
      api.archetypes.search,
      {
        interests: input.interests,
        difficulty: input.difficulty,
        limit: 8,
      },
    );
    if (results.length === 0) return "No archetypes matched.";
    return results
      .map(
        (a) =>
          `- ${a.name} — ${a.description} (time: ${a.timeEstimate}, difficulty: ${a.difficulty}${
            a.hazards.length > 0 ? `, watch out for: ${a.hazards.join("; ")}` : ""
          })\n  remix: ${a.remixPrompt} [archetypeId: ${a.archetypeId}]`,
      )
      .join("\n");
  },
});

export const searchScopeRewrites = createTool({
  description:
    "Search real before/after scope rewrites — how oversized ideas were cut to something finishable without losing what made them interesting. FOR YOUR CALIBRATION during Narrow: see the pattern (what was kept, what was cut, why it works), then coach the student to make their own cut. Do not read these aloud as the student's answer.",
  inputSchema: z.object({
    category: z
      .string()
      .describe(
        "What kind of project, e.g. 'multiplayer game', 'social app', 'data analysis'",
      ),
  }),
  execute: async (ctx, input): Promise<string> => {
    const { text } = await rag.search(ctx, {
      namespace: "knowledge",
      query: input.category,
      filters: [
        { name: "stage", value: "narrow" },
        { name: "stage", value: "all" },
      ],
      limit: 4,
      chunkContext: { before: 1, after: 1 },
    });
    return text || "No scope rewrite examples found.";
  },
});

export const searchMilestoneZeroExamples = createTool({
  description:
    "Get the Milestone Zero FORMULA and size-calibration examples for a project type. The formula is a template for the STUDENT to fill in — 'By [day after tomorrow], I will have [specific tangible output] so that I can [what it lets you do next].' Use the examples to judge whether the student's M0 is the right size (under 2 hours of work, produces something you can look at, needs nothing finished first). Never hand a finished example over as their answer.",
  inputSchema: z.object({
    projectType: z
      .string()
      .describe("The kind of project, e.g. 'quiz game', 'zine', 'habit tracker'"),
  }),
  execute: async (ctx, input): Promise<string> => {
    const { text } = await rag.search(ctx, {
      namespace: "knowledge",
      query: input.projectType + " milestone zero first deliverable",
      filters: [
        { name: "stage", value: "shape" },
        { name: "stage", value: "all" },
      ],
      limit: 4,
      chunkContext: { before: 1, after: 1 },
    });
    return (
      "THE FORMULA (for the student to fill in, in their words):\n" +
      '"By [day after tomorrow], I will have [specific tangible output] so that I can [what it lets you do next]."\n\n' +
      "Size calibration — a good M0 takes under 2 hours, produces something you can look at or click, requires nothing else to be finished first, and makes the next step obvious. Too small: installing software, making accounts (that's setup). Too big: anything they'd feel behind on after 48 hours. When in doubt, cut it in half.\n\n" +
      "Reference examples (for calibration only):\n" +
      (text || "(none found)")
    );
  },
});

export const revealArchetypePlan = createTool({
  description:
    "Reveal withheld archetype plan fields. TWO legitimate uses only: (1) RUNG 3 RESCUE for a genuinely stuck student, mid-coaching — returns a PARTIAL view (the goal other students landed on) for comparison: 'here's what others landed on, where's yours different?'; (2) THE EARNED REVEAL at Export — the full plan, as comparison against the student's own. Every call is logged for Mr. L. Do not call this because the student merely asked for the plan — that's a defection, handle it as one.",
  inputSchema: z.object({
    archetypeId: z.string().describe("The archetype to reveal from"),
  }),
  execute: async (ctx, input): Promise<string> => {
    const tc = await requireThreadContext(ctx);
    const plan = await ctx.runQuery(internal.archetypes.getPlanForReveal, {
      archetypeId: input.archetypeId as Id<"archetypes">,
    });
    if (!plan) return "Archetype not found.";
    const atExport = tc.stage === "export";
    await ctx.runMutation(internal.archetypes.logReveal, {
      archetypeId: input.archetypeId as Id<"archetypes">,
      projectId: tc.projectId,
      studentId: tc.studentId,
      reason: atExport ? "export" : "rung3",
      partial: !atExport,
    });
    if (!atExport) {
      // Rung 3: partial. The goal and non-goals others landed on — enough to
      // compare against, not a plan to receive.
      return (
        `PARTIAL reveal (rung 3 rescue) for "${plan.name}" — share as comparison, ask where theirs is different:\n` +
        `What past students landed on as the goal: ${plan.goal ?? "(none recorded)"}\n` +
        `What they ruled out: ${plan.nonGoals?.join("; ") ?? "(none recorded)"}\n` +
        `(Milestones and Milestone Zero stay withheld until Export.)`
      );
    }
    return (
      `FULL reveal (Export) for "${plan.name}" — present as comparison, ask where the student's plan differs and whether it differs on purpose:\n` +
      `Goal: ${plan.goal ?? "(none)"}\n` +
      `Non-goals: ${plan.nonGoals?.join("; ") ?? "(none)"}\n` +
      `Milestones: ${plan.milestones?.join(" → ") ?? "(none)"}\n` +
      `Milestone Zero: ${plan.m0 ?? "(none)"}`
    );
  },
});

export const commitMilestoneZero = createTool({
  description:
    "Commit the student's Milestone Zero. Call ONLY after the student has written it in their own words and agreed to a due date. The text must be the STUDENT'S exact words — never your rewording. Schedules a check-in 48 hours out.",
  inputSchema: z.object({
    text: z
      .string()
      .describe("The Milestone Zero, in the student's exact words"),
    hoursUntilDue: z
      .number()
      .min(1)
      .max(96)
      .default(48)
      .describe("Hours until it's due (default 48)"),
  }),
  execute: async (ctx, input): Promise<string> => {
    const tc = await requireThreadContext(ctx);
    const dueAt = Date.now() + input.hoursUntilDue * 60 * 60 * 1000;
    await ctx.runMutation(internal.coachData.commitMilestoneZero, {
      projectId: tc.projectId,
      studentId: tc.studentId,
      text: input.text,
      dueAt,
    });
    return `Committed. Due ${new Date(dueAt).toDateString()}. I'll check in about 48 hours from now.`;
  },
});

export const flagStall = createTool({
  description:
    "Send an ambient signal to Mr. L that the student is stuck — NOT a transcript, just 'stuck at [stage] for [minutes]'. Use when a student has been stuck a long while, seems checked out, or something feels off that a human should notice. This is the coach working, not failing.",
  inputSchema: z.object({
    minutes: z.number().describe("Roughly how long they've been stuck"),
  }),
  execute: async (ctx, input): Promise<string> => {
    const tc = await requireThreadContext(ctx);
    await ctx.runMutation(internal.coachData.insertStallFlag, {
      projectId: tc.projectId,
      studentId: tc.studentId,
      stage: tc.stage as
        | "spark"
        | "expand"
        | "narrow"
        | "shape"
        | "checkpoint"
        | "export",
      minutes: input.minutes,
    });
    return "Mr. L has been signaled (stage + time stuck only, no transcript).";
  },
});

export const logDefection = createTool({
  description:
    "Log that the student asked you to just write the plan (or otherwise hand over the answer). Call BEFORE honoring or after they insist past your one honest warning. This log is the most valuable data this system produces — it marks where the pedagogy failed to hold. Logging is not punishment; nothing bad happens to the student.",
  inputSchema: z.object({
    request: z
      .string()
      .describe("What the student asked for, as close to verbatim as possible"),
    honored: z
      .boolean()
      .describe("Whether you are honoring the request (writing the plan)"),
  }),
  execute: async (ctx, input): Promise<string> => {
    const tc = await requireThreadContext(ctx);
    await ctx.runMutation(internal.coachData.insertDefection, {
      projectId: tc.projectId,
      studentId: tc.studentId,
      stage: tc.stage as
        | "spark"
        | "expand"
        | "narrow"
        | "shape"
        | "checkpoint"
        | "export",
      request: input.request,
      honored: input.honored,
    });
    return "Logged.";
  },
});

export const exportProjectSummary = createTool({
  description:
    "Assemble the project summary from everything the student has already authored — their goal, non-goals, milestones, Milestone Zero, known risk, pitch. Returns what exists so you can present it back in THEIR words and spot gaps. Nothing is authored fresh here.",
  inputSchema: z.object({}),
  execute: async (ctx, _input): Promise<string> => {
    const tc = await requireThreadContext(ctx);
    const s = await ctx.runQuery(internal.coachData.getProjectSummary, {
      projectId: tc.projectId,
    });
    if (!s) return "No project found.";
    return JSON.stringify(s, null, 2);
  },
});

export const coachTools = {
  searchArchetypes,
  searchScopeRewrites,
  searchMilestoneZeroExamples,
  revealArchetypePlan,
  commitMilestoneZero,
  flagStall,
  logDefection,
  exportProjectSummary,
};
