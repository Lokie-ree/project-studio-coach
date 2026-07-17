# Project Studio Coach — Founding Files

---

## Status: ready to run

Both former blockers are resolved. `coach-instructions.md` has the real
(adapted) Gem export, and `student-context.md`'s TODOs are filled in. All 24
archetypes in `project-archetypes.md` now carry real `goal`/`nonGoals`/
`milestones`/`m0` fields, not just description/time/difficulty/hazards.

**There is no prior prototype.** `project-studio-coach.html` — the old
design-system reference — was intentionally dropped; the visual design was a
couple of months old and is being designed fresh instead of ported. Prompt 1
now designs the UI from scratch rather than reusing a file that no longer
exists.

---

## Run order

Run every prompt from the **repo root** — the directory this README is in,
the parent of `prompts/` — not from inside `prompts/` itself.

| | File | |
|---|---|---|
| 1 | `prompts/prompt-0-grounding.md` | ~5 min. Writes `CLAUDE.md`. Cheap. |
| 2 | `prompts/prompt-1-main-run.md` | The ultracode run. Hours. |
| 3 | `prompts/prompt-2-playtest.md` | ~hour 5. Once it builds, before you polish. |

---

## The files

| File | Role |
|---|---|
| `iste-alignment.md` | The Profile as primary framework. **The central constraint lives here.** |
| `coaching-transcripts.md` | **The voice.** The highest-value file in the repo. |
| `coaching-anti-patterns.md` | The failure modes. Every other file is positive examples. |
| `coach-instructions.md` | Six-stage loop, adapted from the original Gem export. |
| `student-context.md` | Who's on the other side — filled in. |
| `project-archetypes.md` | 24 project shapes, each with plan fields now **withheld by default** at runtime. |
| `scope-examples.md` | Before/after scope rewrites + red-flag checklist |
| `milestone-zero-examples.md` | ~40 first deliverables + the formula |

---

## What changed from the original plan

The prototype handed students a plan. Under the ISTE Profile — Learner skill 1.1, *"students use AI to focus loosely defined goals into more actionable ones"* — **that inverts the skill it claims to teach.**

So: **the archetype's plan is withheld by default.** The student derives their own goal, cut list, and Milestone Zero. The archetype's version is revealed afterward, as comparison.

This makes the app **harder to use on purpose**, and that is the central risk. Every incentive the student has is to close the tab and ask ChatGPT. The engagement mechanisms in `student-context.md` — visible withholding, the earned reveal, the ninety-second Spark, the timeboxed struggle, the open exit — are what make the hard path the one they *want* to walk.

If students bail at Narrow, you have built a beautiful thing nobody finishes. Which is, precisely, the problem this project exists to solve.

---

## Three decisions already made — don't let Fable re-open them

**Profile primary, Standards as substrate.** The ISTE+ASCD *Profile of an AI-Ready Graduate* (2026.07) is the target. Store role IDs, never display strings — the framework already renamed *Ideator* to *Problem Solver* once.

**Reflection, not assessment.** `profileEvidence` is student-owned. A coach that files reports is a coach nobody tells the truth to.

**The coach is a bridge between two humans.** Escalating to the teacher is the coach working, not the coach failing. Name the teacher early and mean it.