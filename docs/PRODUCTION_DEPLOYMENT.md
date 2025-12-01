# Purple Glow Social 2.0 - Production Deployment Guide

## Overview

This guide covers deploying Purple Glow Social 2.0 to production using Vercel.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Neon Database** - PostgreSQL database at [neon.tech](https://neon.tech)
3. **Polar.sh Account** - Payments at [polar.sh](https://polar.sh)
4. **Google Cloud Console** - For Gemini AI and OAuth
5. **Social Platform Developer Accounts** - Meta, Twitter, LinkedIn

---

## Step 1: Database Setup (Neon)

1. Create a Neon account and project
2. Copy the connection string
3. Run database migrations:
   ```bash
   npm run db:push
   ```

---

## Step 2: Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require

# Authentication
BETTER_AUTH_SECRET=<generate-64-char-secret>
BETTER_AUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.vercel.app
```

### Generate Secrets

```bash
# Generate BETTER_AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate TOKEN_ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate CRON_SECRET
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Optional but Recommended

```env
# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# AI Content Generation
GEMINI_API_KEY=xxx

# Social Platform OAuth
META_APP_ID=xxx
META_APP_SECRET=xxx
TWITTER_CLIENT_ID=xxx
TWITTER_CLIENT_SECRET=xxx
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx

# Payments
POLAR_ACCESS_TOKEN=xxx
POLAR_ORGANIZATION_ID=xxx
POLAR_WEBHOOK_SECRET=xxx
POLAR_SERVER=production

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=xxx
SENTRY_DSN=xxx

# Rate Limiting
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx

# Token Encryption
TOKEN_ENCRYPTION_KEY=<64-char-hex>

# Admin
ADMIN_EMAILS=admin@yourdomain.com
```

---

## Step 3: Vercel Deployment

### Option A: GitHub Integration (Recommended)

1. Push code to GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## Step 4: Configure OAuth Callbacks

Update OAuth callback URLs for each provider:

### Google OAuth
- Console: [console.cloud.google.com](https://console.cloud.google.com)
- Add authorized redirect URI:
  ```
  https://your-domain.vercel.app/api/auth/callback/google
  ```

### Meta (Facebook/Instagram)
- Console: [developers.facebook.com](https://developers.facebook.com)
- Add OAuth redirect URIs:
  ```
  https://your-domain.vercel.app/api/oauth/facebook/callback
  https://your-domain.vercel.app/api/oauth/instagram/callback
  ```

### Twitter/X
- Console: [developer.twitter.com](https://developer.twitter.com)
- Add callback URL:
  ```
  https://your-domain.vercel.app/api/oauth/twitter/callback
  ```

### LinkedIn
- Console: [linkedin.com/developers](https://www.linkedin.com/developers/)
- Add authorized redirect URL:
  ```
  https://your-domain.vercel.app/api/oauth/linkedin/callback
  ```

---

## Step 5: Configure Webhooks

### Polar Webhooks
1. Go to Polar.sh dashboard
2. Add webhook endpoint:
   ```
   https://your-domain.vercel.app/api/webhooks/polar
   ```
3. Copy webhook secret to `POLAR_WEBHOOK_SECRET`

---

## Step 6: Set Up Cron Jobs

### Vercel Cron (vercel.json)

The cron job is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled-posts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes to process scheduled posts.

---

## Step 7: Monitoring Setup

### Sentry (Error Tracking)
1. Create account at [sentry.io](https://sentry.io)
2. Create a Next.js project
3. Copy DSN to environment variables
4. Configure alerts for errors

### Upstash Redis (Rate Limiting)
1. Create account at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy REST URL and token to environment variables

---

## Step 8: Custom Domain (Optional)

1. Go to Vercel project settings
2. Navigate to Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update environment variables with new domain

---

## Post-Deployment Checklist

- [ ] Verify login works (email + Google OAuth)
- [ ] Test content generation
- [ ] Test social platform connections
- [ ] Test scheduled post publishing
- [ ] Verify payment flows
- [ ] Check error tracking in Sentry
- [ ] Confirm cron jobs are running
- [ ] Test rate limiting
- [ ] Check admin dashboard access

---

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### OAuth Errors
- Verify callback URLs match exactly
- Check client ID/secret are correct
- Ensure app is approved/published on the platform

### Cron Job Not Running
- Check Vercel cron logs in dashboard
- Verify CRON_SECRET is set
- Check that cron path is accessible

### Rate Limiting Not Working
- Verify Upstash Redis is connected
- Falls back to in-memory (less effective)

---

## Scaling Considerations

### Database
- Neon auto-scales, but monitor connection limits
- Consider connection pooling for high traffic

### Rate Limiting
- Use Upstash Redis for distributed rate limiting
- Adjust limits based on usage patterns

### Caching
- React Query handles client-side caching
- Consider Vercel Edge Config for server-side

---

## Security Checklist

- [ ] All secrets in Vercel environment variables (not in code)
- [ ] TOKEN_ENCRYPTION_KEY is unique and secret
- [ ] Admin emails list is restricted
- [ ] OAuth apps are in production mode
- [ ] Webhook secrets are configured
- [ ] Rate limiting is enabled
- [ ] Security headers are active (via next.config.js)

---

## Support

For deployment issues:
- Check Vercel deployment logs
- Review Sentry for errors
- Check Neon database logs
- Review OAuth provider dashboards
