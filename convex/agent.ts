import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { stepCountIs } from "ai";
import { components, internal } from "./_generated/api";
import { coachTools } from "./tools";
import { BASE_INSTRUCTIONS } from "./instructions";
import { EMBEDDING_MODEL } from "./rag";

/**
 * The coaching agent. OpenAI via the Vercel AI SDK (@ai-sdk/openai) — this
 * repo NEVER calls the Anthropic API. All model calls happen server-side in
 * Convex actions; the key lives in Convex env, never the browser.
 *
 * Model IDs verified against live OpenAI docs July 2026:
 * gpt-5.6-terra (primary; tools + structured output, $2.50/$15 per 1M),
 * gpt-5.6-luna (cheap fallback, $1/$6). Override with OPENAI_CHAT_MODEL.
 */
declare const process: { env: Record<string, string | undefined> };
export const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL ?? "gpt-5.6-terra";

export const coachAgent = new Agent(components.agent, {
  name: "Project Studio Coach",
  // Responses API, not Chat Completions: gpt-5.6 models reject function
  // tools on /v1/chat/completions ("use /v1/responses") — seen live 2026-07-14.
  languageModel: openai.responses(CHAT_MODEL),
  // Enables semantic search over message history; same model family as RAG.
  embeddingModel: openai.embedding(EMBEDDING_MODEL),
  // Static fallback; every real call passes dynamic instructions built in
  // coach.ts (stage notes, student context, teacher notes).
  instructions: BASE_INSTRUCTIONS,
  // Tools stop after one step by default — let the coach search then speak.
  stopWhen: stepCountIs(5),
  tools: coachTools,
  contextOptions: {
    excludeToolMessages: true,
    recentMessages: 60,
    searchOptions: {
      limit: 8,
      vectorSearch: true,
      messageRange: { before: 2, after: 1 },
    },
  },
  usageHandler: async (ctx, { userId, threadId, model, usage }) => {
    await ctx.runMutation(internal.usage.record, {
      studentIdStr: userId ?? undefined,
      threadId: threadId ?? undefined,
      model,
      promptTokens: usage.inputTokens ?? 0,
      completionTokens: usage.outputTokens ?? 0,
      totalTokens: usage.totalTokens ?? 0,
    });
  },
  callSettings: { maxRetries: 2 },
});
