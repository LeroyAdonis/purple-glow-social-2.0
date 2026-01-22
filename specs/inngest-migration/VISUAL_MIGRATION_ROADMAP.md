# Visual Migration Roadmap - Vercel Cron to Inngest

**Project:** Purple Glow Social 2.0  
**Visual Guide:** Architecture diagrams and flow charts  

---

## 📊 Current Architecture (Before Migration)

```
┌─────────────────────────────────────────────────────────────┐
│                    PURPLE GLOW SOCIAL 2.0                   │
│                     Current State (Mixed)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      JOB PROCESSING                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐      ┌─────────────────────┐     │
│  │   VERCEL CRON       │      │     INNGEST         │     │
│  │   💰 $20/month      │      │   ✅ FREE (2%)      │     │
│  └─────────────────────┘      └─────────────────────┘     │
│           │                              │                  │
│           ├─ cleanup-pkce (hourly)       ├─ process-scheduled-post │
│           ├─ refresh-tokens (6h)         ├─ execute-automation    │
│           └─ learn-patterns (daily)      ├─ check-credit-expiry   │
│                                          ├─ reset-monthly-credits │
│                                          └─ check-low-credits     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

❌ PROBLEM: Paying for redundant systems
❌ PROBLEM: Inconsistent error handling
❌ PROBLEM: Limited monitoring on Vercel Cron
```

---

## 🎯 Target Architecture (After Migration)

```
┌─────────────────────────────────────────────────────────────┐
│                    PURPLE GLOW SOCIAL 2.0                   │
│                     Target State (Unified)                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      JOB PROCESSING                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                ┌─────────────────────┐                      │
│                │     INNGEST         │                      │
│                │   ✅ FREE (2%)      │                      │
│                │   8 Functions       │                      │
│                └─────────────────────┘                      │
│                          │                                  │
│        ┌─────────────────┼─────────────────┐              │
│        │                 │                 │              │
│   [Event-Driven]    [Cron: Hourly]   [Cron: Periodic]    │
│        │                 │                 │              │
│   ├─ process-post   ├─ cleanup-pkce   ├─ refresh-tokens  │
│   ├─ automation     │                 │   (every 6h)      │
│   ├─ credit-expiry  │                 │                   │
│   ├─ reset-credits  │                 └─ learn-patterns   │
│   └─ check-low      │                     (daily 3am)     │
│                     │                                      │
└─────────────────────────────────────────────────────────────┘

✅ SOLUTION: Single unified platform
✅ SOLUTION: Built-in retries + monitoring
✅ SOLUTION: $240/year cost savings
```

---

## 🔄 Migration Flow Diagram

```
START: Current State
  │
  ├─ Vercel Cron (3 jobs) ─────┐
  │   - cleanup-pkce            │
  │   - refresh-tokens          │
  │   - learn-patterns          │
  │                             │
  └─ Inngest (5 functions) ─────┤
      - process-scheduled-post  │
      - execute-automation      │
      - check-credit-expiry     │
      - reset-monthly-credits   │
      - check-low-credits       │
                                │
                                ↓
                        ┌───────────────┐
                        │  MIGRATION    │
                        │  3-4 hours    │
                        └───────────────┘
                                │
                ┌───────────────┼───────────────┐
                ↓               ↓               ↓
        [Create 3 New]   [Integrate]    [Cleanup]
        Inngest Funcs    & Register     Old Files
                │               │               │
                └───────────────┴───────────────┘
                                │
                                ↓
                        ┌───────────────┐
                        │   TESTING     │
                        │   1 hour      │
                        └───────────────┘
                                │
                                ↓
END: Target State
  │
  └─ Inngest (8 functions) ────────
      - ALL jobs unified
      - FREE tier
      - Better monitoring
```

---

## 📦 File Structure Changes

### Before Migration

```
purple-glow-social-2.0/
├── app/
│   └── api/
│       ├── cron/                         ❌ DELETE
│       │   ├── cleanup-pkce/
│       │   │   └── route.ts              ❌ DELETE
│       │   ├── refresh-tokens/
│       │   │   └── route.ts              ❌ DELETE
│       │   └── learn-patterns/
│       │       └── route.ts              ❌ DELETE
│       └── inngest/
│           └── route.ts                  ✅ KEEP (update)
├── lib/
│   └── inngest/
│       ├── client.ts                     ✅ KEEP
│       └── functions/
│           ├── index.ts                  ⚠️ UPDATE
│           ├── process-scheduled-post.ts ✅ KEEP
│           ├── execute-automation-rule.ts ✅ KEEP
│           ├── check-credit-expiry.ts    ✅ KEEP
│           ├── reset-monthly-credits.ts  ✅ KEEP
│           └── check-low-credits.ts      ✅ KEEP
├── vercel.json                           ⚠️ UPDATE (remove crons)
└── .env.example                          ⚠️ UPDATE (add Inngest vars)
```

### After Migration

```
purple-glow-social-2.0/
├── app/
│   └── api/
│       └── inngest/
│           └── route.ts                  ✅ UPDATED (8 functions)
├── lib/
│   └── inngest/
│       ├── client.ts                     ✅ KEEP
│       └── functions/
│           ├── index.ts                  ✅ UPDATED (exports)
│           ├── process-scheduled-post.ts ✅ KEEP
│           ├── execute-automation-rule.ts ✅ KEEP
│           ├── check-credit-expiry.ts    ✅ KEEP
│           ├── reset-monthly-credits.ts  ✅ KEEP
│           ├── check-low-credits.ts      ✅ KEEP
│           ├── cleanup-pkce-verifiers.ts ✨ NEW
│           ├── refresh-oauth-tokens.ts   ✨ NEW
│           └── learn-ai-patterns.ts      ✨ NEW
├── vercel.json                           ✅ UPDATED (crons removed)
└── .env.example                          ✅ UPDATED (Inngest vars)
```

---

## 🌊 Wave-Based Implementation

```
┌─────────────────────────────────────────────────────────────┐
│                       WAVE 1: SETUP                         │
│                        15 minutes                           │
├─────────────────────────────────────────────────────────────┤
│  Task 1: Add Inngest vars to .env.example        [5 min]   │
│  Task 2: Verify TypeScript build passes          [5 min]   │
│  Task 3: Get Inngest API keys                    [5 min]   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    WAVE 2: CREATE FUNCTIONS                 │
│                    2 hours (PARALLEL)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Track A    │  │   Track B    │  │   Track C    │     │
│  │  PKCE       │  │   Tokens     │  │   Learning   │     │
│  │  30 min     │  │   1 hour     │  │   1.5 hours  │     │
│  └─────────────┘  └──────────────┘  └──────────────┘     │
│       │                  │                   │             │
│       └──────────────────┴───────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   WAVE 3: INTEGRATION                       │
│                      30 minutes                             │
├─────────────────────────────────────────────────────────────┤
│  Task 1: Update index.ts exports              [5 min]      │
│  Task 2: Register in route.ts                 [5 min]      │
│  Task 3: TypeScript build                     [5 min]      │
│  Task 4: Test with Inngest Dev Server         [15 min]     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     WAVE 4: CLEANUP                         │
│                      15 minutes                             │
├─────────────────────────────────────────────────────────────┤
│  Task 1: Delete cron endpoint files           [5 min]      │
│  Task 2: Update vercel.json                   [3 min]      │
│  Task 3: Delete empty directories             [2 min]      │
│  Task 4: Verify build                         [5 min]      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  WAVE 5: TESTING                            │
│                      1 hour                                 │
├─────────────────────────────────────────────────────────────┤
│  Task 1: Manual trigger tests                 [30 min]     │
│  Task 2: Verify dashboard logs                [10 min]     │
│  Task 3: Code review                          [20 min]     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 WAVE 6: DOCUMENTATION                       │
│                      30 minutes                             │
├─────────────────────────────────────────────────────────────┤
│  Task 1: Update AGENTS.md                     [10 min]     │
│  Task 2: Update README.md                     [10 min]     │
│  Task 3: Update API docs                      [10 min]     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
                          ✅ DONE!
```

---

## 🎯 Function Coverage Matrix

```
┌────────────────────────────────────────────────────────────────┐
│              VERCEL CRON → INNGEST MAPPING                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  VERCEL CRON                      INNGEST FUNCTION            │
│  ════════════                     ══════════════════           │
│                                                                │
│  ❌ /api/cron/cleanup-pkce    →   ✨ cleanup-pkce-verifiers   │
│     Schedule: 0 * * * *              Schedule: 0 * * * *      │
│     (hourly)                         (hourly)                 │
│                                                                │
│  ❌ /api/cron/refresh-tokens  →   ✨ refresh-oauth-tokens     │
│     Schedule: 0 */6 * * *            Schedule: 0 */6 * * *    │
│     (every 6 hours)                  (every 6 hours)          │
│                                                                │
│  ❌ /api/cron/learn-patterns  →   ✨ learn-ai-patterns        │
│     Schedule: 0 1 * * *              Schedule: 0 1 * * *      │
│     (daily 3am SAST)                 (daily 3am SAST)         │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                    ALREADY MIGRATED                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ❌ process-scheduled-posts   →   ✅ processScheduledPost     │
│     (deleted)                       Event: post/scheduled     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Comparison Visualization

```
┌────────────────────────────────────────────────────────────┐
│                    MONTHLY COST ANALYSIS                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  BEFORE MIGRATION:                                         │
│  ┌──────────────────────────────────────────┐             │
│  │  Vercel Hobby Plan       $ 20.00/month   │ ████████   │
│  │  Inngest Free Tier       $  0.00/month   │            │
│  └──────────────────────────────────────────┘             │
│  TOTAL:                      $ 20.00/month                 │
│                                                            │
│  AFTER MIGRATION:                                          │
│  ┌──────────────────────────────────────────┐             │
│  │  Vercel Free Tier        $  0.00/month   │            │
│  │  Inngest Free Tier       $  0.00/month   │            │
│  └──────────────────────────────────────────┘             │
│  TOTAL:                      $  0.00/month                 │
│                                                            │
│  💰 SAVINGS:                 $ 20.00/month                 │
│  💰 ANNUAL SAVINGS:          $240.00/year                  │
│                                                            │
└────────────────────────────────────────────────────────────┘

ROI Calculation:
  Investment:    3-4 hours of engineering time
  Return:        $240/year
  Break-even:    ~1 week (at $60/hour)
  5-year value:  $1,200 savings
```

---

## 📊 Inngest Usage vs. Free Tier Limits

```
┌────────────────────────────────────────────────────────────┐
│               INNGEST FREE TIER CAPACITY                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Function Runs per Month:                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Current Usage:        ~20,000 runs                │   │
│  │  Free Tier Limit:    1,000,000 runs                │   │
│  │                                                     │   │
│  │  [██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]   │   │
│  │   2% used                      98% available       │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Usage Breakdown (estimated):                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Scheduled Posts:          15,000/month  [████░░]  │   │
│  │  Automation Rules:          1,500/month  [█░░░░░]  │   │
│  │  Credit Checks:               500/month  [░░░░░░]  │   │
│  │  Cron Jobs (3):             3,000/month  [██░░░░]  │   │
│  │  ─────────────────────────────────────────────────│   │
│  │  TOTAL:                    20,000/month  [██░░░░]  │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ✅ FREE TIER IS MORE THAN SUFFICIENT                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Rollback Strategy Flowchart

```
                    [Production Deployed]
                            │
                            ↓
                    [Monitor for Issues]
                            │
                ┌───────────┴───────────┐
                ↓                       ↓
          [No Issues]            [Issues Detected]
                │                       │
                ↓                       ↓
        [Continue Running]      [Severity Check]
                │                       │
                ↓               ┌───────┴───────┐
        [Success! ✅]           ↓               ↓
                          [Minor]         [Critical]
                            │               │
                            ↓               ↓
                    [Log & Monitor]  [ROLLBACK NOW]
                            │               │
                            ↓               ↓
                    [Fix in Next]   [1. Restore vercel.json]
                    [Deployment]    [2. Redeploy (5 min)]
                                   [3. Verify Vercel cron]
                                   [4. Investigate offline]
                                            │
                                            ↓
                                    [System Restored]
```

---

## 🎯 Success Criteria Dashboard

```
┌────────────────────────────────────────────────────────────┐
│                  MIGRATION SUCCESS METRICS                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  TECHNICAL VALIDATION (24 hours)                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ☐ All 8 functions in dashboard                   │   │
│  │  ☐ Cron schedules executing on time                │   │
│  │  ☐ Error rate < 1%                                 │   │
│  │  ☐ TypeScript build passing                        │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  OPERATIONAL VALIDATION (72 hours)                         │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ☐ PKCE cleanup: 72 successful runs                │   │
│  │  ☐ Token refresh: 12 successful runs               │   │
│  │  ☐ AI learning: 3 successful runs                  │   │
│  │  ☐ No user complaints                              │   │
│  │  ☐ No Sentry error spikes                          │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  BUSINESS VALIDATION (30 days)                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  ☐ Vercel plan: Free tier                          │   │
│  │  ☐ Inngest usage: < 50% of free tier               │   │
│  │  ☐ Cost savings: $20/month confirmed               │   │
│  │  ☐ No functionality regressions                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Timeline Visualization

```
Day 1 (Implementation Day)
═══════════════════════════════════════════════════════════
09:00 ├─ Wave 1: Setup (15 min)
09:15 ├─ Wave 2: Create Functions (2 hours, parallel)
      │   ├─ Track A: PKCE cleanup
      │   ├─ Track B: Token refresh
      │   └─ Track C: AI learning
11:15 ├─ Wave 3: Integration (30 min)
11:45 ├─ Wave 4: Cleanup (15 min)
12:00 ├─ LUNCH BREAK (1 hour)
13:00 ├─ Wave 5: Testing (1 hour)
14:00 ├─ Wave 6: Documentation (30 min)
14:30 ├─ Deploy to Staging
15:00 └─ Monitor

Day 2 (Validation Day)
═══════════════════════════════════════════════════════════
09:00 ├─ Review staging logs
10:00 ├─ Run final tests
11:00 ├─ Code review approval
12:00 ├─ LUNCH BREAK
13:00 ├─ Deploy to Production
14:00 ├─ Monitor initial runs
17:00 └─ End of day check

Days 3-5 (Monitoring Period)
═══════════════════════════════════════════════════════════
      ├─ Check Inngest dashboard daily
      ├─ Monitor Sentry for errors
      ├─ Verify all cron executions
      └─ Track success rates

Day 7 (Final Validation)
═══════════════════════════════════════════════════════════
      ├─ Verify cost savings (Vercel Free tier)
      ├─ Confirm all metrics green
      ├─ Remove Vercel cron fallback
      └─ Migration complete! ✅
```

---

## 📁 Documentation Package Overview

```
specs/inngest-migration/
│
├── 📄 README.md ⭐ START HERE
│   └─ Index of all documents
│
├── 🎯 EXECUTIVE_SUMMARY.md
│   └─ 5-minute overview for stakeholders
│
├── 📊 GAP_ANALYSIS_REPORT.md
│   └─ Current vs. target state analysis
│
├── 📋 MIGRATION_SPECIFICATION.md
│   └─ Complete implementation plan
│
├── 🔧 FUNCTION_SPEC_CLEANUP_PKCE.md
│   └─ PKCE cleanup function (30 min)
│
├── 🔧 FUNCTION_SPEC_REFRESH_TOKENS.md
│   └─ Token refresh function (1 hour)
│
├── 🔧 FUNCTION_SPEC_LEARN_PATTERNS.md
│   └─ AI learning function (1.5 hours)
│
├── 🛠️ TYPESCRIPT_FIX_PLAN.md
│   └─ Type safety validation (no errors!)
│
├── 👥 SUBAGENT_ASSIGNMENT_MATRIX.md
│   └─ Task assignments & coordination
│
├── ⚙️ ENVIRONMENT_SETUP_GUIDE.md
│   └─ Inngest configuration & troubleshooting
│
└── 🗺️ VISUAL_MIGRATION_ROADMAP.md (this file)
    └─ Diagrams and visual guides

TOTAL: 10 comprehensive documents
SIZE: ~100KB of detailed specifications
STATUS: ✅ Ready for implementation
```

---

**Status:** ✅ Visual Roadmap Complete  
**Package:** 10/10 documents ready  
**Confidence:** High  
**Next Step:** Begin implementation (Wave 1)  

🚀 **Ready to migrate!**
