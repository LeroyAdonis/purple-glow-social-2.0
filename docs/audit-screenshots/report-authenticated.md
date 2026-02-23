# Purple Glow Social 2.0 - Authenticated Pages Audit Report
**Generated:** 2026/02/20, 13:14:36
**Base URL:** http://localhost:3000
---

## Scenario 1: Unauthenticated redirect to /dashboard
**Timestamp:** 2026-02-20T11:14:08.130Z
**Final URL:** `http://localhost:3000/login?redirect=%2Fdashboard`
**Screenshot:** `docs/audit-screenshots/dashboard-unauth.png`

**Status:** ✅ PASS - Redirected to login

**Expected:** Should redirect to /login

**Page Content:**
**Title:** Purple Glow | AI Social Manager

**Headings:**
- Purple Glow Social
- 🍪 We Value Your Privacy

**Elements:** 7 buttons, 4 links, 1 forms


**Console Errors:** None

**Network Errors:** None

---

## Scenario 2: Login flow (Pro user)
**Timestamp:** 2026-02-20T11:14:17.729Z
**Final URL:** `http://localhost:3000/dashboard`
**Screenshot:** `docs/audit-screenshots/post-login-pro.png`

**Status:** ✅ PASS - Login successful, redirected away from /login

**Expected:** Should redirect to /dashboard or home page after successful login

**Page Content:**
**Title:** Purple Glow | AI Social Manager

**Headings:**
- Purple Glow
- Purple Glow
- Welcome back, Pro
- Content Generator

**Elements:** 23 buttons, 0 links, 1 forms


**Console Errors (8):**
- [ERROR] [2026-02-20T11:14:14.585Z] [ERROR] [Auth] Session cookie not created after successful login {email: pro@test.purpleglow.co.za, cookieCount: 1}
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8787:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at doubleInvokeEffectsOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10093:133)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:79)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:131)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:405)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8697:33)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8746:783)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8738:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
- [ERROR] [2026-02-20T11:14:18.430Z] [ERROR] [API] Failed to fetch {action: fetch-user-profile, userId: krdbQqpQwUjWSAok-7Uzp, stack: TypeError: Failed to fetch
    at DashboardClient.…t_dist_compiled_react-dom_1e674e59._.js:8684:316)}
- [ERROR] [2026-02-20T11:14:18.432Z] [ERROR] [API] Failed to fetch {action: fetch-user-profile, userId: krdbQqpQwUjWSAok-7Uzp, stack: TypeError: Failed to fetch
    at DashboardClient.…_dist_compiled_react-dom_1e674e59._.js:10086:147)}
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8787:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at doubleInvokeEffectsOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10093:133)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:79)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:131)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:405)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8697:33)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8746:783)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8738:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
- [ERROR] [2026-02-20T11:14:21.626Z] [ERROR] [API] Failed to fetch {action: fetch-user-profile, userId: krdbQqpQwUjWSAok-7Uzp, stack: TypeError: Failed to fetch
    at DashboardClient.…_dist_compiled_react-dom_1e674e59._.js:10086:147)}

**Network Errors:** None

---

## Scenario 3: Dashboard (authenticated Pro user)
**Timestamp:** 2026-02-20T11:14:21.037Z
**Final URL:** `http://localhost:3000/dashboard`
**Screenshot:** `docs/audit-screenshots/dashboard-pro.png`

**Status:** ✅ PASS - On dashboard page

**Expected:** Should show dashboard content for authenticated user

**Page Content:**
**Title:** Purple Glow | AI Social Manager

**Headings:**
- Purple Glow
- Purple Glow
- Welcome back, Pro
- Content Generator

**Elements:** 22 buttons, 0 links, 1 forms


**Console Errors (7):**
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8787:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at doubleInvokeEffectsOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10093:133)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:79)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:131)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:405)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8697:33)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8746:783)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8738:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
- [ERROR] [2026-02-20T11:14:18.430Z] [ERROR] [API] Failed to fetch {action: fetch-user-profile, userId: krdbQqpQwUjWSAok-7Uzp, stack: TypeError: Failed to fetch
    at DashboardClient.…t_dist_compiled_react-dom_1e674e59._.js:8684:316)}
- [ERROR] [2026-02-20T11:14:18.432Z] [ERROR] [API] Failed to fetch {action: fetch-user-profile, userId: krdbQqpQwUjWSAok-7Uzp, stack: TypeError: Failed to fetch
    at DashboardClient.…_dist_compiled_react-dom_1e674e59._.js:10086:147)}
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8787:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at doubleInvokeEffectsOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10093:133)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:79)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:131)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:405)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8697:33)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8746:783)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8738:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
- [ERROR] [2026-02-20T11:14:21.626Z] [ERROR] [API] Failed to fetch {action: fetch-user-profile, userId: krdbQqpQwUjWSAok-7Uzp, stack: TypeError: Failed to fetch
    at DashboardClient.…_dist_compiled_react-dom_1e674e59._.js:10086:147)}

**Network Errors:** None

---

## Scenario 4: Session persistence (reload dashboard)
**Timestamp:** 2026-02-20T11:14:23.932Z
**Final URL:** `http://localhost:3000/dashboard`
**Screenshot:** `N/A`

**Status:** ✅ PASS - Session persisted, still on dashboard

**Expected:** Should remain on /dashboard after reload

**Page Content:**
**Title:** Purple Glow | AI Social Manager

**Headings:**
- Purple Glow
- Purple Glow
- Welcome back, Pro
- Content Generator

**Elements:** 22 buttons, 0 links, 1 forms


**Console Errors (3):**
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8787:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at doubleInvokeEffectsOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10093:133)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:79)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:131)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:405)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8697:33)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8746:783)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8738:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
- [ERROR] [2026-02-20T11:14:21.626Z] [ERROR] [API] Failed to fetch {action: fetch-user-profile, userId: krdbQqpQwUjWSAok-7Uzp, stack: TypeError: Failed to fetch
    at DashboardClient.…_dist_compiled_react-dom_1e674e59._.js:10086:147)}

**Network Errors:** None

---

## Scenario 5: Admin page (Admin user)
**Timestamp:** 2026-02-20T11:14:35.357Z
**Final URL:** `http://localhost:3000/admin`
**Screenshot:** `docs/audit-screenshots/admin-page.png`

**Status:** ✅ PASS - On admin page

**Expected:** Should show admin page content for admin user

**Page Content:**
**Title:** Purple Glow | AI Social Manager

**Elements:** 2 buttons, 0 links, 0 forms


**Console Errors (4):**
- [ERROR] [2026-02-20T11:14:29.428Z] [ERROR] [Auth] Session cookie not created after successful login {email: admin@test.purpleglow.co.za, cookieCount: 1}
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8787:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8801:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at recursivelyTraverseReconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8774:13)
    at reconnectPassiveEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8786:17)
    at doubleInvokeEffectsOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10093:133)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:79)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:131)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:405)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
    at recursivelyTraverseAndDoubleInvokeEffectsInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:10086:147)
- [ERROR] [2026-02-20T11:14:32.774Z] [ERROR] [API] Failed to fetch {action: fetch-user-profile, userId: wF1JPF3ZGv7CWIOFbFEIX, stack: TypeError: Failed to fetch
    at DashboardClient.…_dist_compiled_react-dom_1e674e59._.js:10086:147)}
- [ERROR] Failed to fetch limits: TypeError: Failed to fetch
    at fetchLimits (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:58:44)
    at ContentGenerator.useEffect (http://localhost:3000/_next/static/chunks/components_content-generator_tsx_7d5140d3._.js:73:13)
    at Object.react_stack_bottom_frame (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:14877:22)
    at runWithFiberInDEV (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:966:74)
    at commitHookEffectListMount (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7267:167)
    at commitHookPassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:7302:60)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8697:33)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8758:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8746:783)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8738:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8701:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)
    at commitPassiveMountOnFiber (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8696:17)
    at recursivelyTraversePassiveMountEffects (http://localhost:3000/_next/static/chunks/node_modules_next_dist_compiled_react-dom_1e674e59._.js:8684:316)

**Network Errors:** None

---

## Summary

- **Total Scenarios:** 5
- **Timestamp:** 2026-02-20T11:14:36.953Z
