# Schema Naming Fix - Better Auth Model Error

## Error Message
```
ERROR [Better Auth]: INTERNAL_SERVER_ERROR 
[Error [BetterAuthError]: [# Drizzle Adapter]: The model "session" was not found in the schema object.
```

## Root Cause

Better Auth expects schema exports to be **singular** (e.g., `user`, `session`), but our schema was exporting them as **plural** (e.g., `users`, `sessions`).

When Better Auth tried to look for `schema.session`, it couldn't find it because we exported `schema.sessions` (with an 's').

## Solution Applied

### 1. Changed Schema Export Names (drizzle/schema.ts)

**Before:**
```typescript
export const users = pgTable("user", { ... });
export const sessions = pgTable("session", { ... });
export const accounts = pgTable("account", { ... });
export const verifications = pgTable("verification", { ... });
```

**After:**
```typescript
export const user = pgTable("user", { ... });
export const session = pgTable("session", { ... });
export const account = pgTable("account", { ... });
export const verification = pgTable("verification", { ... });
```

### 2. Updated All References

Updated all references throughout the schema file:
- `users.id` → `user.id`
- `sessions.$inferSelect` → `session.$inferSelect`
- etc.

### 3. Added Explicit Schema Mapping (lib/auth.ts)

**Before:**
```typescript
database: drizzleAdapter(db, {
  provider: "pg",
  // No schema specified
})
```

**After:**
```typescript
database: drizzleAdapter(db, {
  provider: "pg",
  schema: {
    user: schema.user,
    session: schema.session,
    account: schema.account,
    verification: schema.verification,
  },
})
```

## Why This Works

Better Auth looks for specific model names in the schema object:
- `schema.user` for user table
- `schema.session` for session table
- `schema.account` for OAuth accounts
- `schema.verification` for email verification

By using singular names and explicitly mapping them, Better Auth can now find and use these tables correctly.

## Files Modified

1. **drizzle/schema.ts**
   - Changed 4 export names (plural → singular)
   - Updated 4 references in other tables
   - Updated 3 TypeScript type definitions

2. **lib/auth.ts**
   - Added explicit schema mapping to drizzleAdapter

## Testing Steps

1. **Restart the dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Test signup:**
   - Go to: `http://localhost:3000/signup`
   - Fill in email, password, name
   - Click "Create Account"
   - Should succeed without errors

3. **Verify session:**
   - Check server logs for "Database connected successfully"
   - No "model not found" errors
   - Successful redirect to dashboard

## Expected Server Logs

**Good (After Fix):**
```
[Auth] Database connected successfully
✓ Ready in 2000ms
```

**Bad (Before Fix):**
```
[Auth] Database connected successfully
ERROR [Better Auth]: INTERNAL_SERVER_ERROR
[Error [BetterAuthError]: [# Drizzle Adapter]: The model "session" was not found
```

## Impact on Other Code

**Note:** If any other files import these schema exports, they need to be updated:

**Find and replace in your codebase:**
- `schema.users` → `schema.user`
- `schema.sessions` → `schema.session`
- `schema.accounts` → `schema.account`
- `schema.verifications` → `schema.verification`

**Check these directories:**
- `lib/db/` - Database helper functions
- `app/api/` - API routes that query users/sessions
- Any other files importing from `drizzle/schema.ts`

## Better Auth Naming Conventions

For future reference, Better Auth expects:

| Model | Table Name | Export Name | Description |
|-------|-----------|-------------|-------------|
| User | `user` | `user` | User accounts |
| Session | `session` | `session` | Active sessions |
| Account | `account` | `account` | OAuth provider accounts |
| Verification | `verification` | `verification` | Email verification tokens |

**Important:** Export names should be **singular**, even though tables contain multiple records.

---

**Status:** Fix applied, ready for testing with server restart.
