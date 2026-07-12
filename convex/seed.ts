import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { parseArchetypes } from "./lib/parseArchetypes";
import { rag, chunkByHeaders } from "./rag";
import { vDifficulty } from "./shared";
import projectArchetypes from "./knowledge/projectArchetypes";
import coachingTranscripts from "./knowledge/coachingTranscripts";
import scopeExamples from "./knowledge/scopeExamples";
import milestoneZeroExamples from "./knowledge/milestoneZeroExamples";

/**
 * Seed: parses project-archetypes.md (synced verbatim into knowledge/) and
 * upserts all 24 archetypes with every field populated. Plan fields are
 * withheld from STUDENTS at runtime — not from this script. Fields absent
 * from the markdown (glyph) stay null; nothing is invented.
 *
 * Run with: npx convex run seed:run
 * Idempotent: archetypes upsert by name; RAG entries replace by key.
 */

export const ensureTeacher = internalMutation({
  args: { name: v.string() },
  returns: v.id("teachers"),
  handler: async (ctx, { name }) => {
    const existing = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("name"), name))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("teachers", { name });
  },
});

const vSeedArchetype = v.object({
  name: v.string(),
  description: v.string(),
  timeEstimate: v.string(),
  difficulty: vDifficulty,
  skills: v.array(v.string()),
  hazards: v.array(v.string()),
  remixPrompt: v.union(v.string(), v.null()),
  goal: v.union(v.string(), v.null()),
  nonGoals: v.union(v.array(v.string()), v.null()),
  milestones: v.union(v.array(v.string()), v.null()),
  m0: v.union(v.string(), v.null()),
});

export const upsertArchetype = internalMutation({
  args: { archetype: vSeedArchetype },
  returns: v.union(v.literal("inserted"), v.literal("updated")),
  handler: async (ctx, { archetype: a }) => {
    const doc = {
      name: a.name,
      description: a.description,
      timeEstimate: a.timeEstimate,
      difficulty: a.difficulty,
      skills: a.skills,
      hazards: a.hazards,
      remixPrompt: a.remixPrompt ?? "",
      tags: [],
      status: "seed" as const,
      goal: a.goal ?? undefined,
      nonGoals: a.nonGoals ?? undefined,
      milestones: a.milestones ?? undefined,
      m0: a.m0 ?? undefined,
    };
    const existing = await ctx.db
      .query("archetypes")
      .withIndex("by_name", (q) => q.eq("name", a.name))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, doc);
      return "updated";
    }
    await ctx.db.insert("archetypes", doc);
    return "inserted";
  },
});

const KNOWLEDGE_FILES = [
  {
    key: "scope-examples.md",
    content: scopeExamples,
    stage: "narrow", // the destination: what a well-scoped project looks like
    docType: "scope-example",
  },
  {
    key: "milestone-zero-examples.md",
    content: milestoneZeroExamples,
    stage: "shape", // the formula, for the student to fill in
    docType: "milestone-zero",
  },
  {
    key: "coaching-transcripts.md",
    content: coachingTranscripts,
    stage: "all", // the VOICE — retrievable at every stage, especially the ladder
    docType: "coaching-transcript",
  },
] as const;

type SeedResult = {
  teacherId: Id<"teachers">;
  archetypes: { parsed: number; inserted: number; updated: number };
  ingested: Record<string, string>;
};

export const run = internalAction({
  args: {},
  handler: async (ctx): Promise<SeedResult> => {
    // 1. The teacher. student-context.md names him: the coach uses the real name.
    const teacherId: Id<"teachers"> = await ctx.runMutation(
      internal.seed.ensureTeacher,
      { name: "Mr. L" },
    );

    // 2. Parse and upsert all 24 archetypes from the markdown, verbatim.
    const parsed = parseArchetypes(projectArchetypes);
    if (parsed.length !== 24) {
      throw new Error(
        `Expected 24 archetypes in project-archetypes.md, parsed ${parsed.length}`,
      );
    }
    let inserted = 0;
    let updated = 0;
    for (const a of parsed) {
      const result = await ctx.runMutation(internal.seed.upsertArchetype, {
        archetype: {
          name: a.name,
          description: a.description,
          timeEstimate: a.timeEstimate,
          difficulty: a.difficulty,
          skills: a.skills,
          hazards: a.hazards,
          remixPrompt: a.remixPrompt,
          goal: a.goal,
          nonGoals: a.nonGoals,
          milestones: a.milestones,
          m0: a.m0,
        },
      });
      if (result === "inserted") inserted++;
      else updated++;
    }

    // 3. Ingest the knowledge markdown into RAG with per-stage filters.
    // Requires a valid OPENAI_API_KEY on the deployment (embeddings happen
    // here). If it fails, archetypes are still seeded; re-run just this step
    // with: npx convex run seed:ingestKnowledge
    let ingested: Record<string, string>;
    try {
      ingested = await ctx.runAction(internal.seed.ingestKnowledge, {});
    } catch (e) {
      ingested = {
        FAILED: e instanceof Error ? e.message : String(e),
        recover: "fix OPENAI_API_KEY, then: npx convex run seed:ingestKnowledge",
      };
    }

    return {
      teacherId,
      archetypes: { parsed: parsed.length, inserted, updated },
      ingested,
    };
  },
});

/** RAG ingestion alone — idempotent (keys replace). */
export const ingestKnowledge = internalAction({
  args: {},
  handler: async (ctx) => {
    const ingested: Record<string, string> = {};
    for (const f of KNOWLEDGE_FILES) {
      const { status, created } = await rag.add(ctx, {
        namespace: "knowledge",
        key: f.key,
        title: f.key,
        chunks: chunkByHeaders(f.content),
        filterValues: [
          { name: "stage", value: f.stage },
          { name: "docType", value: f.docType },
        ],
      });
      ingested[f.key] = created ? status : "unchanged";
    }
    return ingested;
  },
});
