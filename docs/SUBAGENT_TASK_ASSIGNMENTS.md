# 👥 Subagent Task Assignments - Purple Glow Social 2.0

**Date:** January 21, 2026  
**Phase:** Pre-Launch Critical Path  
**Objective:** Execute remaining tasks for beta launch

---

## 🔴 CRITICAL PRIORITY (Pre-Launch - Must Do)

### Task 1: H007 - Remove Image Generation Claims
**Assigned to:** Frontend Agent  
**Skill Required:** React, Next.js, JSON, i18n  
**Estimated Time:** 1 hour  
**Priority:** 🔴 CRITICAL  
**Dependencies:** None  
**Blocks:** Final QA testing, production launch

#### Files to Modify:
1. **`lib/translations/en.json`** (line 19)
   - Change: `"Gemini 2.5 Flash + Imagen 3 powering your posts"`
   - To: `"Gemini 2.5 Flash powering your posts with AI-suggested visuals"`

2. **`app/page.tsx`** (line 400)
   - Remove: `<span className="text-[10px] font-mono tracking-wider">IMAGEN 3</span>`
   - Or change to: `<span className="text-[10px] font-mono tracking-wider">AI PROMPTS</span>`

3. **`lib/translations/en.json`** (lines 85-112, pricing section)
   - Change: `"50 Image Credits / month"`
   - To: `"50 AI Posts / month"`
   - Change: `"200 Image & Video Credits"`
   - To: `"200 AI Posts / month"`

4. **Repeat for all 11 languages:**
   - `lib/translations/af.json`
   - `lib/translations/zu.json`
   - `lib/translations/xh.json`
   - `lib/translations/nso.json`
   - `lib/translations/tn.json`
   - `lib/translations/st.json`
   - `lib/translations/ts.json`
   - `lib/translations/ss.json`
   - `lib/translations/ve.json`
   - `lib/translations/nr.json`

#### Acceptance Criteria:
- [ ] No mention of "Imagen 3" on landing page
- [ ] No mention of "Image Credits" in pricing
- [ ] All 11 language files updated consistently
- [ ] Hero section badge updated or removed
- [ ] Pricing cards show "AI Posts" instead of "Image Credits"
- [ ] No broken translations or missing keys

#### Testing:
```bash
# Test translations load correctly
npm run dev
# Navigate to landing page
# Switch through all 11 languages
# Verify no "Imagen 3" or "Image Credits" appear
```

---

### Task 2: Final QA Testing
**Assigned to:** Testing Agent  
**Skill Required:** E2E testing, OAuth flows, Payment testing  
**Estimated Time:** 2 hours  
**Priority:** 🔴 CRITICAL  
**Dependencies:** Task 1 complete  
**Blocks:** Production launch

#### Test Scenarios:

##### 1. Authentication Flow (30 min)
- [ ] Email/password signup
- [ ] Email/password login
- [ ] Google OAuth login
- [ ] Session persistence after refresh
- [ ] Logout functionality
- [ ] Admin dashboard access (admin@test.purpleglow.co.za)
- [ ] Non-admin blocked from admin dashboard (403 page)

##### 2. OAuth Connection Flow (30 min)
- [ ] Connect Facebook account
- [ ] Connect Instagram account
- [ ] Connect Twitter/X account
- [ ] Connect LinkedIn account
- [ ] Verify tokens encrypted in database
- [ ] Disconnect account functionality
- [ ] Connection status indicators

##### 3. Content Generation & Posting (30 min)
- [ ] Generate AI content (English)
- [ ] Generate AI content (Zulu)
- [ ] Generate AI content (Afrikaans)
- [ ] Schedule post for future date
- [ ] Publish immediate post to Facebook
- [ ] Publish immediate post to Instagram
- [ ] Publish immediate post to Twitter
- [ ] Publish immediate post to LinkedIn
- [ ] Verify credits deducted correctly

##### 4. Payment & Credits (15 min)
- [ ] View credit balance
- [ ] Credit deduction on publish
- [ ] Free tier limits enforced (10 credits)
- [ ] Pro tier limits (500 credits)
- [ ] Subscription modal opens
- [ ] Credit topup modal opens

##### 5. Mobile Experience (15 min)
- [ ] Mobile navigation hamburger opens
- [ ] Mobile navigation drawer closes
- [ ] Dashboard responsive on mobile
- [ ] Content generator responsive
- [ ] Landing page responsive (320px width)

#### Test Accounts:
```
Free: free@test.purpleglow.co.za / TestFree123!
Pro: pro@test.purpleglow.co.za / TestPro123!
Business: business@test.purpleglow.co.za / TestBiz123!
Admin: admin@test.purpleglow.co.za / TestAdmin123!
```

#### Acceptance Criteria:
- [ ] All authentication flows working
- [ ] All 4 OAuth platforms connect successfully
- [ ] AI content generation working (11 languages)
- [ ] Posts publish to all 4 platforms
- [ ] Credits deduct correctly
- [ ] Mobile navigation fully functional
- [ ] No console errors in browser
- [ ] No 500 errors in Network tab
- [ ] Admin dashboard accessible only to admin users

---

## 🟡 HIGH PRIORITY (Week 2 - Post-Launch)

### Task 3: H006 - Contact Form Backend
**Assigned to:** Backend Agent  
**Skill Required:** Next.js API routes, Email integration  
**Estimated Time:** 4 hours  
**Priority:** 🟡 HIGH  
**Dependencies:** None  
**Timeline:** Week 2 (post-launch)

#### Implementation Steps:

1. **Create API endpoint** (`app/api/contact/route.ts`)
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { Resend } from 'resend';
   
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   export async function POST(request: NextRequest) {
     // Parse request body
     // Validate fields (name, email, message)
     // Send email via Resend
     // Return success response
   }
   ```

2. **Add form submission handler** (`app/page.tsx`)
   ```typescript
   const handleContactSubmit = async (e: FormEvent) => {
     e.preventDefault();
     // Submit to /api/contact
     // Show success toast
   }
   ```

3. **Add environment variable**
   ```bash
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Add rate limiting**
   - Limit to 3 submissions per 15 minutes per IP
   - Prevent spam

#### Acceptance Criteria:
- [ ] Contact form submits successfully
- [ ] Email received by support team
- [ ] User sees success message
- [ ] Form validates required fields
- [ ] Rate limiting prevents spam
- [ ] Works in production

---

### Task 4: H005 - Draft Management UI
**Assigned to:** Frontend Agent  
**Skill Required:** React, Next.js, UI/UX  
**Estimated Time:** 6 hours  
**Priority:** 🟡 HIGH  
**Dependencies:** None  
**Timeline:** Week 2 (post-launch)

#### Implementation Steps:

1. **Add "Save as Draft" button** to AI Content Studio
   - Button next to "Schedule Post"
   - Saves post with status="draft"

2. **Create Drafts tab** in dashboard
   - New tab: "Dashboard | Schedule | Drafts | Automation | Settings"
   - List all posts with status="draft"

3. **Add draft actions**
   - Edit draft
   - Delete draft
   - Schedule draft
   - Publish draft immediately

4. **Database query**
   ```typescript
   const drafts = await db.select()
     .from(posts)
     .where(eq(posts.status, 'draft'))
     .where(eq(posts.userId, userId));
   ```

#### Acceptance Criteria:
- [ ] "Save as Draft" button functional
- [ ] Drafts tab shows all user drafts
- [ ] Can edit existing draft
- [ ] Can delete draft
- [ ] Can schedule draft for later
- [ ] Can publish draft immediately
- [ ] Draft count badge on tab

---

### Task 5: H004 - Rate Limit UI Feedback
**Assigned to:** Frontend Agent  
**Skill Required:** React, Toast notifications  
**Estimated Time:** 3 hours  
**Priority:** 🟡 HIGH  
**Dependencies:** None  
**Timeline:** Week 2 (post-launch)

#### Implementation Steps:

1. **Create toast notification component**
   - Use Sonner or react-hot-toast
   - Style matches Purple Glow theme

2. **Handle 429 responses**
   ```typescript
   if (response.status === 429) {
     const data = await response.json();
     toast.error(
       `Rate limit exceeded. Try again in ${data.retryAfter} seconds.`,
       { duration: data.retryAfter * 1000 }
     );
   }
   ```

3. **Add countdown timer**
   - Show "Retry in: 30s, 29s, 28s..."
   - Re-enable button after countdown

4. **Improve error messages**
   - "Haai, slow down! Too many AI generations."
   - "Sharp sharp! Too many posts. Try again in 30 seconds."

#### Acceptance Criteria:
- [ ] Toast appears on rate limit
- [ ] Shows seconds until retry
- [ ] User-friendly South African messaging
- [ ] Button disabled during cooldown
- [ ] Works for all rate-limited endpoints

---

### Task 6: Database - Credit Race Condition Fix
**Assigned to:** Backend Agent  
**Skill Required:** PostgreSQL, Drizzle ORM, Transactions  
**Estimated Time:** 4 hours  
**Priority:** 🟢 MEDIUM  
**Dependencies:** None  
**Timeline:** Week 2 (post-launch)

#### Problem:
- Test `credit-race-condition.test.ts` failing
- Concurrent credit deductions cause race condition
- Query fails: `"credits" >= $4` check fails under load

#### Solution:
1. **Add database transaction**
   ```typescript
   await db.transaction(async (tx) => {
     const result = await tx.update(user)
       .set({ 
         credits: sql`${user.credits} - ${amount}`,
         updated_at: new Date()
       })
       .where(and(
         eq(user.id, userId),
         gte(user.credits, amount)
       ))
       .returning({ credits: user.credits });
     
     if (!result.length) {
       throw new Error('Insufficient credits');
     }
   });
   ```

2. **Add optimistic locking**
   - Use `version` field
   - Increment on each update
   - Retry on conflict

3. **Re-run tests**
   ```bash
   npm run test:run tests/integration/credit-race-condition.test.ts
   ```

#### Acceptance Criteria:
- [ ] All race condition tests passing
- [ ] No incorrect credit deductions
- [ ] Transaction rollback on failure
- [ ] 150/150 tests passing

---

## 🔵 LOW PRIORITY (Week 3+ - Feature Additions)

### Task 7: AI Image Generation Integration
**Assigned to:** AI Integration Agent  
**Skill Required:** API integration, Image processing  
**Estimated Time:** 8-16 hours  
**Priority:** 🔵 LOW  
**Dependencies:** Product decision required  
**Timeline:** Week 3-4 (based on user demand)

#### Options:

**Option A: Pollinations.ai (Free)**
- Free API, no key required
- Simple REST endpoint
- Good quality images
- Implementation time: 8 hours

**Option B: DALL-E 3 (Paid)**
- OpenAI API key required
- High quality images
- Costs per generation
- Implementation time: 12 hours

**Option C: Imagen 3 (Google)**
- Google Vertex AI required
- Highest quality
- Complex setup
- Implementation time: 16 hours

#### Decision Criteria:
- User feedback: Do users want image generation?
- Budget: Can we afford paid API?
- Quality: What quality level is acceptable?

#### Not blocking launch - reassess after Week 1 user feedback.

---

## 📊 Summary Table

| Task | Agent | Priority | Time | Timeline | Status |
|------|-------|----------|------|----------|--------|
| H007: Remove Image Claims | Frontend | 🔴 CRITICAL | 1h | Pre-launch | ⏳ Pending |
| Final QA Testing | Testing | 🔴 CRITICAL | 2h | Pre-launch | ⏳ Pending |
| H006: Contact Form | Backend | 🟡 HIGH | 4h | Week 2 | 📋 Planned |
| H005: Draft UI | Frontend | 🟡 HIGH | 6h | Week 2 | 📋 Planned |
| H004: Rate Limit UX | Frontend | 🟡 HIGH | 3h | Week 2 | 📋 Planned |
| DB: Race Condition | Backend | 🟢 MEDIUM | 4h | Week 2 | 📋 Planned |
| AI: Image Generation | AI Agent | 🔵 LOW | 8-16h | Week 3-4 | 💭 Consider |

**Total Pre-Launch:** 3 hours  
**Total Week 2:** 17 hours  
**Total Week 3-4:** 8-16 hours (optional)

---

## 🚀 Execution Timeline

### Today (January 21)
- **10:00 AM:** Kickoff meeting
- **10:15 AM:** Frontend Agent starts H007 (1h)
- **11:15 AM:** H007 complete, code review
- **11:30 AM:** Testing Agent starts QA (2h)
- **1:30 PM:** QA complete, deploy decision

### Tomorrow (January 22)
- **9:00 AM:** Deploy to production (if QA passed)
- **9:30 AM:** Monitor Sentry, logs, database
- **10:00 AM:** Announce beta launch
- **All day:** Monitor for critical bugs

### Next Week (Week 2)
- **Monday:** Start H006 (Contact Form)
- **Tuesday:** Start H005 (Draft UI)
- **Wednesday:** Start H004 (Rate Limit UX)
- **Thursday:** Start DB race condition fix
- **Friday:** Review week, plan Week 3

---

## 📞 Communication Protocol

### Daily Standups
- **Time:** 9:00 AM SAST
- **Duration:** 15 minutes
- **Format:** What did you do? What will you do? Any blockers?

### Issue Escalation
- **Critical bugs:** Slack @channel immediately
- **Blockers:** Tag lead engineer
- **Questions:** Post in #purple-glow-dev

### Deployment Notifications
- **Pre-deploy:** Announce in #deployments 30 min before
- **Post-deploy:** Confirm success in #deployments
- **Rollback:** Immediate notification if needed

---

**Status:** Task assignments ready  
**Next Action:** Assign agents and begin work  
**Estimated Launch:** Within 3 hours of starting

