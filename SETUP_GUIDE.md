# Purple Glow Social 2.0 - Complete Setup Guide

**Last Updated:** January 2025  
**Version:** 2.0  
**Estimated Setup Time:** 30-45 minutes

---

## 📋 Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Database Setup (Neon PostgreSQL)](#3-database-setup-neon-postgresql)
4. [Environment Variables](#4-environment-variables)
5. [OAuth Provider Setup](#5-oauth-provider-setup)
6. [Running Locally](#6-running-locally)
7. [Database Migrations](#7-database-migrations)
8. [Seeding Test Data](#8-seeding-test-data)
9. [Testing](#9-testing)
10. [Troubleshooting Common Issues](#10-troubleshooting-common-issues)

---

## 1. System Requirements

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Operating System** | Windows 10, macOS 10.15, Ubuntu 20.04 | Latest LTS versions |
| **Node.js** | 18.0.0 | 20.x LTS |
| **npm** | 9.0.0 | 10.x |
| **RAM** | 4 GB | 8 GB+ |
| **Disk Space** | 500 MB | 1 GB+ |
| **Internet** | Required | Stable broadband |

### Verify Your Environment

```bash
# Check Node.js version (must be 18+)
node --version

# Check npm version (must be 9+)
npm --version

# Check Git version
git --version
```

### Install Node.js (if needed)

**Windows/macOS:**
Download from [nodejs.org](https://nodejs.org/) (LTS version recommended)

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS (Homebrew):**
```bash
brew install node@20
```

---

## 2. Development Environment Setup

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/LeroyAdonis/purple-glow-social-2.0.git

# OR clone via SSH
git clone git@github.com:LeroyAdonis/purple-glow-social-2.0.git

# Navigate to project directory
cd purple-glow-social-2.0
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - Next.js 16 with React 19
# - Drizzle ORM for database
# - Better-auth for authentication
# - Tailwind CSS v4 for styling
# - And 50+ other dependencies
```

### Step 3: Set Up Environment File

```bash
# Copy the example environment file
cp .env.example .env.local

# On Windows (PowerShell)
Copy-Item .env.example .env.local

# On Windows (Command Prompt)
copy .env.example .env.local
```

### Step 4: Recommended VS Code Extensions

For the best development experience, install these VS Code extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## 3. Database Setup (Neon PostgreSQL)

Purple Glow Social uses [Neon](https://neon.tech/) for serverless PostgreSQL. Neon offers a generous free tier perfect for development.

### Step 1: Create a Neon Account

1. Go to [neon.tech](https://neon.tech/)
2. Click **"Sign Up"** (you can use GitHub, Google, or email)
3. Verify your email if required

### Step 2: Create a New Project

1. Click **"New Project"**
2. Enter project details:
   - **Name:** `purple-glow-social`
   - **Region:** Choose closest to your users (e.g., `eu-west` for South Africa)
   - **PostgreSQL Version:** 15 (default)
3. Click **"Create Project"**

### Step 3: Get Your Connection String

1. After project creation, you'll see your connection details
2. Copy the **Connection String** (it looks like this):
   ```
   postgresql://username:password@ep-xxx-xxx-123456.eu-west-2.aws.neon.tech/neondb?sslmode=require
   ```
3. **Important:** Keep `?sslmode=require` at the end

### Step 4: Configure Database URL

Add the connection string to your `.env.local` file:

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx-123456.eu-west-2.aws.neon.tech/neondb?sslmode=require
```

### Step 5: Push Database Schema

```bash
# Push the Drizzle schema to your database
npm run db:push

# You should see output like:
# [✓] Changes applied
# [✓] 18 tables created
```

### Step 6: Verify Database (Optional)

```bash
# Open Drizzle Studio to view your database
npm run db:studio

# This opens a web interface at http://localhost:4983
```

### Database Tables Created

The schema includes 18 tables:

| Table | Purpose |
|-------|---------|
| `user` | User accounts |
| `session` | Active sessions |
| `account` | OAuth accounts (Better-auth) |
| `verification` | Email verification tokens |
| `posts` | Social media posts |
| `automation_rules` | Automation configurations |
| `connected_account` | Social platform OAuth tokens |
| `transactions` | Payment records |
| `subscriptions` | User subscriptions |
| `webhook_events` | Polar webhook audit trail |
| `credit_reservations` | Reserved credits for scheduled posts |
| `generation_logs` | AI generation tracking |
| `daily_usage` | Daily rate limiting |
| `notifications` | User notifications |
| `job_logs` | Inngest job tracking |
| `post_analytics` | Engagement metrics |
| `user_learning_profiles` | AI learning data |
| `content_feedback` | User feedback on AI content |

---

## 4. Environment Variables

### Complete Environment Variables Reference

Your `.env.local` file needs the following variables. Copy from `.env.example` and fill in your values.

### 4.1 Required Variables (Minimum for Local Dev)

```env
# ============================================
# REQUIRED - App won't work without these
# ============================================

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require

# Authentication (Better-auth)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
BETTER_AUTH_SECRET=your_64_character_hex_string_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Token Encryption (for OAuth tokens)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TOKEN_ENCRYPTION_KEY=your_64_character_hex_string_here
```

### 4.2 AI Content Generation

```env
# ============================================
# AI - Required for content generation
# ============================================

# Google Gemini API
# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get a Gemini API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key and add to your `.env.local`

### 4.3 Google OAuth (Login with Google)

```env
# ============================================
# Google OAuth - For "Sign in with Google"
# ============================================

GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

### 4.4 Social Platform OAuth (For Posting)

```env
# ============================================
# Social Platform OAuth - For connecting accounts
# ============================================

# Meta (Facebook/Instagram)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret

# Twitter/X
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### 4.5 Payment Integration (Polar.sh)

```env
# ============================================
# Payments - Polar.sh
# ============================================

POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
POLAR_ORGANIZATION_ID=your_polar_org_id
POLAR_SERVER=sandbox  # Use 'production' for live

# Base URL for callbacks
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Credit Package Product IDs
POLAR_PRODUCT_100_CREDITS=prod_xxx
POLAR_PRODUCT_500_CREDITS=prod_xxx
POLAR_PRODUCT_1000_CREDITS=prod_xxx
POLAR_PRODUCT_50_VIDEO_CREDITS=prod_xxx

# Subscription Product IDs
POLAR_PRODUCT_PRO_MONTHLY=prod_xxx
POLAR_PRODUCT_PRO_ANNUAL=prod_xxx
POLAR_PRODUCT_BUSINESS_MONTHLY=prod_xxx
POLAR_PRODUCT_BUSINESS_ANNUAL=prod_xxx
```

### 4.6 Security & Monitoring

```env
# ============================================
# Security
# ============================================

# Cron Job Authentication
CRON_SECRET=your_cron_secret_here

# Admin Email Addresses (comma-separated)
ADMIN_EMAILS=admin@purpleglow.co.za

# ============================================
# Monitoring (Optional but Recommended)
# ============================================

# Sentry - Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=purple-glow-social
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Upstash Redis - Rate Limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Vercel Blob - Image Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 4.7 Generate Secret Keys

Use these commands to generate secure random keys:

```bash
# Generate BETTER_AUTH_SECRET (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate TOKEN_ENCRYPTION_KEY (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CRON_SECRET (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 5. OAuth Provider Setup

### 5.1 Google OAuth (Sign in with Google)

**Purpose:** Allow users to sign in with their Google account.

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Purple Glow Social`
4. Click **"Create"**

#### Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **"External"** user type → Click **"Create"**
3. Fill in the required fields:
   - **App name:** Purple Glow Social
   - **User support email:** your email
   - **Developer contact:** your email
4. Click **"Save and Continue"**
5. Add scopes: `email`, `profile`, `openid`
6. Click **"Save and Continue"**
7. Add test users (your email) for development
8. Click **"Save and Continue"**

#### Step 3: Create OAuth Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**
4. Enter name: `Purple Glow Social Web`
5. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Click **"Create"**
7. Copy **Client ID** and **Client Secret**

#### Step 4: Add to Environment

```env
GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

---

### 5.2 Meta (Facebook/Instagram) OAuth

**Purpose:** Connect Facebook Pages and Instagram Business accounts for posting.

#### Step 1: Create Meta Developer Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Log in with your Facebook account
3. Click **"My Apps"** → **"Create App"**

#### Step 2: Create App

1. Select **"Business"** as app type
2. Enter app name: `Purple Glow Social`
3. Enter contact email
4. Click **"Create App"**

#### Step 3: Add Facebook Login Product

1. In your app dashboard, click **"Add Product"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Select **"Web"**
4. Enter site URL: `http://localhost:3000`
5. Click **"Save"**

#### Step 4: Configure Facebook Login Settings

1. Go to **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/oauth/facebook/callback
   http://localhost:3000/api/oauth/instagram/callback
   ```
3. Enable:
   - ✅ Client OAuth Login
   - ✅ Web OAuth Login
4. Click **"Save Changes"**

#### Step 5: Add Required Permissions

1. Go to **App Review** → **Permissions and Features**
2. Request the following permissions:
   - `pages_manage_posts` - Post to Pages
   - `pages_read_engagement` - Read Page engagement
   - `instagram_basic` - Basic Instagram access
   - `instagram_content_publish` - Publish to Instagram
   - `business_management` - Business account access

#### Step 6: Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy **App ID** and **App Secret**

#### Step 7: Add to Environment

```env
META_APP_ID=1234567890123456
META_APP_SECRET=abcdef1234567890abcdef1234567890
```

> **Note:** For production, you'll need to submit your app for review to get permissions approved.

---

### 5.3 Twitter/X OAuth

**Purpose:** Connect Twitter accounts for posting tweets.

#### Step 1: Create Twitter Developer Account

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Sign in with your Twitter account
3. Apply for a developer account (if you don't have one)

#### Step 2: Create a Project and App

1. Click **"Projects & Apps"** → **"Create Project"**
2. Enter project name: `Purple Glow Social`
3. Select use case: **"Building tools for people to manage their Twitter account"**
4. Enter project description
5. Create an App within the project

#### Step 3: Configure App Settings

1. Go to your App → **"Settings"**
2. Click **"Edit"** under **User authentication settings**
3. Configure:
   - **App permissions:** Read and write
   - **Type of App:** Web App, Automated App or Bot
   - **Callback URL:** `http://localhost:3000/api/oauth/twitter/callback`
   - **Website URL:** `http://localhost:3000`

#### Step 4: Get OAuth 2.0 Credentials

1. Go to **"Keys and tokens"** tab
2. Under **OAuth 2.0 Client ID and Client Secret**, click **"Regenerate"**
3. Copy **Client ID** and **Client Secret**

#### Step 5: Add to Environment

```env
TWITTER_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
TWITTER_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Note:** Twitter uses PKCE (Proof Key for Code Exchange) for OAuth 2.0, which is already implemented in the app.

---

### 5.4 LinkedIn OAuth

**Purpose:** Connect LinkedIn profiles for posting professional content.

#### Step 1: Create LinkedIn Developer App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click **"Create app"**
3. Fill in the details:
   - **App name:** Purple Glow Social
   - **LinkedIn Page:** Your company page (create one if needed)
   - **App logo:** Upload your logo
   - **Legal agreement:** Check the box
4. Click **"Create app"**

#### Step 2: Configure OAuth Settings

1. Go to **"Auth"** tab
2. Add **Authorized redirect URLs**:
   ```
   http://localhost:3000/api/oauth/linkedin/callback
   ```
3. Click **"Update"**

#### Step 3: Request Products

1. Go to **"Products"** tab
2. Request access to:
   - **Share on LinkedIn** - Required for posting
   - **Sign In with LinkedIn using OpenID Connect** - For authentication

#### Step 4: Get Credentials

1. Go to **"Auth"** tab
2. Copy **Client ID** and **Client Secret**

#### Step 5: Add to Environment

```env
LINKEDIN_CLIENT_ID=xxxxxxxxxxxx
LINKEDIN_CLIENT_SECRET=xxxxxxxxxxxxxxxx
```

---

### 5.5 OAuth Callback URL Summary

| Provider | Local Development | Production |
|----------|-------------------|------------|
| **Google** | `http://localhost:3000/api/auth/callback/google` | `https://yourdomain.com/api/auth/callback/google` |
| **Facebook** | `http://localhost:3000/api/oauth/facebook/callback` | `https://yourdomain.com/api/oauth/facebook/callback` |
| **Instagram** | `http://localhost:3000/api/oauth/instagram/callback` | `https://yourdomain.com/api/oauth/instagram/callback` |
| **Twitter** | `http://localhost:3000/api/oauth/twitter/callback` | `https://yourdomain.com/api/oauth/twitter/callback` |
| **LinkedIn** | `http://localhost:3000/api/oauth/linkedin/callback` | `https://yourdomain.com/api/oauth/linkedin/callback` |

---

## 6. Running Locally

### Start Development Server

```bash
# Start the development server
npm run dev

# The app will be available at:
# http://localhost:3000
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migration files |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed-test` | Seed test accounts |

### Development Workflow

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Sign up or use test accounts:**
   - Create a new account, or
   - Use pre-seeded test accounts (see Section 8)

4. **Connect social accounts:**
   Navigate to Dashboard → Connected Accounts

5. **Generate content:**
   Navigate to Dashboard → AI Studio

### Hot Reloading

The development server supports hot reloading:
- **React components:** Instant refresh
- **API routes:** Automatic restart
- **CSS (Tailwind):** Instant refresh

### Debugging

```bash
# Run with Node.js inspector
NODE_OPTIONS='--inspect' npm run dev

# Then open chrome://inspect in Chrome
```

---

## 7. Database Migrations

### Understanding Drizzle Migrations

Purple Glow Social uses [Drizzle ORM](https://orm.drizzle.team/) for database management. Drizzle offers two approaches:

1. **`db:push`** - Direct schema push (development)
2. **`db:generate` + `db:push`** - Migration files (production)

### Development: Direct Push

For development, use direct push (faster, no migration files):

```bash
# Push schema changes directly to database
npm run db:push
```

### Production: Migration Files

For production, generate migration files for version control:

```bash
# 1. Generate migration files
npm run db:generate

# 2. Review generated SQL in drizzle/migrations/
# 3. Apply migrations
npm run db:push
```

### View Database

```bash
# Open Drizzle Studio (web interface)
npm run db:studio

# Opens at http://localhost:4983
```

### Common Database Commands

```bash
# Reset database (WARNING: deletes all data)
# 1. Drop all tables in Neon dashboard
# 2. Run: npm run db:push

# Check database connection
npx drizzle-kit check

# View migration history
ls -la drizzle/migrations/
```

### Schema Location

The database schema is defined in:
```
drizzle/schema.ts
```

When you modify this file, run `npm run db:push` to apply changes.

---

## 8. Seeding Test Data

### Seed Test Accounts

Pre-configured test accounts help you test different user tiers and scenarios:

```bash
# Seed all test accounts
npm run db:seed-test
```

### Test Accounts Reference

| Account | Email | Password | Tier | Credits |
|---------|-------|----------|------|---------|
| **Free User** | `free@test.purpleglow.co.za` | `TestFree123!` | Free | 10 |
| **Pro User** | `pro@test.purpleglow.co.za` | `TestPro123!` | Pro | 500 |
| **Business User** | `business@test.purpleglow.co.za` | `TestBiz123!` | Business | 2000 |
| **Admin User** | `admin@test.purpleglow.co.za` | `TestAdmin123!` | Business | 2000 |
| **Low Credit** | `lowcredit@test.purpleglow.co.za` | `TestLow123!` | Pro | 2 |
| **Zero Credit** | `zerocredit@test.purpleglow.co.za` | `TestZero123!` | Pro | 0 |

### Testing Different Scenarios

#### Free Tier Limitations
Login as `free@test.purpleglow.co.za` to test:
- ✅ 5 daily generation limit
- ✅ 5 post queue limit
- ✅ Cannot create automation rules
- ✅ Upgrade prompts appear

#### Pro Tier Features
Login as `pro@test.purpleglow.co.za` to test:
- ✅ 50 daily generation limit
- ✅ 50 post queue limit
- ✅ 5 automation rules limit
- ✅ Credit purchases work

#### Business Tier Features
Login as `business@test.purpleglow.co.za` to test:
- ✅ 200 daily generation limit
- ✅ 200 post queue limit
- ✅ 20 automation rules
- ✅ All features unlocked

#### Low Credit Warnings
Login as `lowcredit@test.purpleglow.co.za` to test:
- ✅ Low credit warning banner
- ✅ Notifications appear
- ✅ Top-up prompts shown

#### Admin Dashboard
Login as `admin@test.purpleglow.co.za` to test:
- ✅ Admin dashboard access
- ✅ User management
- ✅ Analytics overview

---

## 9. Testing

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run with coverage report
npm run test:coverage

# Run with visual UI
npm run test:ui
```

### Test Structure

```
tests/
├── unit/               # Unit tests
│   ├── services/       # Service tests
│   ├── utils/          # Utility tests
│   └── components/     # Component tests
├── integration/        # Integration tests
│   ├── api/            # API route tests
│   └── db/             # Database tests
└── setup.ts            # Test configuration
```

### Current Test Coverage

```
✓ 134 tests passing
✓ Services: 45 tests
✓ API Routes: 38 tests
✓ Components: 31 tests
✓ Utilities: 20 tests
```

### Writing New Tests

```typescript
// Example: Testing a service
import { describe, it, expect } from 'vitest';
import { generateContent } from '@/lib/ai/gemini-service';

describe('AI Service', () => {
  it('should generate content for Instagram', async () => {
    const result = await generateContent({
      platform: 'instagram',
      topic: 'Test topic',
      tone: 'professional',
      language: 'en',
    });
    
    expect(result).toBeDefined();
    expect(result.content).toContain('#');
  });
});
```

### Manual Testing Checklist

Before deploying, manually test:

- [ ] User registration (email + Google OAuth)
- [ ] Login/logout flow
- [ ] Connect social accounts (at least one)
- [ ] Generate AI content
- [ ] Schedule a post
- [ ] View calendar/list views
- [ ] Create automation rule
- [ ] Credit purchase flow (sandbox)
- [ ] Admin dashboard (admin account)
- [ ] Mobile responsiveness
- [ ] Language switching (11 languages)

---

## 10. Troubleshooting Common Issues

### Issue: "Module not found" Errors

**Symptoms:**
```
Error: Cannot find module '@/lib/...'
```

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

---

### Issue: Database Connection Failed

**Symptoms:**
```
Error: Connection to database failed
ECONNREFUSED or ETIMEDOUT
```

**Solutions:**

1. **Check DATABASE_URL format:**
   ```env
   # Correct format (note: ?sslmode=require)
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
   ```

2. **Check Neon database status:**
   - Go to [Neon Dashboard](https://console.neon.tech/)
   - Ensure database is not paused (free tier pauses after inactivity)
   - Click "Wake" if paused

3. **Test connection:**
   ```bash
   # Using psql
   psql "$DATABASE_URL"
   
   # Or using Node.js
   node -e "const { Pool } = require('pg'); new Pool({connectionString: process.env.DATABASE_URL}).query('SELECT 1').then(console.log)"
   ```

---

### Issue: Authentication Not Working

**Symptoms:**
- Login appears successful but redirects back to login
- Session not persisting
- 401 errors on API calls

**Solutions:**

1. **Check BETTER_AUTH_SECRET:**
   ```env
   # Must be at least 32 characters
   BETTER_AUTH_SECRET=your_64_character_secret_here
   ```

2. **Check URL configuration:**
   ```env
   # Both must match exactly
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   ```

3. **Clear browser cookies:**
   - Open DevTools → Application → Cookies
   - Delete all cookies for localhost
   - Try logging in again

4. **Vercel deployment issue:**
   If deploying to `.vercel.app` domain, ensure secure cookies are disabled:
   ```typescript
   // lib/auth.ts should have:
   advanced: {
     useSecureCookies: false, // For .vercel.app domains
   }
   ```

---

### Issue: OAuth Callback Errors

**Symptoms:**
- "Invalid redirect URI"
- "Callback URL mismatch"
- OAuth flow fails after authorization

**Solutions:**

1. **Verify callback URLs match exactly:**
   - Check trailing slashes
   - Check http vs https
   - Check port numbers

2. **For local development:**
   ```
   http://localhost:3000/api/oauth/[platform]/callback
   ```

3. **For production:**
   ```
   https://yourdomain.com/api/oauth/[platform]/callback
   ```

4. **Common mistakes:**
   - ❌ `http://localhost:3000/api/oauth/facebook/callback/` (trailing slash)
   - ❌ `https://localhost:3000/api/oauth/facebook/callback` (https on localhost)
   - ✅ `http://localhost:3000/api/oauth/facebook/callback`

---

### Issue: AI Content Generation Fails

**Symptoms:**
- "Failed to generate content"
- Empty responses from AI
- 500 errors on /api/ai/generate

**Solutions:**

1. **Check GEMINI_API_KEY:**
   ```env
   GEMINI_API_KEY=your_valid_api_key
   ```

2. **Verify API key is active:**
   - Go to [Google AI Studio](https://makersuite.google.com/)
   - Test your key in the playground

3. **Check rate limits:**
   - Free tier: 60 requests/minute
   - If exceeded, wait and retry

4. **Check credits:**
   - User must have available credits
   - Credits are checked before generation

---

### Issue: Styling/Tailwind Not Working

**Symptoms:**
- Styles not applied
- Classes not recognized
- Layout broken

**Solutions:**

1. **Restart development server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check Tailwind config:**
   - Ensure `tailwind.config.ts` includes all content paths
   - Verify PostCSS is configured

---

### Issue: TypeScript Errors

**Symptoms:**
- Red squiggly lines in VS Code
- Build fails with type errors

**Solutions:**

1. **Restart TypeScript server in VS Code:**
   - Press `Cmd/Ctrl + Shift + P`
   - Type "TypeScript: Restart TS Server"
   - Press Enter

2. **Update TypeScript:**
   ```bash
   npm install typescript@latest
   ```

3. **Regenerate types:**
   ```bash
   npm run build
   ```

---

### Issue: Port 3000 Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Find and kill the process:**
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 <PID>
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Use a different port:**
   ```bash
   PORT=3001 npm run dev
   ```

---

### Getting More Help

If you're still stuck:

1. **Check the docs:**
   - [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Full troubleshooting runbook
   - [docs/PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md) - Deployment issues

2. **Search existing issues:**
   - [GitHub Issues](https://github.com/LeroyAdonis/purple-glow-social-2.0/issues)

3. **Check logs:**
   ```bash
   # View server logs
   npm run dev 2>&1 | tee server.log
   
   # View database logs in Neon dashboard
   ```

4. **Ask for help:**
   - Create a GitHub issue with:
     - Error message
     - Steps to reproduce
     - Environment (OS, Node version)
     - Relevant logs

---

## 🎉 You're All Set!

Congratulations! You now have Purple Glow Social 2.0 running locally.

### Next Steps

1. **Explore the app:**
   - Create an account or use test accounts
   - Connect a social account
   - Generate AI content

2. **Read the documentation:**
   - [AGENTS.md](./AGENTS.md) - Full architecture overview
   - [docs/COMPONENT_GUIDE.md](./docs/COMPONENT_GUIDE.md) - Component reference

3. **Deploy to production:**
   - [docs/PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md)

---

**Built with ❤️ for South African Businesses** 🇿🇦

*Sharp sharp! Lekker coding!* 🚀
