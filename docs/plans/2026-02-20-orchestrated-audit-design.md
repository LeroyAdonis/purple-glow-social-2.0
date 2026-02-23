# Orchestrated App Audit & Improvement — Design Doc
**Date:** 2026-02-20  
**Project:** Purple Glow Social 2.0  
**Status:** Approved

---

## Summary

A fully autonomous, Orchestrator-coordinated audit-then-fix cycle for Purple Glow Social 2.0. The Orchestrator delegates to specialist agents, questions every result critically, and never implements anything directly. Git worktrees isolate parallel work. The loop runs until all three exit gates pass simultaneously.

---

## Architecture & Agent Topology

```
USER
 └─► ORCHESTRATOR (coordinates, never touches code)
       ├─► webapp-testing  [Phase 1 — Playwright audit, parallel: public + authenticated]
       ├─► planner         [Phase 3 — per-issue research + implementation plans]
       ├─► design-expert   [Phase 4 — visual/UX decisions before Coder]
       ├─► coder           [Phase 4 — complex multi-file fixes in git worktrees]
       ├─► fast-coder      [Phase 4 — trivial single-file fixes in git worktrees]
       └─► webapp-testing  [Phase 5 — re-verification after each fix wave]
```

**Skills the Orchestrator activates:**
- `using-git-worktrees` — before every implementation wave
- `dispatching-parallel-agents` — for independent issue clusters
- `verification-before-completion` — before accepting any wave as done
- `systematic-debugging` — when root cause cannot be isolated
- `next-best-practices` — Next.js 16 / React 19 guidance as needed
- `web-design-guidelines` — accessibility and UX audit

**Orchestrator rules (non-negotiable):**
- Never writes code, edits files, or runs tests directly.
- Every subagent prompt ends with a question.
- Never accepts "fixed" without screenshot or test output as evidence.
- Treats every agent output as a hypothesis until independently verified.

---

## Playwright Audit Scope (Phase 1)

Two `webapp-testing` agents run **simultaneously** via `dispatching-parallel-agents`:

### Agent A — Public Pages (no auth)
| Page | What to check |
|---|---|
| `/` | Hero, nav, pricing, features, footer render; no console errors |
| `/login` | Form renders; no errors |
| `/signup` | Form renders; validation visible |
| `/privacy`, `/terms` | Static pages render |

### Agent B — Authenticated Pages
Uses test credentials from AGENTS.md (`pro@test.purpleglow.co.za / TestPro123!`, `free@test.purpleglow.co.za / TestFree123!`, `admin@test.purpleglow.co.za / TestAdmin123!`)

| Page / User | What to check |
|---|---|
| `/dashboard` (Pro) | All tabs load, features accessible |
| `/dashboard` (Free) | Credit limits enforced in UI |
| `/dashboard` (Admin) | Admin panel visible |
| `/oauth/*` | Error states handled gracefully |

**Both agents capture per-page:**
- Full-page screenshot
- All console errors and warnings
- All failed network requests (4xx, 5xx)
- Broken images or missing assets
- Layout overflow or visual breaks
- Accessibility violations (ARIA, keyboard nav)

Agents produce a **structured findings report** merged by the Orchestrator.

---

## Issue Triage (Phase 2)

The Orchestrator **interrogates every finding** before assigning severity:

| Question the Orchestrator must ask | Why |
|---|---|
| Is this a real bug or a React/Next.js dev-mode warning? | Dev noise is expected and not a bug |
| Is this a missing env var or actual broken code? | Infra issues can't be fixed in code |
| Is this a regression or an intentionally incomplete feature? | Don't gold-plate out-of-scope features |
| Does the authenticated test confirm the correct session tier? | Pro vs Free vs Business differ in UI |
| Is the a11y violation WCAG A (critical) or AAA (nice-to-have)? | Triage correctly |

**Severity:**
- **Critical** — App crashes, auth broken, data loss risk, build fails
- **High** — Key feature broken or page inaccessible
- **Medium** — Visual glitch, minor UX friction, non-critical console error
- **Low** — Typo, colour contrast, missing alt text, cosmetic

---

## Worktree Strategy (Phase 3/4)

One worktree per independent issue cluster (created via `using-git-worktrees` skill). Clusters scoped to codebase areas to minimise merge conflicts:

| Worktree branch | Scope |
|---|---|
| `fix/ui-landing` | Landing page visual/layout |
| `fix/auth-flow` | Login, signup, session, redirect |
| `fix/dashboard` | Dashboard component bugs |
| `fix/api-routes` | API route failures |
| `fix/accessibility` | ARIA, keyboard nav, alt text |

Additional worktrees created as needed based on findings.

---

## Fix Waves & Agent Assignment (Phase 4)

| Agent | Handles | Condition |
|---|---|---|
| `fast-coder` | Low / trivial single-file fixes | Crystal-clear spec, < 5 min, no design decisions |
| `coder` | Medium / High / Critical | Complex, multi-file, or architectural |
| `design-expert` | Visual/UX issues needing a design decision | Called before Coder for those issues |
| `planner` | Critical issues needing research first | Called before Coder for those issues |

Independent clusters dispatched in parallel via `dispatching-parallel-agents`.

---

## Verification Loop (Phase 5)

After every wave:
1. `webapp-testing` re-runs Playwright on **affected pages only**.
2. Produces before/after screenshot comparison + console error diff.
3. Orchestrator **requires evidence** — no screenshot = not verified.
4. Regressions re-enter the triage queue with a new worktree.
5. Worktrees merged to `main` only after Orchestrator accepts evidence.
6. Loop continues until all clusters resolved and verified.

---

## Exit Criteria (Gate to Stop)

All three gates must pass **simultaneously**:

### Gate 1 — Visual & Functional (Playwright)
- All audited pages render without console errors
- No failed network requests
- Auth flow works end-to-end (login → dashboard → feature → logout)
- Tier-gated UI correct for Free / Pro / Business
- No Critical or High accessibility violations

### Gate 2 — Code Quality
- `npx tsc --noEmit` — zero type errors
- `npm run test:run` — all tests pass
- No new `any` types introduced

### Gate 3 — Production Build
- `npm run build` — succeeds with zero errors

### Final Report
- All issues found (with evidence)
- All fixes applied (what changed, where, how verified)
- Before/after screenshots
- Any deferred issues (infra/env-only)

---

## Open Questions
- Does `.env.local` exist with required env vars? If not, env-dependent failures will be flagged as infrastructure issues (not code bugs) and documented separately.
