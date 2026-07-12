# Project Studio Coach

An AI coach that teaches students to **scope a vague, oversized idea down into
a project they can actually finish** — and then writes what they learned back
into a living archetype library so the next student inherits it. Built for a
voluntary, ungraded high-school club run by Mr. L.

The pedagogical thesis is ISTE+ASCD *Profile of an AI-Ready Graduate*, Learner
skill 1.1: *"students use AI to focus loosely defined goals into more
actionable ones."* The **student** does the focusing. The coach withholds the
library's pre-written plans until the student's own plan exists, then reveals
them as a comparison. See `CLAUDE.md` (ground truth) and `docs/` (the founding
documents).

## Stack

- **Convex** backend — components: Agent, Workflow, RAG, Rate Limiter,
  Aggregate, Persistent Text Streaming, crons
- **OpenAI via Vercel AI SDK** (`@ai-sdk/openai`, chat model `gpt-5.6-terra`,
  embeddings `text-embedding-3-small` @ 1536 dims). All model calls run
  server-side in Convex actions; the API key never reaches the browser.
  **This repo never calls the Anthropic API.**
- **Vite + React + TypeScript** frontend

## Setup

```bash
npm install
npx convex dev            # dev deployment (already configured in .env.local)

# The deployment needs a VALID OpenAI key (the currently-set one is expired):
npx convex env set OPENAI_API_KEY sk-...

# Seed: parses docs/project-archetypes.md (24 archetypes) + ingests the
# coaching knowledge into RAG (requires the valid key for embeddings):
node scripts/sync-knowledge.mjs
npx convex run seed:run
# If RAG ingestion failed earlier (bad key), re-run just that part:
npx convex run seed:ingestKnowledge

npm run dev               # frontend on :5173 + convex dev watcher
```

Student app: `http://localhost:5173` · Teacher screen: `http://localhost:5173/#/teacher`

## How it works

**Spark → Expand → Narrow → Shape → Checkpoint → Export.** The stage pointer
lives in `projects.stage` (close the tab at Narrow, reopen at Narrow) and is
mirrored by a durable Workflow whose steps park on `awaitEvent` between
stages. Conversation history streams through the Agent component's persisted
deltas, so a reload never loses the thread.

The archetype plan fields (`goal`, `nonGoals`, `milestones`, `m0`) are
**withheld at the query layer** — `archetypes:search` structurally cannot
return them (explicit-pick projection + return validator). The only door is
the logged reveal: partial at rung 3 of the stuck-student ladder, full at
Export.

Completed projects draft **contributions** (a real remix prompt, the real
before/after scope cut, the hazard the student hit, actual vs. estimated
time) into a teacher review queue. Nothing enters the library unapproved.
Genuinely new shapes are the rare path, also teacher-gated.

`profileEvidence` is reflection, not assessment: student-owned, captured only
from text the student typed, never shown to the teacher.

## Honest limitations (prototype)

- **No authentication.** Identity is "pick your name," like a club sign-in
  sheet. The teacher screen is an unauthenticated route. Do not deploy beyond
  a trusted club without adding auth.
- **The OpenAI key currently on the deployment is dead** — live coaching and
  RAG ingestion are blocked until it's replaced (one command, above). All
  non-LLM behavior is verified working; the coach's conversational behavior
  (pushback at Narrow, the ladder, defection handling) is prompt-engineered
  from `docs/coach-instructions.md` but **unverified live** until then —
  `prompts/prompt-2-playtest.md` is the plan for that.
- Streaming uses the Agent component's persisted delta streaming (the
  Persistent Text Streaming component is registered but idle — agent-native
  streaming already survives reloads, which is the requirement).

## Scripts

| Command | What |
|---|---|
| `npm run dev` | Vite + convex dev, together |
| `npm run typecheck` | Both TS projects |
| `node scripts/sync-knowledge.mjs` | Founding markdown → `convex/knowledge/*.ts` |
| `npx convex run seed:run` | Teacher + 24 archetypes + RAG ingest |
| `node scripts/verify-ui.mjs` | Playwright walk of the student + teacher flows |
