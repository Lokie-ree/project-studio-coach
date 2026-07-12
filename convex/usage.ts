import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { rateLimiter } from "./rateLimits";
import type { Id } from "./_generated/dataModel";

/**
 * Records actual token usage and debits both budgets. reserve: true means
 * the debit never fails — it drives the balance negative, and the NEXT
 * pre-flight check is what rejects until the bucket refills. This is the
 * documented post-hoc debit pattern.
 */
export const record = internalMutation({
  args: {
    studentIdStr: v.optional(v.string()),
    threadId: v.optional(v.string()),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
  },
  handler: async (ctx, args) => {
    const studentId = args.studentIdStr as Id<"students"> | undefined;
    await ctx.db.insert("tokenUsage", {
      studentId,
      threadId: args.threadId,
      model: args.model,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      totalTokens: args.totalTokens,
    });
    if (studentId) {
      await rateLimiter.limit(ctx, "studentTokens", {
        key: studentId,
        count: args.totalTokens,
        reserve: true,
      });
    }
    await rateLimiter.limit(ctx, "classTokens", {
      key: "the-club",
      count: args.totalTokens,
      reserve: true,
    });
  },
});
