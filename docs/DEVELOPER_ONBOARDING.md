# Developer Onboarding Guide - Purple Glow Social 2.0

**Welcome to the team!** 🇿🇦✨

This guide will help you get up to speed with Purple Glow Social 2.0, South Africa's AI-powered social media management platform.

---

## Table of Contents

1. [Welcome & Project Overview](#1-welcome--project-overview)
2. [Getting Started Checklist (Day 1)](#2-getting-started-checklist-day-1)
3. [Architecture Deep Dive (Week 1)](#3-architecture-deep-dive-week-1)
4. [Development Workflow (Week 1)](#4-development-workflow-week-1)
5. [Common Tasks (Week 2)](#5-common-tasks-week-2)
6. [Key Files to Know (Week 2)](#6-key-files-to-know-week-2)
7. [Coding Standards](#7-coding-standards)
8. [Testing Guide](#8-testing-guide)
9. [Debugging Tips](#9-debugging-tips)
10. [Resources & Links](#10-resources--links)
11. [First PR Guide](#11-first-pr-guide)
12. [South African Context](#12-south-african-context)

---

## 1. Welcome & Project Overview

### What is Purple Glow Social 2.0?

Purple Glow Social 2.0 is a **South African-focused AI-powered social media management platform**. It enables small businesses and entrepreneurs to generate, schedule, and automate social media content across multiple platforms with culturally relevant, localized content.

### Project Vision

> *"Empowering Mzansi's small businesses to compete on social media through AI-powered content that speaks to local audiences in their own language."*

### Target Users

- 🏪 **Small Business Owners** - Spaza shops, salons, local restaurants
- 👩‍💼 **Entrepreneurs** - Side hustlers, freelancers, startups
- 📱 **Social Media Managers** - Agencies managing SA clients
- 🛍️ **E-commerce Sellers** - Online shops targeting SA market

### Key Features

| Feature | Description |
|---------|-------------|
| **AI Content Generation** | Generate posts using Google Gemini Pro with SA cultural context |
| **Multi-Platform Posting** | Post to Instagram, Twitter/X, LinkedIn, and Facebook |
| **11 Languages** | Support for all South African official languages |
| **Scheduling** | Schedule posts with optimal timing suggestions |
| **Automation** | Create rules for recurring content generation |
| **Analytics** | Track engagement and learn from performance |

### Tech Stack Overview

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 with App Router |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4 |
| **Database** | PostgreSQL (Neon) with Drizzle ORM |
| **Authentication** | Better-auth with OAuth support |
| **AI** | Google Gemini Pro via @google/genai |
| **Payments** | Polar.sh integration |
| **Job Queue** | Inngest for background jobs |
| **Hosting** | Vercel |
| **Storage** | Vercel Blob for images |

---

## 2. Getting Started Checklist (Day 1)

### Prerequisites

Before you begin, ensure you have:

- [ ] **Node.js 18+** installed ([download](https://nodejs.org/))
- [ ] **Git** installed ([download](https://git-scm.com/))
- [ ] **VS Code** or preferred IDE ([download](https://code.visualstudio.com/))
- [ ] **PostgreSQL client** (optional, for database inspection)

### Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/purple-glow-social-2.0.git
cd purple-glow-social-2.0

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure environment variables (see below)

# 5. Push database schema
npm run db:push

# 6. Seed test accounts (optional but recommended)
npm run db:seed-test

# 7. Start development server
npm run dev

# 8. Open in browser
# Navigate to http://localhost:3000
```

### Environment Variables

Create `.env.local` with these essential variables:

```env
# Database (get from Neon dashboard or ask team lead)
DATABASE_URL=postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require

# Authentication
BETTER_AUTH_SECRET=your-dev-secret-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# AI (optional for local dev - uses mock if not set)
GEMINI_API_KEY=your-gemini-api-key

# Token Encryption (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
TOKEN_ENCRYPTION_KEY=your-64-char-hex-key
```

> 💡 **Tip:** Ask your team lead for a pre-configured `.env.local` file for development.

### Day 1 Checklist

- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Set up environment variables (`.env.local`)
- [ ] Run database migrations (`npm run db:push`)
- [ ] Seed test accounts (`npm run db:seed-test`)
- [ ] Start dev server (`npm run dev`)
- [ ] Access http://localhost:3000
- [ ] Log in with test account (see below)
- [ ] Run tests (`npm test`)
- [ ] Read `AGENTS.md` (comprehensive project docs)
- [ ] Read `QUICK_REFERENCE.md` (quick tips)

### Test Accounts

Use these pre-configured accounts for development:

| Account | Email | Password | Tier | Credits |
|---------|-------|----------|------|---------|
| Free User | free@test.purpleglow.co.za | TestFree123! | Free | 10 |
| Pro User | pro@test.purpleglow.co.za | TestPro123! | Pro | 500 |
| Business User | business@test.purpleglow.co.za | TestBiz123! | Business | 2000 |
| Admin User | admin@test.purpleglow.co.za | TestAdmin123! | Business | 2000 |

---

## 3. Architecture Deep Dive (Week 1)

### Project Structure

```
purple-glow-social-2.0/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles
│   ├── actions/                 # Server actions
│   ├── admin/                   # Admin dashboard
│   ├── dashboard/               # User dashboard
│   ├── login/                   # Auth pages
│   ├── signup/
│   └── api/                     # API routes (see below)
│
├── components/                   # React components
│   ├── modals/                  # Modal components
│   ├── providers/               # Context providers
│   └── connected-accounts/      # OAuth UI
│
├── lib/                         # Core utilities
│   ├── auth.ts                 # Better-auth config
│   ├── auth-client.ts          # Client-side auth
│   ├── logger.ts               # Structured logging
│   ├── ai/                     # AI services (Gemini)
│   ├── api/                    # React Query setup
│   ├── config/                 # Environment config
│   ├── context/                # React contexts
│   ├── crypto/                 # Token encryption
│   ├── db/                     # Database helpers
│   ├── inngest/                # Background jobs
│   ├── oauth/                  # OAuth providers
│   ├── polar/                  # Payment integration
│   ├── posting/                # Social media posting
│   ├── security/               # Auth & validation
│   ├── tiers/                  # Subscription tiers
│   ├── translations/           # 11 SA languages
│   └── types/                  # TypeScript types
│
├── drizzle/                     # Database
│   ├── schema.ts               # Database schema
│   ├── db.ts                   # DB connection
│   └── migrations/             # SQL migrations
│
├── docs/                        # Documentation
├── specs/                       # Feature specifications
└── scripts/                     # Utility scripts
```

### API Route Structure

All API routes are in `app/api/`:

```
app/api/
├── auth/[...all]/           # Better-auth endpoints
├── ai/
│   ├── generate/            # Content generation
│   ├── hashtags/            # Hashtag suggestions
│   ├── topics/              # Topic suggestions
│   ├── feedback/            # User feedback
│   └── learning/            # AI learning
├── oauth/
│   ├── connections/         # List connected accounts
│   ├── facebook/            # Facebook OAuth
│   ├── instagram/           # Instagram OAuth
│   ├── twitter/             # Twitter OAuth
│   └── linkedin/            # LinkedIn OAuth
├── posts/
│   ├── publish/             # Immediate posting
│   ├── schedule/            # Schedule posts
│   └── scheduled/publish/   # Process scheduled
├── user/
│   ├── profile/             # User profile
│   ├── posts/               # User's posts
│   └── automation-rules/    # Automation rules
├── admin/                   # Admin endpoints
├── webhooks/polar/          # Payment webhooks
├── cron/                    # Cron jobs
└── health/                  # Health check
```

### Database Schema Overview

The database uses PostgreSQL with Drizzle ORM. Key tables:

| Table | Purpose |
|-------|---------|
| `user` | User accounts with tier, credits |
| `session` | Active sessions (Better-auth) |
| `account` | OAuth accounts (Better-auth) |
| `posts` | Scheduled and published posts |
| `automation_rules` | Automation configurations |
| `connected_account` | Social media OAuth tokens |
| `transactions` | Payment records |
| `subscriptions` | User subscriptions |
| `credit_reservations` | Reserved credits for scheduled posts |
| `generation_logs` | AI generation tracking |
| `daily_usage` | Rate limiting data |
| `notifications` | User notifications |
| `job_logs` | Inngest job tracking |

See `drizzle/schema.ts` for complete schema definitions.

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Better-auth │────▶│  PostgreSQL │
│  (React)    │◀────│   (Server)   │◀────│   (Neon)    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │
      │                    ▼
      │             ┌─────────────┐
      └────────────▶│  Google     │
                    │  OAuth      │
                    └─────────────┘
```

1. User submits credentials or clicks "Sign in with Google"
2. Better-auth validates and creates session
3. Session stored in PostgreSQL
4. HttpOnly cookie set on client
5. Subsequent requests include cookie for auth

### OAuth Integration Architecture

Social media connections (Instagram, Facebook, Twitter, LinkedIn):

```
┌─────────┐    ┌──────────────┐    ┌─────────────┐
│ Connect │───▶│ /api/oauth/  │───▶│  Platform   │
│ Button  │    │ [platform]/  │    │  OAuth      │
└─────────┘    │ connect      │    └─────────────┘
                     │                    │
                     │                    ▼
               ┌─────▼─────┐       ┌─────────────┐
               │ /api/oauth/│◀─────│  Callback   │
               │ [platform]/│      │  with code  │
               │ callback   │      └─────────────┘
               └─────┬─────┘
                     │
                     ▼
               ┌─────────────┐
               │ Encrypt &   │
               │ Store Token │
               └─────────────┘
```

Tokens are encrypted with AES-256-GCM before storage.

### Component Organization

Components follow a consistent pattern:

```typescript
// components/example-component.tsx
'use client';

import { useState } from 'react';
import { useAppContext } from '@/lib/context/AppContext';

interface ExampleComponentProps {
  title: string;
  onAction?: () => void;
}

export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
  const { user, credits } = useAppContext();
  const [loading, setLoading] = useState(false);

  // Component logic...

  return (
    <div className="rounded-xl bg-pretoria-blue p-6">
      {/* JSX */}
    </div>
  );
}
```

---

## 4. Development Workflow (Week 1)

### Git Branching Strategy

We follow a simplified GitFlow:

```
main (production)
  │
  └── develop (staging)
        │
        ├── feature/PGS-123-add-new-component
        ├── bugfix/PGS-456-fix-auth-issue
        └── hotfix/PGS-789-critical-fix
```

**Branch Naming Convention:**
- `feature/PGS-XXX-short-description` - New features
- `bugfix/PGS-XXX-short-description` - Bug fixes
- `hotfix/PGS-XXX-short-description` - Critical production fixes
- `chore/description` - Maintenance tasks (no ticket)

### Commit Message Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, no code change
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**
```bash
feat(ai): add support for Zulu language generation
fix(auth): resolve session persistence on Vercel
docs(readme): update installation instructions
refactor(posting): extract common posting logic
test(api): add integration tests for posts endpoint
```

### PR Process

1. **Create Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/PGS-123-my-feature
   ```

2. **Make Changes**
   - Write code following coding standards
   - Add/update tests
   - Update documentation if needed

3. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   git push origin feature/PGS-123-my-feature
   ```

4. **Create PR**
   - Use PR template
   - Link related issues
   - Add screenshots for UI changes
   - Request reviewers

5. **Address Feedback**
   - Respond to all comments
   - Make requested changes
   - Re-request review when ready

6. **Merge**
   - Squash and merge to develop
   - Delete branch after merge

### Code Review Guidelines

**As a Reviewer:**
- [ ] Code follows project patterns
- [ ] TypeScript types are correct
- [ ] Tests are included
- [ ] No security issues
- [ ] Documentation updated
- [ ] SA context maintained
- [ ] Accessible (keyboard nav, ARIA)

**As an Author:**
- [ ] Self-review before requesting
- [ ] Explain complex changes
- [ ] Respond to feedback promptly
- [ ] Don't take feedback personally

### Testing Requirements

All PRs must:
- [ ] Pass existing tests (`npm test`)
- [ ] Include new tests for new features
- [ ] Maintain or improve coverage
- [ ] Pass linting (`npm run lint`)

### CI/CD Pipeline

GitHub Actions runs on every PR:

```yaml
# .github/workflows/ci.yml
- Install dependencies
- Run linting
- Run type checking
- Run tests
- Build application
```

Vercel automatically deploys:
- **Preview** - Every PR gets a preview URL
- **Production** - Merges to `main` deploy to production

---

## 5. Common Tasks (Week 2)

### How do I... Add a New API Endpoint?

1. Create route file:
```typescript
// app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Your logic here
    const data = { message: 'Hello!' };

    return NextResponse.json(data);
  } catch (error) {
    logger.api.exception(error, { endpoint: 'my-endpoint' });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Similar pattern for POST
}
```

2. Add React Query hook (optional):
```typescript
// lib/api/hooks.ts
export function useMyEndpoint() {
  return useQuery({
    queryKey: ['my-endpoint'],
    queryFn: () => fetch('/api/my-endpoint').then(r => r.json()),
  });
}
```

### How do I... Create a New React Component?

1. Create component file:
```typescript
// components/my-component.tsx
'use client';

import { useState } from 'react';

interface MyComponentProps {
  title: string;
  onComplete?: (result: string) => void;
}

export function MyComponent({ title, onComplete }: MyComponentProps) {
  const [value, setValue] = useState('');

  return (
    <div className="rounded-xl bg-pretoria-blue border border-glass-border p-6">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {/* Component content */}
    </div>
  );
}
```

2. Export from index (if creating a folder):
```typescript
// components/my-component/index.ts
export { MyComponent } from './my-component';
```

### How do I... Add a New Database Table?

1. Add schema in `drizzle/schema.ts`:
```typescript
export const myTable = pgTable("my_table", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Add TypeScript types
export type MyTable = typeof myTable.$inferSelect;
export type NewMyTable = typeof myTable.$inferInsert;
```

2. Push to database:
```bash
npm run db:push
```

3. Create helper functions in `lib/db/`:
```typescript
// lib/db/my-table.ts
import { db } from '@/drizzle/db';
import { myTable } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function getByUserId(userId: string) {
  return db.select().from(myTable).where(eq(myTable.userId, userId));
}
```

### How do I... Implement a New OAuth Provider?

1. Create provider in `lib/oauth/`:
```typescript
// lib/oauth/new-provider.ts
import { BaseOAuthProvider } from './base-provider';

export class NewProvider extends BaseOAuthProvider {
  readonly platform = 'newplatform';
  readonly authorizationUrl = 'https://newplatform.com/oauth/authorize';
  readonly tokenUrl = 'https://newplatform.com/oauth/token';
  readonly scopes = ['read', 'write'];

  async getUserInfo(accessToken: string) {
    // Fetch user info from platform API
  }
}
```

2. Create API routes in `app/api/oauth/newplatform/`
3. Add to connected accounts UI

### How do I... Add a New Language Translation?

1. Create translation file:
```json
// lib/translations/xx.json (language code)
{
  "welcome": "Welcome message in new language",
  "dashboard": "Dashboard translation",
  // ... all keys from en.json
}
```

2. Update language selector in `components/language-selector.tsx`

3. Add language to supported list in `lib/i18n.ts`

### How do I... Debug Authentication Issues?

1. **Check browser cookies:**
   - DevTools → Application → Cookies
   - Look for `better-auth.session_token`

2. **Use auth diagnostics endpoint:**
   ```bash
   curl http://localhost:3000/api/diagnostics/auth
   ```

3. **Check server logs:**
   - Look for `[auth]` prefixed messages
   - Check for token validation errors

4. **Common issues:**
   - Missing `BETTER_AUTH_SECRET`
   - Cookie domain mismatch
   - Session expired

See `docs/TROUBLESHOOTING.md` for more details.

### How do I... Test API Endpoints?

**Using curl:**
```bash
# Get session cookie first (login via browser)
# Then use cookie in requests:

curl -H "Cookie: better-auth.session_token=YOUR_TOKEN" \
  http://localhost:3000/api/user/profile
```

**Using VS Code REST Client:**
```http
### Get user profile
GET http://localhost:3000/api/user/profile
Cookie: better-auth.session_token={{token}}
```

**Using tests:**
```typescript
// __tests__/api/user.test.ts
import { describe, it, expect } from 'vitest';

describe('User API', () => {
  it('returns user profile', async () => {
    // Test implementation
  });
});
```

---

## 6. Key Files to Know (Week 2)

### Essential Files Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| `AGENTS.md` | Complete project documentation | First read, reference |
| `QUICK_REFERENCE.md` | Quick tips and commands | Daily reference |
| `lib/auth.ts` | Authentication configuration | Auth changes |
| `lib/auth-client.ts` | Client-side auth utilities | Frontend auth |
| `drizzle/schema.ts` | Database schema | DB changes |
| `drizzle/db.ts` | Database connection | DB queries |
| `lib/api/query-provider.tsx` | React Query setup | API state management |
| `lib/api/hooks.ts` | API hooks | Data fetching |
| `lib/context/AppContext.tsx` | Global state | Shared state |
| `lib/logger.ts` | Structured logging | Debugging |
| `lib/tiers/config.ts` | Subscription tier config | Tier logic |
| `lib/i18n.ts` | Internationalization | Translations |

### Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind CSS config |
| `tsconfig.json` | TypeScript config |
| `drizzle.config.ts` | Drizzle ORM config |
| `vitest.config.ts` | Test configuration |
| `vercel.json` | Vercel deployment config |
| `.env.local` | Local environment variables |

### Documentation Files

| File | Purpose |
|------|---------|
| `docs/COMPONENT_GUIDE.md` | Component API reference |
| `docs/MOCK_DATA_STRUCTURE.md` | Data models documentation |
| `docs/TEST_ACCOUNTS_GUIDE.md` | Test accounts and testing |
| `docs/TROUBLESHOOTING.md` | Common issues and solutions |
| `docs/PRODUCTION_DEPLOYMENT.md` | Deployment guide |
| `docs/API_REFERENCE.md` | API documentation |

---

## 7. Coding Standards

### TypeScript Strict Mode

We use strict TypeScript. No `any` types allowed!

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
interface DataInput {
  value: string;
  count: number;
}

function processData(data: DataInput): string {
  return data.value;
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile`, `PostCard` |
| Functions | camelCase | `getUserData`, `handleSubmit` |
| Variables | camelCase | `isLoading`, `userData` |
| Constants | SCREAMING_SNAKE | `MAX_CREDITS`, `API_URL` |
| Files (components) | kebab-case | `user-profile.tsx` |
| Files (utilities) | kebab-case | `auth-utils.ts` |
| Database tables | snake_case | `user_profiles`, `post_analytics` |
| CSS classes | kebab-case | `bg-pretoria-blue` |

### File Organization

```typescript
// 1. Imports (external, then internal, then relative)
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

import { Button } from './button';
import type { UserData } from './types';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
}

// 3. Constants
const MAX_ITEMS = 10;

// 4. Component or function
export function MyComponent({ title }: ComponentProps) {
  // 4a. Hooks
  const [state, setState] = useState(false);
  
  // 4b. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 4c. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 4d. Render
  return <div>{title}</div>;
}
```

### Comment Guidelines

```typescript
// Single line comments for brief explanations

/*
 * Multi-line comments for longer explanations
 * that span multiple lines
 */

/**
 * JSDoc for exported functions/components
 * @param userId - The user's unique identifier
 * @returns The user's profile data
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  // Implementation
}

// TODO: Brief description of what needs to be done
// FIXME: Description of bug that needs fixing
// HACK: Explanation of why this workaround exists

// ⚠️ CRITICAL: Important warning that must not be ignored
```

### Import Aliases

Use `@/` alias for imports from project root:

```typescript
// ✅ Good
import { auth } from '@/lib/auth';
import { Button } from '@/components/button';

// ❌ Avoid deep relative paths
import { auth } from '../../../lib/auth';
```

---

## 8. Testing Guide

### Running Tests

```bash
# Run all tests
npm test

# Run tests once (no watch)
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run specific file
npm test -- user.test.ts

# Run tests matching pattern
npm test -- --grep "auth"
```

### Writing Unit Tests

```typescript
// __tests__/lib/utils.test.ts
import { describe, it, expect, vi } from 'vitest';
import { formatCredits, calculateDiscount } from '@/lib/utils';

describe('formatCredits', () => {
  it('formats positive credits correctly', () => {
    expect(formatCredits(100)).toBe('100 credits');
  });

  it('handles singular credit', () => {
    expect(formatCredits(1)).toBe('1 credit');
  });

  it('handles zero credits', () => {
    expect(formatCredits(0)).toBe('0 credits');
  });
});
```

### Writing Integration Tests

```typescript
// __tests__/api/posts.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/drizzle/db';
import { posts } from '@/drizzle/schema';

describe('Posts API', () => {
  beforeEach(async () => {
    // Setup test data
  });

  afterEach(async () => {
    // Cleanup
    await db.delete(posts).where(/* test data condition */);
  });

  it('creates a new post', async () => {
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ content: 'Test post' }),
    });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.content).toBe('Test post');
  });
});
```

### Mocking Strategies

```typescript
// Mocking modules
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: 'test-user', email: 'test@example.com' }
      })
    }
  }
}));

// Mocking fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' }),
});

// Mocking database
vi.mock('@/drizzle/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([{ id: '1', name: 'Test' }]),
  }
}));
```

### Test Coverage Expectations

- **Minimum coverage:** 70%
- **New features:** Must include tests
- **Bug fixes:** Should include regression test
- **Critical paths:** 90%+ coverage (auth, payments)

---

## 9. Debugging Tips

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Unauthorized (401)` | Session expired or missing | Re-login, check cookies |
| `NEXT_PUBLIC_* undefined` | Env var not prefixed | Add `NEXT_PUBLIC_` prefix |
| `Column does not exist` | Schema out of sync | Run `npm run db:push` |
| `Connection refused` | DB not running/configured | Check `DATABASE_URL` |
| `Hydration mismatch` | Server/client render differs | Check `'use client'` directive |

### Using Browser DevTools

**Network Tab:**
- Monitor API requests
- Check response status/body
- Look for CORS errors

**Application Tab:**
- Inspect cookies (auth tokens)
- Check local storage
- View session storage

**Console:**
- React Query devtools
- Error stack traces
- Custom log messages

### Debugging API Routes

1. **Add logging:**
```typescript
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.api.debug('Request received', { 
    url: request.url,
    headers: Object.fromEntries(request.headers),
  });
  
  // ... your code
  
  logger.api.debug('Response', { status: 200, data });
  return NextResponse.json(data);
}
```

2. **Use breakpoints:**
   - VS Code: Click line number to set breakpoint
   - Add `debugger;` statement in code
   - Run `npm run dev` and attach debugger

### Database Debugging

```bash
# Open Drizzle Studio (visual DB explorer)
npm run db:studio

# Direct SQL queries
psql $DATABASE_URL

# Check table contents
psql $DATABASE_URL -c "SELECT * FROM user LIMIT 5;"

# Check schema
psql $DATABASE_URL -c "\d user"
```

### OAuth Debugging

1. **Check callback URLs match exactly** (including trailing slashes)
2. **Verify environment variables** are set correctly
3. **Check platform developer console** for app status
4. **Review token encryption** - ensure `TOKEN_ENCRYPTION_KEY` is set

See `docs/TROUBLESHOOTING.md` for comprehensive debugging guide.

---

## 10. Resources & Links

### Internal Documentation

| Document | Location |
|----------|----------|
| Project Overview | `AGENTS.md` |
| Quick Reference | `QUICK_REFERENCE.md` |
| Component Guide | `docs/COMPONENT_GUIDE.md` |
| Testing Guide | `docs/TEST_ACCOUNTS_GUIDE.md` |
| Troubleshooting | `docs/TROUBLESHOOTING.md` |
| Deployment Guide | `docs/PRODUCTION_DEPLOYMENT.md` |
| API Reference | `docs/API_REFERENCE.md` |

### External Resources

| Resource | URL |
|----------|-----|
| Next.js Documentation | https://nextjs.org/docs |
| React Documentation | https://react.dev |
| TypeScript Handbook | https://www.typescriptlang.org/docs |
| Tailwind CSS | https://tailwindcss.com/docs |
| Drizzle ORM | https://orm.drizzle.team |
| Better-auth | https://www.better-auth.com/docs |
| React Query | https://tanstack.com/query |
| Vitest | https://vitest.dev |
| Polar.sh | https://docs.polar.sh |
| Inngest | https://www.inngest.com/docs |

### Platform Developer Portals

| Platform | URL |
|----------|-----|
| Meta (Facebook/Instagram) | https://developers.facebook.com |
| Twitter/X | https://developer.twitter.com |
| LinkedIn | https://www.linkedin.com/developers |
| Google Cloud | https://console.cloud.google.com |

### Team Communication

| Channel | Purpose |
|---------|---------|
| `#purple-glow-dev` | Development discussions |
| `#purple-glow-support` | Production issues |
| `#code-review` | PR reviews and discussions |

---

## 11. First PR Guide

### Finding Good First Issues

Look for issues labeled:
- `good-first-issue` - Great for newcomers
- `documentation` - Doc improvements
- `bug-small` - Small bug fixes
- `enhancement-small` - Small features

### Step-by-Step First PR

1. **Pick an Issue**
   - Read the issue thoroughly
   - Ask questions in comments if unclear
   - Assign yourself

2. **Set Up Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/PGS-123-my-first-feature
   ```

3. **Make Changes**
   - Follow coding standards
   - Keep changes focused
   - Test your changes locally

4. **Run Quality Checks**
   ```bash
   # Run tests
   npm test
   
   # Check types (if not automatic)
   npx tsc --noEmit
   
   # Test the feature manually
   npm run dev
   ```

5. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): brief description

   - Detail 1
   - Detail 2
   
   Closes #123"
   ```

6. **Push & Create PR**
   ```bash
   git push origin feature/PGS-123-my-first-feature
   ```
   
   Then on GitHub:
   - Click "Create Pull Request"
   - Fill in the PR template
   - Add screenshots if UI changes
   - Request review from team member

7. **Respond to Review**
   - Address all comments
   - Make changes and push
   - Re-request review
   - Be patient and open to feedback

8. **Celebrate! 🎉**
   - Your PR gets merged
   - You've contributed to the project!

### PR Template Checklist

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Screenshots (if UI change)
[Add screenshots here]

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed my code
- [ ] Added necessary documentation
- [ ] No new warnings
```

---

## 12. South African Context

### Why 11 Languages?

South Africa has **11 official languages**, and we support all of them:

| Language | Code | Speakers |
|----------|------|----------|
| English | `en` | 10% (but widely used) |
| Afrikaans | `af` | 13% |
| Zulu (isiZulu) | `zu` | 23% |
| Xhosa (isiXhosa) | `xh` | 16% |
| Northern Sotho (Sepedi) | `nso` | 9% |
| Tswana (Setswana) | `tn` | 8% |
| Southern Sotho (Sesotho) | `st` | 8% |
| Tsonga (Xitsonga) | `ts` | 4% |
| Swati (siSwati) | `ss` | 3% |
| Venda (Tshivenda) | `ve` | 2% |
| Ndebele (isiNdebele) | `nr` | 2% |

**Why this matters:** Our users can create content that resonates with their local audience in their home language. This is a key differentiator!

### POPIA Compliance

The Protection of Personal Information Act (POPIA) is South Africa's data protection law. We must:

- ✅ Get explicit consent for data collection
- ✅ Allow users to export their data
- ✅ Allow users to delete their accounts
- ✅ Encrypt sensitive data (tokens, passwords)
- ✅ Have clear privacy policy
- ✅ Report data breaches within 72 hours

**Code implications:**
- User export endpoint: `/api/user/export`
- User delete endpoint: `/api/user/delete`
- Token encryption: `lib/crypto/token-encryption.ts`
- Privacy page: `/privacy`

### Cultural Considerations

When writing content or UI text:

**DO:**
- Use local expressions ("Howzit!", "Sharp sharp", "Lekker")
- Reference SA cities (Joburg, Cape Town, Durban, Pretoria)
- Use SA-specific hashtags (#MzansiMagic, #LocalIsLekker)
- Include diverse SA names in examples
- Respect cultural nuances of each language

**DON'T:**
- Use American/British slang exclusively
- Assume everyone speaks English
- Use stereotypes or offensive language
- Ignore regional differences

### ZAR Currency Handling

All monetary values use South African Rand (ZAR):

```typescript
// Always display with R symbol
const formatCurrency = (amount: number) => `R ${amount.toLocaleString('en-ZA')}`;

// Examples
formatCurrency(299);   // "R 299"
formatCurrency(1999);  // "R 1,999"

// Include 15% VAT where applicable
const withVat = (amount: number) => amount * 1.15;
```

**Pricing tiers:**
- Free: R 0/month
- Pro: R 299/month
- Business: R 999/month

### SAST Timezone

South Africa uses **SAST (South African Standard Time)**, which is **UTC+2** year-round (no daylight saving).

```typescript
// Always use SAST for scheduling
const scheduledDate = new Date();
// Store in UTC, display in SAST

// Converting for display
const formatSAST = (date: Date) => {
  return date.toLocaleString('en-ZA', { 
    timeZone: 'Africa/Johannesburg' 
  });
};
```

**Important:** When scheduling posts, always consider SAST as the user's timezone!

---

## Welcome to the Team! 🇿🇦

You're now ready to contribute to Purple Glow Social 2.0. Remember:

1. **Read the docs** - `AGENTS.md` is your friend
2. **Ask questions** - No question is too small
3. **Follow patterns** - Look at existing code first
4. **Test your changes** - Both automated and manual
5. **Keep SA context** - It's what makes us unique!

*Lekker coding!* ✨

---

**Last Updated:** January 2025  
**Questions?** Ask in `#purple-glow-dev` or reach out to your team lead.

