import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function Join({ onJoined }: { onJoined: (id: Id<"students">) => void }) {
  const join = useMutation(api.students.join);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const go = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const id = await join({ name });
      onJoined(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  };

  return (
    <div className="shell-narrow">
      <div className="hero">
        <h1>
          Project <span style={{ color: "var(--accent)" }}>Studio</span>
        </h1>
        <p>
          You've got an idea — or you will. This is where it turns into
          something you can actually finish.
        </p>
      </div>
      <label className="lbl" htmlFor="name">
        Your name (like the sign-in sheet)
      </label>
      <input
        id="name"
        className="field"
        value={name}
        placeholder="First name is fine"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && void go()}
      />
      {error && <p className="note" style={{ color: "var(--accent)", marginTop: 8 }}>{error}</p>}
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={() => void go()} disabled={!name.trim() || busy}>
          Come on in
        </button>
      </div>
    </div>
  );
}
