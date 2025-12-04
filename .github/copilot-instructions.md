# GitHub Copilot Instructions - Purple Glow Social 2.0

## Project Context

Purple Glow Social 2.0 is a production-ready AI-powered social media management platform specifically designed for South African businesses. The platform enables content generation, scheduling, and automated posting across 4 social platforms (Instagram, Facebook, Twitter/X, LinkedIn) with support for all 11 South African official languages.

## Tech Stack

- **Framework:** Next.js 16 with React 19 and TypeScript
- **Database:** PostgreSQL (Neon) with Drizzle ORM
- **Authentication:** Better-auth (email/password + Google OAuth)
- **AI:** Google Gemini Pro for content generation
- **Payments:** Polar.sh for subscriptions and credits
- **Styling:** Tailwind CSS v4
- **Storage:** Vercel Blob for images
- **Deployment:** Vercel with Cron jobs

## Critical: South African Context

**ALWAYS maintain South African cultural context:**

- **Timezone:** SAST (UTC+2) - the default for all dates/times
- **Currency:** ZAR (South African Rand) with 15% VAT
- **Languages:** Support all 11 official SA languages (en, af, zu, xh, nso, tn, st, ts, ss, ve, nr)
- **Slang:** Use local expressions: "lekker", "sharp sharp", "howzit", "eish", "ja nee"
- **Locations:** Reference SA cities: Joburg, Cape Town, Durban, Pretoria, Sandton
- **Hashtags:** Include SA-relevant tags: #Mzansi, #LocalIsLekker, #SouthAfrica

## Code Standards

### TypeScript Requirements

```typescript
// ✅ ALWAYS define interfaces for all data structures
interface User {
  id: string;
  name: string;
  email: string;
  tier: "free" | "pro" | "business";
  credits: number;
}

// ✅ ALWAYS type function parameters and returns
async function getUserById(userId: string): Promise<User | null> {
  // implementation
}

// ❌ NEVER use 'any' type
// ❌ NEVER skip type annotations
```

### Authentication Pattern

```typescript
// ✅ ALWAYS validate sessions in API routes and server components
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  // ... rest of logic
}
```

### Database Access Pattern

```typescript
// ✅ ALWAYS use Drizzle ORM for database queries
import { db } from "@/lib/db";
import { posts, user } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

const userPosts = await db
  .select()
  .from(posts)
  .where(and(eq(posts.userId, userId), eq(posts.status, "posted")))
  .orderBy(desc(posts.createdAt));

// ❌ NEVER write raw SQL queries
// ❌ NEVER skip WHERE clauses on user-specific data
```

### OAuth Token Handling

```typescript
// ✅ ALWAYS decrypt tokens before use
import { getDecryptedToken } from "@/lib/db/connected-accounts";

const accessToken = await getDecryptedToken(userId, "instagram");
if (!accessToken) {
  throw new Error("Instagram not connected");
}

// ❌ NEVER store tokens unencrypted
// ❌ NEVER log tokens or sensitive data
```

## Component Patterns

### Server Components (Default)

```typescript
// ✅ Use for data fetching and static content
export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: headers() });

  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
    </div>
  );
}
```

### Client Components

```typescript
// ✅ Use 'use client' for interactivity
"use client";

import { useState } from "react";

export function ContentGenerator() {
  const [content, setContent] = useState("");
  // ... interactive logic
}
```

### Error Boundaries

```typescript
// ✅ ALWAYS wrap complex components with error boundaries
import { ErrorBoundary } from "@/lib/ErrorBoundary";

export default function FeaturePage() {
  return (
    <ErrorBoundary>
      <ComplexFeatureComponent />
    </ErrorBoundary>
  );
}
```

## Security Rules

### Environment Variables

```typescript
// ✅ ALWAYS use environment variables for secrets
const apiKey = process.env.GEMINI_API_KEY;

// ❌ NEVER hardcode credentials
// ❌ NEVER commit .env files
```

### Input Validation

```typescript
// ✅ ALWAYS validate user input
import { z } from "zod";

const postSchema = z.object({
  content: z.string().min(1).max(5000),
  platform: z.enum(["facebook", "instagram", "twitter", "linkedin"]),
  scheduledDate: z.string().datetime().optional(),
});

const validatedData = postSchema.parse(request.body);
```

### CSRF Protection

```typescript
// ✅ OAuth flows ALWAYS include state parameter
const state = crypto.randomUUID();
// Store state in session
// Verify state in callback
```

## AI Content Generation

### Always Include SA Context

```typescript
// ✅ When generating content with Gemini
const prompt = `
Create a ${tone} ${platform} post about ${topic}.

CRITICAL REQUIREMENTS:
- Use South African English with local expressions
- Reference South African locations when relevant
- Include appropriate SA slang (lekker, sharp sharp, howzit)
- Use local hashtags like #Mzansi, #LocalIsLekker
- Maintain cultural sensitivity
- Language: ${language}
`;
```

## API Route Patterns

### Standard Response Format

```typescript
// ✅ Success response
return Response.json({
  success: true,
  data: result,
  message: "Operation completed successfully",
});

// ✅ Error response
return Response.json(
  {
    success: false,
    error: "Descriptive error message",
    code: "ERROR_CODE",
  },
  { status: 400 }
);
```

### Rate Limiting Consideration

```typescript
// 🔔 Remember to add rate limiting for production
// Consider using @vercel/rate-limit or similar
```

## Testing Guidelines

### Manual Testing Checklist

- [ ] Test on mobile (320px), tablet (768px), desktop (1024px+)
- [ ] Test with all 11 languages
- [ ] Verify authentication flow (login/logout)
- [ ] Test OAuth connections for each platform
- [ ] Verify posts actually go to platforms
- [ ] Check credit deduction
- [ ] Test with different user tiers (free/pro/business)

## Common Pitfalls to Avoid

### ❌ DON'T:

1. Use React 18 patterns (we're on React 19)
2. Skip session validation on protected routes
3. Store sensitive data unencrypted
4. Hardcode South African context (it should be systematic)
5. Use `any` types in TypeScript
6. Write raw SQL queries (use Drizzle ORM)
7. Skip error handling on async operations
8. Forget timezone conversions (UTC to SAST)
9. Mix server and client components incorrectly
10. Skip accessibility attributes (ARIA labels, keyboard nav)

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

// ❌ WRONG: Using default secure cookies on .vercel.app
export const auth = betterAuth({
  // This will break auth on .vercel.app!
});
```

**Symptoms of this issue:**
- Login form submits successfully (no errors)
- User is redirected to dashboard
- Dashboard immediately redirects back to login
- No errors in browser console
- Cookie shows `__Secure-better-auth.state` in network tab

**Solution:** Either disable `__Secure-` prefix (as shown above) OR use a custom domain.

### ✅ DO:

1. Use Next.js 16 App Router patterns
2. Validate user sessions everywhere
3. Encrypt all OAuth tokens (AES-256-GCM)
4. Maintain SA cultural authenticity
5. Use strict TypeScript types
6. Use Drizzle ORM for all database operations
7. Wrap async operations in try-catch
8. Display all times in SAST (UTC+2)
9. Mark client components with 'use client'
10. Include proper ARIA labels and keyboard support

## File Organization

### API Routes

- `app/api/auth/[...all]/route.ts` - Better-auth endpoints
- `app/api/oauth/[platform]/[action]/route.ts` - OAuth flows
- `app/api/posts/publish/route.ts` - Immediate posting
- `app/api/ai/generate/route.ts` - AI content generation
- `app/api/cron/process-scheduled-posts/route.ts` - Scheduled posting

### Key Libraries

- `lib/auth.ts` - Better-auth server configuration
- `lib/auth-client.ts` - Better-auth client
- `lib/ai/gemini-service.ts` - AI content generation
- `lib/posting/post-service.ts` - Social media posting
- `lib/oauth/[platform]-provider.ts` - OAuth providers
- `lib/db/connected-accounts.ts` - Database helpers

### Components

- Server components in `app/` directory
- Client components in `components/` directory
- Mark client components with `'use client'`

## Documentation

**Always refer to:**

- `AGENTS.md` - Complete project architecture guide
- `QUICK_REFERENCE.md` - Quick developer reference
- `docs/COMPONENT_GUIDE.md` - Component API documentation
- `PHASE_8_AUTHENTICATION_COMPLETE.md` - Auth implementation
- `PHASE_9_AUTO_POSTING_COMPLETE.md` - Posting system
- `PHASE_10_AI_CONTENT_GENERATION_COMPLETE.md` - AI features

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)

# Database
npm run db:push               # Push schema changes
npm run db:studio             # Open Drizzle Studio
npm run db:generate           # Generate migrations

# Deployment
git push origin main          # Auto-deploys to Vercel
```

## Environment Variables Required

```env
# Database
DATABASE_URL=                 # Neon PostgreSQL connection string

# Authentication
BETTER_AUTH_SECRET=           # Secret for Better-auth
BETTER_AUTH_URL=              # http://localhost:3000 (dev)
NEXT_PUBLIC_BETTER_AUTH_URL=  # Same as above

# OAuth (Login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Social Media OAuth
META_APP_ID=                  # Facebook/Instagram
META_APP_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# AI
GEMINI_API_KEY=               # Google Gemini Pro

# Payments
POLAR_ACCESS_TOKEN=           # Polar.sh API token
POLAR_ORGANIZATION_ID=
POLAR_WEBHOOK_SECRET=

# Security
TOKEN_ENCRYPTION_KEY=         # 32-byte hex string for AES-256
CRON_SECRET=                  # Secret for cron job authentication

# Job Processing
INNGEST_SIGNING_KEY=          # Inngest webhook signature verification
INNGEST_EVENT_KEY=            # Inngest event key (optional)

# Storage
BLOB_READ_WRITE_TOKEN=        # Vercel Blob storage
```

## Example: Creating a New Feature

```typescript
// 1. Define types
interface NewFeatureData {
  id: string;
  userId: string;
  content: string;
}

// 2. Create API route (app/api/feature/route.ts)
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  // Validate session
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate input
  const body = await request.json();
  // ... validation logic

  // Database operation
  const result = await db.insert(table).values({
    userId: session.user.id,
    ...body,
  });

  return Response.json({ success: true, data: result });
}

// 3. Create client component (components/new-feature.tsx)
("use client");

export function NewFeature() {
  // ... implementation with proper error handling and loading states
}

// 4. Add to page with error boundary
import { ErrorBoundary } from "@/lib/ErrorBoundary";
import { NewFeature } from "@/components/new-feature";

export default function FeaturePage() {
  return (
    <ErrorBoundary>
      <NewFeature />
    </ErrorBoundary>
  );
}
```

## South African Language Codes

When implementing multi-language features:

```typescript
const SA_LANGUAGES = {
  en: "English",
  af: "Afrikaans",
  zu: "Zulu (isiZulu)",
  xh: "Xhosa (isiXhosa)",
  nso: "Northern Sotho (Sepedi)",
  tn: "Tswana (Setswana)",
  st: "Southern Sotho (Sesotho)",
  ts: "Tsonga (Xitsonga)",
  ss: "Swati (siSwati)",
  ve: "Venda (Tshivenda)",
  nr: "Ndebele (isiNdebele)",
} as const;
```

## Accessibility Requirements

```typescript
// ✅ ALWAYS include ARIA labels
<button aria-label="Generate content" onClick={handleGenerate}>
  <i className="fas fa-magic" aria-hidden="true" />
  Generate
</button>

// ✅ ALWAYS support keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  Clickable Element
</div>

// ✅ ALWAYS provide focus indicators
// Already handled by Tailwind: focus:ring-2 focus:ring-neon-grape
```

## Performance Considerations

- Use `loading.tsx` for route loading states
- Implement pagination for large data sets (e.g., 20 items per page)
- Use `React.memo()` for expensive components
- Optimize images with Next.js Image component
- Use dynamic imports for heavy components

---

**Version:** 2.0  
**Last Updated:** Phase 10 Complete  
**Status:** Production Ready 🚀🇿🇦

For detailed information, see `AGENTS.md` in the project root.
