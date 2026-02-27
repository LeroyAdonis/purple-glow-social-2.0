# Production Deployment Checklist - Purple Glow Social 2.0

## Pre-Deployment Verification

### ✅ Code Quality
- [x] All unit tests passing (128/128)
- [x] All regression tests passing (58/58)
- [ ] Build successful with production config
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code review completed
- [ ] Security audit completed

### ✅ Environment Configuration
- [ ] **Vercel Project Setup**
  - [ ] Project created in Vercel
  - [ ] Connected to GitHub repository
  - [ ] Production branch configured
  - [ ] Custom domain configured (optional)

### 🔑 Environment Variables (Required)

#### Database
```bash
DATABASE_URL=                    # Neon PostgreSQL connection string
```

#### Authentication
```bash
BETTER_AUTH_SECRET=              # Min 32 characters (generate with: openssl rand -base64 32)
BETTER_AUTH_URL=                 # Production URL (e.g., https://purpleglowsocial.com)
NEXT_PUBLIC_BETTER_AUTH_URL=     # Same as BETTER_AUTH_URL
```

#### OAuth - Login Providers
```bash
GOOGLE_CLIENT_ID=                # Google OAuth for user login
GOOGLE_CLIENT_SECRET=
```

#### OAuth - Social Media Platforms
```bash
# Facebook/Instagram
META_APP_ID=
META_APP_SECRET=

# Twitter/X
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
```

#### AI Content Generation
```bash
GEMINI_API_KEY=                  # Google Gemini Pro API key
```

#### Payment Processing
```bash
POLAR_ACCESS_TOKEN=              # Polar.sh API token
POLAR_ORGANIZATION_ID=           # Polar.sh org ID
POLAR_WEBHOOK_SECRET=            # For webhook signature verification
```

#### Security
```bash
TOKEN_ENCRYPTION_KEY=            # 64-character hex string (32 bytes for AES-256)
CRON_SECRET=                     # For cron job authentication
```

#### Job Processing
```bash
INNGEST_SIGNING_KEY=             # Inngest webhook signature verification
INNGEST_EVENT_KEY=               # Inngest event key (optional)
```

#### Storage
```bash
BLOB_READ_WRITE_TOKEN=           # Vercel Blob storage token
```

#### Monitoring (Optional but Recommended)
```bash
NEXT_PUBLIC_SENTRY_DSN=          # Sentry error tracking
SENTRY_DSN=                      # Server-side Sentry
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=               # For source map uploads
```

#### Rate Limiting (Optional but Recommended)
```bash
UPSTASH_REDIS_REST_URL=          # Upstash Redis for rate limiting
UPSTASH_REDIS_REST_TOKEN=
```

#### Admin
```bash
ADMIN_EMAILS=                    # Comma-separated admin emails
```

### 📊 Third-Party Service Setup

#### 1. Neon Database
- [ ] Database created
- [ ] Connection string obtained
- [ ] Connection pooling enabled
- [ ] Run migrations: `npm run db:push`
- [ ] (Optional) Seed test accounts: `npm run db:seed-test`

#### 2. Google Cloud Platform
- [ ] Project created
- [ ] OAuth 2.0 credentials configured
- [ ] Authorized redirect URIs added:
  - `https://your-domain.com/api/auth/callback/google`
- [ ] Gemini API enabled
- [ ] API key generated

#### 3. Meta (Facebook/Instagram)
- [ ] App created in Meta Developers
- [ ] App reviewed and approved for production
- [ ] Required permissions granted:
  - `pages_show_list`
  - `pages_manage_posts`
  - `instagram_basic`
  - `instagram_content_publish`
- [ ] OAuth redirect URIs configured

#### 4. Twitter/X Developer
- [ ] App created in Twitter Developer Portal
- [ ] Elevated access granted
- [ ] OAuth 2.0 enabled with PKCE
- [ ] Callback URLs configured

#### 5. LinkedIn Developers
- [ ] App created
- [ ] Required products added:
  - Sign In with LinkedIn
  - Share on LinkedIn
- [ ] Redirect URIs configured

#### 6. Polar.sh
- [ ] Organization created
- [ ] Products configured (Free/Pro/Business tiers)
- [ ] Credit packages configured
- [ ] Webhooks configured:
  - Webhook URL: `https://your-domain.com/api/webhooks/polar`
  - Events: subscription.created, order.created, etc.

#### 7. Inngest (Job Processing)
- [ ] Account created
- [ ] App created
- [ ] Webhook configured
- [ ] Keys obtained

#### 8. Sentry (Error Tracking) - Optional
- [ ] Project created
- [ ] DSN obtained
- [ ] Source maps upload configured
- [ ] Release tracking enabled

#### 9. Upstash (Rate Limiting) - Optional
- [ ] Redis database created
- [ ] REST API credentials obtained

### 🧪 Testing Checklist

#### Automated Tests
- [x] Unit tests: `npm run test:run` (128/128 ✓)
- [x] Regression tests: `npm run regression-test` (58/58 ✓)
- [ ] Build test: `npm run build`

#### Manual Testing (Production-like Environment)
- [ ] **Authentication**
  - [ ] Email/password signup
  - [ ] Email/password login
  - [ ] Google OAuth login
  - [ ] Logout
  - [ ] Session persistence

- [ ] **OAuth Connections**
  - [ ] Connect Facebook account
  - [ ] Connect Instagram account
  - [ ] Connect Twitter/X account
  - [ ] Connect LinkedIn account
  - [ ] Disconnect accounts

- [ ] **AI Content Generation**
  - [ ] Generate content (all 11 languages)
  - [ ] Generate hashtags
  - [ ] Topic suggestions
  - [ ] Different tones (professional, casual, etc.)
  - [ ] Platform-specific content

- [ ] **Post Publishing**
  - [ ] Immediate post to Facebook
  - [ ] Immediate post to Instagram
  - [ ] Immediate post to Twitter
  - [ ] Immediate post to LinkedIn
  - [ ] Schedule posts
  - [ ] Edit scheduled posts
  - [ ] Delete scheduled posts

- [ ] **Payment Processing**
  - [ ] Subscribe to Pro plan
  - [ ] Subscribe to Business plan
  - [ ] Purchase credit packages
  - [ ] Webhook processing (test mode)
  - [ ] Subscription renewal
  - [ ] Credit expiry

- [ ] **Admin Dashboard**
  - [ ] View user list
  - [ ] Update user tier
  - [ ] Add/remove credits
  - [ ] View transactions
  - [ ] View analytics
  - [ ] Monitor jobs
  - [ ] Retry failed jobs

- [ ] **Automation Rules**
  - [ ] Create automation rule
  - [ ] Execute automation
  - [ ] Edit automation rule
  - [ ] Delete automation rule

- [ ] **Internationalization**
  - [ ] Test all 11 SA languages
  - [ ] Verify translations display correctly
  - [ ] Language switcher works

- [ ] **Error Handling**
  - [ ] Invalid credentials
  - [ ] OAuth failures
  - [ ] API failures
  - [ ] Network issues
  - [ ] Rate limiting
  - [ ] Credit exhaustion

#### Browser Testing
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Edge (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (mobile)

#### Responsive Design
- [ ] Mobile (320px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px+)
- [ ] Large desktop (1920px+)

### 🔒 Security Checklist

- [ ] **Environment Variables**
  - [ ] All secrets in Vercel environment variables
  - [ ] No secrets in code
  - [ ] `.env` files in `.gitignore`
  - [ ] Secrets rotated if exposed

- [ ] **Authentication**
  - [ ] BETTER_AUTH_SECRET is strong (≥32 chars)
  - [ ] Session cookies are HTTP-only
  - [ ] CSRF protection enabled
  - [ ] Secure cookies on HTTPS only

- [ ] **OAuth**
  - [ ] All OAuth tokens encrypted (AES-256-GCM)
  - [ ] Tokens stored in database, not localStorage
  - [ ] State parameter validation
  - [ ] Redirect URI validation

- [ ] **API Security**
  - [ ] Rate limiting enabled
  - [ ] Input validation (Zod schemas)
  - [ ] SQL injection protection (Drizzle ORM)
  - [ ] XSS protection (React auto-escaping)

- [ ] **Headers**
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Referrer-Policy configured
  - [ ] Permissions-Policy configured

- [ ] **Dependencies**
  - [ ] No known vulnerabilities: `npm audit`
  - [ ] Dependencies up to date
  - [ ] No unused dependencies

### ⚡ Performance Checklist

- [ ] **Build Optimization**
  - [ ] Build size < 500KB (gzipped)
  - [ ] Lazy loading implemented
  - [ ] Code splitting configured
  - [ ] Tree shaking enabled

- [ ] **Assets**
  - [ ] Images optimized (Next.js Image)
  - [ ] Fonts loaded efficiently (CSS @import)
  - [ ] Icons loaded from CDN

- [ ] **Caching**
  - [ ] React Query configured
  - [ ] API response caching
  - [ ] Static assets cached

- [ ] **Database**
  - [ ] Indexes on frequently queried columns
  - [ ] Connection pooling enabled
  - [ ] Query optimization

- [ ] **Monitoring**
  - [ ] Vercel Analytics enabled
  - [ ] Sentry error tracking configured
  - [ ] Performance metrics tracked

### 📚 Documentation Review

- [x] `README.md` updated
- [x] `AGENTS.md` comprehensive
- [x] API documentation complete
- [x] Deployment guide exists
- [x] Troubleshooting guide exists
- [ ] Environment variables documented
- [ ] Known issues documented
- [ ] Rollback procedures documented

## Deployment Steps

### 1. Pre-Deployment

```bash
# 1. Verify all tests pass
npm run test:run
npm run regression-test

# 2. Build the application
SKIP_ENV_VALIDATION=true npm run build

# 3. Check for issues
npm audit
```

### 2. Database Migration

```bash
# Generate and apply migrations
npm run db:generate
npm run db:push

# (Optional) Seed test accounts
npm run db:seed-test
```

### 3. Vercel Deployment

#### Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Via GitHub Integration
1. Push to `main` branch
2. Vercel automatically deploys
3. Monitor deployment in Vercel dashboard

### 4. Post-Deployment Verification

#### Immediate Checks (0-5 minutes)
- [ ] Site is accessible
- [ ] Homepage loads correctly
- [ ] Login works
- [ ] Database connection successful
- [ ] No errors in Sentry

#### Short-term Checks (5-30 minutes)
- [ ] OAuth connections work
- [ ] Content generation works
- [ ] Post publishing works
- [ ] Payments work (test mode)
- [ ] Cron jobs execute

#### Medium-term Checks (1-24 hours)
- [ ] Scheduled posts publish correctly
- [ ] Automation rules execute
- [ ] Webhook events process
- [ ] No memory leaks
- [ ] No performance degradation

### 5. Monitoring Setup

- [ ] Set up Vercel alerts
- [ ] Configure Sentry notifications
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Monitor error rates
- [ ] Monitor API response times

## Rollback Procedure

If critical issues are detected:

### Option 1: Instant Rollback (Vercel Dashboard)
1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find previous working deployment
4. Click "Promote to Production"

### Option 2: Revert Git Commit
```bash
# Revert to previous commit
git revert HEAD

# Push to trigger new deployment
git push origin main
```

### Option 3: Redeploy Previous Version
```bash
# Deploy specific commit
vercel --prod --commit=<previous-commit-sha>
```

## Post-Launch Checklist

### First 24 Hours
- [ ] Monitor error rates continuously
- [ ] Check user signups and conversions
- [ ] Verify payment processing
- [ ] Monitor API response times
- [ ] Check cron job execution
- [ ] Verify scheduled posts publishing

### First Week
- [ ] Gather user feedback
- [ ] Identify optimization opportunities
- [ ] Address minor bugs
- [ ] Monitor resource usage
- [ ] Check credit system accuracy

### First Month
- [ ] Performance optimization
- [ ] Feature enhancements
- [ ] User retention analysis
- [ ] Revenue tracking
- [ ] Customer support patterns

## Success Metrics

### Technical
- ✅ Uptime: 99.9%
- ✅ Error rate: < 0.1%
- ✅ API response time: < 500ms (p95)
- ✅ Database query time: < 100ms (p90)
- ✅ Test coverage: > 70%
- ✅ Lighthouse score: > 90

### Business
- ⏳ User signups: Track daily/weekly/monthly
- ⏳ Free → Paid conversion: > 5%
- ⏳ Churn rate: < 5% monthly
- ⏳ MRR growth: Track month-over-month
- ⏳ Customer satisfaction: NPS > 50

## Support & Escalation

### Severity Levels

#### P0 - Critical (Site Down)
- **Response:** Immediate
- **Action:** All hands on deck, rollback if needed
- **Examples:** Database down, auth broken, site unreachable

#### P1 - High (Major Feature Broken)
- **Response:** < 1 hour
- **Action:** Hotfix and deploy
- **Examples:** Payments broken, posts not publishing

#### P2 - Medium (Minor Feature Issues)
- **Response:** < 4 hours
- **Action:** Fix in next deployment
- **Examples:** UI glitches, minor bugs

#### P3 - Low (Enhancement/Optimization)
- **Response:** < 1 week
- **Action:** Include in next sprint
- **Examples:** Performance improvements, new features

## Contact Information

- **Technical Lead:** [Your Name]
- **Email:** [your-email]
- **Emergency:** [emergency-contact]
- **Slack Channel:** #purple-glow-production

---

**Last Updated:** 2025-12-17
**Version:** 1.0
**Status:** ✅ Ready for Production Deployment
