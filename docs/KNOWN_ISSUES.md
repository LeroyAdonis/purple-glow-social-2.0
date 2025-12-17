# Known Issues & Limitations - Purple Glow Social 2.0

## Known Issues

### Build & Development

#### 1. Google Fonts Network Dependency
**Status:** ✅ RESOLVED  
**Impact:** Low  
**Description:** Next.js build would fail if Google Fonts CDN was unreachable.  
**Solution:** Changed from `next/font/google` to CSS @import for better reliability.  
**Workaround:** Fonts will gracefully fallback to system fonts if CDN is down.

#### 2. Environment Validation During Build
**Status:** ✅ RESOLVED  
**Impact:** Medium  
**Description:** Build would fail without all production environment variables set.  
**Solution:** Added `SKIP_ENV_VALIDATION` flag and improved validation logic.  
**Workaround:** Set `SKIP_ENV_VALIDATION=true` during build if secrets aren't available.

### Authentication & OAuth

#### 3. Vercel `.vercel.app` Domain Cookie Issue
**Status:** ⚠️ DOCUMENTED  
**Impact:** Critical (if using .vercel.app domain)  
**Description:** The `.vercel.app` domain is on the Public Suffix List, causing browsers to reject `__Secure-` cookie prefix. This breaks authentication silently - login appears to work but sessions aren't persisted.  
**Solution:** Better-auth configured to disable secure cookie prefix on Vercel shared domains.  
**Workaround:** Use a custom domain for production, or ensure `useSecureCookies` is properly configured.  
**Reference:** `lib/auth.ts` lines 69-75, AGENTS.md

#### 4. OAuth Token Refresh
**Status:** ⏳ IN PROGRESS  
**Impact:** Medium  
**Description:** OAuth tokens expire and need periodic refresh. Current implementation has basic refresh logic but may need enhancement for production scale.  
**Solution:** Inngest scheduled job refreshes tokens every 6 hours.  
**Limitation:** Manual reconnection required if refresh fails.

### Social Media Platform Limitations

#### 5. Instagram Business Account Requirement
**Status:** 📋 DOCUMENTED  
**Impact:** Medium  
**Description:** Instagram posting requires a Business or Creator account linked to a Facebook Page.  
**Limitation:** Personal Instagram accounts cannot use the posting feature.  
**Workaround:** Users must convert to Business account in Instagram settings.

#### 6. Twitter/X Rate Limits
**Status:** 📋 DOCUMENTED  
**Impact:** Medium  
**Description:** Twitter API has strict rate limits (50 posts/24hrs for Basic tier).  
**Limitation:** Users may hit limits with heavy automation.  
**Workaround:** Spread posts throughout the day, upgrade to Twitter API plan.

#### 7. LinkedIn Post Limit
**Status:** 📋 DOCUMENTED  
**Impact:** Low  
**Description:** LinkedIn limits posting frequency to prevent spam.  
**Limitation:** ~10-15 posts per day recommended.  
**Workaround:** Use scheduling to stay within limits.

### AI Content Generation

#### 8. Gemini API Rate Limits
**Status:** 📋 DOCUMENTED  
**Impact:** Low  
**Description:** Google Gemini Pro has rate limits (60 requests/minute for free tier).  
**Limitation:** High-volume generation may be throttled.  
**Workaround:** Implement client-side rate limiting, upgrade to paid tier.

#### 9. Content Quality Variability
**Status:** 📋 DOCUMENTED  
**Impact:** Low  
**Description:** AI-generated content quality may vary, especially for non-English languages.  
**Limitation:** Users should review and edit generated content before posting.  
**Workaround:** Use "regenerate" option, provide more specific topics.

### Payment & Billing

#### 10. Credit Expiry
**Status:** ✅ WORKING AS DESIGNED  
**Impact:** Low  
**Description:** Credits expire 90 days after purchase to prevent indefinite accumulation.  
**Limitation:** Users must use credits within 90 days.  
**Workaround:** Low credit and expiry warnings notify users in advance.

#### 11. Polar.sh Webhook Delays
**Status:** 📋 DOCUMENTED  
**Impact:** Low  
**Description:** Webhook events may have slight delays (1-5 seconds).  
**Limitation:** Credit updates may not be instant.  
**Workaround:** UI polling updates credits every 30 seconds.

### Performance

#### 12. First Load Time
**Status:** ⏳ OPTIMIZATION OPPORTUNITY  
**Impact:** Low  
**Description:** Initial page load can be 2-3 seconds on slow connections.  
**Current:** Lazy loading implemented for heavy components.  
**Future:** Consider adding loading skeleton for dashboard.

#### 13. Large Translation Files
**Status:** 📋 DOCUMENTED  
**Impact:** Low  
**Description:** 11 language files add ~50KB to bundle.  
**Limitation:** Cannot reduce unless removing languages.  
**Workaround:** Translations are cached after first load.

### Database & Data

#### 14. Soft Delete Not Implemented
**Status:** ⏳ FUTURE ENHANCEMENT  
**Impact:** Low  
**Description:** Deleted posts/rules are permanently removed.  
**Limitation:** Cannot recover deleted data.  
**Workaround:** Add confirmation dialogs, consider implementing soft delete.

#### 15. No Post Edit History
**Status:** ⏳ FUTURE ENHANCEMENT  
**Impact:** Low  
**Description:** Post edits don't maintain version history.  
**Limitation:** Cannot view previous versions of edited posts.  
**Workaround:** Future feature - post revision history.

## Limitations

### Platform-Specific Limitations

#### Instagram
- ✅ Supports: Single image posts, carousel (up to 10 images), videos
- ❌ Does not support: Stories, Reels (coming soon), polls
- ⚠️ Requires: Business/Creator account linked to Facebook Page
- ⚠️ Image requirements: Min 320px, aspect ratio 4:5 to 1.91:1

#### Twitter/X
- ✅ Supports: Text posts (280 chars), threads, images, videos
- ❌ Does not support: Polls, Spaces, Twitter Blue features
- ⚠️ Rate limit: 50 posts/24hrs (Basic tier), 3,000/24hrs (Pro tier)
- ⚠️ Video limit: 512MB, 2min 20sec (Basic)

#### LinkedIn
- ✅ Supports: Text posts, images, videos, links
- ❌ Does not support: Polls, LinkedIn Live, company pages (coming soon)
- ⚠️ Recommendation: 10-15 posts/day maximum
- ⚠️ Video limit: 5GB, 10 minutes

#### Facebook
- ✅ Supports: Text posts, images, videos, links
- ❌ Does not support: Facebook Stories, Live videos, Events
- ⚠️ Requires: Page admin access
- ⚠️ Image limit: 10 images per carousel

### Tier Limitations

#### Free Tier
- Credits: 10/month
- Connected accounts: 1 per platform
- Max queue size: 5 scheduled posts
- AI generations: 5/day
- Automation rules: ❌ Disabled
- Advance scheduling: 7 days

#### Pro Tier (R299/month)
- Credits: 500/month
- Connected accounts: 3 per platform
- Max queue size: 50 scheduled posts
- AI generations: 50/day
- Automation rules: 5 max
- Advance scheduling: 30 days

#### Business Tier (R999/month)
- Credits: 2,000/month
- Connected accounts: 10 per platform
- Max queue size: 200 scheduled posts
- AI generations: 200/day
- Automation rules: 20 max
- Advance scheduling: 90 days

### Technical Limitations

#### Browser Support
- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari 15+ (latest 2 versions)
- ❌ Internet Explorer (not supported)
- ⚠️ Mobile browsers (basic functionality, some features limited)

#### File Size Limits
- Images: 10MB max
- Videos: 512MB max (Twitter), 5GB (LinkedIn)
- Profile pictures: 5MB max
- Total upload: 100MB per request

#### Character Limits
- Twitter: 280 characters
- Facebook: 63,206 characters (recommended <500)
- Instagram: 2,200 characters (recommended <150)
- LinkedIn: 3,000 characters (recommended <200)

#### Language Support
- ✅ All 11 official South African languages
- ⚠️ AI quality may vary for non-English languages
- ⚠️ Hashtag suggestions optimized for English and Afrikaans
- ❌ Right-to-left (RTL) languages not supported

### API & Integration Limitations

#### Rate Limiting
- API calls: 100 requests/minute per user
- Auth attempts: 5 attempts/15 minutes
- Content generation: 10 requests/minute
- Webhook retries: 3 attempts with exponential backoff

#### Scheduling Limitations
- Minimum schedule time: 5 minutes in future
- Maximum schedule time: Tier-dependent (7/30/90 days)
- Cron frequency: Every 1 minute
- Maximum concurrent posts: 10 per platform per user

#### Data Retention
- Active posts: Indefinite
- Failed post logs: 90 days
- Webhook events: 30 days
- Analytics data: 12 months
- Audit logs: 90 days

## Workarounds & Best Practices

### For Users

#### Getting Better AI Results
1. Be specific in your topics
2. Include context (target audience, goal)
3. Use the regenerate option if not satisfied
4. Review and edit before posting
5. Provide feedback for AI learning

#### Avoiding Rate Limits
1. Use scheduling instead of immediate posting
2. Spread posts throughout the day
3. Stay within daily limits (2 posts/day/platform for Free tier)
4. Upgrade tier if hitting limits frequently

#### Maximizing Engagement
1. Post during peak hours for your audience
2. Use relevant hashtags (3-5 optimal)
3. Include images when possible
4. Engage with comments
5. Use analytics to find best times

### For Developers

#### Testing OAuth Locally
```bash
# Use ngrok or localtunnel for OAuth callbacks
npm run tunnel
# Update OAuth redirect URIs to tunnel URL
```

#### Debugging Webhook Issues
```bash
# Check webhook logs
vercel logs --follow

# Test webhook locally
npm run webhook:test
```

#### Performance Optimization
```bash
# Analyze bundle size
npm run build
# Check .next/analyze/ directory

# Run Lighthouse
npx lighthouse https://your-domain.com
```

## Reporting Issues

### How to Report

1. **Check Existing Issues:** Search known issues above
2. **Gather Information:**
   - Browser and version
   - User tier
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/videos if applicable
3. **Submit Issue:** Use GitHub Issues template
4. **Provide Context:** Environment (staging/production)

### Issue Priority

- **P0 - Critical:** Site down, auth broken, data loss
- **P1 - High:** Major feature broken, payment issues
- **P2 - Medium:** Minor feature issues, UI bugs
- **P3 - Low:** Enhancements, optimizations

## Future Enhancements

### Planned Features
- ⏳ Instagram Stories support
- ⏳ LinkedIn Company Pages
- ⏳ Video content support
- ⏳ Advanced analytics dashboard
- ⏳ A/B testing for content
- ⏳ Team collaboration features
- ⏳ Post performance tracking
- ⏳ Custom branding for Business tier
- ⏳ API access for Enterprise tier
- ⏳ Mobile app (iOS/Android)

### Under Consideration
- 🔮 TikTok integration
- 🔮 YouTube integration
- 🔮 WhatsApp Business integration
- 🔮 Additional African languages
- 🔮 Multi-timezone support
- 🔮 White-label solution
- 🔮 Affiliate program

---

**Last Updated:** 2025-12-17  
**Version:** 1.0  
**Status:** Living Document - Updated as issues are discovered/resolved  

**For urgent issues, contact:** [support email]  
**For feature requests:** Use GitHub Issues with `enhancement` label
