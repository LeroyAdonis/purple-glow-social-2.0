# Orchestrated App Audit & Improvement Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Autonomously audit, triage, fix, and verify the entire Purple Glow Social 2.0 app until all three exit gates pass (Playwright clean, tests green, build passes).

**Architecture:** The Orchestrator agent coordinates a sequential pipeline with parallel worktree bursts. Phase 1 runs a dual-track Playwright audit (public + authenticated simultaneously). Phase 2 is critical triage. Phase 3 creates implementation plans per issue. Phase 4 dispatches Coder/FastCoder agents in isolated git worktrees. Phase 5 re-verifies. Loop until gates pass.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, Better-auth, Drizzle ORM / PostgreSQL (Neon), Inngest, Playwright (Python), Vitest

---

## Pre-flight Checklist (resolve before starting)

- [ ] Confirm `.env.local` exists with `DATABASE_URL`, `BETTER_AUTH_SECRET`, OAuth keys. If absent, flag env-dependent failures as infrastructure issues — do not attempt to fix in code.
- [ ] Confirm `scripts/with_server.py` exists OR note that webapp-testing agent must use `npm run dev` directly.
- [ ] Confirm Playwright Python packages installed (`pip show playwright`).

---

## Phase 0 — Bootstrap

### Task 0.1: Start the dev server

**Files:**
- No file changes — runtime check only

**Step 1: Start dev server**

```bash
npm run dev
```

Expected: Server starts on `http://localhost:3000`. Look for `▲ Next.js 16` and `Local: http://localhost:3000` in output.

**Step 2: Confirm HTTP 200**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: `200`

**Step 3: If server fails to start, check for errors**

Common causes:
- Missing `.env.local` → create minimal stub to unblock (document what's missing)
- Port already in use → kill existing process and retry
- TypeScript/build error → note it as a Critical issue and proceed to audit anyway

---

## Phase 1 — Playwright Audit (Dual-Track, Parallel)

Dispatch two `webapp-testing` agents **simultaneously** using `dispatching-parallel-agents` skill.

### Task 1.1: Agent A — Public Pages Audit

**Agent prompt template:**
```
You are the webapp-testing agent. Run a Playwright audit of the PUBLIC pages of Purple Glow Social 2.0 running at http://localhost:3000.

For each page listed below:
1. Navigate to the URL
2. Wait for networkidle
3. Capture a full-page screenshot saved to `docs/audit-screenshots/<page-name>-public.png`
4. Capture all console errors and warnings
5. Capture all failed network requests (4xx, 5xx)
6. Note any visible layout breaks, overflow, broken images, or missing content
7. Note any ARIA violations (missing role, label, alt text)

Pages to audit:
- / (landing page — check hero, nav, pricing, features section, footer)
- /login (auth form renders, no errors)
- /signup (registration form renders, client-side validation visible)
- /privacy (static page renders)
- /terms (static page renders)

Output a structured Markdown report: one section per page with: screenshot path, console errors (list), network errors (list), visual observations (list), accessibility observations (list).

What did you find?
```

**Step 1: Create screenshots directory**

```bash
mkdir -p docs/audit-screenshots
```

**Step 2: Dispatch Agent A**

Use `task` tool with `agent_type: "webapp-testing"`.

**Step 3: Save Agent A report**

Save the Markdown output to: `docs/audit-screenshots/report-public.md`

---

### Task 1.2: Agent B — Authenticated Pages Audit

**Agent prompt template:**
```
You are the webapp-testing agent. Run a Playwright audit of the AUTHENTICATED pages of Purple Glow Social 2.0 running at http://localhost:3000.

Test accounts (from AGENTS.md):
- Pro user:      pro@test.purpleglow.co.za     / TestPro123!
- Free user:     free@test.purpleglow.co.za    / TestFree123!
- Admin user:    admin@test.purpleglow.co.za   / TestAdmin123!

For each scenario listed below:
1. Navigate to /login
2. Log in with the specified credentials
3. Navigate to the target page
4. Wait for networkidle
5. Capture a full-page screenshot saved to `docs/audit-screenshots/<page-name>-<tier>.png`
6. Capture console errors, network errors, visual observations, accessibility issues
7. Log out after each scenario

Scenarios:
- /dashboard (Pro user) — all tabs clickable, no console errors, no broken network calls
- /dashboard (Free user) — credit limit indicators visible, feature restrictions enforced
- /dashboard (Admin user) — admin panel/indicators visible if any
- /oauth/callback or /oauth/error — check error states render gracefully (navigate directly if no real OAuth flow available)

Also test:
- Login redirect: navigate to /dashboard while unauthenticated → should redirect to /login
- Post-login redirect: after login → should redirect to /dashboard (not loop)

Output a structured Markdown report: one section per scenario with: screenshot path, console errors, network errors, visual observations, accessibility observations, and redirect behaviour observed.

What did you find?
```

**Step 1: Dispatch Agent B simultaneously with Agent A**

Use `task` tool with `agent_type: "webapp-testing"`.

**Step 2: Save Agent B report**

Save to: `docs/audit-screenshots/report-authenticated.md`

---

## Phase 2 — Orchestrator Critical Review

### Task 2.1: Merge and triage audit reports

The Orchestrator reads both reports and **challenges every finding** before assigning severity.

**Checklist — question each finding:**

| Finding type | Challenge to apply before accepting |
|---|---|
| Console warning | Is this a known React/Next.js dev-mode warning (e.g. hydration, strict mode double-render)? If so, classify as Low or ignore. |
| Network 500 | Is this caused by a missing env var in dev? If so, classify as Infrastructure (not a code bug). |
| Network 404 | Is this a real missing route or a browser extension/favicon request? Verify the URL. |
| "Page doesn't render" | Is the server actually running? Confirm with fresh `curl`. |
| Redirect loop | Is this a middleware issue or a cookie issue? Check `middleware.ts`. |
| Auth broken | Is the session actually being set? Check browser cookies in screenshot. |
| Accessibility violation | Is this WCAG A (blocker) or WCAG AA/AAA (enhancement)? |
| Visual break | Is this a known incomplete feature or an actual regression? |

**Output:** Create `docs/audit-screenshots/triage.md` with:

```markdown
## Issue Triage

| ID | Page | Finding | Severity | Challenge | Verdict |
|---|---|---|---|---|---|
| I-001 | / | [finding] | [Critical/High/Medium/Low/Infra] | [question asked] | [real bug / false positive / infra] |
...
```

Severity definitions:
- **Critical** — App crashes, auth totally broken, data loss, build fails
- **High** — Page renders but key feature is broken or inaccessible  
- **Medium** — Visual glitch, minor UX friction, non-critical console error
- **Low** — Typo, colour contrast, missing alt text, cosmetic

---

## Phase 3 — Planner Research Pass

### Task 3.1: Dispatch Planner for each Critical/High issue

For each Critical or High issue in `triage.md`, dispatch one `planner` agent with:

```
You are the Planner for Purple Glow Social 2.0 (Next.js 16, React 19, TypeScript strict, Tailwind v4, Better-auth, Drizzle ORM).

Issue: [issue description from triage]
Severity: [Critical/High]

Please:
1. Locate the relevant source files (use grep/glob to search the codebase).
2. Identify the root cause.
3. Check relevant framework docs if needed (Next.js 16 App Router, Better-auth, Drizzle ORM).
4. Produce an implementation plan: what must change, in which files, in what order.
5. List edge cases and any other issues this change might affect.
6. State any assumptions you are making.

Do NOT write code. Output an ordered implementation plan only.

Key files to reference: middleware.ts, lib/auth.ts, drizzle/schema.ts, app/ directory.

What is your implementation plan?
```

**Step 1: Dispatch Planner agents** — can be parallel if issues are independent.

**Step 2: Save each plan** to `docs/audit-screenshots/plan-I-<id>.md`

---

## Phase 4 — Fix Waves (Parallel Worktrees)

### Task 4.1: Create git worktrees

Use `using-git-worktrees` skill to create one worktree per issue cluster.

```bash
# For each cluster needed:
git worktree add ../purple-glow-fix-ui-landing fix/ui-landing
git worktree add ../purple-glow-fix-auth-flow fix/auth-flow
git worktree add ../purple-glow-fix-dashboard fix/dashboard
git worktree add ../purple-glow-fix-api-routes fix/api-routes
git worktree add ../purple-glow-fix-accessibility fix/accessibility
```

Only create worktrees for clusters that have real issues.

---

### Task 4.2: Dispatch Fix Agents (Parallel)

For each worktree/cluster, dispatch the appropriate agent using `dispatching-parallel-agents` skill.

**Agent selection:**

| Condition | Use |
|---|---|
| Low or trivial, single-file, < 5 min, crystal-clear spec | `fast-coder` |
| Medium/High/Critical, multi-file, architectural | `coder` |
| Visual/UX issue needing design decision first | `design-expert` then `coder` |
| Critical issue needing research (Planner already done) | `coder` with Planner's plan attached |

**Coder/FastCoder prompt template:**

```
You are the [Coder/FastCoder] for Purple Glow Social 2.0.
Working directory: [worktree path]

Issue: [description]
Severity: [level]
Implementation plan from Planner: [attach plan-I-<id>.md contents]

Requirements:
- TypeScript strict mode — no `any` types
- Use lib/logger.ts not console.log
- Use Drizzle ORM for any DB changes
- Validate session on protected routes using auth.api.getSession()
- Follow existing patterns in the codebase
- Run `npm run build` and `npm run test:run` after changes
- Report: what changed, in which files, test output, build output

Do NOT introduce new dependencies unless absolutely necessary.
Do NOT modify unrelated files.

After completing, commit your changes with: git commit -m "fix: [short description]"

What did you change and what were the test/build results?
```

---

### Task 4.3: Merge completed worktrees

After each agent reports completion with evidence (test output + build output):

```bash
# From main repo:
git merge fix/<cluster-name> --no-ff -m "fix: merge <cluster-name> fixes"
git worktree remove ../purple-glow-fix-<cluster-name>
```

---

## Phase 5 — Verification Loop

### Task 5.1: Re-run Playwright on affected pages

For each merged cluster, dispatch `webapp-testing` agent:

```
You are the webapp-testing agent. Verify fixes for cluster: [cluster name].

Run Playwright on the following pages (affected by this cluster's changes):
[list pages specific to the cluster]

For each page:
1. Navigate and wait for networkidle
2. Take a screenshot to docs/audit-screenshots/verify-<page>-after.png
3. Check console errors — compare to the BEFORE screenshot/report
4. Check network errors

Compare to the original audit (docs/audit-screenshots/report-public.md or report-authenticated.md) and report:
- Issues fixed (confirmed by before/after evidence)
- Issues still present
- New regressions introduced

What did you find?
```

### Task 5.2: Orchestrator reviews verification evidence

**Accept criteria (Orchestrator must verify ALL of these before accepting a cluster as done):**

- [ ] Screenshot shows the page rendering correctly
- [ ] Console errors list is empty or only contains known dev-mode noise
- [ ] No new failed network requests
- [ ] Test output shows all tests passing
- [ ] Build output shows success

**If any criterion fails:** Re-open the issue, create a new worktree (`fix/<cluster-name>-v2`), re-run Phase 3→4→5 for the affected issue.

---

## Phase 6 — Final Validation Gate

Run only after ALL clusters are verified and merged.

### Task 6.1: TypeScript type check

```bash
npx tsc --noEmit
```

Expected: Zero errors, zero warnings.

If errors found: dispatch `fast-coder` or `coder` to fix, then re-run.

---

### Task 6.2: Full test suite

```bash
npm run test:run
```

Expected: All tests pass. (Baseline: 128 tests per AGENTS.md)

If failures found: dispatch `coder` with test failure output, then re-run.

---

### Task 6.3: Production build

```bash
npm run build
```

Expected: `✓ Compiled successfully` with zero errors.

If build fails: dispatch `coder` with build output, then re-run.

---

### Task 6.4: Final Playwright sweep

Run both Agent A and Agent B (Tasks 1.1 + 1.2) one final time.

Compare against original audit reports.

Expected: All issues from `triage.md` resolved. No new issues.

---

### Task 6.5: Orchestrator Final Sign-off Report

Save to `docs/audit-screenshots/final-report.md`:

```markdown
# Final Sign-off Report

## Exit Gates

- [ ] Gate 1 (Playwright): All pages clean, auth works, no critical a11y violations
- [ ] Gate 2 (Code quality): tsc clean, all tests pass
- [ ] Gate 3 (Build): npm run build succeeds

## Issues Found: N
## Issues Fixed: N
## Issues Deferred (infrastructure/env only): N

## Summary of Changes
[table: Issue ID | Severity | Files Changed | Verification Evidence]

## Deferred Issues
[list with reason for deferral]
```

---

## Constraints Reference

- Orchestrator NEVER writes code, edits files, or runs tests directly.
- Every subagent prompt ends with a question.
- No fix is accepted without screenshot + test/build output as evidence.
- No new `any` types. No raw SQL. No console.log (use lib/logger.ts).
- South African context preserved: SAST (UTC+2), ZAR currency, 11 languages.
- Design doc: `docs/plans/2026-02-20-orchestrated-audit-design.md`
