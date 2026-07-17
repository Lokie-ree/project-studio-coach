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

  // Per-student token budget, calibrated from the 2026-07-15 playtest: a
  // real coach turn costs ~8-12k tokens with context, and the original
  // 25k/hr starved a normal-paced session after 3 turns. 120k/hr sustains a
  // ~12-turn hour; 250k capacity covers one full continuous session.
  // maxReserved caps how far one runaway response can drive a student into
  // debt.
  studentTokens: {
    kind: "token bucket",
    rate: 120_000,
    period: HOUR,
    capacity: 250_000,
    maxReserved: 60_000,
  },

  // Class-wide budget — the outer, nested cap. Sharded: every student in the
  // room contends on this one key. 5x the per-student rate: five students
  // coaching flat-out simultaneously is the club's realistic ceiling.
  classTokens: {
    kind: "token bucket",
    rate: 600_000,
    period: HOUR,
    capacity: 1_200_000,
    shards: 5,
  },
});

/** ~4 chars/token heuristic + a rough output allowance. */
export function estimateTokens(prompt: string): number {
  const promptTokens = Math.ceil(prompt.length / 4);
  return promptTokens + 1_500; // coach replies are short; context dominates
}
