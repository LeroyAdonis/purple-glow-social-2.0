# Better Auth 500 Error - Diagnosis & Fix

## Current Status

✅ **Fixed:** OAuth 404 error (changed to use `signIn.social()`)  
❌ **Current Issue:** 500 Internal Server Error when calling `/api/auth/sign-in/social`

## Root Cause Analysis

The 500 error is likely caused by **Better Auth schema mismatch**. Here's why:

### Problem 1: Manual Schema vs Auto-Generated
Better Auth expects to either:
1. Auto-generate its own tables, OR
2. Use a very specific schema structure

Our current setup:
- We have manually defined tables in `drizzle/schema.ts`
- Better Auth is trying to use these tables via the Drizzle adapter
- There may be subtle differences in what Better Auth expects vs what we defined

### Problem 2: Column Naming Convention
Better Auth uses camelCase in code but expects snake_case in database:
- Code: `emailVerified` → Database: `email_verified` ✅ (We have this)
- Code: `createdAt` → Database: `created_at` ✅ (We have this)

However, Better Auth might have additional requirements we're missing.

## Solutions

### Solution 1: Use Better Auth's Built-in Migration (RECOMMENDED)

Better Auth can auto-generate the correct schema. Here's how:

#### Step 1: Create a Migration Script
Create `scripts/migrate-auth.ts`:

```typescript
import { auth } from '../lib/auth';

async function migrate() {
  console.log('Migrating Better Auth tables...');
  
  try {
    // Better Auth will auto-create tables if they don't exist
    // or validate existing tables
    await auth.api.getSession({
      headers: new Headers(),
    });
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrate();
```

#### Step 2: Run Migration
```bash
npx tsx scripts/migrate-auth.ts
```

### Solution 2: Simplify Better Auth Config (QUICK FIX)

The issue might be with how we're configuring the database adapter. Try this updated config:

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }), // Don't pass custom schema - let Better Auth handle it
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

### Solution 3: Check Server Logs (DEBUGGING)

The actual error is in your server terminal. Please check:

1. **Stop the dev server** (if running)
2. **Clear the terminal**
3. **Restart:** `npm run dev`
4. **Click the Google sign-up button**
5. **Check the terminal** for the full error stack trace

Common errors you might see:
- `column "xyz" does not exist` → Schema mismatch
- `relation "user" does not exist` → Tables not created
- `OAuth error` → Google OAuth configuration issue

## Immediate Action Items

### 1. Check Server Terminal Logs
**Please copy the full error from your server terminal** when you click "Sign up with Google". This will tell us exactly what's failing.

### 2. Test Auth Configuration Endpoint
Visit: `http://localhost:3000/api/test-auth`

This should show:
```json
{
  "status": "ok",
  "config": {
    "databaseConfigured": true,
    "hasGoogleOAuth": true,
    "hasAuthSecret": true,
    "baseURL": "http://localhost:3000"
  }
}
```

### 3. Verify Google OAuth Redirect URI
In Google Cloud Console, make sure you have added:
```
http://localhost:3000/api/auth/callback/google
```

### 4. Try Email/Password First
Before debugging Google OAuth, test if basic auth works:

1. Go to `/signup`
2. Fill in the form with email/password
3. Click "Create Account"
4. If this works, the issue is specifically with Google OAuth
5. If this fails too, it's a broader Better Auth setup issue

## Quick Diagnostic Commands

```bash
# Test database connection
npm run db:studio

# Check if tables exist
# (In Drizzle Studio, look for: user, session, account, verification)

# Check environment variables
npx dotenv-cli printenv | grep -E "DATABASE_URL|GOOGLE_CLIENT|BETTER_AUTH"
```

## Expected Behavior After Fix

1. Click "Sign up with Google"
2. Redirect to Google OAuth consent screen
3. Accept permissions
4. Redirect back to `http://localhost:3000/api/auth/callback/google`
5. Better Auth processes the OAuth response
6. Creates user account in database
7. Creates session
8. Redirects to `/dashboard`

## Common Pitfalls

❌ **Using mock credentials in production**
- Check `.env` has real Google OAuth credentials
- Check `.env.local` doesn't override them

❌ **Wrong redirect URI**
- Must match exactly in Google Cloud Console
- Include protocol: `http://` or `https://`

❌ **Schema mismatch**
- Better Auth expects specific column names
- Don't modify core auth tables manually

❌ **Missing environment variables**
- All `BETTER_AUTH_*` variables must be set
- `DATABASE_URL` must be a real connection string

## Next Steps

**Please provide:**
1. The **full error** from your server terminal (copy all red text)
2. The output of `http://localhost:3000/api/test-auth`
3. Does email/password signup work? (Test at `/signup`)

With this information, I can provide a more specific fix!

---

## Alternative: Bypass Auth for Testing

If you want to bypass auth temporarily to test the app:

1. Create a mock session in `middleware.ts`
2. Add a "Skip Login" button that sets a cookie
3. This lets you test the dashboard while we debug auth

Would you like me to implement this temporary bypass?
