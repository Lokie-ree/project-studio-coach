/**
 * Playtest CLI — drives the deployed app the way the UI does, for scripted
 * persona runs. Usage:
 *
 *   node scripts/playtest-cli.mjs new <studentName>          → {studentId, projectId}
 *   node scripts/playtest-cli.mjs spark <projectId> <text>    → coach reply
 *   node scripts/playtest-cli.mjs say <projectId> <text>      → coach reply
 *   node scripts/playtest-cli.mjs menu                        → archetype menu (public fields)
 *   node scripts/playtest-cli.mjs choose <projectId> <archetypeId|none> [rejectedNote]
 *   node scripts/playtest-cli.mjs rewrite <projectId> <before> <after>
 *   node scripts/playtest-cli.mjs shape <projectId> <goal> <nonGoal;nonGoal> <m1;m2;m3>
 *   node scripts/playtest-cli.mjs m0 <projectId> <text> [hours]
 *   node scripts/playtest-cli.mjs checkpoint <projectId> <risk> [stuckOn]
 *   node scripts/playtest-cli.mjs pitch <projectId> <text>
 *   node scripts/playtest-cli.mjs advance <projectId>
 *   node scripts/playtest-cli.mjs reveal <projectId>
 *   node scripts/playtest-cli.mjs complete <projectId>
 *   node scripts/playtest-cli.mjs state <projectId>           → stage + plan so far
 *   node scripts/playtest-cli.mjs transcript <projectId>      → full thread
 */
import { ConvexHttpClient } from "convex/browser";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = readFileSync(join(root, ".env.local"), "utf8");
const url = env.match(/^CONVEX_URL=(.+)$/m)?.[1]?.trim();
if (!url) throw new Error("CONVEX_URL not found in .env.local");
const client = new ConvexHttpClient(url);

const q = (name, args) => client.query(name, args);
const m = (name, args) => client.mutation(name, args);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getThreadId(projectId) {
  const p = await q("projects:get", { projectId });
  if (!p?.threadId) throw new Error("no thread");
  return p.threadId;
}

async function lastAssistant(threadId) {
  const r = await q("coach:listThreadMessages", {
    threadId,
    paginationOpts: { numItems: 50, cursor: null },
    streamArgs: { kind: "list" },
  });
  const msgs = (r.page ?? []).filter((x) => x.role === "assistant");
  return { count: msgs.length, text: msgs[msgs.length - 1]?.text ?? "" };
}

/** Wait until a NEW assistant reply exists and has stopped growing. */
async function awaitReply(threadId, prevCount) {
  let stable = "";
  for (let i = 0; i < 40; i++) {
    await sleep(3000);
    const { count, text } = await lastAssistant(threadId);
    if (count > prevCount && text.length > 0) {
      if (text === stable) return text; // unchanged across two polls → done
      stable = text;
    }
  }
  return stable || "(no reply after 120s)";
}

const [, , cmd, ...rest] = process.argv;
const out = (x) => console.log(typeof x === "string" ? x : JSON.stringify(x, null, 1));

switch (cmd) {
  case "new": {
    const studentId = await m("students:join", { name: rest[0] });
    await m("students:completeOnboarding", { studentId, worksBetweenMeetings: rest[1] === "between" });
    const projectId = await m("projects:create", { studentId });
    out({ studentId, projectId });
    break;
  }
  case "spark": {
    const [projectId, text] = rest;
    const threadId = await getThreadId(projectId);
    const { count } = await lastAssistant(threadId);
    await m("projects:setSpark", { projectId, text });
    out(await awaitReply(threadId, count));
    break;
  }
  case "say": {
    const [projectId, text] = rest;
    const threadId = await getThreadId(projectId);
    const { count } = await lastAssistant(threadId);
    await m("coach:sendMessage", { projectId, prompt: text });
    out(await awaitReply(threadId, count));
    break;
  }
  case "menu":
    out(await q("archetypes:search", { limit: 24 }));
    break;
  case "choose": {
    const [projectId, archetypeId, rejectedNote] = rest;
    await m("projects:chooseArchetype", {
      projectId,
      archetypeId: archetypeId === "none" ? undefined : archetypeId,
      consideredAndRejected: rejectedNote || undefined,
    });
    out("chosen");
    break;
  }
  case "rewrite":
    await m("projects:saveScopeRewrite", { projectId: rest[0], before: rest[1], after: rest[2] });
    out("saved");
    break;
  case "shape":
    await m("projects:saveShape", {
      projectId: rest[0],
      goal: rest[1],
      nonGoals: rest[2].split(";"),
      milestones: rest[3].split(";"),
    });
    out("saved");
    break;
  case "m0":
    await m("checkIns:commitMilestoneZero", {
      projectId: rest[0],
      text: rest[1],
      hoursUntilDue: Number(rest[2] ?? 48),
    });
    out("committed");
    break;
  case "checkpoint":
    await m("projects:saveCheckpoint", { projectId: rest[0], knownRisk: rest[1], stuckOn: rest[2] || undefined });
    out("saved");
    break;
  case "pitch":
    await m("projects:savePitch", { projectId: rest[0], pitch: rest[1] });
    out("saved");
    break;
  case "advance":
    out(await m("projects:advanceStage", { projectId: rest[0] }));
    break;
  case "reveal":
    out(await m("projects:revealPlan", { projectId: rest[0] }));
    break;
  case "complete":
    await m("projects:completeProject", { projectId: rest[0] });
    out("completed");
    break;
  case "state": {
    const p = await q("projects:get", { projectId: rest[0] });
    out({
      stage: p.stage, status: p.status, sparkText: p.sparkText, goal: p.goal,
      nonGoals: p.nonGoals, knownRisk: p.knownRisk, pitch: p.pitch,
      milestones: p.milestoneList.map((x) => x.text),
      m0: p.milestoneZero ? { text: p.milestoneZero.text, status: p.milestoneZero.status } : null,
      planRevealed: p.planRevealed,
    });
    break;
  }
  case "transcript": {
    const threadId = await getThreadId(rest[0]);
    const r = await q("coach:listThreadMessages", {
      threadId,
      paginationOpts: { numItems: 200, cursor: null },
      streamArgs: { kind: "list" },
    });
    for (const msg of r.page ?? []) {
      if (!msg.text) continue;
      console.log(`\n### ${msg.role === "assistant" ? "COACH" : "STUDENT"}\n${msg.text}`);
    }
    break;
  }
  default:
    throw new Error(`unknown command: ${cmd}`);
}
