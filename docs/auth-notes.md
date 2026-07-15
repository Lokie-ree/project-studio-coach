# Auth — stashed decisions and research (2026-07-14)

Status: **deliberately deferred.** The prototype runs on sign-in-sheet
identity (pick your name, localStorage) with an unauthenticated teacher
route — acceptable for a trusted club room, documented in the README. Revisit
before any use beyond that room.

## Decisions already made (don't re-litigate without reason)

- **Scope:** everyone signs in — students and Mr. L. Not teacher-only.
- **Method:** Google OAuth — students have school Google accounts.
- **Component:** Option A, `@convex-dev/better-auth` (identity stays inside
  Convex; no third-party SaaS holding minors' accounts; $0; fits the existing
  component architecture). WorkOS AuthKit was the runner-up (hosted UI,
  1M MAU free, less setup — but identity lives in WorkOS's cloud and every
  student must complete a redirect before their first win).

## Open variables (why this is stashed)

1. **District IT:** Google Workspace for Education blocks unapproved
   third-party OAuth apps for under-18 accounts by default. Needs a district
   admin to allowlist the app (redirect domain = the Convex `.convex.site`
   URL). Unknown lead time.
2. **Better Auth churn:** `@convex-dev/better-auth` was 0.12.5 (pre-1.0,
   history of breaking minor versions). Pin exactly; re-check version on
   pickup.
3. **Scale question:** single club vs. multi-teacher/multi-class changes the
   role model (env-var allowlist vs. real org modeling).

## The enforcement design (component-agnostic — most of the work)

The audit's real finding: every function trusts client-supplied IDs. Whatever
auth lands:

- `convex/authz.ts` with `requireStudent(ctx)` / `requireTeacher(ctx)`.
- Student mutations/queries stop taking `studentId` args; identity derived
  server-side; project access checks `project.studentId === caller`.
- All `teachers.*` functions (incl. `review`, `saveNote`, `defectionLog`)
  require the teacher role. Teacher route stops being an open URL.
- Thread transcripts owner-only (teacher gets signals, never transcripts).
- `students`/`teachers` gain indexed `authUserId`; teacher role from a
  `TEACHER_EMAILS` allowlist at first sign-in.
- Old name-picker + localStorage identity deleted; dev test data cleared.
- Better Auth guest/anonymous plugin: documented fallback if district
  approval lags — off by default (conflicts with "everyone signs in").

## Research facts (verified against live docs 2026-07-14)

- `@convex-dev/better-auth` 0.12.5, needs `better-auth@~1.6.15`, Convex
  ≥1.25. Vite SPA needs: `crossDomain` plugin both sides, HTTP routes with
  `{ cors: true }`, env `BETTER_AUTH_SECRET`/`SITE_URL` +
  `VITE_CONVEX_SITE_URL`/`VITE_SITE_URL`. Google OAuth origin/redirect point
  at `https://<deployment>.convex.site/api/auth/callback/google`.
  Server: `authComponent.safeGetAuthUser(ctx)`.
- WorkOS: `@convex-dev/workos` 0.0.3 + `@convex-dev/workos-authkit` 0.2.7 +
  `@workos-inc/authkit-react` 0.16.1 (the `@workos/` scope 404s). Free to
  1M MAU. Current default in `npm create convex`.
- Convex Auth (`@convex-dev/auth` 0.0.94): still officially beta; Convex
  docs steer new apps elsewhere. Not recommended.
- Clerk: fine, 50k free MAU — no advantage here over the two above.
