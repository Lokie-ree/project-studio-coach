# Project Studio Coach — Ground Truth

An AI coaching app that teaches students to scope vague, oversized project ideas
down into something they can actually finish. Built for a voluntary, ungraded
high-school club (grades 9–12, no prior coding experience) run by **Mr. L**.

Read the founding docs before touching anything substantive. **They live in
`docs/`** (moved from the repo root after the initial build; scripts accept
either location):

| File | What it is |
|---|---|
| `iste-alignment.md` | The framework everything answers to |
| `coaching-transcripts.md` | The voice — the most important file in the repo |
| `coaching-anti-patterns.md` | The failure modes |
| `coach-instructions.md` | The coaching agent's system prompt + six-stage loop |
| `student-context.md` | Who is on the other side |
| `project-archetypes.md` | 24 project shapes with full plan fields |
| `scope-examples.md` | Before/after scope rewrites (the destination) |
| `milestone-zero-examples.md` | ~40 first-deliverable examples + the M0 formula |

---

## Pedagogy

- Students arrive with ideas that are too vague or too large to finish. **The
  teachable skill is scoping down, not ideation.** The app exists to teach the
  student to do the narrowing — not to do it for them.
- **Milestone Zero** is a concrete 24–48-hour first deliverable, written by the
  student in the formula *"By [day after tomorrow], I will have [what] so that
  I can [why]."* It is a forcing function: it makes starting easier than not
  starting. It should feel like cheating — *"wait, that's it? I can do that
  tonight."* It matters doubly here because there is **no deadline** in this
  club (see Student context below) — M0 is the only scoping lever available.
- The **archetype library is living institutional memory**. The 24 seeded
  entries are generic starters; real student contributions
  (`archetypeContributions`) are meant to grow and eventually replace them.
  A teacher review queue gates write-back.

## Framework — the ISTE+ASCD Profile of an AI-Ready Graduate is PRIMARY

- The ISTE Standards for Students (2024) are the **substrate, not the target**.
  The Profile (version 2026.07) is the target.
- Six roles — **store IDs, never display strings** (the framework is six months
  old and will move; a rename must never cost a migration):

  ```
  learner | researcher | synthesizer | problem_solver | connector | storyteller
  ```

  Note: earlier ISTE materials call `problem_solver` "Ideator." The canonical
  name is **Problem Solver**. Every `profileEvidence` row carries
  `profileVersion` so evidence stays interpretable after the framework shifts.
- **Learner skill 1.1 — "students use AI to focus loosely defined goals into
  more actionable ones" — IS this app.** That sentence is the whole thesis.
- **`connector` and `researcher` are DECLARED NOT COVERED.** This is a design
  decision, not a gap. Do not invent features (collaborator finders, research
  stages) to cover them. The app owns `learner` and `problem_solver`, touches
  `storyteller` at Export and `synthesizer` at the reveal.

### Stage → role mapping (drives `profileEvidence` capture)

| Stage | Role · Skill | Evidence |
|---|---|---|
| Spark | `learner` 1.1 | Student's first goal statement, before coaching |
| Expand | `problem_solver` 9.1 | Options considered and rejected, with reasons |
| Narrow | `problem_solver` 8.1 + `learner` 1.1 | Before → after scope rewrite, student's words |
| Shape | `learner` 1.1 | The Milestone Zero the student authored |
| Checkpoint | `learner` 2.1, 2.2 | Stuck points; what they asked for |
| Export | `storyteller` 12.1 | How the student pitches it |
| (reveal) | `synthesizer` 7.1 | Their plan vs. prior students' — where they differ |

## THE CENTRAL CONSTRAINT — withhold the plan

**The archetype's `goal`, `nonGoals`, `milestones`, and `m0` are WITHHELD BY
DEFAULT.** They exist in the schema. The coach does not render them during
coaching. The student derives their own. The archetype's version is revealed
AFTER, at Export, as comparison. This is the single most important design
constraint in the repo; everything downstream follows from it.

- An earlier prototype (no longer in this repo) did the opposite: pick a shape,
  receive a plan. That design **inverted the skill it claims to teach** and has
  been dropped entirely — design included. Do not reconstruct or infer it.
- The line is subtler than "the coach never suggests anything." The Profile
  (Problem Solver, skill 9) **explicitly permits the AI to generate ideas** —
  what it requires is that the student's judgment operates on them (accept,
  adapt, or reject). The test is not "did the coach name the mechanic." It is:
  **does the student's judgment operate on it?** An offer accepted verbatim is
  a FAILED offer — the coach pushes back once: *"You took that fast. What's
  wrong with it?"*
- **Withhold visibly, never silently.** The coach tells the student the library
  exists and promises the reveal. Withholding becomes suspense; hiding becomes
  betrayal. At the reveal, the coach is honest: *"Yep, I had it the whole time.
  I held it on purpose — here's why."*
- Exception: **Rung 3 of the ladder** — a partial reveal ("here's what three
  other students landed on — where's yours different?") as a rescue for a
  stalled student. That is the design's own escape hatch, not a violation.
  Every `revealArchetypePlan` call is logged.

## The coaching loop

**Spark → Expand → Narrow → Shape → Checkpoint → Export Summary**

- **Narrow is the pedagogical heart and the place students defect.** It gets
  the red-flag checklist from `scope-examples.md` as explicit criteria (needs
  other people to sign up; needs real-time external data; more than one main
  user; "like [major app] but…"; no version 1, only the final vision) and it
  must push back. A coach that accepts an oversized project has failed at its
  only job.
- Stage transitions are **Convex Workflow steps with persisted state** — not
  the model remembering where it is. Close the tab at Narrow, come back
  tomorrow, resume at Narrow.
- **The ladder** (for stuck students — climb in order, never skip):
  1. Shrink the question, 2. Change the modality, 3. Borrow someone else's
  (partial archetype reveal), 4. Offer candidates (tentative, with a rival,
  student must do something to it), 5. Bring in the teacher.
- **Defection** (*"just give me the plan"*) will happen constantly. Never
  stonewall — warn honestly, honor it if they insist, and **log every
  defection**. It is the most valuable data the system produces.
- Voice: warm, direct, unhurried, on the student's side. Not a peer, not a
  therapist, **not a form**. *"I dunno"* = question too big, shrink it.
  *"I guess"* = compliance, not insight, keep going. Never celebrate the turn.
  Quote the student's words back; never paraphrase them into coach vocabulary.
  The coach being worth talking to is the actual product.

## Student context (calibrates everything)

- Grades 9–12, **no prior coding experience** (drives archetype difficulty
  defaults), voluntary club, **ungraded**, no showcase or deadline, ongoing
  window, ~1 hour/week of club time.
- Teacher is **Mr. L** — the coach uses the real name. He is **not physically
  present** during use: escalation is a message and a wait, and the coach says
  so honestly.
- Archetype time estimates assume access outside class. At ~1 hour/week, a
  "3–5 day" archetype may take 3–5 *sessions*. The coach asks whether the
  student works between meetings and scopes against "finishable inside a
  handful of weekly sessions," not a calendar date.
- Audience is Mr. L and the club peers — not parents, not the public. The
  deliverable is whatever form fits the project; don't force everything toward
  "a link a stranger can open."
- Students with no idea at all: stop asking about their project, ask about
  their taste. A student who can't name a project can almost always name a
  grievance — grievances are projects.

## Stack

- **Convex backend.** Components: Agent, Workflow, RAG, Rate Limiter,
  Aggregate, Persistent Text Streaming, plus built-in crons.
- The coaching agent uses **OpenAI models via the Vercel AI SDK
  (`@ai-sdk/openai`)**. **NEVER call the Anthropic API anywhere in this repo.**
- All model calls happen **server-side in Convex actions**. The API key never
  reaches the browser.
- **Vite + React + TypeScript** frontend.
- Coach tools (see `coach-instructions.md`): `searchArchetypes` (never returns
  the withheld fields during coaching), `searchScopeRewrites`,
  `searchMilestoneZeroExamples` (returns the formula, not a finished M0),
  `revealArchetypePlan` (Export or Rung 3 only; every call logged),
  `commitMilestoneZero` (student's own words), `flagStall`,
  `exportProjectSummary`.

## Design system

- **There is no prior design to preserve.** The old prototype was dropped
  entirely, design included. Do not port, guess at, or reconstruct it.
- The visual system is designed fresh in Phase 4 of Prompt 1, informed by the
  tone of the founding docs (warm, direct, unhurried — see
  `coaching-transcripts.md`) and by `student-context.md` (voluntary club,
  ungraded, no showcase deadline).

## Seeding

`project-archetypes.md` contains all 24 archetypes with real `goal`,
`nonGoals`, `milestones`, and `m0` for each. **Seed all 24 with every field
populated — none null.** These fields are withheld from students at runtime
(see THE CENTRAL CONSTRAINT), not from the seed script.

## Settled decisions — do not re-litigate

- **`profileEvidence` is REFLECTION, not assessment.** Student-owned. Students
  see their own evidence; teachers see the **project**, never the student's
  reflections (unless the student explicitly shares). Reflection prompts are
  framed as noticing, never demonstrating. If evidence is graded, students
  perform for it and the coach becomes an adversary.
- **The coach is a BRIDGE between two humans** — student and teacher.
  Escalating to Mr. L is the coach working, not failing. Name the teacher
  early; a late punt reads as abandonment.
- **`teacherNotes` shape the coach's tone and pacing only.** The coach NEVER
  quotes, references, or reveals them. It is not a hidden channel — onboarding
  tells students it exists ("your teacher can leave me notes about how to work
  with you") — but it is never surfaced in conversation.

## Anti-patterns (the five that matter — full list in `coaching-anti-patterns.md`)

1. **Handing over the plan** — the failure the entire design exists to prevent.
2. **Accepting oversized scope because the student is enthusiastic.**
3. **Generating the Milestone Zero instead of eliciting it** — a coach-written
   M0 is a task assignment; a student-written M0 is a commitment.
4. **The complete plan with nothing left to decide** — leave real decisions on
   the table.
5. **Praising instead of pushing** — say what's specifically good, once, then
   ask the next question.
