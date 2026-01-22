# 🧪 STEP-BY-STEP TESTING GUIDE
## Purple Glow Social 2.0 - End-to-End Browser Testing

---

## 📖 OVERVIEW

This guide will walk you through comprehensive browser testing of Purple Glow Social 2.0 
to verify that recent fixes have resolved 404 errors and the application is functioning correctly.

**Estimated Total Time:** 15-20 minutes

---

## 🎯 WHAT WE'RE TESTING

1. **Basic Routing** - Verify 404 errors are fixed
2. **Authentication Flow** - Verify login/session management works
3. **API Endpoints** - Verify backend routes are accessible
4. **Error Handling** - Verify graceful error handling

---

## 📋 STEP 1: Apply Database Migrations (CRITICAL)

**Why:** Without database tables, authentication will completely fail.

### Instructions:

1. Open your browser and go to: https://console.neon.tech/

2. Login to your Neon account

3. Select your project: **ep-sweet-smoke-aeixni9b**

4. Click **"SQL Editor"** in the left sidebar

5. Open this file in a text editor: `drizzle/migrations/0000_lazy_sister_grimm.sql`

6. Copy the ENTIRE contents of the file

7. Paste into the Neon SQL Editor

8. Click **"Run"** (or press Ctrl+Enter)

9. Wait for success message

### Verify Migration Worked:

Run this query in the SQL Editor:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

**Expected Result:** You should see these tables:
- user
- session
- account
- verification
- post
- connected_account
- automation_rule

✅ **Checkpoint:** If you see these tables, proceed to Step 2.
❌ **If tables don't appear:** Check for error messages in the SQL Editor.

---

## 📋 STEP 2: Start Development Server

**Why:** Tests need the application running to test it.

### Instructions:

1. Open a **NEW terminal/PowerShell window** (keep it open during testing)

2. Navigate to the project directory (if not already there)

3. Run:
   ```bash
   pnpm run dev
   ```

4. Wait for the message: **"Ready in X.Xs"** or **"Local: http://localhost:3000"**

5. **IMPORTANT:** Leave this terminal window open!

### Verify Server is Running:

Open your browser and go to: http://localhost:3000

**Expected Result:** You should see the Purple Glow Social landing page (not an error).

✅ **Checkpoint:** Server is running and accessible.
❌ **If server won't start:** Check for port conflicts (kill other Node processes on port 3000).

---

## 📋 STEP 3: Run Automated Tests

**Why:** Automated tests will systematically check all key functionality.

### Option A: Run with UI (RECOMMENDED for first run)

1. Open a **SECOND terminal/PowerShell window** (original terminal still running dev server)

2. Run:
   ```bash
   npx playwright test --ui
   ```

3. The Playwright UI will open showing all tests

4. Click **"Run All"** button (play icon)

5. Watch tests execute in real-time

6. Review results in the UI

### Option B: Run Headless (Faster)

1. Open a second terminal

2. Run:
   ```bash
   npx playwright test
   ```

3. Tests will run in the background

4. Results will print to console

### Option C: Use Quick Start Script

We've created a helper script that checks everything before running tests:

```bash
pwsh tmp_rovodev_run_tests.ps1
```

---

## 📋 STEP 4: Review Test Results

### A. Check Console Output

Look for:
- ✅ Green checkmarks = Tests passed
- ❌ Red X marks = Tests failed
- Summary at the end (e.g., "12 passed, 0 failed")

### B. Review Screenshots

1. Open the `test-screenshots/` folder

2. Review each screenshot:
   - `test-01-diagnostic-route.png` - Should show "Route Test - SUCCESS"
   - `test-02-home-page.png` - Should show landing page
   - `test-03-login-page.png` - Should show login form
   - `test-04-dashboard-redirect.png` - Should show login or dashboard (NOT 404)
   - `test-05-login-attempt.png` - Shows login result
   - Additional screenshots for other tests

### C. View HTML Report

```bash
npx playwright show-report
```

This opens a detailed report in your browser with:
- Test results
- Execution time
- Failure details
- Screenshots
- Videos (if any failures)

---

## 📋 STEP 5: Manual Verification (Optional)

If automated tests show issues, manually verify:

### Test 1: Diagnostic Route
1. Browser → http://localhost:3000/tmp_rovodev_route_test
2. **Expected:** Green success page with "Route Test - SUCCESS"
3. **Not Expected:** 404 error

### Test 2: Home Page
1. Browser → http://localhost:3000/
2. **Expected:** Landing page with hero section, pricing, features
3. **Not Expected:** 404 error, blank page

### Test 3: Login Page
1. Browser → http://localhost:3000/login
2. **Expected:** Login form with email/password fields
3. **Not Expected:** 404 error

### Test 4: Dashboard (Unauthenticated)
1. Browser → http://localhost:3000/dashboard
2. **Expected:** One of these:
   - Redirects to /login ✅
   - Shows "Please login" message ✅
   - Shows database error (if migrations not applied) ✅
3. **Not Expected:** 404 error ❌

### Test 5: Login Attempt
1. Go to http://localhost:3000/login
2. Enter:
   - Email: `free@test.purpleglow.co.za`
   - Password: `TestFree123!`
3. Click "Sign In"
4. **Expected (if DB working):** Redirects to dashboard
5. **Expected (if DB not working):** Error message (not a crash)

### Test 6: Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to different pages
4. **Acceptable:** Database/connection errors
5. **Not Acceptable:** JavaScript runtime errors, crashes

---

## 📊 INTERPRETING RESULTS

### ✅ SUCCESS INDICATORS:

**Minimum Success (404 Fix Verified):**
- Diagnostic route loads (no 404) ✓
- Home page loads (no 404) ✓
- Login page loads (no 404) ✓
- Dashboard shows something (not 404) ✓

**Full Success (Everything Working):**
- All routing tests pass ✓
- Login works ✓
- Session persists ✓
- API endpoints return 200/401 (not 404) ✓
- No critical JavaScript errors ✓

### ⚠️ EXPECTED/ACCEPTABLE ISSUES:

- Database connection errors (if migrations not applied yet)
- Authentication fails with "database error" message
- TypeScript warnings in console
- Some features not working (if DB not setup)

### ❌ FAILURE INDICATORS:

**Critical Issues (Must Fix):**
- 404 errors on /dashboard, /login, or / ❌
- JavaScript runtime exceptions (crashes) ❌
- Infinite redirect loops ❌
- Blank white screens with no content ❌
- "Failed to compile" errors ❌

---

## 📝 DOCUMENTING RESULTS

After testing, note:

### What Worked:
- List of pages that loaded successfully
- Features that functioned correctly
- Tests that passed

### What Didn't Work:
- Specific errors encountered
- Which tests failed
- Screenshots showing issues

### Database Status:
- Were migrations applied? Yes/No
- If No: This explains authentication failures

### Next Steps:
- Issues that need fixing
- Features that need database setup
- Anything requiring further investigation

---

## 🎓 UNDERSTANDING THE TEST SUITE

### Test Suite 1: Basic Routing (CRITICAL)
**Purpose:** Verify 404 errors are fixed
**Tests:**
- 1.1 Diagnostic route
- 1.2 Home page
- 1.3 Login page
- 1.4 Dashboard (unauthenticated)

### Test Suite 2: Authentication Flow (HIGH)
**Purpose:** Verify login system works
**Tests:**
- 2.1 Login attempt
- 2.2 Dashboard access (authenticated)
- 2.3 Session persistence

### Test Suite 3: API Endpoints (MEDIUM)
**Purpose:** Verify backend routes accessible
**Tests:**
- 3.1 Auth session endpoint
- 3.2 Diagnostics endpoint

### Test Suite 4: Error Scenarios (LOW)
**Purpose:** Verify graceful error handling
**Tests:**
- 4.1 Invalid login
- 4.2 Console errors check

---

## 🆘 TROUBLESHOOTING

### Problem: Tests won't start

**Symptom:** Error when running `npx playwright test`

**Solutions:**
1. Check dev server is running: `http://localhost:3000`
2. Ensure Playwright installed: `pnpm install`
3. Install browsers: `npx playwright install`

### Problem: All tests timeout

**Symptom:** Tests hang and timeout

**Solutions:**
1. Verify server is responding: Open http://localhost:3000 in browser
2. Check for compilation errors in dev server terminal
3. Increase timeout in `playwright.config.ts` (line 12)

### Problem: Authentication tests all fail

**Symptom:** Login doesn't work, database errors shown

**Solutions:**
1. **Most likely cause:** Database migrations not applied
2. Complete Step 1 (Apply Database Migrations)
3. Restart dev server after applying migrations

### Problem: Can't see what's happening

**Symptom:** Tests run too fast to see what's happening

**Solutions:**
1. Run with UI: `npx playwright test --ui`
2. Run in headed mode: `npx playwright test --headed`
3. Add `--debug` flag: `npx playwright test --debug`

### Problem: Port 3000 already in use

**Symptom:** Dev server won't start, says port in use

**Solutions:**
1. Kill existing Node process: `Get-Process node | Stop-Process -Force`
2. Or use different port: `pnpm run dev -- -p 3001` (update playwright.config.ts)

---

## 📚 FILES CREATED FOR YOU

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Playwright configuration |
| `e2e-tests/purple-glow-social.spec.ts` | Complete test suite |
| `test-screenshots/` | Screenshots from tests |
| `tmp_rovodev_run_tests.ps1` | Quick test runner script |
| `PRE_TESTING_CHECKLIST.md` | Pre-testing requirements |
| `STEP_BY_STEP_TESTING_GUIDE.md` | This guide |

---

## ✅ READY TO TEST?

**Pre-flight Checklist:**
- [ ] Database migrations applied (Step 1)
- [ ] Dev server running (Step 2)
- [ ] Terminal ready for test command (Step 3)

**If all checked, proceed with:**
```bash
npx playwright test --ui
```

**Good luck! The tests will generate a detailed report of all findings.**

---

## 📞 WHAT TO DO AFTER TESTING

1. Review the HTML report: `npx playwright show-report`
2. Check all screenshots in `test-screenshots/`
3. Note which tests passed/failed
4. If 404 errors are gone → Success! ✅
5. If authentication issues → Apply database migrations
6. If other issues → Document them with screenshots

---

**Questions? Check the troubleshooting section above or review `DATABASE_FIX_COMPLETE.md`**
