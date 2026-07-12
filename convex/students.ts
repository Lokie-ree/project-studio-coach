import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Club roster identity. This is a voluntary club of a dozen-ish students with
 * one teacher — the "auth" is picking your name, like writing it on the
 * sign-in sheet. Honest limitation, documented in the README: there is no
 * real authentication in this prototype.
 */

export const join = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) throw new Error("Name required");
    const existing = await ctx.db
      .query("students")
      .filter((q) => q.eq(q.field("name"), trimmed))
      .first();
    if (existing) return existing._id;
    const teacher = await ctx.db.query("teachers").first();
    if (!teacher) throw new Error("No teacher seeded — run seed first");
    return await ctx.db.insert("students", {
      name: trimmed,
      teacherId: teacher._id,
      onboarded: false,
    });
  },
});

export const get = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, { studentId }) => {
    const student = await ctx.db.get(studentId);
    if (!student) return null;
    const teacher = await ctx.db.get(student.teacherId);
    return { ...student, teacherName: teacher?.name ?? "your teacher" };
  },
});

export const completeOnboarding = mutation({
  args: {
    studentId: v.id("students"),
    worksBetweenMeetings: v.optional(v.boolean()),
  },
  handler: async (ctx, { studentId, worksBetweenMeetings }) => {
    await ctx.db.patch(studentId, { onboarded: true, worksBetweenMeetings });
  },
});
