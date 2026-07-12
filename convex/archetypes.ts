import { v } from "convex/values";
import { query, internalQuery, internalMutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { vArchetypePublic, vDifficulty } from "./shared";
import type { Infer } from "convex/values";

/**
 * THE CENTRAL CONSTRAINT LIVES HERE.
 *
 * goal, nonGoals, milestones, and m0 are WITHHELD BY DEFAULT. Enforcement is
 * at the query layer, not by convention: every function in this file that
 * returns archetypes to a student path goes through toPublic(), which PICKS
 * fields explicitly — it never spreads the document. There is exactly one
 * function that returns the withheld fields (getPlanForReveal), it is
 * internal-only, and every caller must log the reveal via logReveal.
 */

type ArchetypePublic = Infer<typeof vArchetypePublic>;

export function toPublic(doc: Doc<"archetypes">): ArchetypePublic {
  // Explicit field picks only. NEVER use {...doc} here — a spread is how the
  // withheld fields leak.
  return {
    archetypeId: doc._id,
    name: doc.name,
    glyph: doc.glyph,
    description: doc.description,
    timeEstimate: doc.timeEstimate,
    difficulty: doc.difficulty,
    skills: doc.skills,
    hazards: doc.hazards,
    remixPrompt: doc.remixPrompt,
    tags: doc.tags,
  };
}

/**
 * The Expand-stage menu and the coach's searchArchetypes tool.
 * MUST NOT return goal, nonGoals, milestones, m0 — and cannot: the return
 * validator rejects extra fields, and toPublic never includes them.
 */
export const search = query({
  args: {
    interests: v.optional(v.string()),
    difficulty: v.optional(vDifficulty),
    timeBudget: v.optional(v.string()), // free text: "a few sessions", "1 week"
    limit: v.optional(v.number()),
  },
  returns: v.array(vArchetypePublic),
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("archetypes")
      .withIndex("by_status", (q) => q.eq("status", "seed"))
      .collect();
    const active = await ctx.db
      .query("archetypes")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    let candidates = [...all, ...active];

    if (args.difficulty) {
      candidates = candidates.filter((a) => a.difficulty === args.difficulty);
    }
    if (args.interests) {
      const terms = args.interests
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((t) => t.length > 2);
      if (terms.length > 0) {
        const scored = candidates.map((a) => {
          const hay = (
            a.name +
            " " +
            a.description +
            " " +
            a.remixPrompt +
            " " +
            a.skills.join(" ") +
            " " +
            a.tags.join(" ")
          ).toLowerCase();
          const score = terms.reduce(
            (s, t) => s + (hay.includes(t) ? 1 : 0),
            0,
          );
          return { a, score };
        });
        const anyHit = scored.some((s) => s.score > 0);
        if (anyHit) {
          scored.sort((x, y) => y.score - x.score);
          candidates = scored.filter((s) => s.score > 0).map((s) => s.a);
        }
        // If nothing matches the interest terms, fall through with the full
        // menu — Expand exists to show the menu is bigger than they think.
      }
    }
    return candidates.slice(0, args.limit ?? 8).map(toPublic);
  },
});

/** Single archetype, public projection — for the Expand detail card. */
export const get = query({
  args: { archetypeId: v.id("archetypes") },
  returns: v.union(vArchetypePublic, v.null()),
  handler: async (ctx, { archetypeId }) => {
    const doc = await ctx.db.get(archetypeId);
    return doc ? toPublic(doc) : null;
  },
});

/**
 * THE ONLY PATH TO THE WITHHELD FIELDS. Internal: not callable from the
 * client. Callers (the reveal mutation, the coach's rung-3 rescue) must log
 * via logReveal in the same transaction or immediately after.
 */
export const getPlanForReveal = internalQuery({
  args: { archetypeId: v.id("archetypes") },
  returns: v.union(
    v.object({
      name: v.string(),
      goal: v.optional(v.string()),
      nonGoals: v.optional(v.array(v.string())),
      milestones: v.optional(v.array(v.string())),
      m0: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, { archetypeId }) => {
    const doc = await ctx.db.get(archetypeId);
    if (!doc) return null;
    return {
      name: doc.name,
      goal: doc.goal,
      nonGoals: doc.nonGoals,
      milestones: doc.milestones,
      m0: doc.m0,
    };
  },
});

/** Every reveal is logged. No exceptions. */
export const logReveal = internalMutation({
  args: {
    archetypeId: v.id("archetypes"),
    projectId: v.optional(v.id("projects")),
    studentId: v.optional(v.id("students")),
    reason: v.union(
      v.literal("export"),
      v.literal("rung3"),
      v.literal("teacher"),
    ),
    partial: v.boolean(),
  },
  returns: v.id("planReveals"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("planReveals", args);
  },
});

/**
 * The earned reveal, at Export. Sets planRevealed on the project, logs, and
 * returns the archetype's own plan for side-by-side comparison. Refuses to
 * run before the project reaches Export — the reveal must be earned.
 */
export const revealAtExport = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (project.stage !== "export") {
      throw new Error(
        `Reveal refused: project is at ${project.stage}, not export`,
      );
    }
    if (!project.archetypeId) return null;
    const doc = await ctx.db.get(project.archetypeId);
    if (!doc) return null;
    await ctx.db.patch(projectId, { planRevealed: true, updatedAt: Date.now() });
    await ctx.db.insert("planReveals", {
      archetypeId: project.archetypeId,
      projectId,
      studentId: project.studentId,
      reason: "export",
      partial: false,
    });
    return {
      name: doc.name,
      goal: doc.goal,
      nonGoals: doc.nonGoals,
      milestones: doc.milestones,
      m0: doc.m0,
    };
  },
});

/**
 * Client-facing read of an already-earned reveal. Returns the plan ONLY if
 * this project's reveal has happened (planRevealed set by revealAtExport).
 * Before that: null, always.
 */
export const revealedPlan = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project || !project.planRevealed || !project.archetypeId) return null;
    const doc = await ctx.db.get(project.archetypeId);
    if (!doc) return null;
    return {
      name: doc.name,
      goal: doc.goal,
      nonGoals: doc.nonGoals,
      milestones: doc.milestones,
      m0: doc.m0,
    };
  },
});
