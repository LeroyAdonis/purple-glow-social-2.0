# 🚀 Purple Glow Social - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Development Complete

- [x] Phase 1-2: Foundation & UI
- [x] Phase 3: Payments & Admin
- [x] Phase 4: Internationalization (11 languages)
- [x] Phase 5: Automation & Scheduling
- [x] Phase 6: Integration & Polish
- [x] Phase 7: OAuth UI Components
- [x] Phase 8: Authentication & OAuth Backend
- [x] Phase 9: Auto-Posting Feature
- [x] Phase 10: AI Content Generation

### 🔐 Security Review

- [x] Token encryption (AES-256-GCM)
- [x] CSRF protection on OAuth flows
- [x] PKCE for Twitter OAuth 2.0
- [x] HttpOnly, Secure cookies
- [x] Password hashing (Better-auth/bcrypt)
- [x] SQL injection prevention (Drizzle ORM)
- [x] XSS protection (React escaping)
- [x] Environment variables for all secrets

---

## 🌐 Deployment Platform: Vercel

### Why Vercel?

- ✅ Next.js native support
- ✅ Zero-config deployment
- ✅ Edge functions for OAuth
- ✅ Cron jobs built-in
- ✅ Environment variable management
- ✅ Free SSL/HTTPS
- ✅ Global CDN
- ✅ Automatic scaling

---

## 📝 Step-by-Step Deployment

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git status

# Push to GitHub
git push origin feature/social-auth-oauth-integration

# Merge to main branch (recommended)
git checkout main
git merge feature/social-auth-oauth-integration
git push origin main
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next
   - **Install Command:** `npm install`

### Step 3: Configure Environment Variables

Go to **Project Settings → Environment Variables** and add:

#### Database

```
DATABASE_URL=postgresql://[YOUR_NEON_URL]
```

#### Better-auth

```
BETTER_AUTH_SECRET=[Generate new 32-char secret]
BETTER_AUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.vercel.app
```

Generate secret:

```bash
openssl rand -base64 32
```

#### Google OAuth (for login)

```
GOOGLE_CLIENT_ID=[Your Google OAuth Client ID]
GOOGLE_CLIENT_SECRET=[Your Google OAuth Client Secret]
```

Setup at: [Google Cloud Console](https://console.cloud.google.com)

- Authorized redirect URIs:
  - `https://your-domain.vercel.app/api/auth/callback/google`

#### Meta/Facebook (for Instagram & Facebook posting)

```
META_APP_ID=[Your Meta App ID]
META_APP_SECRET=[Your Meta App Secret]
```

Setup at: [Meta for Developers](https://developers.facebook.com)

- Authorized redirect URIs:
  - `https://your-domain.vercel.app/api/oauth/facebook/callback`
  - `https://your-domain.vercel.app/api/oauth/instagram/callback`

#### Twitter/X

```
TWITTER_CLIENT_ID=[Your Twitter Client ID]
TWITTER_CLIENT_SECRET=[Your Twitter Client Secret]
```

Setup at: [Twitter Developer Portal](https://developer.twitter.com)

- Authorized redirect URIs:
  - `https://your-domain.vercel.app/api/oauth/twitter/callback`

#### LinkedIn

```
LINKEDIN_CLIENT_ID=[Your LinkedIn Client ID]
LINKEDIN_CLIENT_SECRET=[Your LinkedIn Client Secret]
```

Setup at: [LinkedIn Developers](https://www.linkedin.com/developers)

- Authorized redirect URIs:
  - `https://your-domain.vercel.app/api/oauth/linkedin/callback`

#### AI & Storage

```
GEMINI_API_KEY=[Your Google Gemini API Key]
API_KEY=[Your Google Gemini API Key - fallback]
TOKEN_ENCRYPTION_KEY=[Your 64-char hex encryption key]
BLOB_READ_WRITE_TOKEN=[Vercel Blob token - auto-created]
```

Generate encryption key:

```bash
openssl rand -hex 32
```

#### Job Processing (Inngest)

```
INNGEST_SIGNING_KEY=[Your Inngest Signing Key]
INNGEST_EVENT_KEY=[Your Inngest Event Key - optional]
INNGEST_EVENT_API_URL=[Inngest Events API URL - optional, defaults to app.inngest.com]
```

Setup at: [Inngest Dashboard](https://app.inngest.com)

- Create new app
- Copy signing key for webhook verification
- Event key for sending events (optional)
- API URL is usually `https://app.inngest.com/api/v1/events`

**Note:** Cron jobs are no longer needed - Inngest handles all scheduled processing with better reliability and retry logic.

### Step 4: Configure OAuth Redirect URIs

Update all OAuth apps with production URLs:

**Google OAuth:**

- Authorized JavaScript origins: `https://your-domain.vercel.app`
- Authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`

**Meta (Facebook/Instagram):**

- Valid OAuth Redirect URIs:
  - `https://your-domain.vercel.app/api/oauth/facebook/callback`
  - `https://your-domain.vercel.app/api/oauth/instagram/callback`

**Twitter:**

- Callback URLs: `https://your-domain.vercel.app/api/oauth/twitter/callback`

**LinkedIn:**

- Authorized redirect URLs: `https://your-domain.vercel.app/api/oauth/linkedin/callback`

### Step 5: Deploy

```bash
# Option 1: Deploy from Vercel Dashboard
# Click "Deploy" button

# Option 2: Deploy from CLI
npm i -g vercel
vercel login
vercel --prod
```

### Step 6: Set Up Inngest Integration

1. **Run Database Migration:**

   ```bash
   npm run db:push  # Apply the Inngest integration migration
   ```

2. **Configure Inngest Database Settings:**

   ```bash
   npm run inngest:setup  # Set up database triggers and test connection
   ```

3. **Configure Inngest Webhook:**
   - Go to [Inngest Dashboard](https://app.inngest.com)
   - Create app: "Purple Glow Social"
   - Set webhook URL: `https://your-domain.vercel.app/api/inngest`
   - Copy signing key to `INNGEST_SIGNING_KEY` environment variable

**Note:** Database triggers will automatically send events to Inngest when:

- Posts are scheduled or status changes
- Credit reservations are created/updated
- User credits change (low credit warnings)

**Note:** Inngest replaces the old Vercel cron jobs. All scheduled post processing is now handled by Inngest functions with retry logic and better reliability.

### Step 7: Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `purpleglowsocial.co.za`)
3. Update DNS records as instructed by Vercel
4. Update all OAuth redirect URIs to use custom domain
5. Update environment variables:
   ```
   BETTER_AUTH_URL=https://purpleglowsocial.co.za
   NEXT_PUBLIC_BETTER_AUTH_URL=https://purpleglowsocial.co.za
   ```

---

## 🧪 Post-Deployment Testing

### Test Authentication

1. ✅ Register new account with email/password
2. ✅ Login with email/password
3. ✅ Login with Google OAuth
4. ✅ Logout
5. ✅ Protected routes redirect to login

### Test OAuth Connections

1. ✅ Connect Facebook account
2. ✅ Connect Instagram Business account
3. ✅ Connect Twitter account
4. ✅ Connect LinkedIn account
5. ✅ Disconnect accounts
6. ✅ Verify tokens are encrypted in database

### Test AI Content Generation

1. ✅ Generate content for Twitter
2. ✅ Generate content for Instagram
3. ✅ Generate content for Facebook
4. ✅ Generate content for LinkedIn
5. ✅ Test different tones
6. ✅ Test different languages
7. ✅ Verify credits deduct correctly
8. ✅ Test with 0 credits

### Test Auto-Posting

1. ✅ Post immediately to Twitter
2. ✅ Post immediately to Instagram (with image)
3. ✅ Schedule post for 2 minutes in future
4. ✅ Wait for cron to publish
5. ✅ Verify post appears on platform
6. ✅ Check database for platform post ID and URL

### Test Scheduling System

1. ✅ Create automation rule
2. ✅ Activate automation rule
3. ✅ View scheduled posts in calendar
4. ✅ Edit scheduled post
5. ✅ Delete scheduled post

---

## 🔍 Monitoring Setup

### 1. Vercel Analytics (Built-in)

Already enabled automatically:

- Page views
- Visitor analytics
- Performance metrics

### 2. Error Monitoring (Sentry)

Install Sentry:

```bash
npm install @sentry/nextjs
```

Initialize:

```bash
npx @sentry/wizard@latest -i nextjs
```

Add to environment variables:

```
NEXT_PUBLIC_SENTRY_DSN=[Your Sentry DSN]
SENTRY_AUTH_TOKEN=[Your Sentry Auth Token]
```

### 3. Application Monitoring

Create monitoring dashboard to track:

- User registrations
- OAuth connections
- AI generations
- Posts published
- Credits used
- Error rates

### 4. Uptime Monitoring

Use services like:

- [Uptime Robot](https://uptimerobot.com) (Free)
- [Pingdom](https://www.pingdom.com)
- [Better Uptime](https://betteruptime.com)

Monitor endpoints:

- `https://your-domain.vercel.app/` (200 OK)
- `https://your-domain.vercel.app/api/health` (create health check)

---

## 📊 Database Management

### Neon Console

Access at: [console.neon.tech](https://console.neon.tech)

**Regular Tasks:**

- Monitor database size
- Check connection pooling
- Review query performance
- Set up automated backups

**Backup Strategy:**

```sql
-- Manual backup
pg_dump $DATABASE_URL > backup.sql

-- Restore
psql $DATABASE_URL < backup.sql
```

**Monitoring Queries:**

```sql
-- Active users count
SELECT COUNT(*) FROM "user";

-- Posts by status
SELECT status, COUNT(*) FROM posts GROUP BY status;

-- Credits distribution
SELECT tier, AVG(credits), SUM(credits) FROM "user" GROUP BY tier;

-- Connected accounts by platform
SELECT platform, COUNT(*) FROM connected_account GROUP BY platform;
```

---

## 🚨 Incident Response

### Common Issues & Solutions

#### Issue: Scheduled posts not processing

**Solution:**

1. Check Inngest dashboard for function runs
2. Verify `INNGEST_SIGNING_KEY` is correct
3. Check webhook URL is accessible: `POST /api/inngest`
4. Review Inngest function logs for errors
5. Test manual trigger if needed

#### Issue: OAuth connection fails

**Solution:**

1. Check redirect URI matches exactly
2. Verify OAuth credentials in environment variables
3. Check OAuth app status (not in development mode)
4. Review logs for specific error messages

#### Issue: AI generation fails

**Solution:**

1. Verify `GEMINI_API_KEY` is correct
2. Check Gemini API quota/limits
3. Review error logs
4. Test with simple topic

#### Issue: Database connection errors

**Solution:**

1. Check `DATABASE_URL` is correct
2. Verify Neon database is active
3. Check connection pooling limits
4. Review Neon console for issues

#### Issue: Image upload fails

**Solution:**

1. Verify `BLOB_READ_WRITE_TOKEN` exists
2. Check Vercel Blob storage quota
3. Ensure image URL is accessible
4. Check file size limits

---

## 📈 Scaling Considerations

### Current Limits (Vercel Free Tier)

- **Bandwidth:** 100GB/month
- **Serverless Function Execution:** 100GB-hours
- **Edge Function Execution:** 1M invocations
- **Cron Jobs:** Not used (Inngest handles scheduling)

### When to Upgrade (Vercel Pro - $20/month)

- 1TB bandwidth
- 1000GB-hours execution
- 100M edge invocations
- Team collaboration
- (Cron jobs not needed - using Inngest)

### Database Scaling (Neon)

**Current:** Free tier

- 0.5 GB storage
- 1 concurrent connection

**Upgrade when:**

- Storage > 0.5 GB
- Need more connections
- Require auto-scaling

**Neon Pro ($19/month):**

- 10 GB storage
- Auto-scaling compute
- Multiple branches
- Point-in-time restore

---

## 💰 Cost Estimates

### Monthly Costs (Production)

**Infrastructure:**

- Vercel Pro: $20/month (recommended for production)
- Neon Pro: $19/month (as you scale)
- Domain: $10-15/year

**APIs:**

- Google Gemini: Pay-per-use (~$0.0005 per generation)
- Google Imagen: Pay-per-use (~$0.04 per image)
- Meta API: Free (within limits)
- Twitter API: Free or $100/month (depends on plan)
- LinkedIn API: Free

**Monitoring:**

- Sentry: Free tier (5k events/month) or $26/month
- Analytics: Free (Vercel built-in)

**Total Estimate:**

- **Minimum (launch):** ~$50/month
- **Growth phase:** ~$100-200/month
- **Scaled (1000+ users):** ~$500+/month

---

## 🎯 Launch Checklist

### Pre-Launch (Technical)

- [ ] All environment variables set in production
- [ ] OAuth apps approved and configured
- [ ] Database migrations applied
- [ ] Cron job verified working
- [ ] SSL/HTTPS enabled
- [ ] Error monitoring configured (Sentry)
- [ ] Uptime monitoring configured
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit passed

### Pre-Launch (Business)

- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Pricing page finalized
- [ ] Payment processing tested (Polar)
- [ ] Support email configured
- [ ] Help/FAQ documentation
- [ ] User onboarding flow tested
- [ ] Demo video created
- [ ] Landing page optimized

### Launch Day

- [ ] Deploy to production
- [ ] Verify all features work
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Social media announcement
- [ ] Email beta users
- [ ] Press release (if applicable)
- [ ] Submit to Product Hunt
- [ ] Update documentation

### Post-Launch (Week 1)

- [ ] Daily monitoring
- [ ] User feedback collection
- [ ] Bug fixes as needed
- [ ] Performance optimization
- [ ] Content marketing
- [ ] Community engagement
- [ ] Analytics review

---

## 📞 Support & Maintenance

### Daily Tasks

- Monitor error logs (Sentry)
- Check uptime (monitoring service)
- Review user feedback
- Respond to support requests

### Weekly Tasks

- Review analytics
- Check database performance
- Update documentation
- Plan feature improvements
- Security updates

### Monthly Tasks

- Backup database
- Review costs
- API quota checks
- User growth analysis
- Feature roadmap review

---

## 🔗 Useful Links

**Documentation:**

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Drizzle ORM: https://orm.drizzle.team
- Better-auth: https://www.better-auth.com/docs

**APIs:**

- Google Gemini: https://ai.google.dev
- Meta for Developers: https://developers.facebook.com
- Twitter Developer: https://developer.twitter.com
- LinkedIn Developers: https://www.linkedin.com/developers

**Monitoring:**

- Vercel Analytics: https://vercel.com/analytics
- Sentry: https://sentry.io
- Neon Console: https://console.neon.tech

---

## 🎉 You're Ready to Launch!

Purple Glow Social is **production-ready** with:

- ✅ Complete authentication system
- ✅ OAuth integration (4 platforms)
- ✅ AI content generation
- ✅ Auto-posting functionality
- ✅ Automated scheduling
- ✅ Multi-language support
- ✅ Credit management
- ✅ Enterprise security

**Next Steps:**

1. Deploy to Vercel
2. Configure all OAuth apps
3. Test thoroughly
4. Launch! 🚀

---

_Good luck with your launch!_ 🇿🇦✨

**Questions?** Review this guide and the phase completion documents for detailed information on each system.
