# Social Authentication & OAuth Integration Feature

**Status:** 📋 Ready for Implementation  
**Phase:** 8  
**Priority:** High  
**Estimated Time:** 2-3 weeks

---

## Quick Links

- **[Requirements](./requirements.md)** - Full feature specification with user stories, data models, and success metrics
- **[Implementation Plan](./implementation-plan.md)** - Step-by-step development guide with file structure
- **[Code Examples](./code-examples.md)** - Production-ready code snippets and patterns
- **[Getting Started](./getting-started.md)** - Practical setup guide and troubleshooting

---

## Overview

This feature adds two critical capabilities to Purple Glow Social 2.0:

### 1. Social Login (Authentication)
- Users can sign up/login using **Google OAuth**
- Faster onboarding, no password management
- Better-auth handles the heavy lifting
- Session management with 30-day expiry

### 2. Social Media Connection (Authorization)
- Users can connect **Instagram, Facebook, Twitter/X, and LinkedIn** accounts
- Enables auto-posting functionality
- Secure token storage with AES-256 encryption
- Automatic token refresh system

---

## Key Features

✅ **Google Authentication** - One-click login with Google  
✅ **Multi-Platform OAuth** - Connect 4 major social platforms  
✅ **Secure Token Storage** - AES-256 encryption for all access tokens  
✅ **Auto Token Refresh** - Background job to prevent token expiry  
✅ **Connection Management** - UI to view, connect, and disconnect accounts  
✅ **South African Context** - Maintained throughout (SAST timezone, ZAR pricing)  

---

## Architecture

```
User Authentication Flow:
┌────────┐  Login   ┌─────────────┐  OAuth   ┌────────┐
│ User   │ ───────> │ Better-auth │ ───────> │ Google │
└────────┘          └─────────────┘          └────────┘
                           │
                           ↓
                    Create Session
                           │
                           ↓
                    ┌──────────────┐
                    │  Dashboard   │
                    └──────────────┘

Social Media Connection Flow:
┌────────┐  Connect  ┌─────────────┐  OAuth   ┌───────────┐
│ User   │ ────────> │ OAuth API   │ ───────> │ Instagram │
└────────┘           └─────────────┘          └───────────┘
                            │
                            ↓
                     Encrypt & Store
                            │
                            ↓
                     ┌──────────────┐
                     │  Database    │
                     └──────────────┘
```

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Authentication | Better-auth | Google OAuth, session management |
| OAuth Providers | Custom adapters | Instagram, Facebook, Twitter, LinkedIn |
| Token Encryption | AES-256-GCM | Secure token storage |
| Database | PostgreSQL + Drizzle | User and token storage |
| Background Jobs | Node cron | Token refresh automation |
| UI | React + TypeScript | Login pages, settings UI |

---

## Database Schema

### New Tables

**connectedAccount**
- Stores social media connections for posting
- Links to user via `userId`
- Encrypted access/refresh tokens
- Platform-specific metadata

### Modified Tables

**user**
- Added `tier` field (free/pro/business)
- Added `credits` field (default: 10)

---

## Security Features

🔒 **Token Encryption** - All tokens encrypted at rest  
🔒 **CSRF Protection** - State parameter validation  
🔒 **HTTP-Only Cookies** - Secure session storage  
🔒 **Environment Variables** - No secrets in code  
🔒 **Token Rotation** - Automatic refresh prevents staleness  
🔒 **Audit Logging** - Track authentication events  

---

## Implementation Phases

### Phase 1: Setup (Day 1-2)
- OAuth provider registration
- Environment configuration
- Database migrations
- Token encryption service

### Phase 2: Google Auth (Day 3-4)
- Login/signup pages
- Better-auth integration
- Session management
- Protected routes

### Phase 3: Social OAuth (Day 5-7)
- OAuth provider adapters
- API routes (12 endpoints)
- Token exchange flows
- Error handling

### Phase 4: Token Management (Day 8-9)
- Encryption utilities
- Database helpers
- Background refresh job
- Monitoring system

### Phase 5: UI Integration (Day 10-11)
- Settings page updates
- Connection status UI
- Loading states
- Error messages

### Phase 6: Testing & Polish (Day 12-14)
- Unit tests
- Integration tests
- E2E tests
- Documentation

---

## Getting Started

### Prerequisites
```bash
# Required accounts
✓ Google Cloud Console (OAuth app)
✓ Meta for Developers (Instagram/Facebook)
✓ Twitter Developer Portal
✓ LinkedIn Developers

# Required tools
✓ Node.js 18+
✓ PostgreSQL database
✓ Git
```

### Quick Start
```bash
# 1. Set up OAuth providers (see getting-started.md)

# 2. Configure environment
cp .env.example .env
# Add all OAuth credentials

# 3. Run migrations
npx drizzle-kit push:pg

# 4. Install dependencies
npm install

# 5. Start development
npm run dev

# 6. Test OAuth flows
# Go to http://localhost:5173/login
```

---

## File Structure

```
specs/social-auth-feature/
├── README.md                    # This file
├── requirements.md              # Full specification
├── implementation-plan.md       # Development guide
├── code-examples.md             # Code snippets
└── getting-started.md           # Setup tutorial

New files to create:
├── app/
│   ├── login/page.tsx           # Login page
│   ├── signup/page.tsx          # Signup page
│   ├── api/oauth/               # 12 OAuth endpoints
│   └── oauth/callback/          # Success/error pages
├── lib/
│   ├── auth-client.ts           # Better-auth client
│   ├── crypto/                  # Token encryption
│   ├── oauth/                   # Provider adapters (5 files)
│   └── db/                      # Database helpers
├── components/
│   ├── auth/                    # Auth components
│   └── connected-accounts/      # Connection UI
└── drizzle/
    └── migrations/              # Database migration
```

---

## Testing Strategy

### Unit Tests
- OAuth provider adapters
- Token encryption/decryption
- Database operations
- Error handling

### Integration Tests
- Complete OAuth flows (mocked)
- Token refresh logic
- API endpoint responses
- Session management

### E2E Tests (Playwright)
- Login with Google
- Connect social accounts
- Disconnect accounts
- Mobile responsiveness

### Manual Testing
- Browser compatibility (Chrome, Firefox, Safari)
- Mobile devices (iOS, Android)
- Error scenarios
- Token expiry handling

---

## Success Metrics

### Technical
- ✅ 99.9% authentication success rate
- ✅ < 3s OAuth callback time
- ✅ < 1% token refresh failure rate
- ✅ Zero security vulnerabilities

### User
- ✅ 60%+ choose Google login
- ✅ 80%+ connect at least 1 platform
- ✅ < 5% connection failures
- ✅ 90%+ satisfaction (NPS)

### Business
- ✅ 30% increase in signup conversion
- ✅ 50% reduction in password reset tickets
- ✅ Enable auto-posting (revenue driver)

---

## Documentation

### For Users
- "How to Login with Google" guide
- "Connecting Social Media Accounts" tutorial
- "Troubleshooting Connection Issues" FAQ
- Video walkthrough (2-3 min)

### For Developers
- OAuth implementation guide
- Token encryption API docs
- Adding new OAuth providers
- Testing OAuth flows locally

---

## Known Limitations

### Instagram
- Requires Instagram Business or Creator account
- Must be linked to a Facebook Page
- API access subject to Meta review

### Twitter/X
- API access tiered (Free/Basic/Pro)
- Short token expiry (2 hours)
- Rate limits apply

### LinkedIn
- "Share on LinkedIn" requires app review
- Review process takes 1-2 weeks
- Limited to personal posts (not company pages without review)

### Facebook
- App must go through Meta review for public use
- Development mode allows testing with limited users
- Review process requires detailed privacy policy

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| OAuth provider changes API | High | Medium | Abstract providers, monitor changelogs |
| Token expiry issues | Medium | High | Robust refresh logic, user notifications |
| Security vulnerabilities | Critical | Low | Regular audits, penetration testing |
| User confusion | Medium | Medium | Clear UI, tooltips, video tutorials |

---

## Next Steps After Implementation

1. **User Testing** - Beta test with 10-20 users
2. **Performance Optimization** - Profile and optimize slow queries
3. **Analytics Integration** - Track auth funnel metrics
4. **Provider Reviews** - Submit Meta and LinkedIn apps
5. **Auto-Posting Feature** - Use connected accounts to post content
6. **Webhook Integration** - Listen for token revocation events
7. **Monitoring Setup** - Sentry for errors, DataDog for metrics

---

## Support & Resources

### Internal Documentation
- `AGENTS.md` - Project overview and patterns
- `docs/COMPONENT_GUIDE.md` - Component usage
- `docs/MOCK_DATA_STRUCTURE.md` - Data models

### External Resources
- [Better-auth Docs](https://www.better-auth.com/docs)
- [Meta OAuth Guide](https://developers.facebook.com/docs/facebook-login)
- [Twitter OAuth 2.0](https://developer.twitter.com/en/docs/authentication/oauth-2-0)
- [LinkedIn OAuth](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication)

### Getting Help
1. Check `getting-started.md` for common issues
2. Review `code-examples.md` for implementation patterns
3. Search existing code for similar patterns
4. Reach out to team for clarification

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| Phase 8 | 1.0.0 | Initial specification created |

---

## Approval

- [ ] Product Owner approval
- [ ] Technical Lead review
- [ ] Security review
- [ ] UX/UI review
- [ ] Ready for implementation

---

**Let's build something lekker!** 🚀🇿🇦

*Purple Glow Social - Empowering South African Entrepreneurs*
