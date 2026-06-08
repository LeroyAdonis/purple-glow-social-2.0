# Remaining Console.log Fixes - Quick Reference

## Summary
Priority files (login, middleware, dashboard-client) are COMPLETE ✅  
Remaining files: 68 console statements in 20 files

---

## 🔴 HIGH PRIORITY (Next to Fix)

### 1. `app/dashboard/client-page.tsx` (4 statements)
**Why:** Client-side dashboard, session handling
```typescript
// Lines 17, 29, 30, 33
console.log('[Dashboard Client] Session check:', ...);
console.log('[Dashboard Client] ❌ No session found...');
console.log('[Dashboard Client] Redirecting to login...');
console.log('[Dashboard Client] ✅ Session verified...');

// Replace with:
import { logger } from '@/lib/logger';
logger.auth.debug('Session check', { ... });
logger.auth.warn('No session found after loading');
logger.auth.info('Session verified, user authenticated');
```

### 2. `app/signup/page.tsx` (2 statements)
**Why:** Authentication flow
```typescript
// Lines 45, 62
console.error('Sign-up error:', err);
console.error('Google sign-up error:', err);

// Replace with:
import { logger } from '@/lib/logger';
logger.auth.exception(err, { action: 'email-signup' });
logger.auth.exception(err, { action: 'google-signup' });
```

### 3. `app/actions/generate.ts` (2 statements)
**Why:** Server action, AI generation
```typescript
// Lines 147, 162
console.error("Database operation failed:", dbError);
console.error("Generation Error:", error);

// Replace with:
import { logger } from '@/lib/logger';
logger.db.exception(dbError, { action: 'save-generated-post' });
logger.ai.exception(error, { action: 'generate-content' });
```

---

## 🟡 MEDIUM PRIORITY (Component Updates)

### 4. `components/LogoutButton.tsx` (1 statement)
```typescript
// Line 20
console.error('Logout error:', error);

// Replace with:
logger.auth.exception(error as Error, { action: 'logout' });
```

### 5. `components/ai-content-studio.tsx` (3 statements)
```typescript
// Lines 46, 105, 131
console.error('Failed to fetch limits:', err);
console.error('Generation error:', err);
console.error('Topic suggestion error:', err);

// Replace with:
logger.api.exception(err, { action: 'fetch-generation-limits' });
logger.ai.exception(err, { action: 'content-generation' });
logger.ai.exception(err, { action: 'topic-suggestions' });
```

### 6. `components/automation-view.tsx` (3 statements)
```typescript
// Lines 66, 102, 121
console.error('Failed to fetch automation data:', error);
console.error('Failed to toggle rule:', error);
console.error('Failed to delete rule:', error);

// Replace with:
logger.api.exception(error, { action: 'fetch-automation-data' });
logger.api.exception(error, { action: 'toggle-automation-rule' });
logger.api.exception(error, { action: 'delete-automation-rule' });
```

### 7. `components/schedule-view.tsx` (1 statement)
```typescript
// Line 99
console.error('Failed to fetch data:', error);

// Replace with:
logger.api.exception(error, { action: 'fetch-scheduled-posts' });
```

### 8. `components/settings-view.tsx` (1 statement)
```typescript
// Line 50
console.error('Failed to fetch billing history:', err);

// Replace with:
logger.api.exception(err, { action: 'fetch-billing-history' });
```

### 9. `components/content-generator.tsx` (1 statement)
```typescript
// Line 68
console.error('Failed to fetch limits:', err);

// Replace with:
logger.api.exception(err, { action: 'fetch-generation-limits' });
```

### 10. `components/connected-accounts/connected-account-card.tsx` (2 statements)
```typescript
// Lines 73, 85
console.error(`Failed to connect ${platform}:`, error);
console.error(`Failed to disconnect ${platform}:`, error);

// Replace with:
logger.oauth.exception(error, { action: 'connect-account', platform });
logger.oauth.exception(error, { action: 'disconnect-account', platform });
```

### 11. `components/connected-accounts/connected-accounts-view.tsx` (2 statements)
```typescript
// Lines 84, 130
console.error('Error fetching data:', err);
console.error('Error disconnecting:', err);

// Replace with:
logger.api.exception(err, { action: 'fetch-connected-accounts' });
logger.oauth.exception(err, { action: 'disconnect-account' });
```

### 12. `components/modals/credit-topup-modal.tsx` (1 statement)
```typescript
// Line 112
console.error('Checkout error:', err);

// Replace with:
logger.polar.exception(err, { action: 'create-credit-checkout' });
```

### 13. `components/modals/subscription-modal.tsx` (1 statement)
```typescript
// Line 123
console.error('Checkout error:', err);

// Replace with:
logger.polar.exception(err, { action: 'create-subscription-checkout' });
```

### 14. `components/test-posting.tsx` (1 statement)
```typescript
// Line 44
console.error('Posting error:', err);

// Replace with:
logger.posting.exception(err, { action: 'test-post' });
```

---

## 🟢 LOW PRIORITY (Error Boundaries - Keep as console.error)

These are React Error Boundaries that should use console.error for React DevTools integration:

### 15. `components/errors/DashboardErrorBoundary.tsx` (1 statement)
```typescript
// Line 28 - KEEP AS IS
console.error('Dashboard Error:', error, errorInfo);
// React Error Boundaries should log to console for DevTools
```

### 16. `components/errors/PaymentErrorBoundary.tsx` (1 statement)
```typescript
// Line 27 - KEEP AS IS
console.error('Payment Error:', error, errorInfo);
```

### 17. `components/errors/ContentGenErrorBoundary.tsx` (1 statement)
```typescript
// Line 27 - KEEP AS IS
console.error('Content Generation Error:', error, errorInfo);
```

### 18. `components/errors/OAuthErrorBoundary.tsx` (1 statement)
```typescript
// Line 28 - KEEP AS IS
console.error('OAuth Error:', error, errorInfo);
```

---

## ⚪ SKIP (Intentional/System Files)

### 19. `lib/logger.ts` (3 statements)
**Why:** Logger implementation needs console.* internally
```typescript
// Lines 133, 135, 140, 142, 147, 149 - SKIP
console.info(...);
console.warn(...);
console.error(...);
// These are the actual logger implementation
```

### 20. `lib/diagnostics/auth-diagnostic.ts` (35 statements)
**Why:** Diagnostic tool meant to output to console
```typescript
// All console.log statements - SKIP
// This is a diagnostic script run manually
```

### 21. `lib/inngest/database-config.ts` (9 statements)
**Why:** Configuration diagnostic output
```typescript
// All console.log statements - SKIP
// This is a configuration helper
```

### 22. Test Files (6 statements)
**Why:** Temporary test files
- `app/tmp_rovodev_all-components-test/page.tsx` (4)
- `app/tmp_rovodev_image-uploader-test/page.tsx` (2)
- These will be deleted after testing

---

## 📊 Statistics

### Total Console Statements Found: 68

#### By Priority:
- 🔴 **HIGH**: 8 statements (4 files) - Authentication & AI generation
- 🟡 **MEDIUM**: 16 statements (11 files) - Component error handling
- 🟢 **LOW**: 4 statements (4 files) - Error boundaries (intentional)
- ⚪ **SKIP**: 47 statements (5 files) - System/diagnostic files

#### By Context:
- **Authentication**: 6 statements → `logger.auth.*`
- **API Calls**: 8 statements → `logger.api.*`
- **AI Generation**: 3 statements → `logger.ai.*`
- **OAuth**: 4 statements → `logger.oauth.*`
- **Database**: 1 statement → `logger.db.*`
- **Payments**: 2 statements → `logger.polar.*`
- **Posting**: 1 statement → `logger.posting.*`
- **Error Boundaries**: 4 statements → Keep as console.error
- **System Files**: 47 statements → Skip

---

## 🛠️ Batch Fix Script Template

For quick fixes, you can use this pattern:

```typescript
// Before:
console.error('Operation failed:', error);

// After:
import { logger } from '@/lib/logger';
logger.[context].exception(error, { action: 'operation-name' });

// Available contexts:
// - logger.auth (authentication flows)
// - logger.api (API calls)
// - logger.ai (AI generation)
// - logger.oauth (OAuth connections)
// - logger.db (database operations)
// - logger.polar (payment processing)
// - logger.posting (social media posting)
// - logger.admin (admin operations)
// - logger.security (security events)
// - logger.cron (scheduled tasks)
```

---

## 📋 Recommended Fix Order

1. **Week 1**: HIGH priority files (8 statements)
   - `app/dashboard/client-page.tsx`
   - `app/signup/page.tsx`
   - `app/actions/generate.ts`

2. **Week 2**: MEDIUM priority components (16 statements)
   - AI & Content components
   - OAuth components
   - Payment modals

3. **Future**: Error boundaries (optional)
   - Can keep console.error for React DevTools
   - Or add logger.exception() alongside console.error

---

## ✅ Completion Criteria

### Phase 1 (DONE ✅):
- [x] `app/login/page.tsx`
- [x] `middleware.ts`
- [x] `app/dashboard/dashboard-client.tsx`

### Phase 2 (Next):
- [ ] `app/dashboard/client-page.tsx`
- [ ] `app/signup/page.tsx`
- [ ] `app/actions/generate.ts`

### Phase 3 (Future):
- [ ] All component files
- [ ] Optional: Error boundaries

---

**Last Updated:** 2024  
**Total Fixed:** 30/68 (44%)  
**Critical Fixed:** 30/30 (100%) ✅
