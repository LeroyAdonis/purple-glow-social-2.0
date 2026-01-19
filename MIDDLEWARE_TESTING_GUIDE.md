# Middleware Testing Guide

## Quick Start

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser to:** `http://localhost:3000`

---

## Test Scenarios

### Scenario 1: Public Routes (No Login Required)

**Test these URLs without logging in:**

| URL | Expected Result |
|-----|----------------|
| `http://localhost:3000/` | ✅ Landing page loads |
| `http://localhost:3000/login` | ✅ Login page loads |
| `http://localhost:3000/signup` | ✅ Signup page loads |
| `http://localhost:3000/api/health` | ✅ Returns JSON health check |

---

### Scenario 2: Protected Routes Without Authentication

**Test these URLs in incognito/private window (no login):**

| URL | Expected Result |
|-----|----------------|
| `http://localhost:3000/dashboard` | 🔀 Redirects to `/login?redirect=/dashboard` |
| `http://localhost:3000/dashboard/settings` | 🔀 Redirects to `/login?redirect=/dashboard/settings` |
| `http://localhost:3000/admin` | 🔀 Redirects to `/login?redirect=/admin` |
| `http://localhost:3000/api/user/profile` | ❌ Returns 401 JSON error |
| `http://localhost:3000/api/admin/stats` | ❌ Returns 401 JSON error |

**Check these in browser:**
1. Notice the URL bar shows `?redirect=/dashboard` parameter
2. Network tab shows 307 redirect status
3. Console has no errors

---

### Scenario 3: Redirect Flow (Critical Test!)

**Step-by-step test:**

1. **Open incognito window**
2. **Navigate to:** `http://localhost:3000/dashboard/settings`
3. **Observe:** Redirected to `/login?redirect=/dashboard/settings`
4. **Login with:** 
   - Email: `free@test.purpleglow.co.za`
   - Password: `TestFree123!`
5. **After successful login:** Should redirect to `/dashboard/settings` (NOT `/dashboard`)

✅ **Success:** You land on the settings page you originally requested  
❌ **Failure:** You land on `/dashboard` instead

---

### Scenario 4: Already Logged In Users

**After logging in, test these:**

| URL | Expected Result |
|-----|----------------|
| `http://localhost:3000/login` | 🔀 Redirects to `/dashboard` |
| `http://localhost:3000/signup` | 🔀 Redirects to `/dashboard` |
| `http://localhost:3000/dashboard` | ✅ Dashboard loads |

**Purpose:** Prevent logged-in users from accessing login/signup pages

---

### Scenario 5: Admin Routes (Non-Admin User)

**Login with non-admin account:**
- Email: `free@test.purpleglow.co.za`
- Password: `TestFree123!`

**Then test:**

| URL | Expected Result |
|-----|----------------|
| `http://localhost:3000/admin` | 🔀 Redirects to `/dashboard` |
| `http://localhost:3000/api/admin/stats` | ❌ Returns 403 JSON error |

**Check browser console:**
- Should NOT see admin dashboard
- Should see redirect to `/dashboard`

---

### Scenario 6: Admin Routes (Admin User)

**Login with admin account:**
- Email: `admin@test.purpleglow.co.za`
- Password: `TestAdmin123!`

**Then test:**

| URL | Expected Result |
|-----|----------------|
| `http://localhost:3000/admin` | ✅ Admin dashboard loads |
| `http://localhost:3000/api/admin/stats` | ✅ Returns admin data |
| `http://localhost:3000/dashboard` | ✅ Regular dashboard still works |

---

### Scenario 7: OAuth Flow

**Test OAuth connection (requires login):**

1. **Login first** (any account)
2. **Navigate to:** Connected Accounts page
3. **Click:** "Connect Facebook" or any platform
4. **Observe:** OAuth flow initiates without middleware blocking

**Without login:**
- Visit: `http://localhost:3000/api/oauth/facebook/connect` 
- **Expected:** 401 Unauthorized JSON response

**OAuth callback (public):**
- OAuth callbacks should work without authentication
- Middleware allows `/api/oauth/*/callback` routes

---

## Verification Checklist

After testing all scenarios:

- [ ] Public routes accessible without login
- [ ] Protected routes redirect to login
- [ ] Redirect parameter preserved in URL
- [ ] After login, user goes to original destination
- [ ] Logged-in users can't access login/signup
- [ ] Non-admin users can't access admin routes
- [ ] Admin users can access admin routes
- [ ] API routes return JSON errors (not redirects)
- [ ] OAuth flows work correctly
- [ ] No console errors or warnings
- [ ] Browser Network tab shows correct status codes (307, 401, 403)

---

## Common Issues & Solutions

### Issue: Middleware not working
**Solution:** Check that `middleware.ts` is at project root (not in `app/` or `lib/`)

### Issue: Always redirected to login
**Solution:** Check browser cookies - clear cookies and login again

### Issue: Redirect parameter lost
**Solution:** Check `app/login/page.tsx` uses `useSearchParams` and `redirectTo` variable

### Issue: OAuth flow blocked
**Solution:** Check `/api/oauth/*/callback` routes are in `PUBLIC_API_ROUTES`

### Issue: Admin routes accessible to non-admin
**Solution:** Check `ADMIN_EMAILS` environment variable or email ends with `@purpleglow.co.za`

---

## Browser DevTools Tips

### Check Middleware Execution

**Network Tab:**
1. Open DevTools (F12)
2. Go to Network tab
3. Navigate to protected route
4. Look for 307 redirect status
5. Check "Location" header for redirect URL

**Console Tab:**
1. Should see login page logs: `[Login] Environment check`
2. Should NOT see middleware errors
3. After login: `[Login] Sign in successful, redirecting to: /dashboard/settings`

**Application Tab (Cookies):**
1. Look for `better-auth.session_token` or `better-auth.session` cookie
2. Should exist after successful login
3. Should be `HttpOnly` flag set (secure)

---

## Performance Check

**Expected latency added by middleware:**
- < 10ms per request
- No noticeable delay in page loads

**Monitor:**
1. Open Network tab
2. Check "Time" column for requests
3. Middleware should add < 10ms overhead

---

## Test Accounts

| Account | Email | Password | Tier | Admin |
|---------|-------|----------|------|-------|
| Free User | free@test.purpleglow.co.za | TestFree123! | Free | No |
| Pro User | pro@test.purpleglow.co.za | TestPro123! | Pro | No |
| Business User | business@test.purpleglow.co.za | TestBiz123! | Business | No |
| Admin User | admin@test.purpleglow.co.za | TestAdmin123! | Business | Yes |

---

## Success Criteria

✅ **All tests pass**  
✅ **No console errors**  
✅ **Redirect flow works correctly**  
✅ **Admin routes properly protected**  
✅ **OAuth flows unaffected**  
✅ **Performance impact < 10ms**

---

## Next Steps After Testing

1. **If all tests pass:**
   - Commit changes: `git add . && git commit -m "feat: Add global middleware for route protection"`
   - Deploy to Vercel preview environment
   - Test on production URL

2. **If tests fail:**
   - Check `MIDDLEWARE_IMPLEMENTATION_COMPLETE.md` for troubleshooting
   - Review middleware logic in `middleware.ts`
   - Verify Better-auth cookie configuration in `lib/auth.ts`

---

**Happy Testing!** 🚀
