# Prompt 1 — The Main Run

**This is the ultracode one. Expect hours. Run from the repo root (the parent of `prompts/`), same place Prompt 0 wrote CLAUDE.md.**

---

```
ultracode. Read CLAUDE.md first — it is ground truth.

Build Project Studio Coach from scratch in the repo root: a Convex-backed
web app that coaches a student from a vague idea to a scoped project with a
committed Milestone Zero, then writes completed projects back into a living
archetype library so the next student inherits them.

It is an instrument of the ISTE+ASCD Profile of an AI-Ready Graduate,
Learner skill 1.1: "students use AI to focus loosely defined goals into more
actionable ones." Every design decision answers to that sentence.

Run the phases below end to end. Orchestrate subagents for research,
implementation, and adversarial verification. Don't stop to ask permission on
reversible steps. Verify your own work before reporting done. I have until
tomorrow — use everything.

──────────────────────────────────────────
PHASE 1 — RESEARCH (parallel subagents)

Each returns a working code sketch against current APIs, not a prose summary.
Use Context7 for live docs rather than recalling APIs from memory — this
applies especially to OpenAI model identifiers and the Vercel AI SDK surface,
where your training data may be stale. Do not assert a model name from memory.

  a) @convex-dev/agent driven by @ai-sdk/openai: thread creation, tool
     definitions, streaming, message history. Confirm which OpenAI models
     support tool-calling and structured output through the AI SDK, and which
     embedding model to pair with them.
  b) @convex-dev/rag: chunking strategy for the knowledge markdown files.
     REPORT THE EMBEDDING DIMENSION required by the OpenAI embedding model
     chosen in (a). Pin it before ingesting anything — changing it later means
     re-ingesting everything.
  c) @convex-dev/workflow: the six-stage coaching loop as a durable workflow
     with state persisted between stages. A student who closes the tab at
     Narrow resumes at Narrow.
  d) @convex-dev/rate-limiter + Convex crons: per-student token budgets
     against a shared class budget; a 48-hour Milestone Zero check-in job.

──────────────────────────────────────────
PHASE 2 — SCHEMA + SEED

Scaffold the Convex project. Design the schema:

  students, teachers, teacherNotes, projects, milestones, milestoneZeros,
  archetypes, archetypeContributions, scopeRewrites, coachThreads,
  profileEvidence, stallFlags, defections, reviewQueue

Two tables carry the weight:

ARCHETYPES — the living library.
  name, glyph, description, timeEstimate, difficulty, skills[], hazards[],
  remixPrompt, tags[], status, sourceProjectId (nullable), contributedBy
  (nullable).

  The plan fields — goal, nonGoals, milestones, m0 — exist here but are
  WITHHELD BY DEFAULT. Enforce this at the query layer, not by convention:
  searchArchetypes() must not return them. A separate revealArchetypePlan()
  returns them, and every call is logged.

  Difficulty and timeEstimate are MUTABLE. The seeded values are guesses and
  real completion data should correct them.

PROFILEEVIDENCE — student-owned reflection, never assessment.
  studentId, projectId, stage, roleId, skillCode, profileVersion,
  studentWords (the student's own text, never paraphrased), createdAt,
  sharedWithTeacher (default false).

  Store role IDs (learner, problem_solver, ...), never display strings.
  Carry profileVersion on every row — the framework will move.

SEED: write a script that PARSES project-archetypes.md and inserts all 24
archetypes with every field populated, including goal, nonGoals, milestones,
and m0 — the markdown now has real values for all four on every archetype.
Do not hand-transcribe a subset, and do not invent values for any field that
actually is absent from the markdown; leave those null instead.

Ingest the knowledge markdown into RAG with per-stage retrieval tags:
  scope-examples.md         → Narrow
  milestone-zero-examples.md → Shape
  coaching-transcripts.md   → all stages (this is the VOICE — it must be
                              retrievable when the coach needs to know how to
                              sound, especially the ladder when a student stalls)

──────────────────────────────────────────
PHASE 3 — THE COACH AGENT

Build on @convex-dev/agent with an OpenAI chat model. All model calls
server-side in Convex actions; the API key never reaches the browser. Rate-
limit every call.

System prompt from coach-instructions.md. Voice from coaching-transcripts.md.
Failure modes from coaching-anti-patterns.md. Read all three before writing
the prompt.

Stage transitions are Workflow steps with persisted state — not the model
remembering where it is.

TOOLS
  searchArchetypes(interests, difficulty, timeBudget)
    → name, description, time, difficulty, hazards, remixPrompt
    → MUST NOT return goal, nonGoals, milestones, m0
  searchScopeRewrites(category)
  searchMilestoneZeroExamples(projectType)
    → returns the FORMULA for the student to fill in, not a finished M0
  revealArchetypePlan(archetypeId)   → logged on every call
  commitMilestoneZero(text, dueAt)   → text must be the student's own words
  flagStall(stage, minutes)          → ambient signal to teacher, NOT a transcript
  exportProjectSummary()

NARROW IS THE PEDAGOGICAL HEART. It is where the app earns its existence and
where students defect. Give it the red-flag checklist from scope-examples.md
as explicit criteria and make it PUSH BACK. A coach that accepts an obviously
oversized project has failed at its only job.

THE LADDER — when a student is stuck, climb in order, do not skip:
  1. Shrink the question. Stop asking about their project; ask about their
     TASTE. "When YOU play this kind of game, when does your heart rate go up?"
  2. Change the modality. "Draw the first screen." "What's the worst thing that
     could happen in your game?"
  3. Borrow someone else's — a PARTIAL reveal of the withheld archetype, used
     as a rescue. "Here's what three other students landed on. Where's yours
     different?"
  4. Offer candidates. Only here does the coach name a mechanic. Three rules:
     it's a candidate not a conclusion; it comes with rivals (offer 2–3, one
     deliberately weaker); the student must DO something to it. An offer
     accepted verbatim is a FAILED offer — push back: "You took that fast.
     What's wrong with it?"
  5. Bring in the teacher. Escalation is the coach WORKING, not breaking.

THE EXIT IS ALWAYS OPEN. A student may demand the plan. Do not stonewall —
that converts the coach into an obstacle and they'll open ChatGPT in another
tab. Warn honestly ("if I write it, it's my project, not yours"), honor it if
they insist, and LOG THE DEFECTION. That log is the most valuable data this
system produces.

TEACHERNOTES: the coach reads them. The coach NEVER quotes, references, or
reveals them. They shape tone and pacing only.

──────────────────────────────────────────
PHASE 4 — FRONTEND

Vite + React + TypeScript.

Design the visual system from scratch. There is no prior prototype and no
existing design system to port — this is a green-field UI. Take the tone
from coaching-transcripts.md (warm, direct, unhurried, not a form) and the
constraints from student-context.md (a voluntary club, ungraded, no
showcase deadline, ~1 hour/week — this is not a polished-SaaS-dashboard
context) as your brief. Use your own judgment on typography, color, and
layout; do not default to generic Tailwind/shadcn boilerplate without a
reason grounded in this app's actual voice.

The flow is the six-stage coached conversation — Spark, Expand, Narrow,
Shape, Checkpoint, Export — streamed via Persistent Text Streaming so a
reload doesn't lose the thread.

ENGAGEMENT IS THE REAL RISK. This app deliberately withholds the answer from a
teenager who wants the answer, while the pre-written plan sits in the database.
Every incentive is to defect. Build these in:

  - SPARK COSTS ALMOST NOTHING. Two clicks, not a questionnaire. A visible win
    inside 90 seconds. Momentum before friction.
  - WITHHOLD VISIBLY. The moment a shape is picked, the coach says the library
    exists and promises the reveal. Suspense, not obstruction.
  - TIMEBOX THE STRUGGLE OUT LOUD. "Narrow takes about eight minutes. It's the
    hard part. It's also the only part that matters." Unbounded struggle reads
    as broken software.
  - MILESTONE ZERO IS THE EXIT and must feel like cheating. The student should
    leave thinking "wait, that's it? I can do that tonight."

Teacher surface: the review queue, the stall flags, and a teacherNotes
textarea per student. Keep it to one screen.

Student onboarding tells the truth in plain language: nothing here is graded;
your reflections are yours; your teacher can leave me notes about how to work
with you.

──────────────────────────────────────────
PHASE 5 — THE WRITE-BACK LOOP

This is why the app exists.

BUT — think carefully about what actually compounds. An archetype is a GENRE
("Quiz Game"), not a project ("a quiz about my grandmother's village"). Most
completed student projects are INSTANCES of existing archetypes, not new
archetypes. Thirty finished projects might yield two genuinely new shapes and
twenty-eight variations. If every completion drafts a new archetype, the
library bloats into exactly the rot this design is trying to avoid.

So the default write-back is a CONTRIBUTION to an existing archetype, not a
new row:
  - remixPrompts — real ones, from real projects. Infinitely better than the
    invented ones in the seed.
  - hazardsObserved — GOLD. "Six students tried this; four got stuck on
    hosting." No amount of upfront authoring produces this.
  - actualTime vs. estimatedTime — the seeded estimates are guesses. Real data
    corrects them.
  - scopeRewrite — the before/after of a real narrowing session.

Proposing a genuinely NEW archetype is the rare path, not the default.

Everything lands in a TEACHER REVIEW QUEUE. Nothing enters the library
unapproved. An unapproved write-back means one student's mediocre project
becomes canon for the next thirty. Build the queue in this phase, not later.

The review queue sees the PROJECT. It never sees the student's profileEvidence.

──────────────────────────────────────────
PHASE 6 — ADVERSARIAL VERIFICATION

Fresh-context subagents. Report failures with actual output, not reassurance.
If something is unverified, say so rather than assuming.

  - SEED INTEGRITY. All 24 archetypes present, no field silently dropped or
    hallucinated? Diff against the markdown.
  - THE WITHHOLDING HOLDS. Can searchArchetypes() be made to return goal,
    nonGoals, milestones, or m0 through ANY path? Try. This is the central
    constraint and it must be enforced at the query layer, not by convention.
  - EMBEDDING DIMENSION. Does the RAG config match the OpenAI embedding model
    actually in use? A mismatch fails silently at query time.
  - FULL LOOP. Traverse all six stages, close the tab mid-conversation, reopen,
    resume with state intact.
  - THE COACH PUSHES BACK. Feed it "a social network for musicians." Does
    Narrow push back, or comply?
  - THE LADDER WORKS. Feed it a student who answers "I dunno" to everything.
    Does it climb the ladder, or does it just ask louder? Does it eventually
    escalate to the teacher?
  - THE OFFER IS NOT RUBBER-STAMPED. Feed it a student who accepts the coach's
    first candidate verbatim. Does the coach push back?
  - THE COACH DOESN'T SOUND LIKE A FORM. Read a full transcript. Compare against
    coaching-transcripts.md. Does it celebrate the turn? Praise reflexively?
    Fill silences? Paraphrase the student into its own vocabulary? Every one of
    those is a failure — see coaching-anti-patterns.md.
  - TEACHERNOTES NEVER LEAK. Plant a note. Run 50 turns. Does the coach ever
    quote, reference, or hint at it?
  - RATE LIMITER. Can one student exhaust the class budget?
  - NO ANTHROPIC API CALLS ANYWHERE. Grep for it.
```