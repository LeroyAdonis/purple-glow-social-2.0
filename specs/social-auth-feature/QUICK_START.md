# Quick Start Guide - 30 Minutes to First OAuth Connection

**Goal:** Get Instagram OAuth working in 30 minutes

This guide gets you from zero to a working Instagram connection as fast as possible. Perfect for developers who want to start coding immediately.

---

## ⚡ Prerequisites (5 minutes)

```bash
# 1. Verify tools
node --version  # Need 18+
psql --version  # Need PostgreSQL

# 2. Clone/pull latest
git pull origin main

# 3. Install dependencies
npm install
```

---

## 🔧 Setup (10 minutes)

### Step 1: Create Meta App (5 min)

1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Choose "Business" type
4. Add products: "Facebook Login" and "Instagram Basic Display"
5. Copy your **App ID** and **App Secret**

### Step 2: Configure Environment (5 min)

```bash
# Copy example
cp .env.example .env

# Edit .env and add:
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here

# Generate encryption key
node -e "console.log('TOKEN_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and add to .env
```

Your `.env` should have:
```env
DATABASE_URL=postgresql://...
META_APP_ID=123456789
META_APP_SECRET=abc123def456
TOKEN_ENCRYPTION_KEY=64_character_hex_string
BETTER_AUTH_URL=http://localhost:5173
BETTER_AUTH_SECRET=your_secret
```

### Step 3: Database Migration (2 min)

```bash
# Add to drizzle/schema.ts
export const connectedAccount = pgTable('connectedAccount', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  platform: text('platform').notNull(),
  platformUserId: text('platformUserId').notNull(),
  platformUsername: varchar('platformUsername', { length: 255 }).notNull(),
  platformDisplayName: varchar('platformDisplayName', { length: 255 }).notNull(),
  profileImageUrl: text('profileImageUrl'),
  accessToken: text('accessToken').notNull(),
  refreshToken: text('refreshToken'),
  tokenExpiresAt: timestamp('tokenExpiresAt'),
  scope: text('scope').notNull(),
  isActive: boolean('isActive').notNull().default(true),
  lastSyncedAt: timestamp('lastSyncedAt').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

# Run migration
npx drizzle-kit push:pg
```

---

## 💻 Code Implementation (15 minutes)

### Step 1: Token Encryption (3 min)

Create `lib/crypto/token-encryption.ts`:

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function encryptToken(token: string): string {
  const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
  const key = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, 'hex');
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Step 2: Instagram Provider (5 min)

Create `lib/oauth/instagram-provider.ts`:

```typescript
export class InstagramProvider {
  private clientId = process.env.META_APP_ID!;
  private clientSecret = process.env.META_APP_SECRET!;
  private redirectUri = `${process.env.BETTER_AUTH_URL}/api/oauth/instagram/callback`;
  
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'instagram_basic,instagram_content_publish',
      response_type: 'code',
      state,
    });
    return `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
  }
  
  async exchangeCodeForToken(code: string) {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${this.clientId}&` +
      `client_secret=${this.clientSecret}&` +
      `code=${code}&` +
      `redirect_uri=${this.redirectUri}`
    );
    return response.json();
  }
  
  async getUserProfile(accessToken: string) {
    const meResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${accessToken}`
    );
    const meData = await meResponse.json();
    
    const igResponse = await fetch(
      `https://graph.facebook.com/v18.0/${meData.id}/accounts?` +
      `fields=instagram_business_account&access_token=${accessToken}`
    );
    const igData = await igResponse.json();
    const igAccountId = igData.data[0]?.instagram_business_account?.id;
    
    const profileResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}?` +
      `fields=id,username,name,profile_picture_url&access_token=${accessToken}`
    );
    return profileResponse.json();
  }
}
```

### Step 3: Connect Endpoint (3 min)

Create `app/api/oauth/instagram/connect/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { InstagramProvider } from '@/lib/oauth/instagram-provider';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const state = crypto.randomBytes(32).toString('hex');
  const provider = new InstagramProvider();
  
  const response = NextResponse.redirect(
    provider.getAuthorizationUrl(state)
  );
  
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    maxAge: 600,
  });
  
  return response;
}
```

### Step 4: Callback Endpoint (4 min)

Create `app/api/oauth/instagram/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { InstagramProvider } from '@/lib/oauth/instagram-provider';
import { encryptToken } from '@/lib/crypto/token-encryption';
import { db } from '@/drizzle/db';
import { connectedAccount } from '@/drizzle/schema';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const storedState = request.cookies.get('oauth_state')?.value;
  
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(
      new URL('/oauth/error?error=invalid_state', request.url)
    );
  }
  
  try {
    const provider = new InstagramProvider();
    
    // Exchange code for token
    const tokenData = await provider.exchangeCodeForToken(code);
    
    // Get user profile
    const profile = await provider.getUserProfile(tokenData.access_token);
    
    // Store in database
    await db.insert(connectedAccount).values({
      id: nanoid(),
      userId: 'user-1', // TODO: Get from session
      platform: 'instagram',
      platformUserId: profile.id,
      platformUsername: profile.username,
      platformDisplayName: profile.name,
      profileImageUrl: profile.profile_picture_url,
      accessToken: encryptToken(tokenData.access_token),
      refreshToken: null,
      tokenExpiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
      scope: 'instagram_basic,instagram_content_publish',
      isActive: true,
      lastSyncedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return NextResponse.redirect(
      new URL('/dashboard?connected=instagram', request.url)
    );
  } catch (error) {
    console.error('Instagram callback error:', error);
    return NextResponse.redirect(
      new URL('/oauth/error?error=connection_failed', request.url)
    );
  }
}
```

---

## 🧪 Test It! (5 minutes)

### Step 1: Configure Callback URL in Meta

1. Go to your Meta app dashboard
2. Navigate to "Facebook Login" → "Settings"
3. Add redirect URI: `http://localhost:5173/api/oauth/instagram/callback`
4. Save changes

### Step 2: Start Dev Server

```bash
npm run dev
```

### Step 3: Test the Flow

```bash
# Open browser and go to:
http://localhost:5173/api/oauth/instagram/connect

# You should be redirected to Facebook
# After logging in and authorizing, you'll be back to your app
```

### Step 4: Verify in Database

```sql
-- Check if connection was created
SELECT 
  platform,
  "platformUsername",
  "isActive",
  LEFT("accessToken", 50) as token_preview
FROM "connectedAccount";
```

---

## ✅ Success Checklist

You've succeeded if:
- ✅ You can visit `/api/oauth/instagram/connect`
- ✅ You're redirected to Facebook/Instagram
- ✅ After authorizing, you're back to your app
- ✅ Database has a new `connectedAccount` record
- ✅ Token is encrypted (looks like random hex)

---

## 🐛 Troubleshooting

### "Invalid OAuth Redirect URI"
**Fix:** Add `http://localhost:5173/api/oauth/instagram/callback` to Meta app settings

### "No Instagram Business Account Found"
**Fix:** Convert your Instagram account to Business/Creator:
1. Go to Instagram Settings
2. Account → Switch to Professional Account
3. Choose Business or Creator

### "Database Connection Error"
**Fix:** Verify `DATABASE_URL` in `.env` is correct

### "TOKEN_ENCRYPTION_KEY not set"
**Fix:** Generate key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### "State Parameter Mismatch"
**Fix:** Clear cookies and try again

---

## 🎯 Next Steps

Now that Instagram works, you can:

1. **Add Other Platforms** - Copy the pattern for Facebook, Twitter, LinkedIn
2. **Add UI** - Create settings page to show connected accounts
3. **Add Session Auth** - Replace hardcoded `userId` with real session
4. **Add Token Refresh** - Implement automatic token refresh
5. **Add Disconnect** - Allow users to disconnect accounts

See the full documentation for complete implementation:
- `requirements.md` - Full feature spec
- `implementation-plan.md` - Complete development guide
- `code-examples.md` - More code examples

---

## 📚 Copy-Paste Commands

Here's everything in one place:

```bash
# Setup
npm install
cp .env.example .env

# Generate encryption key
node -e "console.log('TOKEN_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Create directories
mkdir -p lib/crypto
mkdir -p lib/oauth
mkdir -p app/api/oauth/instagram/connect
mkdir -p app/api/oauth/instagram/callback

# Run migration
npx drizzle-kit push:pg

# Start server
npm run dev
```

---

## 🎉 You're Ready!

You now have a working Instagram OAuth connection! This is the foundation for:
- Auto-posting to Instagram
- Fetching Instagram analytics
- Managing Instagram content

Time to add the other platforms and build the full feature! 🚀

**Questions?** Check the full documentation in this folder.

**Sharp sharp!** 🇿🇦
