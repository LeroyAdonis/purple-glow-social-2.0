# Purple Glow Social 2.0 - Final QA Test Plan

**Date:** January 22, 2026  
**Test Type:** Pre-Launch Browser Testing  
**Estimated Duration:** 30 minutes  
**Status:** Ready to Execute

---

## 🎯 Test Objectives

1. Verify admin authorization works correctly
2. Validate mobile navigation functionality
3. Confirm no false marketing claims (Imagen 3)
4. Check console is clean (no console.log)
5. Verify TypeScript build succeeds

---

## ✅ Critical Tests (MUST PASS)

### Test 1: Admin Authorization ⭐ CRITICAL
**Priority:** CRITICAL  
**Duration:** 5 minutes  
**New Feature:** YES (just implemented)

**Test Steps:**
1. Open incognito browser window
2. Navigate to https://purple-glow-social-2.0.vercel.app/login
3. Login with non-admin user: `free@test.purpleglow.co.za` / `TestFree123!`
4. Navigate directly to `/admin`
5. **Expected Result:** 403 Forbidden page with warning icon
6. **Expected Message:** "You do not have permission to access the admin dashboard"
7. **Expected Button:** "Return to Dashboard"
8. Click "Return to Dashboard"
9. **Expected Result:** Redirected to `/dashboard`

**Pass Criteria:**
- ✅ Non-admin cannot access admin dashboard
- ✅ 403 page displays correctly
- ✅ Return button works
- ✅ No console errors

**Fail Criteria:**
- ❌ Admin dashboard loads for non-admin user
- ❌ Server error or crash
- ❌ Redirect loop

**Test Admin Access:**
1. Logout
2. Login with admin user: `admin@test.purpleglow.co.za` / `TestAdmin123!`
3. Navigate to `/admin`
4. **Expected Result:** Admin dashboard loads successfully

---

### Test 2: Mobile Navigation ⭐ CRITICAL
**Priority:** CRITICAL  
**Duration:** 10 minutes  
**New Feature:** YES (just implemented)

**Test 2a: Mobile Hamburger Menu**
**Device:** iPhone SE (375px) or Chrome DevTools mobile emulation

1. Open dashboard at 375px width
2. **Expected:** Hamburger button visible in top-left
3. **Expected:** Desktop sidebar hidden
4. Click hamburger button
5. **Expected:** Slide-out drawer appears from left
6. **Expected:** Backdrop overlay visible (dark with blur)
7. **Expected:** User profile card shows (avatar, name, email, credits)

**Pass Criteria:**
- ✅ Hamburger button visible on mobile
- ✅ Drawer slides in smoothly
- ✅ Backdrop appears
- ✅ User info displays correctly

---

**Test 2b: Navigation Links**
1. With drawer open, click "Schedule"
2. **Expected:** Schedule view loads, drawer closes
3. Open drawer again
4. **Expected:** "Schedule" tab highlighted
5. Click "Automation"
6. **Expected:** Automation view loads, drawer closes
7. Click "Dashboard"
8. **Expected:** Dashboard view loads, drawer closes

**Pass Criteria:**
- ✅ All navigation links work
- ✅ Active tab highlighted correctly
- ✅ Drawer closes after navigation

---

**Test 2c: Close Interactions**
1. Open drawer
2. Click X button (top-right)
3. **Expected:** Drawer closes
4. Open drawer
5. Press ESC key
6. **Expected:** Drawer closes
7. Open drawer
8. Click backdrop (outside drawer)
9. **Expected:** Drawer closes

**Pass Criteria:**
- ✅ X button closes drawer
- ✅ ESC key closes drawer
- ✅ Backdrop click closes drawer

---

**Test 2d: Accessibility**
1. Open drawer
2. Press Tab key repeatedly
3. **Expected:** Focus stays within drawer (focus trap)
4. **Expected:** Can tab through all interactive elements
5. Check ARIA attributes in DevTools
6. **Expected:** `role="dialog"`, `aria-modal="true"`, `aria-label="Mobile navigation"`

**Pass Criteria:**
- ✅ Focus trap works
- ✅ Tab navigation functional
- ✅ ARIA attributes present
- ✅ Screen reader compatible

---

**Test 2e: Swipe Gesture (Mobile Device)**
**Note:** Only test on real mobile device or touch-enabled screen

1. Open drawer on mobile device
2. Swipe left (drag drawer to the left)
3. **Expected:** Drawer follows finger movement
4. Swipe left > 100px and release
5. **Expected:** Drawer closes
6. Open drawer
7. Swipe left < 100px and release
8. **Expected:** Drawer snaps back open

**Pass Criteria:**
- ✅ Swipe gesture responsive
- ✅ Drawer closes on full swipe
- ✅ Drawer returns on partial swipe

---

### Test 3: Marketing Claims (Imagen 3) ⭐ CRITICAL
**Priority:** CRITICAL  
**Duration:** 5 minutes  
**Languages Fixed:** Ndebele (nr), Swati (ss), Venda (ve)

**Test Steps:**
1. Navigate to landing page: https://purple-glow-social-2.0.vercel.app/
2. Open language selector
3. Select "isiNdebele (nr)"
4. Scroll to Features section
5. Find "Injini Yomsebenzi We-AI" (AI Content Engine)
6. **Expected:** Description mentions "Gemini 2.5 Flash" ONLY
7. **Expected:** NO mention of "Imagen 3"
8. Switch to "siSwati (ss)"
9. Check Features section
10. **Expected:** Description mentions "Gemini 2.5 Flash" ONLY
11. **Expected:** NO mention of "Imagen 3"
12. Switch to "Tshivenḓa (ve)"
13. Check Features section
14. **Expected:** Description mentions "Gemini 2.5 Flash" ONLY
15. **Expected:** NO mention of "Imagen 3"

**Pass Criteria:**
- ✅ No "Imagen 3" references in nr language
- ✅ No "Imagen 3" references in ss language
- ✅ No "Imagen 3" references in ve language
- ✅ All descriptions accurate (Gemini only)

**Fail Criteria:**
- ❌ Any mention of "Imagen 3"
- ❌ False claims about image generation

**Additional Check (All Languages):**
1. Test all 11 languages for consistency
2. **Expected:** Zero "Imagen" references across all languages

**Languages to Verify:**
- ✅ English (en)
- ✅ Afrikaans (af)
- ✅ isiZulu (zu)
- ✅ isiXhosa (xh)
- ✅ Sepedi (nso)
- ✅ Setswana (tn)
- ✅ Sesotho (st)
- ✅ Xitsonga (ts)
- ✅ isiNdebele (nr) ⭐ JUST FIXED
- ✅ siSwati (ss) ⭐ JUST FIXED
- ✅ Tshivenḓa (ve) ⭐ JUST FIXED

---

### Test 4: Console Clean Check ⭐ CRITICAL
**Priority:** CRITICAL  
**Duration:** 5 minutes  
**Validation:** No console.log in production

**Test Steps:**
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Clear console
4. Navigate to `/login`
5. **Expected:** No console.log statements
6. Fill login form and submit
7. **Expected:** No console.log statements (structured logger only)
8. Navigate to `/dashboard`
9. **Expected:** No console.log statements
10. Navigate to `/schedule`
11. **Expected:** No console.log statements
12. Open AI content generator
13. Generate a post
14. **Expected:** No console.log statements

**Pass Criteria:**
- ✅ Zero console.log statements in production
- ✅ Structured logger messages acceptable (if visible)
- ✅ No errors or warnings

**Fail Criteria:**
- ❌ console.log statements in user flows
- ❌ JavaScript errors
- ❌ Unhandled promise rejections

**Note:** Diagnostic tools may still use console.log but users don't access those pages.

---

### Test 5: TypeScript Build ⭐ CRITICAL
**Priority:** CRITICAL  
**Duration:** 5 minutes  
**Validation:** Build succeeds without errors

**Test Steps:**
1. Open terminal
2. Run: `npm run build`
3. **Expected:** Build completes successfully
4. **Expected:** "Compiled successfully" message
5. **Expected:** Zero TypeScript errors
6. Check output for warnings
7. **Expected:** No critical warnings

**Pass Criteria:**
- ✅ Build succeeds
- ✅ Zero TypeScript errors
- ✅ Production bundle created

**Fail Criteria:**
- ❌ Build fails
- ❌ TypeScript compilation errors
- ❌ Missing dependencies

**Sample Expected Output:**
```
▲ Next.js 16.1.3 (Turbopack)
- Environments: .env
✓ Compiled successfully in 16.2s
✓ Optimizing production build
✓ Build completed
```

---

## 🔄 Regression Tests (SHOULD PASS)

### Test 6: Core Authentication Flow
**Priority:** HIGH  
**Duration:** 5 minutes  
**Status:** Previously tested, verify still works

**Test Steps:**
1. Navigate to `/signup`
2. Create test account with unique email
3. **Expected:** Account created, redirected to dashboard
4. Logout
5. Login with same credentials
6. **Expected:** Login successful, dashboard loads

**Pass Criteria:**
- ✅ Signup works
- ✅ Login works
- ✅ Session persists

---

### Test 7: OAuth Connections
**Priority:** HIGH  
**Duration:** 5 minutes  
**Status:** Previously tested, spot check

**Test Steps:**
1. Navigate to Connected Accounts
2. Click "Connect Instagram"
3. **Expected:** OAuth flow initiates
4. (Cancel the flow - don't actually connect)
5. **Expected:** Returns to dashboard without errors

**Pass Criteria:**
- ✅ OAuth flow starts
- ✅ Cancel works gracefully
- ✅ No errors

---

### Test 8: AI Content Generation
**Priority:** HIGH  
**Duration:** 5 minutes  
**Status:** Previously tested, spot check

**Test Steps:**
1. Open AI Content Studio
2. Enter topic: "New coffee shop in Cape Town"
3. Select platform: Instagram
4. Select language: English
5. Click "Generate"
6. **Expected:** Content generated with hashtags
7. **Expected:** Credit deducted (if available)

**Pass Criteria:**
- ✅ Generation works
- ✅ Content quality good
- ✅ Credits deducted

---

### Test 9: Scheduling System
**Priority:** HIGH  
**Duration:** 5 minutes  
**Status:** Previously tested, spot check

**Test Steps:**
1. Generate a post (or create manually)
2. Click "Schedule Post"
3. Select platform: Twitter
4. Select AI suggested time
5. Click "Schedule Post"
6. **Expected:** Post added to schedule queue
7. Navigate to Calendar View
8. **Expected:** Post appears on calendar

**Pass Criteria:**
- ✅ Scheduling works
- ✅ Post appears in queue
- ✅ Calendar displays correctly

---

### Test 10: Payment Flow (Polar.sh)
**Priority:** MEDIUM  
**Duration:** 5 minutes  
**Status:** Previously tested, spot check

**Test Steps:**
1. Click "Top Up Credits"
2. Select a package
3. Click checkout
4. **Expected:** Redirected to Polar checkout
5. (Cancel payment - don't complete)
6. **Expected:** Returns to dashboard

**Pass Criteria:**
- ✅ Checkout initiates
- ✅ Polar loads correctly
- ✅ Cancel works

---

## 📊 Test Matrix

### Browser Compatibility

| Test | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| Admin Authorization | ⏳ | ⏳ | ⏳ | ⏳ |
| Mobile Navigation | ⏳ | ⏳ | ⏳ | ⏳ |
| Imagen Claims | ⏳ | ⏳ | ⏳ | ⏳ |
| Console Clean | ⏳ | ⏳ | ⏳ | ⏳ |
| Authentication | ✅ | ✅ | ✅ | ✅ |
| AI Generation | ✅ | ✅ | ✅ | ✅ |
| Scheduling | ✅ | ✅ | ✅ | ✅ |
| Payment Flow | ✅ | ✅ | ✅ | ✅ |

**Legend:**
- ✅ Previously tested and passing
- ⏳ Needs testing (new changes)
- ❌ Failed
- 🚫 Not supported

---

### Device Compatibility

| Test | Desktop | Tablet | Mobile |
|------|---------|--------|--------|
| Admin Authorization | ⏳ | N/A | N/A |
| Mobile Navigation | N/A | ⏳ | ⏳ |
| Imagen Claims | ⏳ | ⏳ | ⏳ |
| Console Clean | ⏳ | ⏳ | ⏳ |
| Authentication | ✅ | ✅ | ✅ |
| AI Generation | ✅ | ✅ | ✅ |
| Scheduling | ✅ | ✅ | ✅ |
| Payment Flow | ✅ | ✅ | ✅ |

**Test Devices:**
- Desktop: 1920x1080
- Tablet: iPad (768px)
- Mobile: iPhone SE (375px), Android (360px)

---

## 🚨 Known Issues (Non-Blocking)

### Issue 1: Rate Limit UI Feedback
**Status:** Missing (deferred to Week 2)  
**Impact:** Users see generic error on rate limit  
**Test:** Generate 51 posts in a day as Pro user  
**Expected Behavior:** Generic error toast  
**Desired Behavior:** Friendly "Daily limit reached" message  

**Test?** ❌ NO - Not yet implemented

---

### Issue 2: Draft Persistence
**Status:** Not implemented (deferred to Week 2)  
**Impact:** Drafts lost on page refresh  
**Test:** Generate content, refresh page  
**Expected Behavior:** Draft disappears  
**Desired Behavior:** Draft saved to database  

**Test?** ❌ NO - Not yet implemented

---

### Issue 3: Contact Form
**Status:** No backend (deferred to Week 2)  
**Impact:** Contact form doesn't work  
**Test:** Submit contact form  
**Expected Behavior:** Form submits but no email sent  
**Desired Behavior:** Email delivered to support  

**Test?** ❌ NO - Not yet implemented

---

## ✅ Pre-Test Checklist

Before starting tests:

- [ ] Vercel deployment is live
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Test accounts seeded (6 accounts)
- [ ] Cron jobs enabled
- [ ] Webhooks configured
- [ ] SSL certificate active
- [ ] Latest code deployed (with fixes from this session)

---

## 📝 Test Report Template

**Test Date:** __________  
**Tester:** __________  
**Browser:** __________  
**Device:** __________

### Critical Tests
- [ ] Test 1: Admin Authorization - PASS / FAIL
- [ ] Test 2: Mobile Navigation - PASS / FAIL
- [ ] Test 3: Imagen Claims - PASS / FAIL
- [ ] Test 4: Console Clean - PASS / FAIL
- [ ] Test 5: TypeScript Build - PASS / FAIL

### Regression Tests
- [ ] Test 6: Authentication - PASS / FAIL
- [ ] Test 7: OAuth Connections - PASS / FAIL
- [ ] Test 8: AI Generation - PASS / FAIL
- [ ] Test 9: Scheduling - PASS / FAIL
- [ ] Test 10: Payment Flow - PASS / FAIL

### Overall Result
- [ ] **ALL TESTS PASSED** ✅ - Ready for launch
- [ ] **SOME TESTS FAILED** ⚠️ - See notes below

### Notes:
_______________________________________
_______________________________________
_______________________________________

### Blockers Found:
_______________________________________
_______________________________________

### Recommendation:
- [ ] LAUNCH IMMEDIATELY ✅
- [ ] FIX BLOCKERS FIRST ⚠️
- [ ] FURTHER TESTING NEEDED 🔄

---

## 🚀 Post-Test Actions

### If All Tests Pass ✅
1. ✅ Mark tests as complete
2. ✅ Update launch checklist
3. ✅ Proceed with production deployment
4. ✅ Enable monitoring (Sentry, logs)
5. ✅ Announce launch

### If Tests Fail ❌
1. ❌ Document failures
2. ❌ Create GitHub issues
3. ❌ Assign to relevant subagent
4. ❌ Re-test after fixes
5. ❌ Delay launch if critical

---

## 📞 Support

**Questions during testing?**
- Review: `docs/FINAL_COMPLETION_ASSESSMENT_2026-01-22.md`
- Check: `AGENTS.md` for architecture details
- Reference: `docs/TEST_ACCOUNTS_GUIDE.md` for test users

**Found a bug?**
1. Document in test report
2. Create GitHub issue
3. Tag as "pre-launch" + severity
4. Notify team immediately if critical

---

## 🎯 Success Criteria

**Launch is APPROVED if:**
- ✅ All 5 critical tests pass
- ✅ Admin authorization working
- ✅ Mobile navigation functional
- ✅ No false marketing claims
- ✅ Console is clean
- ✅ TypeScript build succeeds

**Launch is BLOCKED if:**
- ❌ Admin dashboard accessible to non-admins
- ❌ Mobile navigation broken
- ❌ Imagen 3 references still present
- ❌ TypeScript build fails
- ❌ Authentication broken

**Regression test failures are NOT blockers** (previously tested features)

---

**Test Plan Version:** 1.0  
**Created:** January 22, 2026  
**Status:** Ready to Execute  
**Estimated Duration:** 30 minutes

**Ready to launch!** 🚀
