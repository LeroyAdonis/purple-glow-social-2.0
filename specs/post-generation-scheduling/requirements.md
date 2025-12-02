# Post Generation, Scheduling & Auto-Publishing - Requirements

**Feature:** Post Generation, Scheduling & Auto-Publishing with Tier-Based Restrictions  
**Version:** 1.0  
**Created:** 2025-12-02  
**Status:** Draft

---

## 1. Overview

This feature implements a comprehensive post generation, scheduling, and auto-publishing system with tier-based restrictions, credit management, and admin monitoring capabilities for Purple Glow Social 2.0.

---

## 2. Business Requirements

### 2.1 Credit System

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| CR-001 | Credits are ONLY deducted on successful publish (not on generation) | P0 |
| CR-002 | 1 credit is charged per platform per successful post | P0 |
| CR-003 | Multi-platform posts charge 1 credit per platform (e.g., 3 platforms = 3 credits) | P0 |
| CR-004 | Failed posts do NOT consume credits | P0 |
| CR-005 | Retry attempts use the same reserved credit (no double-charging) | P0 |
| CR-006 | Credits reset to base amount at subscription renewal (not additive) | P1 |
| CR-007 | Unused credits expire at end of billing cycle (no rollover) | P1 |
| CR-008 | Only Pro/Business tiers can purchase credit top-ups | P1 |

### 2.2 Tier Limits

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Monthly Credits | 10 | 500 | 2000 |
| Connected Accounts (per platform) | 1 | 3 | Unlimited |
| Max Scheduled Posts (queue) | 5 | 50 | Unlimited |
| AI Generations per day | 5 | 100 | Unlimited |
| Automation Rules | 0 (disabled) | 5 | Unlimited |
| Variations per generation | 1 | 3 | 3 |
| Languages available | All 11 | All 11 | All 11 |
| Video credits included | No | 10/month | 50/month |
| Priority support | No | No | Yes |
| Advance scheduling | 7 days | 30 days | 90 days |
| Posts per day per platform | 3 | 10 | Unlimited |

### 2.3 Connected Accounts

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| CA-001 | Limit connected accounts per platform per tier | P0 |
| CA-002 | Free: 1 account per platform | P0 |
| CA-003 | Pro: 3 accounts per platform | P0 |
| CA-004 | Business: Unlimited accounts per platform | P0 |
| CA-005 | Display account limit in connection UI | P1 |
| CA-006 | Prevent connection if limit reached with upgrade prompt | P1 |

### 2.4 Scheduling & Publishing

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| SP-001 | Posts can be scheduled within tier's advance limit | P0 |
| SP-002 | Daily post limit enforced per platform per tier | P0 |
| SP-003 | Queue size limit enforced per tier | P0 |
| SP-004 | Scheduled posts processed via Inngest for reliability | P0 |
| SP-005 | Failed posts trigger automatic retry (3 attempts) | P1 |
| SP-006 | Users notified of scheduling limit before hitting it | P2 |

### 2.5 Credit Warning & Notifications

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| NF-001 | Warn users when credits fall below 20% of allocation | P0 |
| NF-002 | Warn users 3 days before credits expire | P1 |
| NF-003 | Skip scheduled post if 0 credits and notify user | P0 |
| NF-004 | Send email notification for skipped posts | P2 |
| NF-005 | Dashboard banner for low credits | P1 |

### 2.6 Admin Dashboard

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| AD-001 | Real-time view of AI generation errors | P0 |
| AD-002 | Real-time view of publishing errors | P0 |
| AD-003 | Track credits used per platform | P1 |
| AD-004 | Track credits used per content type | P1 |
| AD-005 | Generation vs publishing breakdown analytics | P1 |
| AD-006 | Automation rules monitoring | P1 |
| AD-007 | User tier distribution and revenue tracking | P1 |
| AD-008 | Inngest job queue monitoring | P0 |
| AD-009 | Failed job retry controls | P1 |

### 2.7 Automation Rules (Pro/Business Only)

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| AR-001 | Free tier cannot create/use automation rules | P0 |
| AR-002 | Automation checks credit balance before generating | P0 |
| AR-003 | Automation pauses if credits depleted | P0 |
| AR-004 | User notified when automation paused | P1 |
| AR-005 | Admin can view all automation rules across users | P1 |

---

## 3. Technical Requirements

### 3.1 Inngest Integration

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| IN-001 | Replace Vercel Cron with Inngest for job processing | P0 |
| IN-002 | Implement scheduled post processing as Inngest function | P0 |
| IN-003 | Implement retry logic (3 attempts, exponential backoff) | P0 |
| IN-004 | Log all job events to database for admin visibility | P1 |
| IN-005 | Integrate Inngest dashboard for monitoring | P1 |

### 3.2 Database Schema Updates

| Requirement ID | Description | Priority |
|---------------|-------------|----------|
| DB-001 | Add `creditReservations` table for pending publishes | P0 |
| DB-002 | Add `generationLogs` table for AI usage tracking | P0 |
| DB-003 | Add `notifications` table for user alerts | P1 |
| DB-004 | Add `dailyUsage` table for rate limiting | P0 |
| DB-005 | Update `user` table with `videoCredits` field | P1 |
| DB-006 | Add `jobLogs` table for Inngest job tracking | P0 |

### 3.3 API Endpoints

| Endpoint | Method | Description | Priority |
|----------|--------|-------------|----------|
| `/api/credits/balance` | GET | Get user credit balance and limits | P0 |
| `/api/credits/reserve` | POST | Reserve credits for scheduled post | P0 |
| `/api/credits/release` | POST | Release reserved credits (failed post) | P0 |
| `/api/limits/check` | POST | Check if action is within tier limits | P0 |
| `/api/admin/analytics` | GET | Get admin analytics data | P1 |
| `/api/admin/jobs` | GET | Get Inngest job status | P1 |
| `/api/admin/jobs/retry` | POST | Manually retry failed job | P1 |
| `/api/notifications` | GET | Get user notifications | P1 |
| `/api/notifications/dismiss` | POST | Dismiss notification | P2 |

### 3.4 Test Accounts

| Account | Email | Tier | Purpose |
|---------|-------|------|---------|
| Free Test User | free@test.purpleglow.co.za | Free | Test free tier limits |
| Pro Test User | pro@test.purpleglow.co.za | Pro | Test pro tier features |
| Business Test User | business@test.purpleglow.co.za | Business | Test unlimited features |
| Admin Test User | admin@test.purpleglow.co.za | Business + Admin | Test admin dashboard |
| Low Credit User | lowcredit@test.purpleglow.co.za | Pro | Test credit warnings (2 credits) |
| Zero Credit User | zerocredit@test.purpleglow.co.za | Pro | Test zero credit behavior |

---

## 4. Acceptance Criteria

### 4.1 Credit System
- [ ] User can generate content unlimited times without credit deduction
- [ ] Publishing to 1 platform deducts 1 credit
- [ ] Publishing to 3 platforms deducts 3 credits
- [ ] Failed publish does not deduct credits
- [ ] Retry uses same reserved credit
- [ ] Credit balance updates in real-time on dashboard

### 4.2 Tier Limits
- [ ] Free user blocked after 5 daily generations with upgrade prompt
- [ ] Free user cannot add 2nd account per platform
- [ ] Pro user can schedule up to 50 posts
- [ ] Business user has no queue limits
- [ ] Automation disabled for Free tier with clear messaging

### 4.3 Admin Dashboard
- [ ] Admin sees all generation errors in real-time
- [ ] Admin sees all publishing errors in real-time
- [ ] Admin can retry failed jobs
- [ ] Analytics show credits per platform breakdown
- [ ] Analytics show generation vs publishing stats

### 4.4 Notifications
- [ ] User sees warning at 20% credits remaining
- [ ] User receives notification for skipped posts
- [ ] Dashboard shows credit expiry warning 3 days before

---

## 5. Out of Scope (Phase 1)

- Email notifications (future enhancement)
- SMS notifications
- Mobile push notifications
- Advanced analytics (engagement tracking)
- A/B testing for content
- Team collaboration features

---

## 6. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Inngest | External Service | Free tier available, scales to paid |
| PostgreSQL (Neon) | Database | Already configured |
| Polar.sh | Payments | Already integrated |
| Better-auth | Authentication | Already configured |
| Google Gemini | AI | Already integrated |

---

## 7. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Inngest service outage | High | Fallback to database queue |
| Credit calculation errors | High | Comprehensive testing, audit logs |
| Tier enforcement bypass | Medium | Server-side validation, no client trust |
| Rate limit abuse | Medium | IP-based + account-based limits |

---

**Next:** See `implementation-plan.md` for detailed phases and tasks.
