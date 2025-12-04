# AGENTS.md - Purple Glow Social 2.0

## 🎯 Project Overview

**Purple Glow Social 2.0** is a South African-focused AI-powered social media management platform. It enables small businesses and entrepreneurs to generate, schedule, and automate social media content across multiple platforms (Instagram, Twitter, LinkedIn, Facebook) with culturally relevant, localized content in all 11 South African official languages.

### Tech Stack
- **Framework:** Next.js 16 with React 19 and TypeScript
- **Build Tool:** Next.js (no longer using Vite)
- **Styling:** Tailwind CSS v4
- **Icons:** Font Awesome 6.4
- **Routing:** Next.js App Router
- **State Management:** React Context API
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Authentication:** Better-auth with OAuth support
- **AI:** Google Gemini Pro (via @google/genai)
- **Payments:** Polar.sh integration
- **Storage:** Vercel Blob for images

---

## 🏗️ Architecture Overview

### File Structure
```
purple-glow-social-2.0/
├── app/                          # Next.js App Router structure
│   ├── layout.tsx               # Root layout
│   ├── actions/generate.ts      # Server actions for content generation
│   ├── admin/page.tsx           # Admin dashboard
│   └── dashboard/page.tsx       # User dashboard
├── components/                   # React components
│   ├── calendar-view.tsx        # Calendar scheduling view
│   ├── schedule-view.tsx        # Main scheduling interface
│   ├── automation-view.tsx      # Automation rules dashboard
│   ├── smart-suggestions.tsx    # AI suggestions widget
│   ├── ai-content-studio.tsx    # AI content generation UI
│   ├── admin-dashboard-view.tsx # Admin interface
│   ├── client-dashboard-view.tsx # Client-side dashboard
│   ├── settings-view.tsx        # User settings
│   ├── language-selector.tsx    # Language switcher
│   ├── test-posting.tsx         # Testing component for posting
│   ├── LogoutButton.tsx         # Logout functionality
│   ├── LoadingSkeletons.tsx     # Loading state components
│   ├── modals/                  # Modal components
│   │   ├── schedule-post-modal.tsx
│   │   ├── automation-wizard.tsx
│   │   ├── credit-topup-modal.tsx
│   │   ├── subscription-modal.tsx
│   │   └── payment-success-modal.tsx
│   ├── providers/               # Context providers
│   └── connected-accounts/      # OAuth connection UI
├── lib/                         # Utilities and helpers
│   ├── auth.ts                 # Better-auth server config
│   ├── auth-client.ts          # Better-auth client
│   ├── i18n.ts                 # Internationalization
│   ├── load-translations.ts    # Translation loader
│   ├── ErrorBoundary.tsx       # Error boundaries
│   ├── accessibility.ts        # Accessibility utilities
│   ├── responsive-utils.ts     # Responsive design hooks
│   ├── ai/
│   │   └── gemini-service.ts   # Google Gemini Pro integration
│   ├── oauth/                  # OAuth providers
│   │   ├── base-provider.ts
│   │   ├── facebook-provider.ts
│   │   ├── instagram-provider.ts
│   │   ├── twitter-provider.ts
│   │   └── linkedin-provider.ts
│   ├── posting/                # Auto-posting services
│   │   ├── post-service.ts
│   │   ├── facebook-poster.ts
│   │   ├── instagram-poster.ts
│   │   ├── twitter-poster.ts
│   │   └── linkedin-poster.ts
│   ├── polar/                  # Polar payment integration
│   ├── db/                     # Database helpers
│   │   ├── connected-accounts.ts
│   │   ├── subscriptions.ts
│   │   ├── transactions.ts
│   │   └── webhook-events.ts
│   ├── crypto/                 # Token encryption
│   ├── context/
│   │   ├── AppContext.tsx      # Global state management
│   │   └── LanguageContext.tsx # Language state
│   └── translations/            # Language files (11 SA languages)
│       ├── en.json
│       ├── af.json
│       ├── zu.json
│       ├── xh.json
│       ├── nso.json
│       ├── tn.json
│       ├── st.json
│       ├── ts.json
│       ├── ss.json
│       ├── ve.json
│       └── nr.json
├── drizzle/
│   └── schema.ts               # Database schema (Drizzle ORM)
├── docs/                       # Documentation
│   ├── COMPONENT_GUIDE.md
│   ├── MOCK_DATA_STRUCTURE.md
│   ├── create-feature-agent-prompt.md
│   └── pgs-2.0-prompt.txt
├── specs/                      # Feature specifications
│   └── ui-completion-and-features/
│       ├── implementation-plan.md
│       └── requirements.md
├── App.tsx                     # Main app component
├── index.tsx                   # Entry point
└── AGENTS.md                   # This file
```

---

## 🎨 Design System

### Color Palette (South African Theme)
```css
/* Primary Colors */
--neon-grape: #9D4EDD        /* Primary purple */
--joburg-teal: #00E0FF       /* Accent teal */
--pretoria-blue: #1A1F3A     /* Dark blue */
--mzansi-gold: #FFCC00       /* Gold accent */

/* Backgrounds */
--void: #0D0F1C              /* Dark background */
--glass-border: rgba(255, 255, 255, 0.1)

/* Platform Colors */
--instagram: linear-gradient(purple-500, pink-500)
--twitter: #1DA1F2
--linkedin: #0A66C2
--facebook: #1877F2
```

### Typography
- **Font Display:** Custom display font for headings
- **Font Sans:** System sans-serif for body text
- **Font Mono:** Monospace for code/data

### Component Patterns
- **Modals:** Fixed overlay, centered content, backdrop blur
- **Cards:** Rounded corners (rounded-xl), shadow-lg, border styling
- **Buttons:** Gradient backgrounds, hover effects, transitions
- **Forms:** Consistent input styling, focus rings, validation states

---

## 📦 Core Features (Implemented)

### ✅ Phase 1-2: Foundation & UI Components
- Landing page with hero, features, pricing
- Better-auth integration (active)
- Responsive navigation
- Design system implementation
- Next.js App Router migration

### ✅ Phase 3: Payment & Admin
- **Polar.sh** payment integration (LIVE)
- Admin dashboard with user management
- Real transaction tracking
- Credit top-up system with webhooks
- Subscription management (Free/Pro/Business)
- PostgreSQL database with Drizzle ORM

### ✅ Phase 4: Internationalization
- 11 South African official languages:
  - English, Afrikaans, Zulu, Xhosa
  - Northern Sotho, Tswana, Southern Sotho
  - Tsonga, Swati, Venda, Ndebele
- Language selector component
- Translation infrastructure
- Cultural context in all content
- LanguageContext for state management

### ✅ Phase 5: Automation & Scheduling
- **Calendar View:** Monthly grid with scheduled posts
- **Schedule View:** 3 modes (Calendar/List/Timeline)
- **Schedule Post Modal:** AI-powered best time suggestions
- **Automation Rules:** Create, manage, activate/deactivate
- **Automation Wizard:** 4-step rule creation
- **Smart Suggestions:** 5 categories of AI recommendations
- **Features:**
  - Recurring posts (Daily/Weekly/Monthly)
  - Platform filtering (Instagram/Twitter/LinkedIn/Facebook)
  - Bulk actions
  - Queue position tracking
  - SAST (UTC+2) timezone

### ✅ Phase 6: Integration & Polish
- **Global State:** React Context for user, credits, tier, modals
- **Error Handling:** Error boundaries for crash prevention
- **Loading States:** 10+ skeleton components
- **Accessibility:** WCAG AA compliance utilities
- **Responsive:** Hooks and utilities for breakpoints
- **Documentation:** Comprehensive docs

### ✅ Phase 7: OAuth UI & Connected Accounts
- Connected accounts dashboard
- One-click OAuth connection flow
- Platform connection status indicators
- Disconnect functionality
- Real-time connection sync

### ✅ Phase 8: Authentication & OAuth Backend
- **Better-auth** with email/password + Google OAuth
- Login and signup pages with validation
- Session management (7-day expiry)
- Protected routes with middleware
- **OAuth Backend** for 4 platforms:
  - Facebook Pages
  - Instagram Business
  - Twitter/X (with PKCE)
  - LinkedIn
- **AES-256-GCM token encryption**
- Database schema with 7 tables
- Security: CSRF, HttpOnly cookies, input validation

### ✅ Phase 9: Auto-Posting Feature
- **Real posting** to all 4 platforms
- Platform-specific posting services
- Immediate posting via API
- **Automated posting** via Vercel Cron (every minute)
- Post tracking (platform IDs, URLs, timestamps)
- Error handling and retry logic
- Image support for all platforms
- Thread support (Twitter)
- Carousel support (Instagram)

### ✅ Phase 10: AI Content Generation
- **Google Gemini Pro** integration
- 11 language content generation
- 4 tone variations (professional, casual, friendly, energetic)
- Platform-specific optimization
- Automatic hashtag generation
- Image prompt suggestions
- Multiple content variations
- Topic suggestions by industry
- Credit management system
- South African cultural context

### ✅ Phase 11: Post Generation, Scheduling & Credit System
- **Credit System Refactor:**
  - Credits only deducted on successful publish (not generation)
  - 1 credit per platform per post
  - Credit reservation for scheduled posts
  - Automatic release on failed posts
- **Tier Enforcement:**
  - Free: 10 credits, 5 queue, 5 daily generations
  - Pro: 500 credits, 50 queue, 50 daily generations, 5 automation rules
  - Business: 2000 credits, 200 queue, 200 daily generations, 20 automation rules
- **Inngest Integration:**
  - Reliable job processing with retry logic
  - 3 retries with exponential backoff (1min, 5min, 15min)
  - Scheduled post processing
  - Automation rule execution
  - Credit expiry checks
- **Admin Dashboard Enhancements:**
  - Credits analytics
  - Generation stats
  - Publishing stats
  - Job monitoring with retry
  - Error tracking
  - Automation overview
- **Notifications System:**
  - Low credit warnings (< 20%)
  - Credit expiry warnings (3 days)
  - Post skipped/failed notifications
- **Test Infrastructure:**
  - 128 passing tests (unit + integration)
  - CI/CD pipeline with GitHub Actions
  - Test accounts for all tiers

---

## 🗄️ Data Models

### MockUser
```typescript
{
  id: string;                    // e.g., "user-1"
  name: string;                  // Full name
  email: string;                 // Email address
  tier: 'free' | 'pro' | 'business';
  credits: number;               // Available credits
  image: string;                 // Avatar URL
  joined: Date;
  lastActive: Date;
  postsCreated: number;
  status: 'active' | 'inactive';
}
```

### MockScheduledPost
```typescript
{
  id: string;
  userId: string;
  content: string;               // Post content
  imageUrl: string | null;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook';
  scheduledDate: Date;
  status: 'scheduled' | 'posted' | 'failed';
  topic: string;
}
```

### MockAutomationRule
```typescript
{
  id: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  coreTopic: string;
  platforms: string[];
  isActive: boolean;
  lastRun: Date | null;
  nextRun: Date;
  postsGenerated: number;
  createdAt: Date;
}
```

**See:** `docs/MOCK_DATA_STRUCTURE.md` for complete data documentation

---

## 🔧 Development Patterns

### State Management
```tsx
// Use AppContext for global state
import { useAppContext } from './lib/context/AppContext';

function MyComponent() {
  const { user, credits, addCredits, openModal } = useAppContext();
  // Component logic
}
```

### Mock Data Access
```tsx
// Always use centralized helpers
import { getCurrentUser, getScheduledPostsByUserId } from './lib/mock-data';

const user = getCurrentUser();
const posts = getScheduledPostsByUserId(user.id);
```

### Error Handling
```tsx
// Wrap components with error boundaries
import { ErrorBoundary } from './lib/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Loading States
```tsx
// Use skeleton components
import { CalendarSkeleton } from './components/LoadingSkeletons';

if (loading) return <CalendarSkeleton />;
```

### Responsive Design
```tsx
// Use responsive hooks
import { useIsMobile } from './lib/responsive-utils';

const isMobile = useIsMobile();
return isMobile ? <MobileView /> : <DesktopView />;
```

### Accessibility
```tsx
// Use accessibility utilities
import { trapFocus, announce } from './lib/accessibility';

useEffect(() => {
  if (modalOpen) {
    const cleanup = trapFocus(modalRef.current);
    announce('Modal opened', 'polite');
    return cleanup;
  }
}, [modalOpen]);
```

---

## 🌍 South African Context

### Critical: Always Maintain SA Context
1. **Timezone:** SAST (UTC+2) is the default
2. **Currency:** ZAR (South African Rand) with 15% VAT
3. **Language:** Support all 11 official languages
4. **Names:** Use diverse South African names (Thabo, Zanele, Pieter, etc.)
5. **Locations:** Reference SA cities (Joburg, Cape Town, Durban, Pretoria)
6. **Hashtags:** Use SA-relevant tags (#LocalIsLekker, #MzansiMagic, #Joburg)
7. **Slang:** Incorporate local expressions ("Sharp sharp!", "Howzit!", "Lekker")

### Pricing (ZAR)
- **Free Plan:** R 0/month (10 credits)
- **Pro Plan:** R 299/month (500 credits)
- **Business Plan:** R 999/month (2000 credits)

### User Personas
- **Thabo Nkosi** - Pro user, 450 credits, active
- **Zanele Dlamini** - Business user, 1850 credits, power user
- **Pieter van der Merwe** - Free user, 3 credits, new
- (15 total mock users representing diverse SA demographics)

---

## 🚀 Common Tasks

### Adding a New Component
1. Create in `components/` directory
2. Use TypeScript with proper interfaces
3. Wrap with ErrorBoundary if complex
4. Add loading skeleton if async
5. Use AppContext for global state
6. Follow accessibility patterns
7. Document in `docs/COMPONENT_GUIDE.md`

### Adding a New Modal
1. Create in `components/modals/`
2. Add modal state to AppContext
3. Implement focus management
4. Add keyboard navigation (Escape to close)
5. Use proper ARIA labels
6. Add to App.tsx modal integration

### Adding Mock Data
1. Add to `lib/mock-data.ts`
2. Create TypeScript interface
3. Link to existing users via `userId`
4. Create helper function for retrieval
5. Document in `docs/MOCK_DATA_STRUCTURE.md`

### Adding a Translation
1. Add key to all 11 language files in `lib/translations/`
2. Use `translate()` function from i18n
3. Maintain cultural context per language
4. Test with language selector

---

### 🧪 Testing Guidelines

### Test Accounts

Purple Glow Social 2.0 includes pre-configured test accounts for development and QA:

| Account | Email | Password | Tier | Credits |
|---------|-------|----------|------|---------|
| Free User | free@test.purpleglow.co.za | TestFree123! | Free | 10 |
| Pro User | pro@test.purpleglow.co.za | TestPro123! | Pro | 500 |
| Business User | business@test.purpleglow.co.za | TestBiz123! | Business | 2000 |
| Admin User | admin@test.purpleglow.co.za | TestAdmin123! | Business | 2000 |
| Low Credit | lowcredit@test.purpleglow.co.za | TestLow123! | Pro | 2 |
| Zero Credit | zerocredit@test.purpleglow.co.za | TestZero123! | Pro | 0 |

**Seed test accounts:**
```bash
npm run db:seed-test
```

**See:** `docs/TEST_ACCOUNTS_GUIDE.md` for comprehensive testing procedures.

### Manual Testing Checklist
- [ ] Test on mobile (320px), tablet (768px), desktop (1024px+)
- [ ] Verify all modals open/close correctly
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Check loading states display properly
- [ ] Verify error boundaries catch errors
- [ ] Test with different languages
- [ ] Check responsive breakpoints
- [ ] Verify mock data consistency

### Browser Compatibility
- ✅ Chrome/Edge (Primary)
- ✅ Firefox
- ✅ Safari
- ❌ Internet Explorer (Not supported)

---

## 📚 Documentation References

### For Component Usage
- `docs/COMPONENT_GUIDE.md` - Complete API reference, props, examples

### For Mock Data
- `docs/MOCK_DATA_STRUCTURE.md` - Data models, helpers, migration guide

### For Features
- `specs/ui-completion-and-features/requirements.md` - Feature requirements
- `specs/ui-completion-and-features/implementation-plan.md` - Implementation plan

### For Quick Help
- `QUICK_REFERENCE.md` - Quick developer guide
- `PHASE_8_AUTHENTICATION_COMPLETE.md` - Auth system details
- `PHASE_9_AUTO_POSTING_COMPLETE.md` - Auto-posting implementation
- `PHASE_10_AI_CONTENT_GENERATION_COMPLETE.md` - AI integration details
- `POLAR_INTEGRATION_COMPLETE.md` - Payment system details

---

## 🔐 Authentication & Backend

### Current State: PRODUCTION-READY
- Better-auth is **ACTIVE** with PostgreSQL
- Real database with Drizzle ORM
- OAuth connections working (4 platforms)
- Auto-posting functional
- AI content generation live
- Payment system integrated (Polar.sh)

### ⚠️ CRITICAL: Vercel Cookie Configuration

**NEVER use `__Secure-` cookie prefix on `.vercel.app` domains!**

The `.vercel.app` domain is on the **Public Suffix List**, which causes browsers to reject cookies with `__Secure-` prefix. This breaks authentication silently - login appears to work but sessions are never persisted.

```typescript
// ✅ CORRECT: Disable secure cookies on Vercel's shared domain
const isVercelSharedDomain = process.env.VERCEL_URL?.includes('.vercel.app') || 
                              process.env.VERCEL === '1';

export const auth = betterAuth({
  // ... other config
  advanced: {
    useSecureCookies: !isVercelSharedDomain && process.env.NODE_ENV === 'production',
  },
});
```

**Symptoms of this issue:**
- Login form submits successfully (no errors)
- User is redirected to dashboard
- Dashboard immediately redirects back to login
- No errors in browser console
- Cookie shows `__Secure-better-auth.state` in network tab

**Solution:** Either disable `__Secure-` prefix OR use a custom domain.

### Backend Architecture (IMPLEMENTED)
1. **Authentication:**
   ```typescript
   // Get authenticated user
   import { auth } from '@/lib/auth';
   const session = await auth.api.getSession({ headers });
   const user = session.user;
   ```

2. **Database Access:**
   ```typescript
   // Query with Drizzle ORM
   import { db } from '@/lib/db';
   import { posts, user } from '@/drizzle/schema';
   
   const userPosts = await db.select()
     .from(posts)
     .where(eq(posts.userId, userId));
   ```

3. **OAuth Connections:**
   ```typescript
   // Get decrypted OAuth token
   import { getDecryptedToken } from '@/lib/db/connected-accounts';
   
   const token = await getDecryptedToken(userId, 'instagram');
   ```

4. **API Routes:**
   - `/api/auth/[...all]` - Better-auth endpoints
   - `/api/oauth/[platform]/[action]` - OAuth flows
   - `/api/posts/publish` - Immediate posting
   - `/api/posts/scheduled/publish` - Scheduled posts
   - `/api/ai/generate` - AI content generation
   - `/api/ai/hashtags` - Hashtag generation
   - `/api/ai/topics` - Topic suggestions
   - `/api/cron/process-scheduled-posts` - Cron job

5. **Structured Logging:**
   ```typescript
   // Use the pre-configured logger instead of console.log
   import { logger } from '@/lib/logger';
   
   // Context-specific loggers
   logger.auth.info('User logged in', { userId });
   logger.api.debug('Request received', { endpoint });
   logger.cron.warn('Slow job execution', { duration });
   logger.polar.error('Payment failed', { error });
   
   // Log exceptions with stack traces (auto-sends to Sentry in production)
   logger.oauth.exception(error, { platform: 'twitter' });
   
   // Available contexts: auth, api, cron, oauth, posting, ai, polar, db, admin, security
   ```
   
   Features:
   - Log level filtering by environment (debug in dev, info+ in prod)
   - Automatic sensitive data sanitization (tokens, passwords)
   - Sentry integration for error-level logs
   - Consistent timestamp and context formatting

---

## ⚠️ Important Notes

### DO NOT:
- ❌ Add components without TypeScript types
- ❌ Skip error boundaries on complex components
- ❌ Hardcode credentials or secrets (use .env)
- ❌ Ignore accessibility (keyboard nav, ARIA labels)
- ❌ Remove South African context (timezone, currency, language)
- ❌ Skip loading states for async operations
- ❌ Modify database schema without migrations
- ❌ Store tokens unencrypted
- ❌ Skip session validation on protected routes

### ALWAYS:
- ✅ Use Better-auth for authentication
- ✅ Follow existing component patterns
- ✅ Add TypeScript interfaces
- ✅ Test responsive design
- ✅ Include accessibility features
- ✅ Document new features
- ✅ Maintain South African context
- ✅ Use AppContext for global state
- ✅ Encrypt sensitive data (tokens)
- ✅ Validate user sessions
- ✅ Handle errors gracefully
- ✅ Use Drizzle ORM for database queries

---

## 🎓 Learning Resources

### Internal
- Start with `QUICK_REFERENCE.md` for overview
- Read `docs/COMPONENT_GUIDE.md` for component APIs
- Check `docs/MOCK_DATA_STRUCTURE.md` for data models
- Review implementation plan for context

### External
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Better-auth](https://www.better-auth.com/docs)

---

## 🐛 Troubleshooting

### Common Issues

**Problem:** Component not rendering
- Check imports are correct
- Verify TypeScript types match
- Check console for errors
- Ensure AppProvider wraps app

**Problem:** State not updating
- Verify using AppContext correctly
- Check state updates trigger re-renders
- Ensure not mutating state directly

**Problem:** Modal not opening
- Check modal state in AppContext
- Verify `openModal()` is called correctly
- Check z-index conflicts

**Problem:** Database query fails
- Check DATABASE_URL is set correctly
- Verify database connection is active
- Check userId references are correct
- Use Drizzle ORM properly (await queries)
- Check for table migrations

**Problem:** Responsive design broken
- Test with DevTools device emulation
- Verify Tailwind breakpoint classes
- Check for hardcoded widths
- Use responsive hooks

---

## 📞 Getting Help

1. **Check Documentation First:**
   - `docs/COMPONENT_GUIDE.md` for component usage
   - `docs/MOCK_DATA_STRUCTURE.md` for data questions
   - `QUICK_REFERENCE.md` for common tasks

2. **Review Existing Code:**
   - Look at similar components
   - Check how others solved the problem
   - Follow established patterns

3. **Common Gotchas:**
   - Not wrapping with AppProvider
   - Forgetting error boundaries
   - Skipping TypeScript types
   - Not using responsive hooks
   - Missing accessibility features

---

## 🎯 Current Status

### ✅ Completed (Phases 1-10)
- Landing page & design system
- Admin dashboard & user management
- **Real payment integration (Polar.sh)**
- 11-language internationalization
- Scheduling system (Calendar/List/Timeline)
- Automation rules & wizard
- Smart AI suggestions
- **Authentication system (Better-auth)**
- **OAuth backend (4 platforms)**
- **Auto-posting to social media**
- **AI content generation (Gemini Pro)**
- PostgreSQL database (Neon)
- Token encryption & security
- Vercel Cron for automation
- Global state management
- Error handling & loading states
- Accessibility utilities
- Comprehensive documentation

### 🚧 Production Deployment
- Vercel hosting ready
- Environment variables configured
- Cron jobs enabled
- Webhook listeners active
- SSL/HTTPS enabled

### 📋 Future Enhancements
- WebSocket for real-time updates
- PWA implementation
- Advanced analytics dashboard
- Video content support
- Instagram Stories
- LinkedIn Company Pages
- Post performance tracking
- A/B testing for content
- Team collaboration features
- Retry logic for failed posts

---

## 💡 Tips for Future Agents

1. **Start with Documentation:** Read `QUICK_REFERENCE.md` and `docs/COMPONENT_GUIDE.md` first

2. **Follow Patterns:** Look at existing components before creating new ones

3. **Maintain Context:** Always preserve South African cultural context

4. **Type Safety:** Use TypeScript interfaces for everything

5. **Accessibility First:** Include keyboard navigation and ARIA labels

6. **Document Changes:** Update relevant docs when adding features

7. **Test Thoroughly:** Mobile, tablet, desktop at minimum

8. **Use Utilities:** Leverage existing helpers in `lib/`

9. **Error Handling:** Wrap complex components with ErrorBoundary

10. **Ask Questions:** Check existing docs and code before assumptions

---

## 🔄 Version History

- **Phase 1-2:** Foundation & UI Components
- **Phase 3:** Payment & Admin Dashboard (Polar.sh integration)
- **Phase 4:** Internationalization (11 languages)
- **Phase 5:** Automation & Scheduling Features
- **Phase 6:** Integration & Polish
- **Phase 7:** OAuth UI & Connected Accounts
- **Phase 8:** Authentication & OAuth Backend (Better-auth + 4 platforms)
- **Phase 9:** Auto-Posting Feature (Real posting to social media)
- **Phase 10:** AI Content Generation (Google Gemini Pro) - **CURRENT**
- **Next:** Production testing, monitoring, and optimization

---

**Last Updated:** Phase 10 Complete - Production Ready  
**Maintainer:** Purple Glow Social Team  
**License:** Proprietary  
**Version:** 2.0 (Next.js 16, React 19)

---

## 🤝 Contributing Guidelines

When working on this codebase:

1. **Read this file first** - Understand the architecture and patterns
2. **Check existing docs** - Don't duplicate effort
3. **Follow conventions** - Maintain consistency
4. **Test your changes** - Especially responsive and accessibility
5. **Update documentation** - Keep docs in sync with code
6. **Preserve context** - Maintain South African focus
7. **Use TypeScript** - No `any` types
8. **Add comments** - Explain complex logic
9. **Error handling** - Always include try/catch or boundaries
10. **Ask for help** - When uncertain, reference docs or ask

---

**Welcome to Purple Glow Social 2.0!** 🇿🇦✨

This is a well-structured, documented, and accessible codebase. Take time to understand the patterns, and you'll be productive quickly. The South African context is core to this project—keep it authentic and culturally relevant.

*Lekker coding!* 🚀
