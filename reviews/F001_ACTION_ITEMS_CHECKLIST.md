# F001 Draft Management - Action Items Checklist

**Created:** January 20, 2025  
**Owner:** Development Team  
**Status:** 🔴 BLOCKED - Waiting for API Implementation

---

## Critical Path (P0) - Must Complete Before Deployment

### 1. API Implementation (Owner: Coder Agent)

**Estimated Effort:** 10-15 hours  
**Deadline:** ASAP (Blocking everything else)

#### Endpoint 1: GET /api/posts/drafts
- [ ] Create file: `app/api/posts/drafts/route.ts`
- [ ] Implement GET handler
- [ ] Add Better-auth session check
- [ ] Add userId authorization filter
- [ ] Parse query parameters (platform, sort, limit, offset)
- [ ] Query database with Drizzle ORM
- [ ] Return paginated response
- [ ] Add structured logging
- [ ] Test with Postman/Insomnia

**Acceptance Criteria:**
- Returns 401 if not authenticated
- Returns only user's own drafts
- Filters by platform work correctly
- Sorting (newest/oldest) works
- Pagination works (limit, offset, hasMore)
- Response matches spec format

---

#### Endpoint 2: POST /api/posts/drafts
- [ ] Create file: `app/api/posts/drafts/route.ts` (same file as GET)
- [ ] Implement POST handler
- [ ] Add Better-auth session check
- [ ] Create Zod validation schema
- [ ] Validate request body
- [ ] Insert draft into database
- [ ] Return created draft (201 status)
- [ ] Add structured logging
- [ ] Test with Postman/Insomnia

**Acceptance Criteria:**
- Returns 401 if not authenticated
- Returns 400 if validation fails
- Content length validated (max 10,000 chars)
- Platform enum validated
- Draft saved with status='draft'
- Returns 201 with created draft

---

#### Endpoint 3: PATCH /api/posts/drafts/[id]
- [ ] Create file: `app/api/posts/drafts/[id]/route.ts`
- [ ] Implement PATCH handler
- [ ] Add Better-auth session check
- [ ] Verify draft exists
- [ ] Verify user owns draft
- [ ] Create Zod validation schema for updates
- [ ] Update draft in database
- [ ] Update `updatedAt` timestamp
- [ ] Return updated draft
- [ ] Add structured logging
- [ ] Test with Postman/Insomnia

**Acceptance Criteria:**
- Returns 401 if not authenticated
- Returns 404 if draft not found
- Returns 403 if user doesn't own draft
- Partial updates work (only provided fields updated)
- updatedAt timestamp updates
- Returns 200 with updated draft

---

#### Endpoint 4: DELETE /api/posts/drafts/[id]
- [ ] Create file: `app/api/posts/drafts/[id]/route.ts` (same file as PATCH)
- [ ] Implement DELETE handler
- [ ] Add Better-auth session check
- [ ] Verify draft exists
- [ ] Verify user owns draft
- [ ] Delete associated image from Vercel Blob (if exists)
- [ ] Delete draft from database
- [ ] Return success message
- [ ] Add structured logging
- [ ] Test with Postman/Insomnia

**Acceptance Criteria:**
- Returns 401 if not authenticated
- Returns 404 if draft not found
- Returns 403 if user doesn't own draft
- Associated images deleted from storage
- Draft removed from database
- Returns 200 with success message

---

#### Endpoint 5: POST /api/upload/image
- [ ] Create file: `app/api/upload/image/route.ts`
- [ ] Implement POST handler
- [ ] Add Better-auth session check
- [ ] Parse multipart/form-data
- [ ] Validate file type (JPEG, PNG, WebP)
- [ ] Validate file size (max 5MB)
- [ ] Upload to Vercel Blob
- [ ] Return image URL
- [ ] Add structured logging
- [ ] Test with Postman/Insomnia

**Acceptance Criteria:**
- Returns 401 if not authenticated
- Returns 400 if no file provided
- Returns 400 if invalid file type
- Returns 400 if file too large
- Image uploaded to Vercel Blob
- Returns 200 with image URL

---

### 2. Database Functions (Owner: Coder Agent)

**Estimated Effort:** 2-3 hours

#### Function: getDrafts()
- [ ] Open file: `lib/db/posts.ts`
- [ ] Create `getDrafts()` function
- [ ] Accept parameters: userId, platform, sort, limit, offset
- [ ] Query posts table where status='draft'
- [ ] Filter by userId
- [ ] Filter by platform (if provided)
- [ ] Order by createdAt (asc or desc)
- [ ] Apply limit and offset
- [ ] Return array of drafts
- [ ] Add JSDoc comments

**Signature:**
```typescript
export async function getDrafts(
  userId: string,
  options: {
    platform?: string;
    sort?: 'newest' | 'oldest';
    limit?: number;
    offset?: number;
  }
): Promise<Draft[]>
```

---

#### Function: countDrafts()
- [ ] Open file: `lib/db/posts.ts`
- [ ] Create `countDrafts()` function
- [ ] Accept parameters: userId, platform (optional)
- [ ] Query posts table where status='draft'
- [ ] Filter by userId
- [ ] Filter by platform (if provided)
- [ ] Return count as number
- [ ] Add JSDoc comments

**Signature:**
```typescript
export async function countDrafts(
  userId: string,
  platform?: string
): Promise<number>
```

---

#### Update: getPostStats()
- [ ] Open file: `lib/db/posts.ts`
- [ ] Find `getPostStats()` function
- [ ] Add draft count to returned stats
- [ ] Query: `SELECT COUNT(*) FROM posts WHERE userId=? AND status='draft'`
- [ ] Return `draftCount` in stats object
- [ ] Update TypeScript interface if needed

---

#### Database Indexes
- [ ] Open migration file or schema
- [ ] Create composite index: `(userId, status)`
- [ ] Create composite index: `(userId, status, platform)`
- [ ] Create index: `(userId, status, createdAt)`
- [ ] Run migration: `npm run db:push`

---

### 3. Rate Limiting (Owner: Coder Agent)

**Estimated Effort:** 1 hour

- [ ] Check if rate limiting middleware exists
- [ ] Apply to draft endpoints: 30 requests per minute per user
- [ ] Apply to upload endpoint: 10 requests per minute per user
- [ ] Test rate limits with automated script
- [ ] Verify 429 status code returned when exceeded

---

### 4. Integration (Owner: Coder Agent)

**Estimated Effort:** 3-4 hours

#### Dashboard Navigation
- [ ] Open file: `components/client-dashboard-view.tsx` (or equivalent)
- [ ] Add "Drafts" tab to navigation
- [ ] Add icon: `fa-file-lines` or similar
- [ ] Wire up routing to DraftManagerView
- [ ] Update active tab state
- [ ] Test navigation works

---

#### AI Content Studio Integration
- [ ] Open file: `components/ai-content-studio.tsx`
- [ ] Add "Save as Draft" button to each generated variation
- [ ] Add onClick handler to open PostCreationModal
- [ ] Pre-fill modal with generated content
- [ ] Pre-fill platform and topic
- [ ] Test save draft flow
- [ ] Verify draft appears in draft list

---

#### Dashboard Stats
- [ ] Open file: `components/client-dashboard-view.tsx`
- [ ] Add draft count to dashboard header
- [ ] Fetch draft count from API
- [ ] Display with icon and number
- [ ] Update count when drafts change
- [ ] Test real-time updates

---

## High Priority (P1) - Should Complete Before Deployment

### 5. Input Validation Schemas (Owner: Coder Agent)

**Estimated Effort:** 1-2 hours

- [ ] Create file: `lib/validation/drafts.ts`
- [ ] Define Zod schema: `createDraftSchema`
- [ ] Define Zod schema: `updateDraftSchema`
- [ ] Define Zod schema: `draftFiltersSchema`
- [ ] Import schemas in API routes
- [ ] Apply validation to all POST/PATCH endpoints
- [ ] Test with invalid data

---

### 6. Unit Tests (Owner: Testing Team)

**Estimated Effort:** 8-10 hours

#### Component Tests
- [ ] Create file: `tests/unit/draft-components.test.tsx`
- [ ] Test DraftCard rendering (5 tests)
- [ ] Test DraftCard interactions (5 tests)
- [ ] Test DraftManagerView rendering (5 tests)
- [ ] Test DraftManagerView filtering (5 tests)
- [ ] Test PostCreationModal (10 tests)
- [ ] Test ImageUploader (10 tests)
- [ ] **Target: 30+ tests, all passing**

---

#### API Tests
- [ ] Create file: `tests/unit/draft-api.test.ts`
- [ ] Test GET /api/posts/drafts (10 tests)
- [ ] Test POST /api/posts/drafts (10 tests)
- [ ] Test PATCH /api/posts/drafts/[id] (8 tests)
- [ ] Test DELETE /api/posts/drafts/[id] (7 tests)
- [ ] Test POST /api/upload/image (10 tests)
- [ ] Test authorization (5 tests)
- [ ] **Target: 35+ tests, all passing**

---

#### Integration Tests
- [ ] Create file: `tests/integration/draft-flow.test.ts`
- [ ] Test complete CRUD flow (5 tests)
- [ ] Test image upload + draft creation (2 tests)
- [ ] Test draft to scheduled post (1 test)
- [ ] Test draft to published post (1 test)
- [ ] **Target: 10+ tests, all passing**

---

#### E2E Tests
- [ ] Create file: `tests/e2e/draft-management.spec.ts`
- [ ] Test user creates draft (1 test)
- [ ] Test user edits draft (1 test)
- [ ] Test user deletes draft (1 test)
- [ ] Test user uploads image (1 test)
- [ ] Test user schedules draft (1 test)
- [ ] Test user publishes draft (1 test)
- [ ] Test AI to draft flow (1 test)
- [ ] Test filtering and sorting (1 test)
- [ ] **Target: 8+ tests, all passing**

---

### 7. Security Testing (Owner: Security Team)

**Estimated Effort:** 2-3 hours

- [ ] Test authentication bypass attempts
- [ ] Test authorization bypass (User A accessing User B's drafts)
- [ ] Test SQL injection on all inputs
- [ ] Test XSS on draft content
- [ ] Test file upload with malicious files
- [ ] Test rate limiting with automated script
- [ ] Test CSRF protection
- [ ] Run OWASP ZAP scan
- [ ] Document findings and fixes

---

### 8. Performance Testing (Owner: Performance Team)

**Estimated Effort:** 2-3 hours

- [ ] Test GET /api/posts/drafts response time (target: <200ms)
- [ ] Test POST /api/posts/drafts response time (target: <300ms)
- [ ] Test image upload with 5MB file (target: <3s)
- [ ] Test with 100 drafts in database
- [ ] Test with 200 drafts in database
- [ ] Load test: 100 concurrent users
- [ ] Monitor database query performance
- [ ] Identify and fix N+1 queries
- [ ] Document results

---

## Medium Priority (P2) - Nice to Have

### 9. Documentation (Owner: Technical Writer)

**Estimated Effort:** 2-3 hours

- [ ] Update `docs/COMPONENT_GUIDE.md` with new components
- [ ] Update `AGENTS.md` with draft feature info
- [ ] Create user guide: "How to Manage Drafts"
- [ ] Take screenshots of all draft features
- [ ] Create GIF showing draft-to-publish flow
- [ ] Document API endpoints
- [ ] Add FAQ entries for drafts
- [ ] Update changelog

---

### 10. Enhancements (Owner: Product/Dev Team)

**Estimated Effort:** 8-12 hours (Future sprint)

- [ ] Implement auto-save (every 30 seconds)
- [ ] Add optimistic UI updates
- [ ] Support multi-platform drafts
- [ ] Add bulk operations (delete multiple)
- [ ] Create draft templates feature
- [ ] Add draft sharing/collaboration
- [ ] Implement draft version history
- [ ] Add AI "Improve Draft" button

---

## Regression Testing Checklist

**Before Deployment:** Verify existing features still work

- [ ] Test login/logout flow
- [ ] Test AI content generation (all languages)
- [ ] Test post publishing (immediate)
- [ ] Test post scheduling
- [ ] Test OAuth connections
- [ ] Test admin dashboard
- [ ] Test credit management
- [ ] Test automation rules
- [ ] Run full test suite: `npm run test:run`
- [ ] **Verify: All 158+ existing tests still pass**

---

## Manual Testing Checklist

**Before Deployment:** Manual QA

### Desktop Testing
- [ ] Chrome (Windows/Mac)
- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac)
- [ ] Edge (Windows)

### Mobile Testing
- [ ] iOS Safari (iPhone 13+)
- [ ] Android Chrome (Pixel 6+)
- [ ] Responsive breakpoints: 320px, 768px, 1024px, 1920px

### Accessibility Testing
- [ ] Keyboard-only navigation
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] Screen reader testing (NVDA/JAWS/VoiceOver)
- [ ] Color contrast validation
- [ ] ARIA labels correct

### Network Conditions
- [ ] Slow 3G throttling
- [ ] Offline mode (error handling)
- [ ] Connection loss during upload

---

## Pre-Deployment Checklist

- [ ] All P0 items complete
- [ ] All P1 items complete
- [ ] 80%+ test coverage achieved
- [ ] All tests passing (0 failures)
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Code review approved
- [ ] QA testing passed
- [ ] Documentation complete
- [ ] Product owner approval
- [ ] Stakeholder sign-off
- [ ] Deployment plan documented
- [ ] Rollback plan documented
- [ ] Monitoring dashboards configured
- [ ] Error alerting configured

---

## Deployment Steps

1. [ ] Merge feature branch to staging
2. [ ] Deploy to staging environment
3. [ ] Run smoke tests on staging
4. [ ] Monitor staging for 24 hours
5. [ ] Fix any issues found
6. [ ] Get final approval
7. [ ] Deploy to production (off-peak hours)
8. [ ] Enable feature flag gradually (10% → 50% → 100%)
9. [ ] Monitor error rates and performance
10. [ ] Announce feature to users

---

## Success Metrics

**Track post-deployment:**

- [ ] Draft creation rate (drafts per day)
- [ ] Draft-to-published conversion rate
- [ ] API response times (<200ms p95)
- [ ] Error rate (<1%)
- [ ] User satisfaction (feedback surveys)
- [ ] Feature adoption rate

---

## Rollback Plan

**If critical issues found:**

1. [ ] Disable feature flag immediately
2. [ ] Investigate root cause
3. [ ] Document issue in incident report
4. [ ] Implement fix
5. [ ] Re-test thoroughly
6. [ ] Re-deploy when ready

---

## Contact for Questions

- **Technical Issues:** Coder Agent
- **Testing Questions:** QA Team Lead
- **Security Concerns:** Security Team
- **Timeline Questions:** Project Manager
- **Scope Questions:** Product Owner

---

## Progress Tracking

**Current Status:** 🔴 0% Complete (UI only, no backend)

**Update this checklist as items are completed!**

---

**Last Updated:** January 20, 2025  
**Next Review:** After API implementation  
**Owner:** Development Team

---

**Total Tasks:** 100+  
**P0 Critical:** 45 tasks  
**P1 High:** 35 tasks  
**P2 Medium:** 20+ tasks

**Let's get building!** 🚀
