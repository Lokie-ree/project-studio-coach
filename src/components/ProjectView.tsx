import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Conversation } from "./Conversation";
import { ExpandPanel, NarrowPanel, ShapePanel, CheckpointPanel, ExportPanel } from "./StagePanels";

const STAGES = ["spark", "expand", "narrow", "shape", "checkpoint", "export"] as const;
type Stage = (typeof STAGES)[number];

const STAGE_LABEL: Record<Stage, string> = {
  spark: "Spark",
  expand: "Expand",
  narrow: "Narrow",
  shape: "Shape",
  checkpoint: "Checkpoint",
  export: "Export",
};

/** One line of honest expectation-setting per stage. Timebox the struggle. */
const STAGE_LINE: Record<Stage, string> = {
  spark: "Say the idea. Messy is correct.",
  expand: "See what else this could be before you commit. A few minutes.",
  narrow: "The hard part. About eight minutes. Also the only part that matters.",
  shape: "Your goal, your cut list, your milestones, your first 48 hours.",
  checkpoint: "Two questions before you start building.",
  export: "The plan, the pitch — and the thing we've been saving.",
};

export function ProjectView({
  projectId,
  studentId,
  onBack,
  onSwitchStudent,
}: {
  projectId: Id<"projects">;
  studentId: Id<"students">;
  onBack: () => void;
  onSwitchStudent: () => void;
}) {
  const project = useQuery(api.projects.get, { projectId });
  const setSpark = useMutation(api.projects.setSpark);
  const advance = useMutation(api.projects.advanceStage);
  const [sparkDraft, setSparkDraft] = useState("");
  const [advanceError, setAdvanceError] = useState<string | null>(null);

  if (!project) return <div className="shell" />;
  const stage = project.stage as Stage;
  const stageIdx = STAGES.indexOf(stage);

  // ── Spark capture: the whole screen, two clicks from the door. ──
  if (!project.sparkText) {
    return (
      <div className="shell-narrow fade-in">
        <div className="topbar">
          <button className="btn-quiet" onClick={onBack}>← your projects</button>
          <button className="who" onClick={onSwitchStudent}>switch</button>
        </div>
        <div className="hero">
          <h1>What do you want to make?</h1>
          <p>
            The version where you get everything you want, no limits, nobody
            telling you no. Say it messy — we'll deal with real life later.
          </p>
        </div>
        <textarea
          className="field"
          rows={4}
          autoFocus
          value={sparkDraft}
          placeholder="A game where… / An app that… / I want to figure out why…"
          onChange={(e) => setSparkDraft(e.target.value)}
        />
        <div style={{ marginTop: 14 }}>
          <button
            className="btn btn-primary"
            disabled={!sparkDraft.trim()}
            onClick={() => void setSpark({ projectId, text: sparkDraft })}
          >
            That's the idea
          </button>
        </div>
      </div>
    );
  }

  const tryAdvance = async () => {
    setAdvanceError(null);
    try {
      await advance({ projectId });
    } catch (e) {
      setAdvanceError(e instanceof Error ? e.message.replace(/^.*Uncaught Error: /, "") : "Not yet");
    }
  };

  return (
    <div className="shell fade-in">
      <div className="topbar">
        <button className="btn-quiet" onClick={onBack}>← your projects</button>
        <div className="wordmark" style={{ fontSize: 15 }}>
          Project <span className="studio">Studio</span>
        </div>
      </div>

      <div className="stage-rail">
        {STAGES.map((s, i) => (
          <span key={s} style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {i > 0 && <span className="stage-arrow">→</span>}
            <span className={`stage-chip ${i < stageIdx ? "past" : i === stageIdx ? "now" : ""}`}>
              {STAGE_LABEL[s]}
            </span>
          </span>
        ))}
      </div>

      <p className="note" style={{ marginBottom: 16 }}>{STAGE_LINE[stage]}</p>

      <div className="project-grid">
        <div>
          {stage === "expand" && <ExpandPanel projectId={projectId} chosenArchetypeId={project.archetypeId ?? null} />}
          {stage === "narrow" && <NarrowPanel projectId={projectId} sparkText={project.sparkText} />}
          {stage === "shape" && (
            <ShapePanel
              projectId={projectId}
              existing={{
                goal: project.goal ?? "",
                nonGoals: project.nonGoals ?? [],
                milestones: project.milestoneList.map((m) => m.text),
                m0: project.milestoneZero,
              }}
            />
          )}
          {stage === "checkpoint" && <CheckpointPanel projectId={projectId} m0={project.milestoneZero} />}
          {stage === "export" && (
            <ExportPanel projectId={projectId} studentId={studentId} project={project} />
          )}

          {project.threadId && (
            <Conversation threadId={project.threadId} projectId={projectId} />
          )}
        </div>

        <aside className="plan-panel">
          <PlanSoFar project={project} />
          {stage !== "export" && (
            <div style={{ marginTop: 18 }}>
              <button className="btn" onClick={() => void tryAdvance()}>
                {STAGE_LABEL[stage]} is done → {STAGE_LABEL[STAGES[stageIdx + 1] ?? "export"]}
              </button>
              {advanceError && (
                <p className="note" style={{ color: "var(--accent)", marginTop: 6 }}>{advanceError}</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/** The plan builds visibly, only ever in the student's words. */
function PlanSoFar({
  project,
}: {
  project: {
    sparkText?: string;
    goal?: string;
    nonGoals?: string[];
    knownRisk?: string;
    milestoneList: { _id: string; text: string; done: boolean }[];
    milestoneZero: { text: string; dueAt: number; status: string } | null;
    archetypeId?: string | null;
    planRevealed: boolean;
  };
}) {
  return (
    <div>
      <h2>Your plan, your words</h2>
      <div className="plan-slot">
        <div className="slot-name">the spark</div>
        <div>“{project.sparkText}”</div>
      </div>
      <div className="plan-slot">
        <div className="slot-name">goal</div>
        {project.goal ? <div>{project.goal}</div> : <div className="slot-empty">not written yet — that's fine</div>}
      </div>
      <div className="plan-slot">
        <div className="slot-name">not doing (on purpose)</div>
        {project.nonGoals && project.nonGoals.length > 0 ? (
          <ul>{project.nonGoals.map((n, i) => <li key={i}>{n}</li>)}</ul>
        ) : (
          <div className="slot-empty">the cut list lives here</div>
        )}
      </div>
      <div className="plan-slot">
        <div className="slot-name">milestones</div>
        {project.milestoneList.length > 0 ? (
          <ul>{project.milestoneList.map((m) => <li key={m._id}>{m.text}</li>)}</ul>
        ) : (
          <div className="slot-empty">3–5 steps, when you get there</div>
        )}
      </div>
      <div className="plan-slot">
        <div className="slot-name">milestone zero — the first 48 hours</div>
        {project.milestoneZero ? (
          <div className="m0-card">
            “{project.milestoneZero.text}”
            <div className="due">
              {project.milestoneZero.status === "done"
                ? "Done ✓"
                : `due ${new Date(project.milestoneZero.dueAt).toLocaleDateString(undefined, { weekday: "long" })}`}
            </div>
          </div>
        ) : (
          <div className="slot-empty">the thing you can do tonight</div>
        )}
      </div>
      {project.archetypeId && !project.planRevealed && (
        <div className="callout" style={{ fontSize: 13.5, fontFamily: "var(--sans)" }}>
          The library has plans from students who built this shape before you.
          You'll see all of it at Export — after yours exists. That's on
          purpose, and the coach will tell you why.
        </div>
      )}
    </div>
  );
}
