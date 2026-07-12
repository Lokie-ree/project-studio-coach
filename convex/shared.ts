import { v } from "convex/values";

/**
 * ISTE+ASCD Profile of an AI-Ready Graduate — role IDs.
 * Store IDs, never display strings: the framework is six months old and will
 * move again (problem_solver was "Ideator" in earlier materials). A rename
 * must never cost a migration.
 */
export const ROLE_IDS = [
  "learner",
  "researcher",
  "synthesizer",
  "problem_solver",
  "connector",
  "storyteller",
] as const;
export type RoleId = (typeof ROLE_IDS)[number];

export const vRoleId = v.union(
  v.literal("learner"),
  v.literal("researcher"),
  v.literal("synthesizer"),
  v.literal("problem_solver"),
  v.literal("connector"),
  v.literal("storyteller"),
);

/** The Profile version evidence rows are interpreted against. */
export const PROFILE_VERSION = "2026.07";

/** The six coaching stages, in order. */
export const STAGES = [
  "spark",
  "expand",
  "narrow",
  "shape",
  "checkpoint",
  "export",
] as const;
export type Stage = (typeof STAGES)[number];

export const vStage = v.union(
  v.literal("spark"),
  v.literal("expand"),
  v.literal("narrow"),
  v.literal("shape"),
  v.literal("checkpoint"),
  v.literal("export"),
);

export const nextStage = (stage: Stage): Stage | null => {
  const i = STAGES.indexOf(stage);
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : null;
};

export const vDifficulty = v.union(
  v.literal("beginner"),
  v.literal("beginner-intermediate"),
  v.literal("intermediate"),
  v.literal("intermediate-advanced"),
  v.literal("advanced"),
);

/**
 * The archetype fields that are WITHHELD BY DEFAULT during coaching.
 * They exist in the schema; searchArchetypes never returns them; only
 * revealArchetypePlan does, and every call is logged. See iste-alignment.md.
 */
export const WITHHELD_ARCHETYPE_FIELDS = [
  "goal",
  "nonGoals",
  "milestones",
  "m0",
] as const;

/** Public (coaching-safe) archetype projection. */
export const vArchetypePublic = v.object({
  archetypeId: v.id("archetypes"),
  name: v.string(),
  glyph: v.optional(v.string()),
  description: v.string(),
  timeEstimate: v.string(),
  difficulty: vDifficulty,
  skills: v.array(v.string()),
  hazards: v.array(v.string()),
  remixPrompt: v.string(),
  tags: v.array(v.string()),
});
