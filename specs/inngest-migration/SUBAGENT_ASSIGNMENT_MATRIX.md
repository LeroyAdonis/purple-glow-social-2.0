# Subagent Assignment Matrix - Inngest Migration

**Project:** Purple Glow Social 2.0 - Vercel Cron to Inngest Migration  
**Total Estimated Effort:** 3-4 hours  
**Timeline:** 1-2 days  

---

## 1. Wave-Based Task Assignment

### Wave 1: Environment Setup (15 min) - SEQUENTIAL

| Task ID | Task | Subagent | Effort | Priority | Status |
|---------|------|----------|--------|----------|--------|
| W1.1 | Update `.env.example` with Inngest vars | Coder | 10 min | High | ⏳ Pending |
| W1.2 | Verify TypeScript compilation | Coder | 5 min | High | ⏳ Pending |

**Dependencies:** None  
**Assigned To:** Coder Agent  
**Deliverables:**
- `.env.example` updated with 3 new environment variables
- Build passes with `npm run build`

---

### Wave 2: Create Inngest Functions (2 hours) - PARALLEL

#### Track 2A: Cleanup PKCE Function

| Task ID | Task | Subagent | Effort | Priority | Status |
|---------|------|----------|--------|----------|--------|
| W2A.1 | Create `cleanup-pkce-verifiers.ts` | Coder | 20 min | High | ⏳ Pending |
| W2A.2 | Unit test locally | Coder | 10 min | High | ⏳ Pending |

**Dependencies:** Wave 1  
**Assigned To:** Coder Agent  
**Spec Reference:** `FUNCTION_SPEC_CLEANUP_PKCE.md`

#### Track 2B: Refresh Tokens Function

| Task ID | Task | Subagent | Effort | Priority | Status |
|---------|------|----------|--------|----------|--------|
| W2B.1 | Create `refresh-oauth-tokens.ts` | Coder | 40 min | High | ⏳ Pending |
| W2B.2 | Unit test locally | Coder | 20 min | High | ⏳ Pending |

**Dependencies:** Wave 1  
**Assigned To:** Coder Agent  
**Spec Reference:** `FUNCTION_SPEC_REFRESH_TOKENS.md`

#### Track 2C: Learn Patterns Function

| Task ID | Task | Subagent | Effort | Priority | Status |
|---------|------|----------|--------|----------|--------|
| W2C.1 | Create `learn-ai-patterns.ts` | Coder | 60 min | Medium | ⏳ Pending |
| W2C.2 | Unit test locally | Coder | 30 min | Medium | ⏳ Pending |

**Dependencies:** Wave 1  
**Assigned To:** Coder Agent  
**Spec Reference:** `FUNCTION_SPEC_LEARN_PATTERNS.md`

**Note:** All Track 2 tasks can run in parallel after Wave 1 completes.

---

### Wave 3: Integration (30 min) - SEQUENTIAL

| Task ID | Task | Subagent | Effort | Priority | Status |
|---------|------|----------|--------|----------|--------|
| W3.1 | Update `lib/inngest/functions/index.ts` | Coder | 5 min | High | ⏳ Pending |
| W3.2 | Register functions in `app/api/inngest/route.ts` | Coder | 5 min | High | ⏳ Pending |
| W3.3 | Run TypeScript build | Coder | 5 min | High | ⏳ Pending |
| W3.4 | Test with Inngest Dev Server | Coder | 15 min | High | ⏳ Pending |

**Dependencies:** Wave 2 (all tracks complete)  
**Assigned To:** Coder Agent  
**Deliverables:**
- All functions exported and registered
- Build passes with no errors
- Functions visible in Inngest Dev Server dashboard

---

### Wave 4: Cleanup (15 min) - SEQUENTIAL

| Task ID | Task | Subagent | Effort | Priority | Status |
|---------|------|----------|--------|----------|--------|
| W4.1 | Delete `app/api/cron/cleanup-pkce/route.ts` | Coder | 2 min | Medium | ⏳ Pending |
| W4.2 | Delete `app/api/cron/refresh-tokens/route.ts` | Coder | 2 min | Medium | ⏳ Pending |
| W4.3 | Delete `app/api/cron/learn-patterns/route.ts` | Coder | 2 min | Medium | ⏳ Pending |
| W4.4 | Update `vercel.json` (remove cron config) | Coder | 2 min | Medium | ⏳ Pending |
| W4.5 | Delete empty cron directories | Coder | 2 min | Low | ⏳ Pending |
| W4.6 | Verify build still passes | Coder | 5 min | High | ⏳ Pending |

**Dependencies:** Wave 3 (tested and validated)  
**Assigned To:** Coder Agent  
**Deliverables:**
- Old cron endpoints deleted
- `vercel.json` updated or removed
- Build passes after cleanup

---

### Wave 5: Testing & Validation (1 hour) - SEQUENTIAL

| Task ID | Task | Subagent | Effort | Priority | Status |
|---------|------|----------|--------|----------|--------|
| W5.1 | Manual trigger test (cleanup PKCE) | Browser Testing | 10 min | High | ⏳ Pending |
| W5.2 | Manual trigger test (refresh tokens) | Browser Testing | 10 min | High | ⏳ Pending |
| W5.3 | Manual trigger test (learn patterns) | Browser Testing | 10 min | Medium | ⏳ Pending |
| W5.4 | Verify Inngest dashboard logs | Browser Testing | 10 min | High | ⏳ Pending |
| W5.5 | Code review (all functions) | Code Reviewer | 20 min | High | ⏳ Pending |

**Dependencies:** Wave 4  
**Assigned To:** Browser Testing Agent + Code Reviewer Agent  
**Deliverables:**
- All functions execute successfully
- Dashboard shows correct execution traces
- Code review approval

---

### Wave 6: Documentation Updates (30 min) - PARALLEL

| Task ID | Task | Subagent | Effort | Priority | Status |
|---------|------|----------|--------|----------|--------|
| W6.1 | Update `AGENTS.md` (remove cron refs) | Coder | 10 min | Medium | ⏳ Pending |
| W6.2 | Update `README.md` (add Inngest setup) | Coder | 10 min | Medium | ⏳ Pending |
| W6.3 | Update `docs/API_DOCUMENTATION.md` | Coder | 10 min | Low | ⏳ Pending |

**Dependencies:** Wave 5 (validated)  
**Assigned To:** Coder Agent  

---

## 2. Agent Responsibilities

### 2.1 Coder Agent (Primary - 3 hours)

**Responsibilities:**
- Create 3 new Inngest functions
- Update configuration files
- Delete old cron endpoints
- Update documentation
- Run builds and local testing

**Required Skills:**
- TypeScript proficiency
- Inngest SDK knowledge
- Next.js App Router familiarity
- Database queries (Drizzle ORM)

**Deliverables:**
- 3 new function files
- Updated `index.ts` and `route.ts`
- Updated `.env.example`
- Cleaned up old files
- Updated documentation

### 2.2 Browser Testing Agent (30 min)

**Responsibilities:**
- Manual trigger testing via Inngest dashboard
- Verify function execution logs
- Check database changes
- Validate error handling

**Required Tools:**
- Access to Inngest Dev Server (http://localhost:8288)
- Database inspection tools

**Deliverables:**
- Test execution report
- Screenshots of successful runs
- Database validation results

### 2.3 Code Reviewer Agent (20 min)

**Responsibilities:**
- Review all 3 new functions
- Check code quality and patterns
- Verify error handling
- Validate type safety
- Approve for production

**Checklist:**
- [ ] Follows existing function patterns
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate
- [ ] Types are correct
- [ ] No security issues
- [ ] Performance is acceptable

**Deliverables:**
- Code review approval
- List of any required changes

---

## 3. Coordination Plan

### 3.1 Sequential Dependencies

```
Wave 1 (Setup)
    ↓
Wave 2 (Functions) - All 3 tracks in parallel
    ↓
Wave 3 (Integration)
    ↓
Wave 4 (Cleanup)
    ↓
Wave 5 (Testing)
    ↓
Wave 6 (Documentation)
```

### 3.2 Handoff Points

| Handoff | From | To | Trigger |
|---------|------|----|---------| 
| Setup → Functions | Coder | Coder | Build passes |
| Functions → Integration | Coder | Coder | All 3 functions created |
| Integration → Cleanup | Coder | Coder | Dev server test passes |
| Cleanup → Testing | Coder | Browser Testing | Build passes after cleanup |
| Testing → Review | Browser Testing | Code Reviewer | All tests pass |
| Review → Documentation | Code Reviewer | Coder | Approval received |

---

## 4. Task Tracking

### 4.1 GitHub Issues (Recommended)

**Epic:** Migrate Vercel Cron to Inngest

**Issues:**
1. `[W1] Setup: Add Inngest environment variables` (Coder)
2. `[W2A] Create cleanup-pkce-verifiers function` (Coder)
3. `[W2B] Create refresh-oauth-tokens function` (Coder)
4. `[W2C] Create learn-ai-patterns function` (Coder)
5. `[W3] Integration: Register all Inngest functions` (Coder)
6. `[W4] Cleanup: Remove Vercel Cron endpoints` (Coder)
7. `[W5] Testing: Validate Inngest functions` (Browser Testing)
8. `[W5] Code Review: Approve migration` (Code Reviewer)
9. `[W6] Documentation: Update references` (Coder)

**Labels:** `inngest`, `migration`, `backend`, `cron`

### 4.2 Status Updates

**Daily Standup Questions:**
- What wave are we on?
- Any blockers?
- Are handoffs smooth?
- Any issues discovered?

---

## 5. Risk Management

### 5.1 Potential Blockers

| Risk | Impact | Owner | Mitigation |
|------|--------|-------|------------|
| TypeScript errors in new functions | High | Coder | Follow existing patterns, test incrementally |
| Inngest Dev Server not starting | Medium | Coder | Check port 8288 availability |
| OAuth token refresh fails in test | Medium | Browser Testing | Use test accounts, check credentials |
| AI learning takes too long | Low | Coder | Add timeout configuration |
| Missing environment variables | High | Coder | Document all required vars |

### 5.2 Contingency Plans

**If critical blocker:**
1. Pause migration
2. Keep Vercel Cron active
3. Debug issue in isolation
4. Resume when resolved

**If minor issue:**
1. Log in spec document
2. Continue with other tasks
3. Address before Wave 5

---

## 6. Success Metrics

### 6.1 Completion Criteria

- [ ] All 3 Inngest functions created
- [ ] Functions registered and visible in dashboard
- [ ] TypeScript build passes with no errors
- [ ] All manual tests pass
- [ ] Code review approved
- [ ] Old cron endpoints deleted
- [ ] `vercel.json` updated
- [ ] Documentation updated
- [ ] Deployed to staging successfully

### 6.2 Quality Gates

**Gate 1:** After Wave 2 - All functions compile  
**Gate 2:** After Wave 3 - Integration test passes  
**Gate 3:** After Wave 5 - Code review approval  
**Gate 4:** After staging deploy - 24 hours error-free  

---

## 7. Communication Plan

### 7.1 Synchronous Communication

**Coder ↔ Browser Testing:**
- When functions are ready for testing
- When testing reveals issues

**Browser Testing ↔ Code Reviewer:**
- When tests complete
- When anomalies detected

**Code Reviewer ↔ Coder:**
- When changes requested
- When approval granted

### 7.2 Asynchronous Updates

**Status Document:** `specs/inngest-migration/STATUS.md`
- Updated after each wave
- Tracks completion %
- Lists blockers

---

## 8. Timeline

### 8.1 Optimistic Timeline (1 day)

| Time | Wave | Duration |
|------|------|----------|
| 9:00 AM | Wave 1 | 15 min |
| 9:15 AM | Wave 2 (parallel) | 2 hours |
| 11:15 AM | Wave 3 | 30 min |
| 11:45 AM | Wave 4 | 15 min |
| 12:00 PM | Lunch Break | 1 hour |
| 1:00 PM | Wave 5 | 1 hour |
| 2:00 PM | Wave 6 | 30 min |
| 2:30 PM | Deploy to Staging | - |

**Total:** ~4.5 hours of work

### 8.2 Realistic Timeline (2 days)

**Day 1:**
- Waves 1-3 (functions created and integrated)
- Initial local testing
- Staging deployment

**Day 2:**
- Wave 4 (cleanup old endpoints)
- Wave 5 (comprehensive testing)
- Wave 6 (documentation)
- Code review and approval
- Production deployment

---

## 9. Post-Migration

### 9.1 Monitoring (Ongoing)

**Owner:** DevOps / Coder Agent  
**Duration:** 72 hours  
**Tasks:**
- Monitor Inngest dashboard
- Check Sentry for errors
- Verify cron executions
- Track success rates

### 9.2 Handoff to Operations

**Documentation to Provide:**
- Inngest dashboard URL
- Function execution schedules
- Alert thresholds
- Troubleshooting guide

---

**Status:** ✅ Assignment Matrix Complete  
**Ready for:** Stakeholder approval and agent assignment  
**Estimated Start Date:** TBD  
**Estimated Completion:** 1-2 days after start
