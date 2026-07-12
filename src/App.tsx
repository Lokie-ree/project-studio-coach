import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { Join } from "./components/Join";
import { Onboarding } from "./components/Onboarding";
import { Home } from "./components/Home";
import { ProjectView } from "./components/ProjectView";
import { Teacher } from "./components/Teacher";

/**
 * Views: join → onboarding (the honest one) → home → project.
 * #/teacher is Mr. L's screen. Identity is the club sign-in sheet:
 * pick your name, it sticks in localStorage.
 */

function useHash(): string {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const [studentId, setStudentId] = useState<Id<"students"> | null>(
    () => (localStorage.getItem("studentId") as Id<"students"> | null) ?? null,
  );
  const [projectId, setProjectId] = useState<Id<"projects"> | null>(null);

  const student = useQuery(
    api.students.get,
    studentId ? { studentId } : "skip",
  );

  if (hash.startsWith("#/teacher")) return <Teacher />;

  if (!studentId) {
    return (
      <Join
        onJoined={(id) => {
          localStorage.setItem("studentId", id);
          setStudentId(id);
        }}
      />
    );
  }
  if (student === undefined) return <div className="shell-narrow" />;
  if (student === null) {
    // Stale localStorage (e.g. reseeded DB) — back to join.
    localStorage.removeItem("studentId");
    setStudentId(null);
    return null;
  }

  if (!student.onboarded) {
    return <Onboarding studentId={studentId} studentName={student.name} teacherName={student.teacherName} />;
  }

  if (projectId) {
    return (
      <ProjectView
        projectId={projectId}
        studentId={studentId}
        onBack={() => setProjectId(null)}
        onSwitchStudent={() => {
          localStorage.removeItem("studentId");
          setStudentId(null);
          setProjectId(null);
        }}
      />
    );
  }

  return (
    <Home
      studentId={studentId}
      studentName={student.name}
      onOpenProject={setProjectId}
      onSwitchStudent={() => {
        localStorage.removeItem("studentId");
        setStudentId(null);
      }}
    />
  );
}
