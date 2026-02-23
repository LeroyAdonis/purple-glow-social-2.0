# GitHub Copilot Instructions - Purple Glow Social 2.0

## Project Overview

AI-powered social media management platform for South African businesses. Manages content generation, scheduling, and automated posting across Instagram, Facebook, Twitter/X, and LinkedIn with support for all 11 SA official languages.

**Stack:** Next.js 16 / React 19 / TypeScript (strict) / PostgreSQL (Neon) / Drizzle ORM / Better-auth / Tailwind CSS v4 / Google Gemini Pro / Polar.sh payments / Inngest background jobs / Vercel deployment.

## Commands

```bash
npm run dev              # Next.js dev server (localhost:3000)
npm run build            # Production build
npx tsc --noEmit         # Type checking (CI lint step)
npm run test:run         # Run all unit/integration tests (vitest)
npx vitest run tests/unit/validation.test.ts  # Run a single test file
npm run test:coverage    # Tests with coverage report

npm run db:push          # Push schema changes to database
npm run db:generate      # Generate Drizzle migrations
npm run db:studio        # Open Drizzle Studio GUI
npm run db:seed-test     # Seed test accounts

npx inngest-cli@latest dev  # Local Inngest dev server (localhost:8288)
```

## Architecture

### Authentication Flow

Better-auth with Drizzle adapter → Neon PostgreSQL. Session validation via `auth.api.getSession()`. Middleware (`middleware.ts`) handles route protection as a UX convenience layer; API routes must still validate sessions independently.

```typescript
import { auth } from "@/lib/auth";

const session = await auth.api.getSession({ headers: request.headers });
if (!session?.user) {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Vercel cookie pitfall:** The `.vercel.app` domain is on the Public Suffix List, causing `__Secure-` cookies to be silently rejected by browsers. The auth config conditionally disables `useSecureCookies` when deployed to `.vercel.app`. If auth appears to work but sessions don't persist, this is likely the cause.

### Database Layer

Schema is in `drizzle/schema.ts`. All queries go through Drizzle ORM—never use raw SQL. Database helper modules live in `lib/db/` (one file per domain: `posts.ts`, `users.ts`, `connected-accounts.ts`, etc.).

OAuth tokens are encrypted with AES-256-GCM (`lib/crypto/token-encryption.ts`). Always use `getDecryptedToken()` from `lib/db/connected-accounts.ts` to read tokens.

### Background Jobs (Inngest)

8 scheduled functions in `lib/inngest/functions/`: scheduled post processing (every minute), automation rule execution, OAuth token refresh, credit expiry checks, PKCE cleanup, and AI pattern learning. Client config is in `lib/inngest/client.ts`.

For local development, run the Inngest dev server alongside Next.js.

### Logging

Use the structured logger (`lib/logger.ts`), not `console.log`. Context-specific loggers are available:

```typescript
import { logger } from "@/lib/logger";

logger.auth.info("User logged in", { userId });
logger.api.error("Request failed", { endpoint });
logger.oauth.exception(error, { platform: "twitter" });
// Contexts: auth, api, cron, oauth, posting, ai, polar, db, admin, security
```

The logger auto-sanitizes sensitive data and sends errors to Sentry in production.

### API Response Format

```typescript
// Success
return Response.json({ success: true, data: result, message: "..." });

// Error
return Response.json({ success: false, error: "...", code: "ERROR_CODE" }, { status: 400 });
```

### Component Organization

Server components live in `app/`. Client components live in `components/` and must start with `"use client"`. Complex components should be wrapped with `ErrorBoundary` from `lib/ErrorBoundary.tsx`.

### Credit System

Credits are deducted on successful publish (not generation). 1 credit per platform per post. Scheduled posts use credit reservations that release on failure. Tiers: Free (10 credits), Pro (500), Business (2000).

## South African Context

All dates/times must use SAST (UTC+2). Currency is ZAR with 15% VAT. AI content generation prompts must include SA cultural context (local expressions, hashtags like #Mzansi, #LocalIsLekker, and references to SA cities).

The 11 supported language codes: `en`, `af`, `zu`, `xh`, `nso`, `tn`, `st`, `ts`, `ss`, `ve`, `nr`. Translation files are in `lib/translations/`.

## Key Conventions

- **TypeScript strict mode** is enabled with `noUncheckedIndexedAccess`, `noImplicitAny`, and all strict flags. Never use `any`.
- **Zod** for runtime input validation in API routes.
- **Path alias** `@/*` maps to the project root.
- **OAuth flows** must include a CSRF `state` parameter and use PKCE where applicable (Twitter/X).
- All social platform posting logic follows a provider pattern in `lib/posting/` and `lib/oauth/`.
- The `app/api/auth/[...all]/route.ts` catch-all is owned by Better-auth—don't add custom logic there.
- Tests are in `tests/` using vitest with jsdom environment. Setup file is `tests/setup.ts`.
