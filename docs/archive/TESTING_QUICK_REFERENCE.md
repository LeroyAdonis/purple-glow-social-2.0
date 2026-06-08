# 🧪 QUICK TESTING REFERENCE CARD

## Start Development Server
```powershell
pnpm run dev
```

## Test Routes (in order)

### 1️⃣ Test Route (Diagnostic)
**URL:** http://localhost:3000/tmp_rovodev_route_test
**Expected:** Green success page with route test results
**Auth Required:** ❌ No (public route)
**Status:** Should load immediately

### 2️⃣ Home Page
**URL:** http://localhost:3000/
**Expected:** Purple Glow Social landing page
**Auth Required:** ❌ No (public route)

### 3️⃣ Login Page
**URL:** http://localhost:3000/login
**Expected:** Login form with email/password
**Auth Required:** ❌ No (public route)

### 4️⃣ Dashboard (Unauthenticated)
**URL:** http://localhost:3000/dashboard
**Expected:** Redirect to /login?redirect=/dashboard
**Auth Required:** ✅ Yes (will redirect)

### 5️⃣ Dashboard (Authenticated)
**Steps:**
1. Login at /login with test credentials
2. Navigate to /dashboard
**Expected:** User dashboard with schedule/automation views
**Auth Required:** ✅ Yes

---

## 🔑 Test Accounts

| Tier | Email | Password |
|------|-------|----------|
| Free | free@test.purpleglow.co.za | TestFree123! |
| Pro | pro@test.purpleglow.co.za | TestPro123! |
| Business | business@test.purpleglow.co.za | TestBiz123! |
| Admin | admin@test.purpleglow.co.za | TestAdmin123! |

---

## 🐛 Debugging Checklist

### If you see 404 errors:
- [ ] Verify URL is exactly correct (case-sensitive)
- [ ] Check browser console for JavaScript errors
- [ ] Check terminal for Next.js compilation errors
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Restart dev server

### If dashboard redirects to login:
- [ ] Check browser DevTools → Application → Cookies
- [ ] Look for `better-auth.session_token` cookie
- [ ] Check terminal for "[Middleware]" log messages
- [ ] Try test account: pro@test.purpleglow.co.za / TestPro123!

### If database errors occur:
```powershell
pnpm run db:push
```

---

## ✅ Success Indicators

**In Browser Console:**
```
[Login] ✅ Session cookie present
[Dashboard Client] ✅ Session verified, user authenticated
```

**In Terminal:**
```
[Middleware] ✅ Authenticated, allowing access to: /dashboard
```

**In Browser:**
- Cookies set: better-auth.session_token
- Dashboard loads with user name in header
- No 404 errors on valid routes

---

## 📊 Expected Results Summary

| Route | Auth? | Expected Behavior |
|-------|-------|-------------------|
| / | No | Landing page loads |
| /login | No | Login form displays |
| /signup | No | Signup form displays |
| /dashboard | Yes | Dashboard loads OR redirects to login |
| /admin | Yes (Admin) | Admin dashboard OR forbidden |
| /tmp_rovodev_route_test | No | Test page with green success message |

---

**Generated:** Build cache cleared and runtime fixes applied
**Ready:** ✅ YES - Start `pnpm run dev` and begin testing
