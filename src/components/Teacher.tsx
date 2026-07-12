import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Mr. L's screen. One page: stall flags, review queue, roster + notes,
 * defection log. Sees projects and signals — never student reflections.
 */
export function Teacher() {
  const teacher = useQuery(api.teachers.getTeacher);
  const flags = useQuery(api.teachers.openStallFlags);
  const reviews = useQuery(api.teachers.pendingReviews);
  const roster = useQuery(api.teachers.roster);
  const defections = useQuery(api.teachers.defectionLog);

  if (!teacher) return <div className="shell" />;
  return (
    <div className="shell fade-in">
      <div className="topbar">
        <div className="wordmark">
          Project <span className="studio">Studio</span> — {teacher.name}
        </div>
        <a className="who" href="#/" style={{ textDecoration: "none" }}>
          student view →
        </a>
      </div>

      <section className="teacher-section">
        <h2>Who needs you {flags && flags.length > 0 ? <span className="badge hot">{flags.length}</span> : null}</h2>
        <p className="note">
          Ambient signals from the coach — a student stuck long enough that a
          human should notice. No transcripts, by design.
        </p>
        {flags && flags.length === 0 && <p className="note">Nobody's flagged right now.</p>}
        {flags?.map((f) => (
          <StallFlagRow key={f._id} flag={f} />
        ))}
      </section>

      <section className="teacher-section">
        <h2>
          Review queue {reviews && reviews.length > 0 ? <span className="badge hot">{reviews.length}</span> : null}
        </h2>
        <p className="note">
          What finished projects want to give back to the library. Nothing
          enters unapproved — an unapproved write-back makes one student's
          project canon for the next thirty. Edit freely before approving.
        </p>
        {reviews && reviews.length === 0 && <p className="note">Queue's empty.</p>}
        {reviews?.map((r) => (
          <ReviewRow key={r._id} item={r} />
        ))}
      </section>

      <section className="teacher-section">
        <h2>The club</h2>
        <p className="note">
          Notes shape how the coach talks to each student — tone and pacing
          only. The coach never quotes them, and students know the channel
          exists.
        </p>
        <table className="roster">
          <thead>
            <tr>
              <th style={{ width: "18%" }}>Student</th>
              <th style={{ width: "40%" }}>Projects</th>
              <th>Your note to the coach</th>
            </tr>
          </thead>
          <tbody>
            {roster?.map((row) => (
              <RosterRow key={row.student._id} row={row} teacherId={teacher._id} />
            ))}
          </tbody>
        </table>
      </section>

      <section className="teacher-section">
        <h2>Defections {defections && defections.length > 0 ? <span className="badge">{defections.length}</span> : null}</h2>
        <p className="note">
          Students who asked the coach to just write the plan. Not misbehavior
          — the most useful signal we have about where the process is too
          hard, too slow, or not worth it to them.
        </p>
        {defections && defections.length === 0 && <p className="note">None yet.</p>}
        {defections?.map((d) => (
          <div className="card" key={d._id}>
            <div className="review-item">
              <div className="meta">
                {d.studentName} · at {d.stage} · {d.honored ? "coach wrote it (after the warning)" : "stayed the course"}
              </div>
              <div>“{d.request}”</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function StallFlagRow({
  flag,
}: {
  flag: { _id: Id<"stallFlags">; studentName: string; stage: string; minutes: number };
}) {
  const resolve = useMutation(api.teachers.resolveStallFlag);
  return (
    <div className="card">
      <div className="review-item">
        <div>
          <strong>{flag.studentName}</strong> — stuck at {flag.stage} for ~{flag.minutes} min
        </div>
        <div className="review-actions">
          <button className="btn" onClick={() => void resolve({ stallFlagId: flag._id })}>
            I've got them ✓
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({
  item,
}: {
  item: {
    _id: Id<"reviewQueue">;
    type: string;
    contributionKind?: string;
    studentName: string;
    projectTitle: string;
    archetypeName: string | null;
    payload: unknown;
  };
}) {
  const review = useMutation(api.teachers.review);
  const [comment, setComment] = useState("");
  const payload = item.payload as Record<string, unknown>;

  const label =
    item.type === "newArchetype"
      ? "proposed NEW archetype"
      : `${item.contributionKind} → ${item.archetypeName}`;

  return (
    <div className="card">
      <div className="review-item">
        <div className="meta">
          {item.studentName} · “{item.projectTitle}” · <span className="badge">{label}</span>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 13.5, whiteSpace: "pre-wrap", background: "var(--paper-sunken)", padding: "10px 12px", borderRadius: 8 }}>
          {JSON.stringify(payload, null, 2)}
        </div>
        <div className="review-actions">
          <input
            className="field"
            style={{ flex: 1, padding: "7px 10px", fontSize: 14 }}
            placeholder="optional comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={() =>
              void review({ reviewId: item._id, verdict: "approved", teacherComment: comment || undefined })
            }
          >
            Approve
          </button>
          <button
            className="btn"
            onClick={() =>
              void review({ reviewId: item._id, verdict: "rejected", teacherComment: comment || undefined })
            }
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function RosterRow({
  row,
  teacherId,
}: {
  row: {
    student: { _id: Id<"students">; name: string };
    note: string;
    projects: { projectId: string; title: string; stage: string; status: string }[];
  };
  teacherId: Id<"teachers">;
}) {
  const saveNote = useMutation(api.teachers.saveNote);
  const [note, setNote] = useState(row.note);
  const [saved, setSaved] = useState(true);

  return (
    <tr>
      <td><strong>{row.student.name}</strong></td>
      <td>
        {row.projects.length === 0 && <span className="note">nothing yet</span>}
        {row.projects.map((p) => (
          <div key={p.projectId} className="note" style={{ marginBottom: 4 }}>
            “{p.title}” — {p.status === "completed" ? "finished ✓" : `at ${p.stage}`}
          </div>
        ))}
      </td>
      <td>
        <textarea
          className="field"
          rows={2}
          style={{ fontSize: 14.5 }}
          value={note}
          placeholder="e.g. slow to trust praise; let her drive"
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
          }}
        />
        {!saved && (
          <button
            className="btn"
            style={{ marginTop: 6 }}
            onClick={async () => {
              await saveNote({ teacherId, studentId: row.student._id, text: note });
              setSaved(true);
            }}
          >
            Save note
          </button>
        )}
      </td>
    </tr>
  );
}
