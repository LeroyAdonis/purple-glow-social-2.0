# Getting Started - Social Authentication Implementation

This guide walks you through implementing the social authentication feature step-by-step.

---

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] PostgreSQL database running
- [ ] Google Cloud Console account
- [ ] Meta Developer account (Facebook/Instagram)
- [ ] Twitter Developer account
- [ ] LinkedIn Developer account
- [ ] Basic understanding of OAuth 2.0

---

## Step 1: OAuth Provider Setup (Day 1)

### 1.1 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Application type: "Web application"
6. Authorized redirect URIs:
   - `http://localhost:5173/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env`

### 1.2 Meta (Facebook/Instagram) OAuth Setup

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app → "Business" type
3. Add "Facebook Login" and "Instagram Basic Display" products
4. Configure OAuth redirect URIs:
   - `http://localhost:5173/api/oauth/instagram/callback`
   - `http://localhost:5173/api/oauth/facebook/callback`
5. Under "Settings" → "Basic", copy App ID and App Secret
6. Submit app for review (required for production)

**Important:** Users must have Instagram Business or Creator accounts to connect Instagram.

### 1.3 Twitter Developer Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new project and app
3. Under "User authentication settings":
   - App permissions: Read and Write
   - Type of App: Web App
   - Callback URI: `http://localhost:5173/api/oauth/twitter/callback`
4. Copy Client ID and Client Secret
5. Note: Free tier has limited API access

### 1.4 LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Create a new app
3. Under "Auth" tab:
   - Add redirect URLs: `http://localhost:5173/api/oauth/linkedin/callback`
   - Request "Sign In with LinkedIn" access
4. Under "Products", request "Share on LinkedIn" access
5. Copy Client ID and Client Secret
6. Note: "Share on LinkedIn" requires LinkedIn review

---

## Step 2: Environment Configuration (Day 1)

### 2.1 Copy and Configure `.env`

```bash
# Copy example
cp .env.example .env

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
TOKEN_ENCRYPTION_KEY=<generated_key>
```

### 2.2 Update `.env` with All Credentials

```env
# Better-auth (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your_32_char_secret
BETTER_AUTH_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/purple_glow_social

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Meta (Facebook/Instagram)
META_APP_ID=xxx
META_APP_SECRET=xxx

# Twitter/X
TWITTER_CLIENT_ID=xxx
TWITTER_CLIENT_SECRET=xxx

# LinkedIn
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx

# Token Encryption
TOKEN_ENCRYPTION_KEY=<64_char_hex_from_step_above>
```

---

## Step 3: Database Setup (Day 1)

### 3.1 Install Dependencies

```bash
npm install
npm install drizzle-orm drizzle-kit pg better-auth nanoid
```

### 3.2 Update Schema

Copy the schema updates from `specs/social-auth-feature/code-examples.md` to `drizzle/schema.ts`

### 3.3 Generate and Run Migration

```bash
# Generate migration
npx drizzle-kit generate:pg

# Run migration
npx drizzle-kit push:pg

# Verify tables created
psql -d purple_glow_social -c "\dt"
```

Expected tables:
- `user`
- `session`
- `account`
- `connectedAccount` ← NEW

---

## Step 4: Core Infrastructure (Days 2-3)

### 4.1 Token Encryption Service

1. Create `lib/crypto/token-encryption.ts`
2. Copy code from `specs/social-auth-feature/code-examples.md`
3. Test encryption:

```bash
node -e "
const { encryptToken, decryptToken } = require('./lib/crypto/token-encryption.ts');
const token = 'test_token_12345';
const encrypted = encryptToken(token);
const decrypted = decryptToken(encrypted);
console.log('Original:', token);
console.log('Encrypted:', encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', token === decrypted);
"
```

### 4.2 OAuth Providers

1. Create `lib/oauth/base-provider.ts` (interface)
2. Create `lib/oauth/instagram-provider.ts`
3. Create `lib/oauth/facebook-provider.ts`
4. Create `lib/oauth/twitter-provider.ts`
5. Create `lib/oauth/linkedin-provider.ts`

### 4.3 Database Helpers

Create `lib/db/connected-accounts.ts`:

```typescript
import { db } from '@/drizzle/db';
import { connectedAccount } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { encryptToken, decryptToken } from '@/lib/crypto/token-encryption';

export async function getConnectedAccounts(userId: string) {
  return await db
    .select()
    .from(connectedAccount)
    .where(eq(connectedAccount.userId, userId));
}

export async function getConnectedAccount(
  userId: string, 
  platform: string
) {
  const accounts = await db
    .select()
    .from(connectedAccount)
    .where(
      and(
        eq(connectedAccount.userId, userId),
        eq(connectedAccount.platform, platform)
      )
    )
    .limit(1);
  
  return accounts[0] || null;
}

export async function getDecryptedToken(
  userId: string,
  platform: string
): Promise<string | null> {
  const account = await getConnectedAccount(userId, platform);
  if (!account || !account.accessToken) return null;
  
  try {
    return decryptToken(account.accessToken);
  } catch (error) {
    console.error('Token decryption failed:', error);
    return null;
  }
}

export async function disconnectAccount(
  userId: string,
  platform: string
) {
  await db
    .delete(connectedAccount)
    .where(
      and(
        eq(connectedAccount.userId, userId),
        eq(connectedAccount.platform, platform)
      )
    );
}
```

---

## Step 5: Authentication Pages (Day 3-4)

### 5.1 Update Better-auth Configuration

Update `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/drizzle/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // Update every 24 hours
  },
  advanced: {
    generateId: () => nanoid(), // Use nanoid for IDs
  },
  // Hook to set default tier and credits on signup
  hooks: {
    after: [
      {
        matcher: (context) => context.path === "/sign-up/email",
        handler: async (context) => {
          if (context.user) {
            // Update user with default tier and credits
            await db
              .update(user)
              .set({ 
                tier: 'free', 
                credits: 10 
              })
              .where(eq(user.id, context.user.id));
          }
        },
      },
    ],
  },
});
```

### 5.2 Create Login Page

Create `app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err) {
      setError('Failed to sign in with Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pretoria-blue via-void to-neon-grape p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            🟣 Purple Glow Social
          </h1>
          <p className="text-joburg-teal">Welcome back!</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-glass-border rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Sign In
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-glass-border"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-glass-border"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-glass-border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-grape"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-glass-border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neon-grape"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link 
                href="/forgot-password" 
                className="text-joburg-teal hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-neon-grape to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-neon-grape/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="text-joburg-teal font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 5.3 Create Auth Client

Create `lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5173",
});

export const { useSession, signIn, signOut, signUp } = authClient;
```

---

## Step 6: OAuth API Routes (Days 5-7)

Create API routes for each platform following the pattern in `code-examples.md`:

### Directory Structure:
```
app/api/oauth/
├── instagram/
│   ├── connect/route.ts
│   ├── callback/route.ts
│   └── disconnect/route.ts
├── facebook/
│   ├── connect/route.ts
│   ├── callback/route.ts
│   └── disconnect/route.ts
├── twitter/
│   ├── connect/route.ts
│   ├── callback/route.ts
│   └── disconnect/route.ts
└── linkedin/
    ├── connect/route.ts
    ├── callback/route.ts
    └── disconnect/route.ts
```

Each `connect/route.ts` follows this pattern:
1. Verify user session
2. Generate CSRF state
3. Store state in cookie
4. Redirect to provider authorization URL

Each `callback/route.ts` follows this pattern:
1. Verify state parameter
2. Exchange code for token
3. Fetch user profile
4. Encrypt and store tokens
5. Redirect to success page

---

## Step 7: UI Components (Days 8-9)

### 7.1 Connected Accounts in Settings

Update `components/settings-view.tsx` to add a "Connected Accounts" section:

```typescript
// Add to existing SettingsView component

const ConnectedAccountsSection = () => {
  const { user } = useAppContext();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await fetch('/api/oauth/connections');
      const data = await res.json();
      setConnections(data.connections || []);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: string) => {
    window.location.href = `/api/oauth/${platform}/connect`;
  };

  const handleDisconnect = async (platform: string) => {
    if (!confirm(`Disconnect ${platform}? You'll need to reconnect to post.`)) {
      return;
    }

    try {
      await fetch(`/api/oauth/${platform}/disconnect`, { method: 'POST' });
      fetchConnections();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const platforms = ['instagram', 'facebook', 'twitter', 'linkedin'];
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Connected Accounts</h3>
      <p className="text-gray-400">
        Connect your social media accounts to enable auto-posting.
      </p>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {platforms.map((platform) => {
            const connection = connections.find(c => c.platform === platform);
            const isConnected = !!connection;

            return (
              <div
                key={platform}
                className="bg-white/5 border border-glass-border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Platform Icon */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-grape to-purple-600 flex items-center justify-center">
                    {platform === 'instagram' && '📷'}
                    {platform === 'facebook' && '👥'}
                    {platform === 'twitter' && '🐦'}
                    {platform === 'linkedin' && '💼'}
                  </div>

                  <div>
                    <h4 className="font-semibold text-white capitalize">
                      {platform}
                    </h4>
                    {isConnected ? (
                      <p className="text-sm text-green-400">
                        ✓ Connected as @{connection.platformUsername}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">Not connected</p>
                    )}
                  </div>
                </div>

                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(platform)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform)}
                    className="px-4 py-2 bg-neon-grape text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
```

---

## Step 8: Testing (Day 10)

### 8.1 Manual Testing Checklist

- [ ] Google login works
- [ ] Email/password login works
- [ ] Session persists across page reloads
- [ ] Instagram connection completes
- [ ] Facebook connection completes
- [ ] Twitter connection completes
- [ ] LinkedIn connection completes
- [ ] Tokens are encrypted in database
- [ ] Disconnect removes connection
- [ ] Error handling works for failed OAuth
- [ ] Mobile responsive design

### 8.2 Test OAuth Flow

```bash
# Start dev server
npm run dev

# Test flow:
1. Go to http://localhost:5173/login
2. Click "Continue with Google"
3. Sign in with Google
4. Should redirect to /dashboard
5. Go to Settings
6. Click "Connect" on Instagram
7. Authorize in Instagram
8. Should see "Connected as @username"
```

### 8.3 Verify Database

```sql
-- Check users created
SELECT id, name, email, tier, credits FROM "user";

-- Check connected accounts
SELECT 
  id,
  platform,
  "platformUsername",
  "isActive",
  "tokenExpiresAt"
FROM "connectedAccount";

-- Verify tokens are encrypted (should be long hex strings)
SELECT 
  platform,
  LEFT("accessToken", 50) as token_preview
FROM "connectedAccount";
```

---

## Step 9: Token Refresh System (Day 11)

### 9.1 Create Refresh Job

Create `lib/oauth/token-refresh-job.ts`:

```typescript
import { db } from '@/drizzle/db';
import { connectedAccount } from '@/drizzle/schema';
import { lt, eq } from 'drizzle-orm';
import { InstagramProvider } from './instagram-provider';
import { TwitterProvider } from './twitter-provider';
import { FacebookProvider } from './facebook-provider';
import { LinkedInProvider } from './linkedin-provider';
import { decryptToken, encryptToken } from '@/lib/crypto/token-encryption';

export async function refreshExpiredTokens() {
  console.log('[Token Refresh] Starting token refresh job...');
  
  // Find tokens expiring in next 7 days
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  const expiringAccounts = await db
    .select()
    .from(connectedAccount)
    .where(
      lt(connectedAccount.tokenExpiresAt, sevenDaysFromNow)
    );
  
  console.log(`[Token Refresh] Found ${expiringAccounts.length} tokens to refresh`);
  
  for (const account of expiringAccounts) {
    try {
      let provider;
      
      switch (account.platform) {
        case 'instagram':
          provider = new InstagramProvider();
          break;
        case 'facebook':
          provider = new FacebookProvider();
          break;
        case 'twitter':
          provider = new TwitterProvider();
          break;
        case 'linkedin':
          provider = new LinkedInProvider();
          break;
        default:
          continue;
      }
      
      if (!account.refreshToken) {
        console.log(`[Token Refresh] No refresh token for ${account.platform} - ${account.platformUsername}`);
        continue;
      }
      
      // Decrypt refresh token
      const refreshToken = decryptToken(account.refreshToken);
      
      // Refresh the token
      const tokenResponse = await provider.refreshAccessToken(refreshToken);
      
      // Update in database
      await db
        .update(connectedAccount)
        .set({
          accessToken: encryptToken(tokenResponse.accessToken),
          refreshToken: tokenResponse.refreshToken 
            ? encryptToken(tokenResponse.refreshToken)
            : account.refreshToken,
          tokenExpiresAt: new Date(Date.now() + tokenResponse.expiresIn * 1000),
          updatedAt: new Date(),
        })
        .where(eq(connectedAccount.id, account.id));
      
      console.log(`[Token Refresh] ✓ Refreshed ${account.platform} for ${account.platformUsername}`);
    } catch (error) {
      console.error(`[Token Refresh] ✗ Failed to refresh ${account.platform}:`, error);
      
      // Mark as inactive if refresh fails
      await db
        .update(connectedAccount)
        .set({ isActive: false })
        .where(eq(connectedAccount.id, account.id));
    }
  }
  
  console.log('[Token Refresh] Job completed');
}
```

### 9.2 Schedule the Job

Add to `package.json`:

```json
{
  "scripts": {
    "refresh-tokens": "tsx lib/oauth/token-refresh-job.ts"
  }
}
```

Set up cron job (Linux/Mac) or Task Scheduler (Windows):

```bash
# Cron (run hourly)
0 * * * * cd /path/to/app && npm run refresh-tokens

# Or use a service like node-cron in your app
```

---

## Step 10: Production Deployment

### 10.1 Environment Variables

Set in production environment (Vercel/Railway/etc.):

```env
BETTER_AUTH_SECRET=<production_secret>
BETTER_AUTH_URL=https://yourdomain.com
DATABASE_URL=<production_postgres_url>
# ... all OAuth credentials
TOKEN_ENCRYPTION_KEY=<production_key>
```

### 10.2 Update Callback URLs

Update in each provider console:
- Google: `https://yourdomain.com/api/auth/callback/google`
- Meta: `https://yourdomain.com/api/oauth/instagram/callback`
- Twitter: `https://yourdomain.com/api/oauth/twitter/callback`
- LinkedIn: `https://yourdomain.com/api/oauth/linkedin/callback`

### 10.3 Security Checklist

- [ ] All environment variables set
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Error monitoring (Sentry)
- [ ] Token encryption key rotated

---

## Troubleshooting

### "Invalid state parameter"
- Clear cookies and try again
- Check state cookie is being set
- Verify cookie domain settings

### "No Instagram Business Account"
- User needs to convert to Business/Creator account
- Guide: Settings → Account → Switch to Professional Account

### "Failed to refresh token"
- Check if refresh token exists
- Verify provider credentials are correct
- Check token hasn't been manually revoked

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check network/firewall settings
- Ensure database is running

---

## Next Steps

After completing implementation:

1. ✅ Test all OAuth flows thoroughly
2. ✅ Add analytics tracking
3. ✅ Write user documentation
4. ✅ Submit apps for provider review (Meta, LinkedIn)
5. ✅ Implement posting functionality using connected accounts
6. ✅ Add webhook listeners for token revocation
7. ✅ Set up monitoring and alerts

---

**Questions?** Check the requirements and code examples documents, or reach out for help!

Good luck! 🚀
