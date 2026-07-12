import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

/**
 * The teacher surface — one screen: review queue, stall flags, notes.
 *
 * These queries see PROJECTS and signals. None of them touch profileEvidence:
 * the student's reflections are student-owned, full stop. (The one exception
 * anywhere would be evidence the student explicitly shared — not built here.)
 */

export const getTeacher = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teachers").first();
  },
});

export const roster = query({
  args: {},
  handler: async (ctx) => {
    const students = await ctx.db.query("students").collect();
    const result = [];
    for (const s of students) {
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_student", (q) => q.eq("studentId", s._id))
        .collect();
      const note = await ctx.db
        .query("teacherNotes")
        .withIndex("by_student", (q) => q.eq("studentId", s._id))
        .first();
      result.push({
        student: s,
        note: note?.text ?? "",
        projects: projects.map((p) => ({
          projectId: p._id,
          title: p.title ?? "(no idea yet)",
          stage: p.stage,
          status: p.status,
          goal: p.goal ?? null,
          updatedAt: p.updatedAt,
        })),
      });
    }
    return result;
  },
});

export const openStallFlags = query({
  args: {},
  handler: async (ctx) => {
    const flags = await ctx.db
      .query("stallFlags")
      .withIndex("by_resolved", (q) => q.eq("resolved", false))
      .collect();
    const out = [];
    for (const f of flags) {
      const student = await ctx.db.get(f.studentId);
      out.push({
        ...f,
        studentName: student?.name ?? "?",
      });
    }
    return out;
  },
});

export const resolveStallFlag = mutation({
  args: { stallFlagId: v.id("stallFlags") },
  handler: async (ctx, { stallFlagId }) => {
    await ctx.db.patch(stallFlagId, { resolved: true });
  },
});

export const saveNote = mutation({
  args: {
    teacherId: v.id("teachers"),
    studentId: v.id("students"),
    text: v.string(),
  },
  handler: async (ctx, { teacherId, studentId, text }) => {
    const existing = await ctx.db
      .query("teacherNotes")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { text, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("teacherNotes", {
        teacherId,
        studentId,
        text,
        updatedAt: Date.now(),
      });
    }
  },
});

export const pendingReviews = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("reviewQueue")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const out = [];
    for (const item of items) {
      const student = await ctx.db.get(item.studentId);
      const project = await ctx.db.get(item.projectId);
      const archetype = item.archetypeId
        ? await ctx.db.get(item.archetypeId)
        : null;
      out.push({
        ...item,
        studentName: student?.name ?? "?",
        projectTitle: project?.title ?? "?",
        archetypeName: archetype?.name ?? null,
      });
    }
    return out;
  },
});

/**
 * The gate. Approve → the contribution enters the living library (or the new
 * archetype is born, status "active"). Reject → it goes nowhere. Difficulty
 * and timeEstimate are mutable — approving an actualTime contribution invites
 * the teacher to correct the estimate right here.
 */
export const review = mutation({
  args: {
    reviewId: v.id("reviewQueue"),
    verdict: v.union(v.literal("approved"), v.literal("rejected")),
    teacherComment: v.optional(v.string()),
    // Optional inline corrections when approving actualTime:
    newTimeEstimate: v.optional(v.string()),
    // Optional edit of the payload before it becomes canon (e.g. tightening
    // a drafted remix prompt):
    editedPayload: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.reviewId);
    if (!item) throw new Error("Review item not found");
    if (item.status !== "pending") throw new Error("Already reviewed");

    await ctx.db.patch(args.reviewId, {
      status: args.verdict,
      reviewedAt: Date.now(),
      teacherComment: args.teacherComment,
    });
    if (args.verdict === "rejected") return;

    const payload = (args.editedPayload ?? item.payload) as Record<
      string,
      unknown
    >;

    if (item.type === "contribution" && item.archetypeId) {
      const kind = item.contributionKind!;
      await ctx.db.insert("archetypeContributions", {
        archetypeId: item.archetypeId,
        projectId: item.projectId,
        studentId: item.studentId,
        kind,
        remixPrompt:
          kind === "remixPrompt" ? String(payload.remixPrompt ?? "") : undefined,
        hazardObserved:
          kind === "hazardObserved"
            ? String(payload.hazardObserved ?? "")
            : undefined,
        actualTime:
          kind === "actualTime"
            ? {
                daysElapsed: Number(payload.daysElapsed ?? 0),
                estimateWas: String(payload.estimateWas ?? ""),
              }
            : undefined,
        scopeRewrite:
          kind === "scopeRewrite"
            ? {
                before: String(payload.before ?? ""),
                after: String(payload.after ?? ""),
              }
            : undefined,
        approvedBy: item.teacherId,
        approvedAt: Date.now(),
      });
      // timeEstimate is MUTABLE — real data corrects the seeded guess.
      if (args.newTimeEstimate) {
        await ctx.db.patch(item.archetypeId, {
          timeEstimate: args.newTimeEstimate,
        });
      }
    } else if (item.type === "newArchetype") {
      await ctx.db.insert("archetypes", {
        name: String(payload.name ?? "Untitled shape"),
        description: String(payload.description ?? ""),
        timeEstimate: String(payload.timeEstimate ?? "unknown"),
        difficulty: "beginner",
        skills: [],
        hazards: [],
        remixPrompt: String(payload.remixPrompt ?? ""),
        tags: [],
        status: "active",
        sourceProjectId: item.projectId,
        contributedBy: item.studentId,
        goal: payload.goal ? String(payload.goal) : undefined,
        nonGoals: Array.isArray(payload.nonGoals)
          ? (payload.nonGoals as string[])
          : undefined,
        milestones: Array.isArray(payload.milestones)
          ? (payload.milestones as string[])
          : undefined,
        m0: payload.m0 ? String(payload.m0) : undefined,
      });
    }
  },
});

/** Approved contributions shown alongside an archetype (teacher + reveal views). */
export const contributionsFor = query({
  args: { archetypeId: v.id("archetypes") },
  handler: async (ctx, { archetypeId }) => {
    return await ctx.db
      .query("archetypeContributions")
      .withIndex("by_archetype", (q) => q.eq("archetypeId", archetypeId))
      .collect();
  },
});

/** Defection log — teacher-visible: where the pedagogy failed to hold. */
export const defectionLog = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("defections").collect();
    const out = [];
    for (const d of rows) {
      const student = await ctx.db.get(d.studentId);
      out.push({ ...d, studentName: student?.name ?? "?" });
    }
    return out.sort((a, b) => b._creationTime - a._creationTime);
  },
});
