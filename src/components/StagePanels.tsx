import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/* ── EXPAND: the menu is bigger than you think ─────────────────────────── */

export function ExpandPanel({
  projectId,
  chosenArchetypeId,
}: {
  projectId: Id<"projects">;
  chosenArchetypeId: string | null;
}) {
  const archetypes = useQuery(api.archetypes.search, { limit: 24 });
  const choose = useMutation(api.projects.chooseArchetype);
  const [rejected, setRejected] = useState("");
  const [savedNote, setSavedNote] = useState(false);

  if (!archetypes) return null;
  return (
    <div className="card">
      <h3>Shapes other people your age have pulled off</h3>
      <p className="note">
        Pick one that's close to your idea — or close to interesting. Picking
        one doesn't shrink your idea; it gives it company. Keeping your own
        shape is also allowed.
      </p>
      <div className="arch-grid">
        {archetypes.map((a) => (
          <button
            key={a.archetypeId}
            className={`arch-card ${chosenArchetypeId === a.archetypeId ? "picked" : ""}`}
            onClick={() =>
              void choose({
                projectId,
                archetypeId: a.archetypeId as Id<"archetypes">,
              })
            }
          >
            <div className="an">{a.name}</div>
            <div className="ad">{a.description}</div>
            <div className="am">
              {a.timeEstimate} · {a.difficulty}
            </div>
          </button>
        ))}
      </div>
      <button
        className="btn-quiet"
        onClick={() => void choose({ projectId, archetypeId: undefined })}
      >
        none of these — mine's its own thing
      </button>

      <label className="lbl">
        Anything here you almost picked, but didn't? What ruled it out?
      </label>
      <textarea
        className="field"
        rows={2}
        value={rejected}
        placeholder="e.g. almost did the map thing, but I care more about the story than the places"
        onChange={(e) => {
          setRejected(e.target.value);
          setSavedNote(false);
        }}
      />
      <div style={{ marginTop: 8 }}>
        <button
          className="btn"
          disabled={!rejected.trim() || savedNote}
          onClick={async () => {
            await choose({
              projectId,
              archetypeId: (chosenArchetypeId as Id<"archetypes">) ?? undefined,
              consideredAndRejected: rejected,
            });
            setSavedNote(true);
          }}
        >
          {savedNote ? "Noted ✓" : "Keep that thought"}
        </button>
      </div>
    </div>
  );
}

/* ── NARROW: the before and the after, in their words ──────────────────── */

export function NarrowPanel({
  projectId,
  sparkText,
}: {
  projectId: Id<"projects">;
  sparkText: string;
}) {
  const save = useMutation(api.projects.saveScopeRewrite);
  const [before, setBefore] = useState(sparkText);
  const [after, setAfter] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="card">
      <h3>The cut</h3>
      <p className="note">
        Talk it through with the coach below, then write both versions here.
        The big one isn't wrong — it's just not first.
      </p>
      <label className="lbl">The big version (where you started)</label>
      <textarea
        className="field"
        rows={2}
        value={before}
        onChange={(e) => setBefore(e.target.value)}
      />
      <label className="lbl">The version you'd actually be proud to show someone</label>
      <textarea
        className="field"
        rows={2}
        value={after}
        placeholder="Smaller. Sharper. Still yours."
        onChange={(e) => {
          setAfter(e.target.value);
          setSaved(false);
        }}
      />
      <div style={{ marginTop: 10 }}>
        <button
          className="btn btn-primary"
          disabled={!before.trim() || !after.trim() || saved}
          onClick={async () => {
            await save({ projectId, before, after });
            setSaved(true);
          }}
        >
          {saved ? "Saved ✓" : "That's the cut"}
        </button>
      </div>
    </div>
  );
}

/* ── SHAPE: goal, non-goals, milestones, Milestone Zero ────────────────── */

export function ShapePanel({
  projectId,
  existing,
}: {
  projectId: Id<"projects">;
  existing: {
    goal: string;
    nonGoals: string[];
    milestones: string[];
    m0: { text: string } | null;
  };
}) {
  const saveShape = useMutation(api.projects.saveShape);
  const commitM0 = useMutation(api.checkIns.commitMilestoneZero);
  const [goal, setGoal] = useState(existing.goal);
  const [nonGoals, setNonGoals] = useState<string[]>(
    existing.nonGoals.length > 0 ? existing.nonGoals : ["", "", ""],
  );
  const [milestones, setMilestones] = useState<string[]>(
    existing.milestones.length > 0 ? existing.milestones : ["", "", ""],
  );
  const [m0Text, setM0Text] = useState(existing.m0?.text ?? "");
  const [hours, setHours] = useState(48);
  const [shapeSaved, setShapeSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAt = (arr: string[], i: number, v: string, set: (a: string[]) => void) => {
    const next = [...arr];
    next[i] = v;
    set(next);
  };

  return (
    <div className="card">
      <h3>Your plan — written by you, not for you</h3>

      <label className="lbl">The goal, one sentence</label>
      <textarea
        className="field"
        rows={2}
        value={goal}
        placeholder="Someone plays/reads/uses it and…"
        onChange={(e) => {
          setGoal(e.target.value);
          setShapeSaved(false);
        }}
      />

      <label className="lbl">Not doing — say it out loud (2–3 things)</label>
      {nonGoals.map((n, i) => (
        <input
          key={i}
          className="field"
          style={{ marginBottom: 6 }}
          value={n}
          placeholder={i === 0 ? "This project will NOT include…" : ""}
          onChange={(e) => {
            setAt(nonGoals, i, e.target.value, setNonGoals);
            setShapeSaved(false);
          }}
        />
      ))}

      <label className="lbl">Milestones (3–5 steps)</label>
      {milestones.map((m, i) => (
        <input
          key={i}
          className="field"
          style={{ marginBottom: 6 }}
          value={m}
          placeholder={`${i + 1}.`}
          onChange={(e) => {
            setAt(milestones, i, e.target.value, setMilestones);
            setShapeSaved(false);
          }}
        />
      ))}
      {milestones.length < 5 && (
        <button className="btn-quiet" onClick={() => setMilestones([...milestones, ""])}>
          + one more
        </button>
      )}

      <div style={{ marginTop: 12 }}>
        <button
          className="btn"
          disabled={!goal.trim() || shapeSaved}
          onClick={async () => {
            await saveShape({ projectId, goal, nonGoals, milestones });
            setShapeSaved(true);
          }}
        >
          {shapeSaved ? "Plan saved ✓" : "Save the plan"}
        </button>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "20px 0" }} />

      <h3>Milestone Zero — the first 48 hours</h3>
      <p className="note">
        Not the project. The proof the project is real. It should feel almost
        like cheating — under two hours, something you can look at when it's
        done.
      </p>
      <div className="m0-formula">
        By [day after tomorrow], I will have [specific thing] so that I can
        [what it unlocks].
      </div>
      {existing.m0 ? (
        <div className="callout green">Committed: “{existing.m0.text}”</div>
      ) : (
        <>
          <textarea
            className="field"
            rows={2}
            value={m0Text}
            placeholder="By Thursday, I will have…"
            onChange={(e) => setM0Text(e.target.value)}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            <select
              className="field"
              style={{ width: "auto" }}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            >
              <option value={24}>by tomorrow</option>
              <option value={48}>within 48 hours</option>
              <option value={72}>by the day after next</option>
            </select>
            <button
              className="btn btn-primary"
              disabled={!m0Text.trim()}
              onClick={async () => {
                setError(null);
                try {
                  await commitM0({ projectId, text: m0Text, hoursUntilDue: hours });
                } catch (e) {
                  setError(e instanceof Error ? e.message.replace(/^.*Uncaught Error: /, "") : "Try again");
                }
              }}
            >
              Commit — I'm doing this
            </button>
          </div>
          {error && <p className="note" style={{ color: "var(--accent)", marginTop: 6 }}>{error}</p>}
        </>
      )}
    </div>
  );
}

/* ── CHECKPOINT: two questions ──────────────────────────────────────────── */

export function CheckpointPanel({
  projectId,
  m0,
}: {
  projectId: Id<"projects">;
  m0: { text: string; status: string; _id: Id<"milestoneZeros"> } | null;
}) {
  const save = useMutation(api.projects.saveCheckpoint);
  const resolve = useMutation(api.checkIns.resolveMilestoneZero);
  const [risk, setRisk] = useState("");
  const [stuck, setStuck] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="card">
      <h3>Before you build</h3>
      {m0 && m0.status === "committed" && (
        <div className="callout" style={{ fontFamily: "var(--sans)", fontSize: 14 }}>
          Still on the hook: “{m0.text}”
          <div style={{ marginTop: 8 }}>
            <button
              className="btn"
              onClick={() => void resolve({ milestoneZeroId: m0._id, outcome: "done" })}
            >
              Did it ✓
            </button>
          </div>
        </div>
      )}
      <label className="lbl">What's one thing that could go wrong?</label>
      <textarea
        className="field"
        rows={2}
        value={risk}
        placeholder="The honest one, not the impressive one"
        onChange={(e) => {
          setRisk(e.target.value);
          setSaved(false);
        }}
      />
      <label className="lbl">Anything you're stuck on right now? (fine to leave blank)</label>
      <textarea
        className="field"
        rows={2}
        value={stuck}
        onChange={(e) => {
          setStuck(e.target.value);
          setSaved(false);
        }}
      />
      <div style={{ marginTop: 10 }}>
        <button
          className="btn btn-primary"
          disabled={!risk.trim() || saved}
          onClick={async () => {
            await save({ projectId, knownRisk: risk, stuckOn: stuck || undefined });
            setSaved(true);
          }}
        >
          {saved ? "Saved ✓" : "That's my answer"}
        </button>
      </div>
    </div>
  );
}

/* ── EXPORT: the summary, the pitch, the earned reveal ─────────────────── */

export function ExportPanel({
  projectId,
  studentId,
  project,
}: {
  projectId: Id<"projects">;
  studentId: Id<"students">;
  project: {
    title?: string;
    sparkText?: string;
    goal?: string;
    nonGoals?: string[];
    knownRisk?: string;
    pitch?: string;
    planRevealed: boolean;
    archetypeId?: Id<"archetypes"> | null;
    status: string;
    milestoneList: { _id: string; text: string }[];
    milestoneZero: { text: string } | null;
  };
}) {
  const savePitch = useMutation(api.projects.savePitch);
  const reveal = useMutation(api.projects.revealPlan);
  const saveComparison = useMutation(api.projects.saveRevealComparison);
  const complete = useMutation(api.projects.completeProject);
  const revealed = useQuery(api.archetypes.revealedPlan, { projectId });
  const evidence = useQuery(api.projects.myEvidence, { studentId, projectId });

  const [pitch, setPitch] = useState(project.pitch ?? "");
  const [pitchSaved, setPitchSaved] = useState(Boolean(project.pitch));
  const [comparison, setComparison] = useState("");
  const [comparisonSaved, setComparisonSaved] = useState(false);

  return (
    <>
      <div className="card">
        <h3>The summary — all your words</h3>
        <div className="plan-slot" style={{ marginTop: 10 }}>
          <div className="slot-name">goal</div>
          <div>{project.goal ?? "—"}</div>
        </div>
        <div className="plan-slot">
          <div className="slot-name">not doing</div>
          <ul>{(project.nonGoals ?? []).map((n, i) => <li key={i}>{n}</li>)}</ul>
        </div>
        <div className="plan-slot">
          <div className="slot-name">milestones</div>
          <ul>{project.milestoneList.map((m) => <li key={m._id}>{m.text}</li>)}</ul>
        </div>
        <div className="plan-slot">
          <div className="slot-name">milestone zero</div>
          <div>{project.milestoneZero?.text ?? "—"}</div>
        </div>
        <div className="plan-slot">
          <div className="slot-name">one known risk</div>
          <div>{project.knownRisk ?? "—"}</div>
        </div>
        <button
          className="btn"
          onClick={() => {
            const text = [
              project.title ?? "My project",
              "",
              `Goal: ${project.goal ?? ""}`,
              `Not doing: ${(project.nonGoals ?? []).join("; ")}`,
              `Milestones: ${project.milestoneList.map((m) => m.text).join(" → ")}`,
              `Milestone Zero: ${project.milestoneZero?.text ?? ""}`,
              `Known risk: ${project.knownRisk ?? ""}`,
              pitch ? `\nThe pitch: ${pitch}` : "",
            ].join("\n");
            void navigator.clipboard.writeText(text);
          }}
        >
          Copy it
        </button>
      </div>

      <div className="card">
        <h3>The ninety-second pitch</h3>
        <p className="note">
          Club day. The other kids are looking at your thing. What do you say?
        </p>
        <textarea
          className="field"
          rows={3}
          value={pitch}
          placeholder="So basically…"
          onChange={(e) => {
            setPitch(e.target.value);
            setPitchSaved(false);
          }}
        />
        <div style={{ marginTop: 8 }}>
          <button
            className="btn"
            disabled={!pitch.trim() || pitchSaved}
            onClick={async () => {
              await savePitch({ projectId, pitch });
              setPitchSaved(true);
            }}
          >
            {pitchSaved ? "Saved ✓" : "That's the pitch"}
          </button>
        </div>
      </div>

      {project.archetypeId && (
        <div className="card">
          <h3>The thing we've been saving</h3>
          {!project.planRevealed ? (
            <>
              <p className="note">
                Students built this shape before you. Their plans have been in
                the library the whole time — held back on purpose, because if
                you'd seen them first, yours would've been theirs. Yours exists
                now. Want to compare?
              </p>
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-primary" onClick={() => void reveal({ projectId })}>
                  Open the library
                </button>
              </div>
            </>
          ) : revealed ? (
            <>
              <div className="compare-grid" style={{ marginTop: 10 }}>
                <div className="compare-col yours">
                  <h4>Yours</h4>
                  <p><strong>Goal:</strong> {project.goal ?? "—"}</p>
                  <p><strong>Not doing:</strong> {(project.nonGoals ?? []).join("; ") || "—"}</p>
                  <p><strong>M0:</strong> {project.milestoneZero?.text ?? "—"}</p>
                </div>
                <div className="compare-col theirs">
                  <h4>The library's ({revealed.name})</h4>
                  <p><strong>Goal:</strong> {revealed.goal ?? "—"}</p>
                  <p><strong>Not doing:</strong> {(revealed.nonGoals ?? []).join("; ") || "—"}</p>
                  <p><strong>M0:</strong> {revealed.m0 ?? "—"}</p>
                </div>
              </div>
              <label className="lbl">Where is yours different — and where is it different on purpose?</label>
              <textarea
                className="field"
                rows={2}
                value={comparison}
                onChange={(e) => {
                  setComparison(e.target.value);
                  setComparisonSaved(false);
                }}
              />
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn"
                  disabled={!comparison.trim() || comparisonSaved}
                  onClick={async () => {
                    await saveComparison({ projectId, comparison });
                    setComparisonSaved(true);
                  }}
                >
                  {comparisonSaved ? "Kept ✓" : "Keep that"}
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}

      {evidence && evidence.length > 0 && (
        <div className="card">
          <h3>What you did here, in your words</h3>
          <p className="note">
            This is yours. Mr. L doesn't see it. It's the trail of how a vague
            idea became a plan — the skill this whole thing was secretly about.
          </p>
          {evidence.map((e) => (
            <div key={e._id} className="plan-slot" style={{ marginTop: 10 }}>
              <div className="slot-name">
                {e.stage} · {e.roleId.replace("_", " ")} {e.skillCode}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>“{e.studentWords}”</div>
            </div>
          ))}
        </div>
      )}

      {project.status !== "completed" && (
        <div className="card">
          <h3>Done here?</h3>
          <p className="note">
            Finishing sends your project's fingerprints — the real cut you
            made, the hazard you hit, how long it actually took — to Mr. L to
            review. If he approves, the next kid who builds this shape inherits
            what you learned. Your reflections stay yours; they don't go.
          </p>
          <div style={{ marginTop: 8 }}>
            <button className="btn btn-primary" onClick={() => void complete({ projectId })}>
              Finish the project
            </button>
          </div>
        </div>
      )}
      {project.status === "completed" && (
        <div className="callout green">
          Finished. What you learned is in Mr. L's review pile — approved bits
          become part of the library the next student starts from.
        </div>
      )}
    </>
  );
}
