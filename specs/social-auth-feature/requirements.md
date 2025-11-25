# Social Authentication & OAuth Integration - Requirements

## Feature Overview

**Feature Name:** Social Authentication & OAuth Integration  
**Phase:** 8  
**Priority:** High  
**Estimated Effort:** 3-4 days  
**Status:** Planning

---

## Executive Summary

This feature adds two distinct authentication capabilities to Purple Glow Social 2.0:

1. **Social Login (Authentication)**: Users can sign up/login using Google OAuth
2. **Social Media Connection (Authorization)**: Users can connect Instagram, Facebook, Twitter/X, and LinkedIn accounts for content posting

These are separate OAuth flows with different purposes and scopes.

---

## User Stories

### Authentication (Login)

**As a** new user  
**I want to** sign up using my Google account  
**So that** I can quickly create an account without filling forms

**As a** returning user  
**I want to** login with my Google account  
**So that** I can access my dashboard without remembering passwords

### Authorization (Social Media Connection)

**As a** Pro/Business user  
**I want to** connect my Instagram, Facebook, Twitter/X, and LinkedIn accounts  
**So that** I can post content directly to these platforms

**As a** user with connected accounts  
**I want to** see which accounts are connected and their status  
**So that** I can manage my integrations

**As a** user  
**I want to** disconnect a social media account  
**So that** I can revoke access when needed

---

## Functional Requirements

### FR1: Social Login (Google)

#### FR1.1: Login Page
- ✅ Dedicated `/login` page with Purple Glow branding
- ✅ "Continue with Google" button with Google branding
- ✅ Alternative email/password login (Better-auth default)
- ✅ "Don't have an account? Sign up" link
- ✅ Redirect to dashboard after successful login
- ✅ Error handling for failed authentication

#### FR1.2: Sign Up Page
- ✅ Dedicated `/signup` page
- ✅ "Sign up with Google" button
- ✅ Alternative email/password signup
- ✅ Terms of service and privacy policy checkboxes
- ✅ Auto-assign "free" tier on signup
- ✅ Initialize user with 10 credits

#### FR1.3: Authentication Flow
- ✅ OAuth 2.0 flow with Google
- ✅ Store user profile (name, email, avatar)
- ✅ Create session with Better-auth
- ✅ Persist session across page reloads
- ✅ Secure cookie-based session management

### FR2: Social Media Connection

#### FR2.1: Settings Page Integration
- ✅ New "Connected Accounts" section in Settings
- ✅ Display all 4 platforms: Instagram, Facebook, Twitter/X, LinkedIn
- ✅ Show connection status for each platform
- ✅ "Connect" button for disconnected accounts
- ✅ "Disconnect" button with confirmation for connected accounts
- ✅ Display connected account info (username, profile picture)
- ✅ Show token expiry status

#### FR2.2: OAuth Connection Flow
- ✅ Platform-specific OAuth 2.0 flows
- ✅ Request appropriate scopes for posting:
  - **Instagram**: `instagram_basic`, `instagram_content_publish`
  - **Facebook**: `pages_manage_posts`, `pages_read_engagement`, `publish_to_groups`
  - **Twitter/X**: `tweet.read`, `tweet.write`, `users.read`
  - **LinkedIn**: `w_member_social`, `r_liteprofile`
- ✅ Store access tokens securely (encrypted)
- ✅ Store refresh tokens when available
- ✅ Link connected accounts to user profile

#### FR2.3: Token Management
- ✅ Automatic token refresh before expiry
- ✅ Background job to check token validity
- ✅ Notify user when manual reconnection needed
- ✅ Graceful handling of revoked permissions

#### FR2.4: Connection Status UI
- ✅ Green checkmark for active connections
- ✅ Yellow warning for expiring tokens (< 7 days)
- ✅ Red X for expired/failed connections
- ✅ Last synced timestamp
- ✅ Reconnect prompt when needed

### FR3: Database Schema

#### FR3.1: Users Table Enhancement
```typescript
// Existing users table from Better-auth
users: {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  // Add our custom fields
  tier: 'free' | 'pro' | 'business';
  credits: number;
}
```

#### FR3.2: Accounts Table (Better-auth)
```typescript
// Used for authentication (login with Google)
accounts: {
  id: string;
  userId: string;
  accountId: string; // Provider user ID
  providerId: string; // 'google'
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date | null;
  scope: string;
  password: string | null; // For email/password
  createdAt: Date;
  updatedAt: Date;
}
```

#### FR3.3: Connected Accounts Table (New)
```typescript
// Used for social media posting
connectedAccounts: {
  id: string;
  userId: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  platformUserId: string; // Platform's user ID
  platformUsername: string;
  platformDisplayName: string;
  profileImageUrl: string | null;
  accessToken: string; // Encrypted
  refreshToken: string | null; // Encrypted
  tokenExpiresAt: Date | null;
  scope: string;
  isActive: boolean;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### FR4: Security Requirements

#### FR4.1: Token Security
- ✅ Encrypt access tokens at rest using AES-256
- ✅ Store encryption key in environment variables
- ✅ Never expose tokens in client-side code
- ✅ Use server-side API routes for OAuth callbacks
- ✅ Implement CSRF protection

#### FR4.2: OAuth Security
- ✅ Use state parameter to prevent CSRF
- ✅ Validate redirect URIs
- ✅ Use PKCE (Proof Key for Code Exchange) when supported
- ✅ Implement proper error handling
- ✅ Log authentication attempts

#### FR4.3: Session Management
- ✅ Secure HTTP-only cookies
- ✅ 30-day session expiry (configurable)
- ✅ Auto-refresh sessions
- ✅ Logout functionality
- ✅ Invalidate sessions on password change

---

## Non-Functional Requirements

### NFR1: Performance
- OAuth callbacks must complete within 3 seconds
- Token refresh must happen in background
- Settings page must load within 2 seconds
- No blocking UI during connection process

### NFR2: Usability
- Clear loading states during OAuth flow
- Helpful error messages (e.g., "Permission denied")
- One-click reconnection for expired tokens
- Mobile-responsive OAuth dialogs
- WCAG AA accessibility compliance

### NFR3: Reliability
- 99.9% uptime for authentication
- Graceful degradation if provider is down
- Automatic retry for failed token refreshes
- Transaction rollback on failed connections

### NFR4: Scalability
- Support 10,000+ concurrent users
- Handle 1,000+ OAuth callbacks per minute
- Efficient token storage and retrieval
- Background job queue for token refresh

---

## Platform-Specific Requirements

### Instagram
- **OAuth Version:** Graph API v18.0
- **Scopes:** `instagram_basic`, `instagram_content_publish`
- **Token Expiry:** 60 days (long-lived tokens)
- **Refresh:** Exchange short-lived for long-lived tokens
- **Business Requirement:** Instagram Business or Creator account
- **Special Notes:** Requires Facebook Page connection first

### Facebook
- **OAuth Version:** Graph API v18.0
- **Scopes:** `pages_manage_posts`, `pages_read_engagement`
- **Token Expiry:** 60 days (long-lived tokens)
- **Refresh:** Can extend tokens before expiry
- **Special Notes:** Support both Pages and Groups

### Twitter/X
- **OAuth Version:** OAuth 2.0 (new API)
- **Scopes:** `tweet.read`, `tweet.write`, `users.read`
- **Token Expiry:** 2 hours (short-lived)
- **Refresh:** Use refresh tokens
- **Special Notes:** Requires Developer Account with appropriate tier

### LinkedIn
- **OAuth Version:** OAuth 2.0
- **Scopes:** `w_member_social`, `r_liteprofile`
- **Token Expiry:** 60 days
- **Refresh:** Use refresh tokens
- **Special Notes:** Posting permissions require review

---

## User Interface Requirements

### UI1: Login Page (`/login`)

#### Layout
```
┌─────────────────────────────────────┐
│  🟣 Purple Glow Social              │
│                                     │
│  ┌─────────────────────────────┐  │
│  │  Welcome Back!               │  │
│  │                               │  │
│  │  [🔵 Continue with Google]   │  │
│  │                               │  │
│  │  ─────── or ───────          │  │
│  │                               │  │
│  │  Email: [____________]       │  │
│  │  Password: [____________]    │  │
│  │                               │  │
│  │  [Forgot Password?]          │  │
│  │                               │  │
│  │  [Login Button]              │  │
│  │                               │  │
│  │  Don't have an account?      │  │
│  │  [Sign up]                   │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

#### Styling
- Full-screen centered card
- Purple Glow gradient background
- Glass morphism card design
- Google button with official branding
- Responsive: mobile, tablet, desktop

### UI2: Settings - Connected Accounts

#### Layout
```
Settings
├── Profile
├── Language (Existing)
├── Connected Accounts (NEW)
│   ├── Instagram [Connect / ✅ Connected]
│   ├── Facebook [Connect / ✅ Connected]
│   ├── Twitter/X [Connect / ✅ Connected]
│   └── LinkedIn [Connect / ✅ Connected]
└── Subscription
```

#### Connected Account Card
```
┌─────────────────────────────────────────┐
│  📷 Instagram                            │
│  ─────────────────────────────────────  │
│  Status: ✅ Connected                   │
│  Account: @yourhandle                   │
│  Last Synced: 2 hours ago               │
│  Token Expires: 45 days                 │
│                                          │
│  [Disconnect] [Refresh Connection]      │
└─────────────────────────────────────────┘
```

### UI3: OAuth Callback Pages

#### Success
```
┌─────────────────────────────────────┐
│  ✅ Successfully Connected!          │
│                                     │
│  Your Instagram account is now      │
│  connected. Redirecting...          │
│                                     │
│  [Go to Dashboard]                  │
└─────────────────────────────────────┘
```

#### Error
```
┌─────────────────────────────────────┐
│  ❌ Connection Failed                │
│                                     │
│  Unable to connect your account:    │
│  "Permission denied"                │
│                                     │
│  [Try Again] [Get Help]             │
└─────────────────────────────────────┘
```

---

## API Endpoints

### Authentication Endpoints (Better-auth)
```typescript
// Provided by Better-auth
POST   /api/auth/sign-in/google          // Initiate Google login
GET    /api/auth/callback/google         // Google OAuth callback
POST   /api/auth/sign-up                 // Email/password signup
POST   /api/auth/sign-in                 // Email/password login
POST   /api/auth/sign-out                // Logout
GET    /api/auth/session                 // Get current session
```

### Social Media Connection Endpoints (Custom)
```typescript
// Instagram
GET    /api/oauth/instagram/connect      // Initiate Instagram OAuth
GET    /api/oauth/instagram/callback     // Instagram callback
POST   /api/oauth/instagram/disconnect   // Disconnect Instagram

// Facebook
GET    /api/oauth/facebook/connect       // Initiate Facebook OAuth
GET    /api/oauth/facebook/callback      // Facebook callback
POST   /api/oauth/facebook/disconnect    // Disconnect Facebook

// Twitter/X
GET    /api/oauth/twitter/connect        // Initiate Twitter OAuth
GET    /api/oauth/twitter/callback       // Twitter callback
POST   /api/oauth/twitter/disconnect     // Disconnect Twitter

// LinkedIn
GET    /api/oauth/linkedin/connect       // Initiate LinkedIn OAuth
GET    /api/oauth/linkedin/callback      // LinkedIn callback
POST   /api/oauth/linkedin/disconnect    // Disconnect LinkedIn

// Management
GET    /api/oauth/connections             // Get all user's connections
POST   /api/oauth/refresh/:platform      // Manually refresh token
GET    /api/oauth/status/:platform       // Check connection status
```

---

## Data Flow Diagrams

### Social Login Flow
```
User → Login Page → "Continue with Google" →
→ Better-auth → Google OAuth → Consent Screen →
→ Google Callback → Better-auth → Create/Update User →
→ Create Session → Redirect to Dashboard
```

### Social Media Connection Flow
```
User → Settings → "Connect Instagram" →
→ /api/oauth/instagram/connect → Instagram OAuth →
→ Consent Screen → Grant Permissions →
→ /api/oauth/instagram/callback → Exchange Code for Token →
→ Store Encrypted Token in DB → Update UI → Show "Connected"
```

### Token Refresh Flow
```
Background Job (Runs Hourly) →
→ Query Tokens Expiring < 7 Days →
→ For Each Token: Call Platform Refresh API →
→ Update Token in DB →
→ Log Success/Failure →
→ Notify User if Manual Action Needed
```

---

## Testing Requirements

### Unit Tests
- ✅ OAuth helper functions
- ✅ Token encryption/decryption
- ✅ Session validation
- ✅ Error handling utilities

### Integration Tests
- ✅ Complete OAuth flows (mocked)
- ✅ Token refresh logic
- ✅ Database operations
- ✅ API endpoint responses

### E2E Tests
- ✅ Login with Google (Playwright)
- ✅ Connect Instagram account
- ✅ Disconnect account
- ✅ Token expiry handling
- ✅ Mobile responsiveness

### Security Tests
- ✅ Token encryption strength
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ SQL injection prevention
- ✅ Rate limiting

---

## Migration Strategy

### Phase 1: Database Setup
1. Create `connectedAccounts` table
2. Add `tier` and `credits` to `users` table
3. Run migrations
4. Seed test data

### Phase 2: Authentication (Week 1)
1. Create login/signup pages
2. Integrate Google OAuth via Better-auth
3. Session management
4. Redirect logic
5. Testing

### Phase 3: Social Connections (Week 2)
1. Create Connected Accounts settings section
2. Implement Instagram connection
3. Implement Facebook connection
4. Implement Twitter/X connection
5. Implement LinkedIn connection
6. Testing

### Phase 4: Token Management (Week 2)
1. Token encryption service
2. Background refresh job
3. Expiry notifications
4. Status monitoring
5. Testing

### Phase 5: Polish & Deploy (Week 3)
1. Error handling improvements
2. Loading states
3. Analytics integration
4. Documentation
5. Production deployment

---

## Success Metrics

### Technical Metrics
- ✅ 99.9% authentication success rate
- ✅ < 3s average OAuth callback time
- ✅ < 1% token refresh failure rate
- ✅ Zero security vulnerabilities

### User Metrics
- ✅ 60%+ users choose Google login
- ✅ 80%+ users connect at least 1 platform
- ✅ < 5% connection failures
- ✅ 90%+ user satisfaction (NPS)

### Business Metrics
- ✅ 30% increase in signup conversion
- ✅ 50% reduction in support tickets (password resets)
- ✅ Enable auto-posting feature (revenue driver)

---

## Dependencies

### External Services
- Google OAuth 2.0
- Facebook Graph API
- Instagram Graph API  
- Twitter API v2
- LinkedIn API v2

### Libraries
- `better-auth` (existing)
- `@better-auth/drizzle-adapter` (existing)
- `crypto` (Node.js built-in for encryption)
- `jose` (JWT handling)

### Configuration
- Environment variables for OAuth credentials
- Callback URLs configured in each provider
- Encryption keys for token storage

---

## Risks & Mitigations

### Risk 1: OAuth Provider Changes
**Impact:** High  
**Probability:** Medium  
**Mitigation:** 
- Abstract OAuth logic into provider-specific adapters
- Monitor provider changelog/newsletters
- Keep dependencies updated

### Risk 2: Token Expiry Issues
**Impact:** Medium  
**Probability:** High  
**Mitigation:**
- Implement robust refresh logic
- User notifications before expiry
- Clear reconnection UI
- Background monitoring

### Risk 3: Security Vulnerabilities
**Impact:** Critical  
**Probability:** Low  
**Mitigation:**
- Regular security audits
- Penetration testing
- Keep dependencies patched
- Follow OWASP guidelines

### Risk 4: User Confusion
**Impact:** Medium  
**Probability:** Medium  
**Mitigation:**
- Clear UI copy
- Tooltips and help text
- Video tutorials
- Dedicated support docs

---

## Documentation Requirements

### User Documentation
- ✅ "How to Login with Google" guide
- ✅ "Connecting Your Social Media Accounts" tutorial
- ✅ "Troubleshooting Connection Issues" FAQ
- ✅ "Understanding Token Expiry" explainer
- ✅ Video walkthrough (2-3 min)

### Developer Documentation
- ✅ OAuth implementation guide
- ✅ Token encryption/decryption API
- ✅ Adding new OAuth providers
- ✅ Testing OAuth flows locally
- ✅ API endpoint documentation

---

## Open Questions

1. **Instagram Business Requirement:** Should we guide users through converting to Business accounts?
2. **Multiple Accounts:** Allow connecting multiple accounts per platform? (e.g., 2 Instagram accounts)
3. **Subscription Gates:** Should Free tier users be limited to 1 connected account?
4. **Token Expiry Grace Period:** How many days before expiry should we notify?
5. **Failed Posts:** What happens to scheduled posts when token expires?

---

## Appendix

### A: OAuth Scopes Reference

#### Google (Authentication)
```
scopes: [
  'openid',
  'profile',
  'email'
]
```

#### Instagram (Posting)
```
scopes: [
  'instagram_basic',
  'instagram_content_publish',
  'pages_read_engagement'
]
```

#### Facebook (Posting)
```
scopes: [
  'pages_manage_posts',
  'pages_read_engagement',
  'publish_to_groups'
]
```

#### Twitter/X (Posting)
```
scopes: [
  'tweet.read',
  'tweet.write',
  'users.read',
  'offline.access'
]
```

#### LinkedIn (Posting)
```
scopes: [
  'w_member_social',
  'r_liteprofile',
  'r_emailaddress'
]
```

### B: Environment Variables

```env
# Better-auth
BETTER_AUTH_SECRET=your_secret_key_here
BETTER_AUTH_URL=http://localhost:5173

# Google OAuth (Authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Instagram/Facebook OAuth (Meta)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# Twitter/X OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Encryption
TOKEN_ENCRYPTION_KEY=your_32_char_encryption_key

# Database
DATABASE_URL=postgresql://...
```

### C: Callback URLs

```
Google: http://localhost:5173/api/auth/callback/google
Instagram: http://localhost:5173/api/oauth/instagram/callback
Facebook: http://localhost:5173/api/oauth/facebook/callback
Twitter: http://localhost:5173/api/oauth/twitter/callback
LinkedIn: http://localhost:5173/api/oauth/linkedin/callback
```

---

**Status:** Ready for Implementation  
**Next Steps:** Create implementation plan  
**Approval Required:** Product Owner

---

*Last Updated: Phase 8 Planning*
