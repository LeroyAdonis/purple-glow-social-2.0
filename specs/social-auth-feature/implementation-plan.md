# Social Authentication & OAuth Integration - Implementation Plan

## Overview

This document provides a step-by-step implementation plan for adding:
1. **Social Login** with Google (authentication)
2. **Social Media Connection** via OAuth (Instagram, Facebook, Twitter/X, LinkedIn)

**Total Estimated Time:** 2-3 weeks  
**Complexity:** High  
**Dependencies:** Better-auth, Database migrations, OAuth provider setup

---

## Table of Contents

1. [Phase 1: Setup & Database](#phase-1-setup--database)
2. [Phase 2: Google Authentication](#phase-2-google-authentication)
3. [Phase 3: Social Media OAuth](#phase-3-social-media-oauth)
4. [Phase 4: Token Management](#phase-4-token-management)
5. [Phase 5: UI Integration](#phase-5-ui-integration)
6. [Phase 6: Testing & Polish](#phase-6-testing--polish)
7. [File Structure](#file-structure)
8. [Code Examples](#code-examples)

---

## Phase 1: Setup & Database
**Duration:** 2 days  
**Priority:** Critical

### Tasks

#### 1.1 Environment Configuration
- [ ] Add OAuth credentials to `.env`
- [ ] Configure callback URLs in each provider console
- [ ] Generate encryption key for tokens
- [ ] Update Better-auth configuration

#### 1.2 Database Schema Updates
- [ ] Create `connectedAccounts` table in Drizzle schema
- [ ] Add `tier` and `credits` columns to `users` table
- [ ] Create migration files
- [ ] Test migrations locally

#### 1.3 OAuth Provider Setup
- [ ] Create Google OAuth app (if not exists)
- [ ] Create Meta (Facebook/Instagram) OAuth app
- [ ] Create Twitter Developer app
- [ ] Create LinkedIn OAuth app
- [ ] Configure redirect URIs for each

### Files to Create/Modify
- `drizzle/schema.ts` (modify)
- `drizzle/migrations/0001_add_connected_accounts.sql` (create)
- `.env` (modify)
- `lib/auth.ts` (modify)

---

## Phase 2: Google Authentication
**Duration:** 3 days  
**Priority:** High

### Tasks

#### 2.1 Login Page
- [ ] Create `/app/login/page.tsx`
- [ ] Design login UI with Google button
- [ ] Add email/password fallback
- [ ] Implement redirect logic after login

#### 2.2 Signup Page
- [ ] Create `/app/signup/page.tsx`
- [ ] Design signup UI with Google button
- [ ] Add terms of service checkbox
- [ ] Initialize new users with free tier

#### 2.3 Better-auth Integration
- [ ] Configure Google provider in Better-auth
- [ ] Test OAuth flow end-to-end
- [ ] Handle session creation
- [ ] Implement logout functionality

#### 2.4 Session Management
- [ ] Create session context provider
- [ ] Add session persistence
- [ ] Implement auto-refresh
- [ ] Add protected route middleware

### Files to Create/Modify
- `app/login/page.tsx` (create)
- `app/signup/page.tsx` (create)
- `lib/auth.ts` (modify)
- `lib/context/SessionContext.tsx` (create)
- `components/auth/google-login-button.tsx` (create)

---

## Phase 3: Social Media OAuth
**Duration:** 5 days  
**Priority:** High

### Tasks

#### 3.1 OAuth Service Layer
- [ ] Create base OAuth provider interface
- [ ] Implement Instagram OAuth adapter
- [ ] Implement Facebook OAuth adapter
- [ ] Implement Twitter OAuth adapter
- [ ] Implement LinkedIn OAuth adapter

#### 3.2 API Routes - Instagram
- [ ] `app/api/oauth/instagram/connect/route.ts`
- [ ] `app/api/oauth/instagram/callback/route.ts`
- [ ] `app/api/oauth/instagram/disconnect/route.ts`
- [ ] Test Instagram connection flow

#### 3.3 API Routes - Facebook
- [ ] `app/api/oauth/facebook/connect/route.ts`
- [ ] `app/api/oauth/facebook/callback/route.ts`
- [ ] `app/api/oauth/facebook/disconnect/route.ts`
- [ ] Test Facebook connection flow

#### 3.4 API Routes - Twitter
- [ ] `app/api/oauth/twitter/connect/route.ts`
- [ ] `app/api/oauth/twitter/callback/route.ts`
- [ ] `app/api/oauth/twitter/disconnect/route.ts`
- [ ] Test Twitter connection flow

#### 3.5 API Routes - LinkedIn
- [ ] `app/api/oauth/linkedin/connect/route.ts`
- [ ] `app/api/oauth/linkedin/callback/route.ts`
- [ ] `app/api/oauth/linkedin/disconnect/route.ts`
- [ ] Test LinkedIn connection flow

### Files to Create
- `lib/oauth/base-provider.ts`
- `lib/oauth/instagram-provider.ts`
- `lib/oauth/facebook-provider.ts`
- `lib/oauth/twitter-provider.ts`
- `lib/oauth/linkedin-provider.ts`
- API route files (12 files total)

---

## Phase 4: Token Management
**Duration:** 3 days  
**Priority:** High

### Tasks

#### 4.1 Encryption Service
- [ ] Create token encryption utility
- [ ] Implement AES-256 encryption
- [ ] Add decryption function
- [ ] Test encryption/decryption

#### 4.2 Token Storage
- [ ] Create database helpers for tokens
- [ ] Implement secure token storage
- [ ] Add token retrieval functions
- [ ] Add token deletion functions

#### 4.3 Token Refresh System
- [ ] Create background job for token refresh
- [ ] Implement platform-specific refresh logic
- [ ] Add error handling and retry logic
- [ ] Set up cron job or scheduled task

#### 4.4 Monitoring & Alerts
- [ ] Create token status checker
- [ ] Implement expiry notifications
- [ ] Add logging for token operations
- [ ] Create admin dashboard view

### Files to Create
- `lib/crypto/token-encryption.ts`
- `lib/oauth/token-manager.ts`
- `lib/oauth/token-refresh-job.ts`
- `app/api/oauth/refresh/[platform]/route.ts`

---

## Phase 5: UI Integration
**Duration:** 3 days  
**Priority:** Medium

### Tasks

#### 5.1 Connected Accounts Settings
- [ ] Add "Connected Accounts" section to Settings
- [ ] Create platform connection cards
- [ ] Show connection status with visual indicators
- [ ] Add connect/disconnect buttons

#### 5.2 Connection Status Components
- [ ] Create `ConnectedAccountCard` component
- [ ] Create `ConnectionStatusBadge` component
- [ ] Create `ConnectButton` component
- [ ] Add loading states

#### 5.3 OAuth Callback Pages
- [ ] Create success callback page
- [ ] Create error callback page
- [ ] Add redirect logic
- [ ] Add user feedback messages

#### 5.4 Navigation Updates
- [ ] Add login/signup to navigation
- [ ] Show user avatar when logged in
- [ ] Add logout button to user menu
- [ ] Update protected route logic

### Files to Create/Modify
- `components/settings-view.tsx` (modify)
- `components/connected-accounts/connected-account-card.tsx` (create)
- `components/connected-accounts/connection-status-badge.tsx` (create)
- `components/connected-accounts/connect-button.tsx` (create)
- `app/oauth/callback/success/page.tsx` (create)
- `app/oauth/callback/error/page.tsx` (create)

---

## Phase 6: Testing & Polish
**Duration:** 2 days  
**Priority:** Medium

### Tasks

#### 6.1 Unit Tests
- [ ] Test OAuth provider adapters
- [ ] Test token encryption/decryption
- [ ] Test database operations
- [ ] Test error handling

#### 6.2 Integration Tests
- [ ] Test complete OAuth flows
- [ ] Test token refresh logic
- [ ] Test API endpoints
- [ ] Test session management

#### 6.3 E2E Tests
- [ ] Test login with Google
- [ ] Test connecting social accounts
- [ ] Test disconnecting accounts
- [ ] Test mobile responsive

#### 6.4 Polish
- [ ] Error message improvements
- [ ] Loading state refinements
- [ ] Accessibility audit
- [ ] Performance optimization

### Files to Create
- `__tests__/oauth/providers.test.ts`
- `__tests__/oauth/token-encryption.test.ts`
- `__tests__/integration/oauth-flow.test.ts`
- `e2e/auth.spec.ts`

---

## File Structure

```
purple-glow-social-2.0/
├── app/
│   ├── login/
│   │   └── page.tsx                          # NEW: Login page
│   ├── signup/
│   │   └── page.tsx                          # NEW: Signup page
│   ├── oauth/
│   │   └── callback/
│   │       ├── success/page.tsx              # NEW: Success page
│   │       └── error/page.tsx                # NEW: Error page
│   └── api/
│       ├── auth/                              # Better-auth handles this
│       │   ├── [...auth]/route.ts
│       │   └── session/route.ts
│       └── oauth/                             # NEW: OAuth endpoints
│           ├── connections/route.ts           # Get all connections
│           ├── instagram/
│           │   ├── connect/route.ts
│           │   ├── callback/route.ts
│           │   └── disconnect/route.ts
│           ├── facebook/
│           │   ├── connect/route.ts
│           │   ├── callback/route.ts
│           │   └── disconnect/route.ts
│           ├── twitter/
│           │   ├── connect/route.ts
│           │   ├── callback/route.ts
│           │   └── disconnect/route.ts
│           ├── linkedin/
│           │   ├── connect/route.ts
│           │   ├── callback/route.ts
│           │   └── disconnect/route.ts
│           └── refresh/
│               └── [platform]/route.ts        # Manual refresh
├── components/
│   ├── auth/
│   │   ├── google-login-button.tsx           # NEW: Google button
│   │   ├── logout-button.tsx                 # NEW: Logout
│   │   └── protected-route.tsx               # NEW: Route guard
│   ├── connected-accounts/
│   │   ├── connected-account-card.tsx        # NEW: Account card
│   │   ├── connection-status-badge.tsx       # NEW: Status badge
│   │   └── connect-button.tsx                # NEW: Connect button
│   └── settings-view.tsx                      # MODIFY: Add accounts section
├── lib/
│   ├── auth.ts                                # MODIFY: Better-auth config
│   ├── context/
│   │   ├── AppContext.tsx                     # MODIFY: Add session
│   │   └── SessionContext.tsx                 # NEW: Session provider
│   ├── oauth/
│   │   ├── base-provider.ts                   # NEW: Base interface
│   │   ├── instagram-provider.ts              # NEW: Instagram adapter
│   │   ├── facebook-provider.ts               # NEW: Facebook adapter
│   │   ├── twitter-provider.ts                # NEW: Twitter adapter
│   │   ├── linkedin-provider.ts               # NEW: LinkedIn adapter
│   │   ├── token-manager.ts                   # NEW: Token CRUD
│   │   └── token-refresh-job.ts               # NEW: Background job
│   ├── crypto/
│   │   └── token-encryption.ts                # NEW: Encryption utils
│   └── db/
│       └── connected-accounts.ts              # NEW: DB helpers
├── drizzle/
│   ├── schema.ts                              # MODIFY: Add tables
│   └── migrations/
│       └── 0001_add_connected_accounts.sql    # NEW: Migration
└── __tests__/
    ├── oauth/
    │   ├── providers.test.ts                  # NEW: Unit tests
    │   └── token-encryption.test.ts           # NEW: Unit tests
    └── integration/
        └── oauth-flow.test.ts                 # NEW: Integration tests
```

---

*Implementation plan continues in next section...*
