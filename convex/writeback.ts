import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * THE WRITE-BACK LOOP — why the app exists.
 *
 * An archetype is a GENRE, not a project. Most completions are INSTANCES of
 * existing archetypes; the default write-back is a CONTRIBUTION to the
 * archetype the student worked in, not a new row. A genuinely new shape (a
 * project that fit no archetype) drafts a newArchetype proposal — the rare
 * path.
 *
 * EVERYTHING lands in the teacher review queue as status "pending". Nothing
 * enters the library unapproved: an unapproved write-back means one student's
 * mediocre project becomes canon for the next thirty.
 *
 * This module reads projects, scopeRewrites, and milestoneZeros. It NEVER
 * reads profileEvidence — the queue sees the project, not the student's
 * reflections.
 */
export const draftContributions = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project || project.status !== "completed") return;
    const student = await ctx.db.get(project.studentId);
    if (!student) return;
    const teacherId = student.teacherId;

    // Don't double-draft if completeProject somehow runs twice.
    const already = await ctx.db
      .query("reviewQueue")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    if (already.some((r) => r.projectId === projectId)) return;

    const base = {
      projectId,
      studentId: project.studentId,
      teacherId,
      status: "pending" as const,
    };

    if (project.archetypeId) {
      const archetype = await ctx.db.get(project.archetypeId);
      const archetypeName = archetype?.name ?? "this shape";

      // 1. A real remix prompt, drafted from the student's own goal.
      if (project.goal) {
        await ctx.db.insert("reviewQueue", {
          ...base,
          type: "contribution",
          archetypeId: project.archetypeId,
          contributionKind: "remixPrompt",
          payload: {
            remixPrompt: `Like a ${archetypeName.toLowerCase()} but ${project.goal}`,
            source: "drafted from the student's goal; edit before approving",
          },
        });
      }

      // 2. The real narrowing session — before/after. Gold for future Narrows.
      const rewrite = await ctx.db
        .query("scopeRewrites")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .order("desc")
        .first();
      if (rewrite) {
        await ctx.db.insert("reviewQueue", {
          ...base,
          type: "contribution",
          archetypeId: project.archetypeId,
          contributionKind: "scopeRewrite",
          payload: { before: rewrite.before, after: rewrite.after },
        });
      }

      // 3. Hazard observed — the risk the student named at Checkpoint.
      if (project.knownRisk) {
        await ctx.db.insert("reviewQueue", {
          ...base,
          type: "contribution",
          archetypeId: project.archetypeId,
          contributionKind: "hazardObserved",
          payload: { hazardObserved: project.knownRisk },
        });
      }

      // 4. Actual time vs the seeded estimate. The seed's numbers are guesses;
      // this is the data that corrects them.
      const daysElapsed = Math.max(
        1,
        Math.round((Date.now() - project._creationTime) / (24 * 60 * 60 * 1000)),
      );
      await ctx.db.insert("reviewQueue", {
        ...base,
        type: "contribution",
        archetypeId: project.archetypeId,
        contributionKind: "actualTime",
        payload: {
          daysElapsed,
          estimateWas: archetype?.timeEstimate ?? "unknown",
        },
      });
    } else if (project.goal) {
      // THE RARE PATH: this project fit no archetype. Propose a new one,
      // built from the student's own plan — the teacher decides if it's
      // genuinely a new shape or a variation that belongs elsewhere.
      const milestones = await ctx.db
        .query("milestones")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .collect();
      const m0 = await ctx.db
        .query("milestoneZeros")
        .withIndex("by_project", (q) => q.eq("projectId", projectId))
        .order("desc")
        .first();
      await ctx.db.insert("reviewQueue", {
        ...base,
        type: "newArchetype",
        payload: {
          name: project.title ?? "Untitled shape",
          description: project.goal,
          goal: project.goal,
          nonGoals: project.nonGoals ?? [],
          milestones: milestones
            .sort((a, b) => a.order - b.order)
            .map((m) => m.text),
          m0: m0?.text ?? null,
          note: "Project fit no existing archetype. Approve only if this is genuinely a new SHAPE, not a variation of an existing one.",
        },
      });
    }
  },
});
