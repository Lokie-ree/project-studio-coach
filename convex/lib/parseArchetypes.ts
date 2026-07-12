/**
 * Parser for project-archetypes.md — the founding library.
 *
 * The seed PARSES the markdown rather than hand-transcribing it, so the
 * markdown stays the single source of truth. Fields genuinely absent from the
 * markdown (glyph) are left null — never invented. Pure module: no Convex
 * imports, unit-testable under plain Node.
 */

export type ParsedArchetype = {
  number: number;
  name: string;
  description: string;
  timeEstimate: string;
  difficulty:
    | "beginner"
    | "beginner-intermediate"
    | "intermediate"
    | "intermediate-advanced"
    | "advanced";
  difficultyRaw: string;
  skills: string[];
  hazards: string[];
  remixPrompt: string | null;
  // The withheld-by-default plan fields. Withheld from students at runtime,
  // not from the seed.
  goal: string | null;
  nonGoals: string[] | null;
  milestones: string[] | null;
  m0: string | null;
};

const FIELD_RE = /^-\s+\*\*(.+?):\*\*\s*(.*)$/;

function normalizeDifficulty(raw: string): ParsedArchetype["difficulty"] {
  const s = raw.toLowerCase();
  const hasBeginner = s.includes("beginner");
  const hasIntermediate = s.includes("intermediate");
  const hasAdvanced = s.includes("advanced");
  if (hasIntermediate && hasAdvanced) return "intermediate-advanced";
  if (hasBeginner && hasIntermediate) return "beginner-intermediate";
  if (hasAdvanced) return "advanced";
  if (hasIntermediate) return "intermediate";
  if (hasBeginner) return "beginner";
  throw new Error(`Unrecognized difficulty: "${raw}"`);
}

function stripQuotes(s: string): string {
  return s.replace(/^["“]/, "").replace(/["”]$/, "").trim();
}

/** "M1 do x; M2 do y" → ["do x", "do y"] (order preserved). */
function splitMilestones(raw: string): string[] {
  return raw
    .split(";")
    .map((m) => m.trim().replace(/^M\d+\s+/, ""))
    .filter(Boolean);
}

function splitList(raw: string): string[] {
  return raw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseArchetypes(markdown: string): ParsedArchetype[] {
  const lines = markdown.split(/\r?\n/);
  const archetypes: ParsedArchetype[] = [];
  let current: Partial<ParsedArchetype> & { descLines: string[] } = {
    descLines: [],
  };
  let inArchetype = false;

  const flush = () => {
    if (!inArchetype) return;
    const a = current;
    const required = ["number", "name", "timeEstimate", "difficultyRaw"];
    for (const f of required) {
      if ((a as Record<string, unknown>)[f] === undefined) {
        throw new Error(
          `Archetype "${a.name ?? "?"}" missing required field: ${f}`,
        );
      }
    }
    archetypes.push({
      number: a.number!,
      name: a.name!,
      description: a.descLines.join(" ").trim(),
      timeEstimate: a.timeEstimate!,
      difficulty: normalizeDifficulty(a.difficultyRaw!),
      difficultyRaw: a.difficultyRaw!,
      skills: a.skills ?? [],
      hazards: a.hazards ?? [],
      remixPrompt: a.remixPrompt ?? null,
      goal: a.goal ?? null,
      nonGoals: a.nonGoals ?? null,
      milestones: a.milestones ?? null,
      m0: a.m0 ?? null,
    });
    current = { descLines: [] };
    inArchetype = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    const header = line.match(/^##\s+(\d+)\.\s+(.+)$/);
    if (header) {
      flush();
      inArchetype = true;
      current.number = parseInt(header[1], 10);
      current.name = header[2].trim();
      continue;
    }
    // Any other ## section (Quick Reference etc.) ends archetype parsing.
    if (/^##\s+/.test(line)) {
      flush();
      continue;
    }
    if (!inArchetype) continue;

    const field = line.match(FIELD_RE);
    if (field) {
      const key = field[1].trim().toLowerCase();
      const value = field[2].trim();
      switch (key) {
        case "time":
          current.timeEstimate = value;
          break;
        case "difficulty":
          current.difficultyRaw = value;
          break;
        case "skills":
          current.skills = value ? [value] : [];
          break;
        case "hazards":
          current.hazards =
            value.toLowerCase().startsWith("none") ? [] : splitList(value);
          break;
        case "goal":
          current.goal = value;
          break;
        case "non-goals":
          current.nonGoals = splitList(value);
          break;
        case "milestones":
          current.milestones = splitMilestones(value);
          break;
        case "m0":
          current.m0 = stripQuotes(value);
          break;
        case "remix prompt":
          current.remixPrompt = stripQuotes(value);
          break;
        default:
          throw new Error(
            `Unknown field "${field[1]}" in archetype "${current.name}"`,
          );
      }
      continue;
    }

    // Plain text after the header, before the field list = description.
    if (line && !line.startsWith("---") && current.timeEstimate === undefined) {
      current.descLines.push(line.trim());
    }
  }
  flush();

  return archetypes;
}
