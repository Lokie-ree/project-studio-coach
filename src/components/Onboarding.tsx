import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/** The honest onboarding. Three truths, plain language, then one question. */
export function Onboarding({
  studentId,
  studentName,
  teacherName,
}: {
  studentId: Id<"students">;
  studentName: string;
  teacherName: string;
}) {
  const complete = useMutation(api.students.completeOnboarding);
  const [between, setBetween] = useState<boolean | null>(null);

  return (
    <div className="shell-narrow fade-in">
      <div className="hero">
        <h1>Hey, {studentName}. Three things before we start.</h1>
      </div>
      <div className="truth-list">
        <div className="card">
          <h3>Nothing here is graded.</h3>
          <p className="note">
            No rubric, no points, no report. You're here because you want to
            make something. That's the whole deal.
          </p>
        </div>
        <div className="card">
          <h3>Your reflections are yours.</h3>
          <p className="note">
            {teacherName} sees your <em>project</em> — what you're building and
            where you are. He never sees your notes and reflections unless you
            choose to share them.
          </p>
        </div>
        <div className="card">
          <h3>{teacherName} can leave the coach notes about how to work with you.</h3>
          <p className="note">
            Things like "slow down with her" or "he hates being cheered on."
            The coach reads them; it won't quote them. If you want to know
            what they say, ask {teacherName} — that's between you two.
          </p>
        </div>
      </div>

      <label className="lbl">One question: do you work on projects between club meetings?</label>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className={`btn ${between === true ? "btn-primary" : ""}`}
          onClick={() => setBetween(true)}
        >
          Yeah, at home too
        </button>
        <button
          className={`btn ${between === false ? "btn-primary" : ""}`}
          onClick={() => setBetween(false)}
        >
          Mostly just club time
        </button>
      </div>
      <div style={{ marginTop: 24 }}>
        <button
          className="btn btn-primary"
          disabled={between === null}
          onClick={() =>
            void complete({ studentId, worksBetweenMeetings: between ?? undefined })
          }
        >
          Got it — let's go
        </button>
      </div>
    </div>
  );
}
