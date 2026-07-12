import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Backstop for the per-commitment 48h scheduler jobs.
crons.daily(
  "milestone zero check-in sweep",
  { hourUTC: 15, minuteUTC: 0 },
  internal.checkIns.sweepOverdueCheckIns,
  {},
);

export default crons;
