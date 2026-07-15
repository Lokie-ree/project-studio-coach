import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

/**
 * Per-student budgets nested under a shared class budget. One student must
 * not be able to exhaust the class budget: their own studentTokens bucket
 * rejects them long before the class bucket drains, while classTokens
 * hard-caps aggregate spend.
 *
 * Pattern (from the Convex agents rate-limiting docs): CHECK estimates
 * before the LLM call, DEBIT actuals after with reserve: true — the debit
 * never fails, it drives the balance negative, and the next pre-flight
 * check is what rejects until the bucket refills.
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Pacing: one message every 5 seconds, small burst. A coach that can be
  // spammed is a coach that gets spammed.
  studentRequests: { kind: "fixed window", rate: 1, period: 5_000, capacity: 3 },

  // Per-student token budget. maxReserved caps how far one runaway response
  // can drive a student into debt.
  // PLAYTEST SETTING (2026-07-15): raised 8x so scripted persona runs can
  // talk continuously. Club values, restore after playtest:
  //   rate 25_000, capacity 75_000, maxReserved 30_000
  studentTokens: {
    kind: "token bucket",
    rate: 200_000,
    period: HOUR,
    capacity: 400_000,
    maxReserved: 100_000,
  },

  // Class-wide budget — the outer, nested cap. Sharded: every student in the
  // room contends on this one key.
  // PLAYTEST SETTING (2026-07-15): raised 4x. Club values, restore after:
  //   rate 250_000, capacity 500_000
  classTokens: {
    kind: "token bucket",
    rate: 1_000_000,
    period: HOUR,
    capacity: 2_000_000,
    shards: 5,
  },
});

/** ~4 chars/token heuristic + a rough output allowance. */
export function estimateTokens(prompt: string): number {
  const promptTokens = Math.ceil(prompt.length / 4);
  return promptTokens + 1_500; // coach replies are short; context dominates
}
