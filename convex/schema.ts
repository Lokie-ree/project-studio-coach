import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { vDifficulty, vRoleId, vStage } from "./shared";

export default defineSchema({
  // ── People ────────────────────────────────────────────────────────────────
  students: defineTable({
    name: v.string(),
    teacherId: v.id("teachers"),
    // True once the student has seen the honest onboarding (nothing is graded;
    // your reflections are yours; your teacher can leave me notes).
    onboarded: v.boolean(),
    // The coach asks whether they work on projects between club meetings and
    // scopes against sessions, not calendar days.
    worksBetweenMeetings: v.optional(v.boolean()),
  }).index("by_teacher", ["teacherId"]),

  teachers: defineTable({
    name: v.string(), // e.g. "Mr. L" — the coach uses the real name
  }),

  // Shapes the coach's tone and pacing ONLY. The coach never quotes,
  // references, or reveals these. Students are told the channel exists.
  teacherNotes: defineTable({
    teacherId: v.id("teachers"),
    studentId: v.id("students"),
    text: v.string(),
    updatedAt: v.number(),
  }).index("by_student", ["studentId"]),

  // ── Projects ──────────────────────────────────────────────────────────────
  projects: defineTable({
    studentId: v.id("students"),
    title: v.optional(v.string()),
    // Reactive stage pointer — the UI resumes from this, instantly.
    // The durable workflow mirrors it; the model never "remembers" the stage.
    stage: vStage,
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("abandoned"),
    ),
    // The student's raw first idea, in their words, before any coaching.
    sparkText: v.optional(v.string()),
    // The shape they picked in Expand (nullable — some projects fit none).
    archetypeId: v.optional(v.id("archetypes")),
    // Student-authored plan, built at Shape. All in the student's words.
    goal: v.optional(v.string()),
    nonGoals: v.optional(v.array(v.string())),
    // One known risk, named at Checkpoint.
    knownRisk: v.optional(v.string()),
    // The ninety-second pitch, captured at Export.
    pitch: v.optional(v.string()),
    // Agent-component thread backing the coaching conversation.
    threadId: v.optional(v.string()),
    // Durable coaching workflow instance (stage gates).
    coachWorkflowId: v.optional(v.string()),
    // Whether the archetype's withheld plan has been revealed (Export or Rung 3).
    planRevealed: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_status", ["status"]),

  // Student-proposed milestones (3–5, authored at Shape).
  milestones: defineTable({
    projectId: v.id("projects"),
    order: v.number(),
    text: v.string(), // the student's words
    done: v.boolean(),
    completedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  // The forcing function. Text must be the student's own words.
  milestoneZeros: defineTable({
    projectId: v.id("projects"),
    studentId: v.id("students"),
    text: v.string(),
    committedAt: v.number(),
    dueAt: v.number(),
    status: v.union(
      v.literal("committed"),
      v.literal("done"),
      v.literal("missed"),
      v.literal("revised"),
    ),
    // The 48-hour check-in job scheduled for this commitment.
    checkInScheduledId: v.optional(v.id("_scheduled_functions")),
    checkedInAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_student", ["studentId"])
    .index("by_status", ["status"]),

  // ── The living library ────────────────────────────────────────────────────
  archetypes: defineTable({
    name: v.string(),
    // Absent from the founding markdown — never invented by the seed. The UI
    // derives a display glyph; a real one can be set via the teacher surface.
    glyph: v.optional(v.string()),
    description: v.string(),
    // MUTABLE: seeded values are guesses; real completion data corrects them.
    timeEstimate: v.string(),
    difficulty: vDifficulty,
    skills: v.array(v.string()),
    hazards: v.array(v.string()),
    remixPrompt: v.string(),
    tags: v.array(v.string()),
    status: v.union(
      v.literal("seed"), // from the founding library
      v.literal("active"), // student-contributed, approved
      v.literal("retired"),
    ),
    sourceProjectId: v.optional(v.id("projects")),
    contributedBy: v.optional(v.id("students")),

    // ── WITHHELD BY DEFAULT ──────────────────────────────────────────────
    // These exist so the archetype has something real to compare against at
    // the reveal. searchArchetypes() NEVER returns them (enforced at the
    // query layer — see archetypes.ts). Only revealArchetypePlan() does,
    // and every call is logged in planReveals.
    goal: v.optional(v.string()),
    nonGoals: v.optional(v.array(v.string())),
    milestones: v.optional(v.array(v.string())),
    m0: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_name", ["name"]),

  // Approved write-backs from real student projects. The default write-back is
  // a CONTRIBUTION to an existing archetype, not a new archetype.
  archetypeContributions: defineTable({
    archetypeId: v.id("archetypes"),
    projectId: v.id("projects"),
    studentId: v.id("students"),
    kind: v.union(
      v.literal("remixPrompt"), // a real remix, from a real project
      v.literal("hazardObserved"), // "four of six got stuck on hosting" — gold
      v.literal("actualTime"), // corrects the seeded estimate
      v.literal("scopeRewrite"), // the before/after of a real narrowing
    ),
    remixPrompt: v.optional(v.string()),
    hazardObserved: v.optional(v.string()),
    actualTime: v.optional(
      v.object({ sessions: v.number(), estimateWas: v.string() }),
    ),
    scopeRewrite: v.optional(v.object({ before: v.string(), after: v.string() })),
    approvedBy: v.id("teachers"),
    approvedAt: v.number(),
  })
    .index("by_archetype", ["archetypeId"])
    .index("by_project", ["projectId"]),

  // Real narrowing sessions: the before → after, in the student's words.
  // (The seeded before/after examples live in RAG, not here.)
  scopeRewrites: defineTable({
    projectId: v.id("projects"),
    studentId: v.id("students"),
    before: v.string(),
    after: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_student", ["studentId"]),

  // Maps our projects onto Agent-component threads.
  coachThreads: defineTable({
    studentId: v.id("students"),
    projectId: v.id("projects"),
    threadId: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_thread", ["threadId"]),

  // ── Reflection, never assessment ──────────────────────────────────────────
  // Student-owned. Teachers never see these unless the student shares.
  profileEvidence: defineTable({
    studentId: v.id("students"),
    projectId: v.id("projects"),
    stage: vStage,
    roleId: vRoleId,
    skillCode: v.string(), // e.g. "1.1", "9.1" — within the role
    profileVersion: v.string(), // the framework will move; rows stay interpretable
    studentWords: v.string(), // the student's own text, NEVER paraphrased
    createdAt: v.number(),
    sharedWithTeacher: v.boolean(), // default false; only the student flips it
  })
    .index("by_student", ["studentId"])
    .index("by_project", ["projectId"]),

  // ── Signals ───────────────────────────────────────────────────────────────
  // Ambient signal to the teacher. NOT a transcript.
  stallFlags: defineTable({
    studentId: v.id("students"),
    projectId: v.id("projects"),
    stage: vStage,
    minutes: v.number(),
    resolved: v.boolean(),
  })
    .index("by_resolved", ["resolved"])
    .index("by_student", ["studentId"]),

  // "Just give me the plan." The most valuable data this system produces —
  // it marks precisely where the pedagogy failed to hold.
  defections: defineTable({
    studentId: v.id("students"),
    projectId: v.id("projects"),
    stage: vStage,
    request: v.string(), // what the student asked for, verbatim
    honored: v.boolean(), // did the coach write the plan after warning?
  })
    .index("by_project", ["projectId"])
    .index("by_stage", ["stage"]),

  // Every reveal of withheld archetype plan fields, logged. No exceptions.
  planReveals: defineTable({
    archetypeId: v.id("archetypes"),
    projectId: v.optional(v.id("projects")),
    studentId: v.optional(v.id("students")),
    reason: v.union(
      v.literal("export"), // the earned reveal
      v.literal("rung3"), // partial reveal as a rescue
      v.literal("teacher"), // teacher viewing their own library
    ),
    partial: v.boolean(), // rung 3 reveals are partial
  })
    .index("by_archetype", ["archetypeId"])
    .index("by_project", ["projectId"]),

  // ── Write-back review ─────────────────────────────────────────────────────
  // Everything lands here. Nothing enters the library unapproved. The queue
  // sees the PROJECT — never the student's profileEvidence.
  reviewQueue: defineTable({
    type: v.union(
      v.literal("contribution"), // default path: enrich an existing archetype
      v.literal("newArchetype"), // rare path: a genuinely new shape
    ),
    projectId: v.id("projects"),
    studentId: v.id("students"),
    teacherId: v.id("teachers"),
    // For contributions:
    archetypeId: v.optional(v.id("archetypes")),
    contributionKind: v.optional(
      v.union(
        v.literal("remixPrompt"),
        v.literal("hazardObserved"),
        v.literal("actualTime"),
        v.literal("scopeRewrite"),
      ),
    ),
    payload: v.any(), // the drafted contribution / archetype proposal
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    reviewedAt: v.optional(v.number()),
    teacherComment: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_teacher", ["teacherId", "status"]),

  // ── Budget bookkeeping ────────────────────────────────────────────────────
  // Actual token usage per LLM call, for debiting budgets and honest reporting.
  tokenUsage: defineTable({
    studentId: v.optional(v.id("students")),
    threadId: v.optional(v.string()),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
  }).index("by_student", ["studentId"]),
});
