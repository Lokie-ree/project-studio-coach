# Prompt 0 — Grounding

**Run first, from the repo root (the parent of this `prompts/` folder) — not from inside `prompts/`. Cheap. ~5 minutes.**

**Status:** `student-context.md` and `coach-instructions.md` are both filled in. There is no prior prototype file to read — the old `project-studio-coach.html` was intentionally dropped; the visual design is unconstrained and Fable designs it fresh in Phase 4 of Prompt 1.

---

```
Run this from the repo root — the directory containing iste-alignment.md,
not the prompts/ subfolder this prompt file lives in.

Read every markdown file in the repo root, in this order:

  1. iste-alignment.md          ← the framework everything answers to
  2. coaching-transcripts.md    ← the voice; the most important file here
  3. coaching-anti-patterns.md  ← the failure modes
  4. coach-instructions.md      ← the six-stage loop
  5. student-context.md         ← who is on the other side
  6. project-archetypes.md      ← 24 project shapes, including each one's
                                  goal/nonGoals/milestones/m0 (withheld from
                                  students at runtime, not from you now)
  7. scope-examples.md          ← before/after scope rewrites
  8. milestone-zero-examples.md ← ~40 first-deliverable examples

There is no prior prototype file. There is no existing design system to
preserve — the app's visual design is being built fresh; do not invent or
assume one at this stage.

Then write CLAUDE.md at the repo root. It is ground truth for every future
session in this repo. It must capture:

PEDAGOGY
- Students arrive with ideas too vague or too large to finish. The teachable
  skill is scoping down, not ideation.
- Milestone Zero: a concrete 48-hour first deliverable. A forcing function —
  it makes starting easier than not starting.
- The archetype library is living institutional memory, designed to grow as
  real student projects complete.

FRAMEWORK — the ISTE+ASCD Profile of an AI-Ready Graduate is PRIMARY
- Six roles: learner, researcher, synthesizer, problem_solver, connector,
  storyteller. Store IDs, never display strings — the framework will move.
- Learner skill 1.1 — "students use AI to focus loosely defined goals into
  more actionable ones" — IS this app. That is the whole thesis.
- The ISTE Standards for Students are the substrate, not the target.
- connector and researcher are DECLARED NOT COVERED. Do not invent features
  to cover them.

THE CENTRAL CONSTRAINT — read iste-alignment.md and understand why
- The archetype's goal, nonGoals, milestones, and m0 are WITHHELD BY DEFAULT.
  They exist in the schema. The coach does not render them during coaching.
  The student derives their own. The archetype's version is revealed AFTER,
  as comparison.
- The earlier prototype (no longer in this repo) did the opposite: pick a
  shape, receive a plan. That design inverted the skill it claims to teach.
  It has been dropped entirely, design included — nothing from it carries
  forward. Do not reconstruct or infer what it looked like.
- The Profile explicitly permits the AI to generate ideas — what it requires
  is that the student's judgment operates on them (accept, adapt, or reject).
  The line is not "does the coach name the mechanic." It is "does the
  student's judgment operate on it."

THE COACHING LOOP
Spark → Expand → Narrow → Shape → Checkpoint → Export Summary
Narrow is the pedagogical heart and the place students defect.

STACK
- Convex backend. Components: Agent, Workflow, RAG, Rate Limiter, Aggregate,
  Persistent Text Streaming, plus built-in crons.
- The coaching agent uses OPENAI models via the Vercel AI SDK (@ai-sdk/openai).
  NEVER call the Anthropic API anywhere in this repo.
- All model calls happen server-side in Convex actions. The API key never
  reaches the browser.
- Vite + React + TypeScript frontend.

DESIGN SYSTEM
- No prior design to preserve. Fable designs the visual system from scratch
  in Phase 4 of Prompt 1, informed by the tone of the founding docs (warm,
  direct, unhurried — see coaching-transcripts.md) and by student-context.md
  (a voluntary club, ungraded, no showcase deadline). Do not port, guess at,
  or reconstruct an old design system — none exists to port.

DATA GAP ALREADY CLOSED
project-archetypes.md contains all 24 archetypes with real goal, nonGoals,
milestones, and m0 fields for each. Seed all 24 with every field populated —
none should be null. These fields are withheld from students at runtime
(see THE CENTRAL CONSTRAINT above), not withheld from the seed script.

SETTLED DECISIONS — do not re-litigate
- profileEvidence is REFLECTION, not assessment. Student-owned. Teachers see
  the project, never the student's reflections.
- The coach is a BRIDGE between two humans — student and teacher. Escalating
  to the teacher is the coach working, not the coach failing.
- teacherNotes shape the coach's tone and pacing. The coach NEVER quotes,
  references, or reveals them. Students are told the channel exists.

Then stop. Do not scaffold, install, or write code yet.
```