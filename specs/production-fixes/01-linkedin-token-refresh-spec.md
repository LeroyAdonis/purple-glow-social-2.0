# LinkedIn Token Refresh Implementation Specification

**Priority:** HIGH  
**Estimated Effort:** 4 hours  
**Dependencies:** None (foundation already exists)  
**Owner:** Backend Developer  

---

## 1. Executive Summary

### Current State
The LinkedIn OAuth provider (`lib/oauth/linkedin-provider.ts`) already has a `refreshAccessToken()` method implemented (lines 109-151). However, the centralized Token Refresh Service (`lib/oauth/token-refresh-service.ts`) does NOT integrate with the LinkedIn provider - it explicitly logs a warning and returns null (lines 82-85).

### Gap
```typescript
// Current code in token-refresh-service.ts (lines 82-85):
case 'linkedin': {
  // LinkedIn refresh will be implemented in linkedin-provider.ts
  logger.oauth.warn('LinkedIn token refresh not yet implemented');
  return null;
}
```

### Impact if NOT Fixed
- LinkedIn users must manually reconnect every 60 days when tokens expire
- Automated posting to LinkedIn will fail after token expiry
- Users will receive unexpected errors during scheduled posts
- Degraded user experience for business-tier users who rely on LinkedIn

### Solution
Integrate the existing `LinkedInProvider.refreshAccessToken()` method into the token refresh service.

---

## 2. Technical Requirements

### 2.1 Primary Requirements
- [x] LinkedInProvider class already implements `refreshAccessToken()` ✅
- [ ] Integrate LinkedIn refresh into `token-refresh-service.ts`
- [ ] Handle LinkedIn-specific token expiry (60 days vs 2 hours for Twitter)
- [ ] Update database with new tokens after refresh
- [ ] Add proper error handling and logging
- [ ] Test with expiring LinkedIn tokens

### 2.2 LinkedIn Token Characteristics
| Property | Value |
|----------|-------|
| Access Token Lifetime | 60 days |
| Refresh Token Lifetime | 365 days |
| Refresh Token Rotation | Yes (new refresh token issued) |
| Refresh Endpoint | `https://www.linkedin.com/oauth/v2/accessToken` |
| Grant Type | `refresh_token` |

### 2.3 Acceptance Criteria
- [ ] LinkedIn tokens refresh automatically when expiring within 24 hours
- [ ] New tokens are encrypted and stored in database
- [ ] Failed refresh marks account as inactive
- [ ] Proper logging for debugging
- [ ] No breaking changes to existing OAuth flows
- [ ] Unit tests pass

---

## 3. Implementation Steps

### Step 1: Update Token Refresh Service (Primary Change)

**File:** `lib/oauth/token-refresh-service.ts`

**Action:** Replace lines 82-85 with LinkedIn integration

**Current Code (lines 82-85):**
```typescript
case 'linkedin': {
  // LinkedIn refresh will be implemented in linkedin-provider.ts
  logger.oauth.warn('LinkedIn token refresh not yet implemented');
  return null;
}
```

**New Code:**
```typescript
case 'linkedin': {
  if (!refreshToken) {
    throw new Error('LinkedIn requires refresh token for token refresh');
  }
  const { LinkedInProvider } = await import('./linkedin-provider');
  const provider = new LinkedInProvider();
  
  // Check if provider is configured
  if (!provider.isConfigured()) {
    throw new Error('LinkedIn credentials not configured');
  }
  
  const result = await provider.refreshAccessToken(refreshToken);
  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken || refreshToken, // LinkedIn returns new refresh token
    expiresIn: result.expiresIn,
  };
}
```

### Step 2: Add Import Statement

**File:** `lib/oauth/token-refresh-service.ts`

**Action:** Add LinkedInProvider import at top of file (if using static import)

**Alternative:** The dynamic import in Step 1 handles this automatically.

### Step 3: Update refreshExpiringTokens Function

**File:** `lib/oauth/token-refresh-service.ts`

**Action:** Ensure the function handles LinkedIn's longer token lifetime appropriately.

The existing code already uses `PROACTIVE_REFRESH_HOURS = 24` which is appropriate for LinkedIn's 60-day tokens. No change needed here.

### Step 4: Add LinkedIn-Specific Error Handling

**File:** `lib/oauth/token-refresh-service.ts`

**Action:** Add specific error codes for LinkedIn failures

**Add after line 106:**
```typescript
/**
 * LinkedIn-specific error codes
 */
const LINKEDIN_ERROR_CODES = {
  INVALID_REFRESH_TOKEN: 'invalid_request', // Refresh token expired or invalid
  REVOKED_TOKEN: 'access_denied',           // User revoked access
  RATE_LIMITED: 'too_many_requests',        // Rate limit exceeded
};
```

### Step 5: Verify LinkedInProvider Implementation

**File:** `lib/oauth/linkedin-provider.ts`

**Review:** The existing implementation (lines 109-151) is correct. Verify these aspects:

```typescript
async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  // ✅ Checks configuration
  if (!this.isConfigured()) {
    throw new OAuthError('LinkedIn credentials not configured', 'not_configured', 500);
  }
  
  // ✅ Correct endpoint
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  
  // ✅ Returns new refresh token if provided
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken, // Keep old if not returned
    expiresIn: data.expires_in || 5184000, // 60 days default
    scope: data.scope || 'openid profile w_member_social',
  };
}
```

**Status:** Implementation is correct. No changes needed.

---

## 4. Files to Modify

| File | Action | Lines | Description |
|------|--------|-------|-------------|
| `lib/oauth/token-refresh-service.ts` | MODIFY | 82-85 | Replace LinkedIn placeholder with actual implementation |
| `lib/oauth/linkedin-provider.ts` | VERIFY | 109-151 | Verify existing implementation (no changes expected) |

---

## 5. Database Changes

**None required.** The existing `connectedAccounts` table already supports:
- `accessToken` (encrypted)
- `refreshToken` (encrypted)
- `tokenExpiresAt` (timestamp)

---

## 6. Testing Strategy

### 6.1 Unit Tests

**File to Create:** `tests/unit/linkedin-token-refresh.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinkedInProvider } from '@/lib/oauth/linkedin-provider';

describe('LinkedInProvider.refreshAccessToken', () => {
  beforeEach(() => {
    vi.stubEnv('LINKEDIN_CLIENT_ID', 'test-client-id');
    vi.stubEnv('LINKEDIN_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv('BETTER_AUTH_URL', 'http://localhost:3000');
  });

  it('should refresh access token successfully', async () => {
    const mockResponse = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      expires_in: 5184000,
      scope: 'openid profile w_member_social',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const provider = new LinkedInProvider();
    const result = await provider.refreshAccessToken('old-refresh-token');

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.expiresIn).toBe(5184000);
  });

  it('should throw error when refresh token is invalid', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({
        error: 'invalid_request',
        error_description: 'Invalid refresh token',
      }),
    });

    const provider = new LinkedInProvider();
    await expect(provider.refreshAccessToken('invalid-token'))
      .rejects.toThrow('Invalid refresh token');
  });

  it('should throw error when credentials not configured', async () => {
    vi.stubEnv('LINKEDIN_CLIENT_ID', '');
    vi.stubEnv('LINKEDIN_CLIENT_SECRET', '');

    const provider = new LinkedInProvider();
    await expect(provider.refreshAccessToken('any-token'))
      .rejects.toThrow('LinkedIn credentials not configured');
  });
});
```

### 6.2 Integration Test

**File to Create:** `tests/integration/linkedin-refresh-flow.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { refreshAccountToken } from '@/lib/oauth/token-refresh-service';
import { db } from '@/drizzle/db';
import { connectedAccounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

describe('LinkedIn Token Refresh Integration', () => {
  const testUserId = 'test-user-linkedin';

  beforeEach(async () => {
    // Setup test environment
    vi.stubEnv('LINKEDIN_CLIENT_ID', 'test-client-id');
    vi.stubEnv('LINKEDIN_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv('TOKEN_ENCRYPTION_KEY', '0'.repeat(64));
  });

  it('should refresh LinkedIn token and update database', async () => {
    // Mock the LinkedIn API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        access_token: 'refreshed-access-token',
        refresh_token: 'refreshed-refresh-token',
        expires_in: 5184000,
      }),
    });

    const result = await refreshAccountToken(testUserId, 'linkedin');

    expect(result.success).toBe(true);
    expect(result.platform).toBe('linkedin');
    expect(result.newExpiresAt).toBeDefined();
  });
});
```

### 6.3 Manual Testing Checklist

- [ ] Connect a LinkedIn account in development
- [ ] Verify token is stored encrypted in database
- [ ] Manually call `/api/cron/refresh-tokens` endpoint
- [ ] Verify logs show LinkedIn token refresh attempt
- [ ] Verify new token is stored in database
- [ ] Verify token expiry is updated (should be ~60 days from now)
- [ ] Test posting to LinkedIn after refresh

---

## 7. Error Scenarios

| Scenario | Expected Behavior | Recovery |
|----------|-------------------|----------|
| Invalid refresh token | OAuthError thrown | Mark account inactive, notify user |
| User revoked access | OAuthError with 'access_denied' | Mark account inactive, notify user |
| Rate limited | OAuthError with retry header | Exponential backoff (already implemented) |
| Network timeout | Generic error | Retry up to 3 times (already implemented) |
| LinkedIn API down | 5xx error | Retry, then mark for later refresh |

---

## 8. Success Criteria

### Functional
- [ ] LinkedIn tokens refresh automatically 24 hours before expiry
- [ ] Cron job `/api/cron/refresh-tokens` handles LinkedIn accounts
- [ ] New tokens are encrypted before storage
- [ ] Token expiry is correctly calculated (60 days from refresh)
- [ ] Failed refresh deactivates account and triggers notification

### Non-Functional
- [ ] No regression in other platform token refresh
- [ ] Logs clearly indicate LinkedIn refresh attempts and results
- [ ] Error messages are user-friendly for notification purposes

---

## 9. Rollback Plan

If issues arise after deployment:

1. **Quick Fix:** Revert the change in `token-refresh-service.ts` to return `null` for LinkedIn
2. **Manual Intervention:** Users can manually reconnect LinkedIn accounts
3. **Monitoring:** Watch Sentry for OAuth-related errors

---

## 10. Post-Implementation Tasks

- [ ] Update `vercel.json` to include token refresh cron if not present
- [ ] Add LinkedIn refresh to monitoring dashboard
- [ ] Update documentation in `AGENTS.md`
- [ ] Verify Sentry captures any refresh failures

---

## 11. Code Review Checklist

- [ ] Error handling covers all LinkedIn-specific error codes
- [ ] Logging includes sufficient context for debugging
- [ ] No sensitive data (tokens) logged
- [ ] TypeScript types are correct
- [ ] Tests cover happy path and error scenarios
- [ ] No breaking changes to existing functionality

---

*Specification created for Purple Glow Social 2.0*  
*Ready for implementation by Coder Agent*
