# ISTE Alignment

**Primary framework:** ISTE+ASCD *Profile of an AI-Ready Graduate*
**Profile version:** 2026.07 (as published at https://iste-ascd.org/ai-ready-graduate)
**Substrate:** ISTE Standards for Students (2024, v4.02)

The Profile is built on the ISTE Standards for Students and ISTE+ASCD's Transformational Learning Principles. Where this document says "the Profile," it means the six-role framework unveiled at ISTELive 26 (Orlando, June–July 2026).

---

## Why the Profile is primary, not the Standards

The Standards for Students are broad and predate the AI-partnership question. The Profile is specific to it. ISTE's own framing of the gap it fills: early frameworks covered AI literacy — the fundamentals, how to interact with AI — and stopped there. The Profile covers the higher-order skills that emerge when a student and an AI work *together*.

That is exactly what this app is. The Standards remain the floor; the Profile is the target.

---

## Naming note — do not get this wrong

Earlier ISTE materials (and some pages that have not been updated) call the fourth role **Ideator**. The current canonical profile calls it **Problem Solver**. Use **Problem Solver**.

**Store role IDs, never display strings.** The Profile is six months old and will move again. A rename must never cost a migration.

```
learner | researcher | synthesizer | problem_solver | connector | storyteller
```

Every `profileEvidence` row carries `profileVersion` so evidence stays interpretable after the framework shifts.

---

## The six roles

| ID | Role | One-line |
|---|---|---|
| `learner` | Learner | Uses AI to set goals, plan skill-building, get unstuck, seek feedback |
| `researcher` | Researcher | Uses AI to investigate topics, evaluate claims, compare sources |
| `synthesizer` | Synthesizer | Uses AI to remix and relevel information across formats and complexity |
| `problem_solver` | Problem Solver | Uses AI as a brainstorming partner to clarify problems and evaluate solutions |
| `connector` | Connector | Uses AI to increase *human* collaboration across language and perspective |
| `storyteller` | Storyteller | Uses AI to communicate complex ideas through text, image, audio, video |

---

## The skill this app exists to teach

From the Profile, Learner, skill 1.1:

> **Students use AI to focus loosely defined goals into more actionable ones.**

That sentence is Project Studio Coach. Scoping down — taking a vague, oversized idea and making it actionable — is the pedagogical thesis of this project, and it is skill 1.1 of the AI-Ready Graduate profile.

This alignment was **not retrofitted**. The project arrived at it independently and the Profile named it.

---

## The constraint this places on the design

**Read 1.1 carefully.** The *student* uses AI to focus the goal. The AI does not focus the goal and hand it over.

The prior prototype (`project-studio-coach.html`) did exactly that: pick an archetype, receive a pre-written goal, pre-written out-of-scope, pre-written milestones, pre-written Milestone Zero. The student chose from a menu. **That design inverts the skill it claims to teach.**

Therefore:

> **The archetype's plan fields are WITHHELD BY DEFAULT.**
>
> `goal`, `nonGoals`, `milestones`, and `m0` exist in the schema. The coach does not render them during the coaching conversation. The student derives their own. The archetype's version is revealed *afterward*, as a comparison.

This is the single most important design constraint in the repo. Everything downstream follows from it. See `coaching-transcripts.md` for what it looks like in practice, and `coaching-anti-patterns.md` for the ways it gets violated.

---

## Where discernment lives (read this before "fixing" the withholding)

The Profile, Problem Solver, skill 9:

> Students use AI as a brainstorming partner to expand their thinking and push them to identify more potential options before selecting a path forward.
> Students use AI to probe their most promising approaches for weaknesses, risks, and implementation challenges.
>
> Throughout, they **maintain critical judgment about which AI-generated insights to accept, adapt, or reject.**

This matters enormously. **The Profile explicitly contemplates the AI generating ideas.** The skill is not "the student must produce every option unaided." The skill is **discernment** — the student is the one who accepts, adapts, or rejects.

So the coach *may* offer candidate mechanics when a student is genuinely stuck. What it may not do is offer them in a way that forecloses judgment. The line is not "does the coach name the mechanic." The line is:

> **Does the student's judgment operate on it?**

An offer that is accepted verbatim, without alteration, is a **failed offer.** The coach pushes back on rubber-stamping. See the escalation ladder in `coaching-transcripts.md`.

---

## Stage → role mapping

The six coaching stages map to Profile skills. This mapping drives `profileEvidence` capture.

| Stage | Role · Skill | Evidence captured |
|---|---|---|
| **Spark** | `learner` 1.1 | The student's own first goal statement, *before* any coaching |
| **Expand** | `problem_solver` 9.1 | Options considered and rejected, with the student's reasons |
| **Narrow** | `problem_solver` 8.1 + `learner` 1.1 | The before → after scope rewrite, in the student's words |
| **Shape** | `learner` 1.1 | The Milestone Zero the student authored |
| **Checkpoint** | `learner` 2.1, 2.2 | Where they got stuck; what they asked for |
| **Export** | `storyteller` 12.1 | How the student pitches the project to someone else |
| *(when the archetype library is revealed)* | `synthesizer` 7.1 | Comparing their plan against prior students' — where they differ |

---

## Declared non-coverage — this is a design decision, not a gap

**`connector` and `researcher` are not meaningfully exercised by this app.**

Do not invent features to cover them. Do not add a "find a collaborator" panel or a "research your topic" stage to be thorough. The Profile is discipline-agnostic by design — ISTE's own position is that teachers across a student's whole academic life contribute to these skills, and no single tool owns all six.

Project Studio Coach owns `learner` and `problem_solver`, touches `storyteller` at Export and `synthesizer` at the reveal, and **explicitly does not address** `connector` or `researcher`.

Saying so is more honest, and more useful to a teacher, than pretending otherwise.

---

## Evidence is reflection, not assessment

`profileEvidence` is **student-owned**. It is a mirror, not a rubric.

- Students see their own evidence. Teachers do not, unless the student explicitly shares it.
- The teacher review queue (archetype write-back) sees the **project**, never the student's reflections.
- Reflection prompts are framed as **noticing**, never as **demonstrating**.
  - ✗ "Show how you used AI to focus your goal."
  - ✓ "Your first idea and the one you landed on are pretty different. What made you cut what you cut?"
- The Profile becomes visible to the student at **Export**, as a name for something they already did — not as a standard they were measured against.

Rationale: if evidence is graded, students perform for it. The reflection becomes theater and the coach becomes an adversary to be managed. A coach that files reports is a coach nobody tells the truth to.