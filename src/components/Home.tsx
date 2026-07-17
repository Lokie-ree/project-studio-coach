import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const STAGE_LABEL: Record<string, string> = {
  spark: "Spark",
  expand: "Expand",
  narrow: "Narrow",
  shape: "Shape",
  checkpoint: "Checkpoint",
  export: "Export",
};

export function Home({
  studentId,
  studentName,
  onOpenProject,
  onSwitchStudent,
}: {
  studentId: Id<"students">;
  studentName: string;
  onOpenProject: (id: Id<"projects">) => void;
  onSwitchStudent: () => void;
}) {
  const projects = useQuery(api.projects.listByStudent, { studentId });
  const create = useMutation(api.projects.create);
  const [busy, setBusy] = useState(false);

  const newProject = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const id = await create({ studentId });
      onOpenProject(id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="shell-narrow fade-in">
      <div className="topbar">
        <div className="wordmark">
          Project <span className="studio">Studio</span>
        </div>
        <button className="who" onClick={onSwitchStudent}>
          not {studentName}?
        </button>
      </div>

      {projects === undefined ? null : projects.length === 0 ? (
        <div className="hero">
          <h1>What do you want to make?</h1>
          <p>
            You don't need a plan. You don't even need a clear idea — messy
            ones are the right ones to start with.
          </p>
          <div style={{ marginTop: 22 }}>
            <button className="btn btn-primary" onClick={() => void newProject()} disabled={busy}>
              Start something
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="hero" style={{ paddingBottom: 10 }}>
            <h1>Your projects</h1>
          </div>
          {projects.map((p) => (
            <button
              key={p._id}
              className="card"
              style={{ width: "100%", textAlign: "left", cursor: "pointer", display: "block" }}
              onClick={() => onOpenProject(p._id)}
            >
              <h3>{p.title ?? "New project"}</h3>
              <p className="note">
                {p.status === "completed"
                  ? "Finished ✓"
                  : `At ${STAGE_LABEL[p.stage]}${p.goal ? ` — "${p.goal}"` : ""}`}
              </p>
            </button>
          ))}
          <div style={{ marginTop: 14 }}>
            <button className="btn" onClick={() => void newProject()} disabled={busy}>
              Start another
            </button>
          </div>
        </>
      )}
    </div>
  );
}
