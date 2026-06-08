# Post-Core Features Roadmap
**Project:** Purple Glow Social 2.0  
**Version:** 2.1+ (Post-Launch Enhancements)  
**Timeline:** 6-12 months  
**Date:** January 20, 2026  

---

## Executive Summary

This roadmap outlines enhancements and new features to be implemented after the core Purple Glow Social 2.0 platform is successfully deployed and stable in production. The focus is on:

1. **User Experience Improvements** - Polish and optimize based on real usage
2. **Advanced Features** - Analytics, video, Stories, advanced automation
3. **Platform Expansion** - New social platforms, integrations
4. **Enterprise Features** - Team collaboration, white-label, advanced admin
5. **Performance & Scale** - Optimization for growth
6. **Mobile App** - Native iOS/Android applications

**Assumption:** Core features deployed by February 2026, stable by March 2026.

### Current Production Status (Pre-Launch)

| Category | Status | Score |
|----------|--------|-------|
| Authentication & OAuth | ✅ Complete | 4 platforms |
| AI Content Generation | ✅ Complete | 11 languages, 4 tones |
| Post Publishing | ✅ Complete | Immediate & scheduled |
| Automation System | ✅ Complete | Inngest-powered |
| Payment Integration | ✅ Complete | Polar.sh live |
| Admin Dashboard | ✅ Complete | Full analytics |
| POPIA Compliance | ✅ Complete | SA privacy law |
| Security Score | ✅ Hardened | 9.5/10 |
| Test Coverage | ✅ Strong | 158 tests passing |
| F001 Draft Management | 🟡 UI Complete | Backend pending |
| **Overall Readiness** | **94/100** | Production-ready |

---

## Phase 1: Stabilization & Quick Wins (Months 1-2)
**Timeline:** March - April 2026  
**Focus:** Production stability, user feedback, quick improvements

### 1.1 Production Monitoring & Optimization
**Priority:** P0 - Critical  
**Effort:** 20-30 hours

**Tasks:**
- Enhanced Sentry monitoring with custom dashboards
- Real-time usage analytics with Vercel Analytics
- Performance profiling and optimization
- Database query optimization based on actual load
- API response time improvements
- Error rate monitoring and alerts
- Uptime monitoring with PagerDuty/Opsgenie integration

**Success Metrics:**
- Uptime: 99.9%+
- Error rate: <0.5%
- Response time p95: <500ms
- Zero critical bugs in first 30 days

**Technical Implementation:**
```typescript
// Example: Custom Sentry performance monitoring
Sentry.init({
  tracesSampleRate: 0.1, // 10% of transactions
  profilesSampleRate: 0.1,
  integrations: [
    new Sentry.Integrations.Postgres(),
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});
```

---

### 1.2 User Feedback Implementation
**Priority:** P1 - High  
**Effort:** 40-60 hours

**Tasks:**
- In-app feedback widget (bottom-right corner)
- User survey integration (post-publish, weekly digest)
- NPS (Net Promoter Score) tracking
- Feature request voting system
- Support ticket system integration (Freshdesk/Zendesk)
- Analytics on most-used features
- Heatmap tracking for UX optimization

**Deliverables:**
- `components/feedback-widget.tsx` - Floating feedback button
- `/api/feedback/submit` - Feedback submission endpoint
- Admin dashboard section for feedback analysis
- Integration with existing notification system

**Database Schema Addition:**
```typescript
// New table for user feedback
export const userFeedback = pgTable("user_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id),
  type: text("type").notNull(), // 'bug', 'feature', 'general', 'nps'
  rating: integer("rating"), // 1-10 for NPS
  message: text("message").notNull(),
  page: text("page"), // Which page they were on
  metadata: jsonb("metadata"), // Browser, device info
  status: text("status").default("new"), // 'new', 'reviewed', 'actioned'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

---

### 1.3 UI/UX Polish (Based on Real Usage)
**Priority:** P1 - High  
**Effort:** 30-40 hours

**From UI_PERFORMANCE_ENHANCEMENT_ROADMAP.md:**

#### Quick Wins (Week 1-2):
| Task | Effort | Impact |
|------|--------|--------|
| Replace native `alert()`/`confirm()` with custom dialogs | 4h | High |
| Add button loading states (spinners during actions) | 3h | Medium |
| Optimistic UI updates (instant feedback) | 4h | High |
| Toast notification improvements | 2h | Medium |
| Keyboard shortcuts (Ctrl+Enter to publish) | 3h | Medium |

#### Mobile Experience (Week 2-3):
| Task | Effort | Impact |
|------|--------|--------|
| Bottom navigation for mobile (<768px) | 5h | High |
| Swipe gestures for card actions | 4h | Medium |
| Touch target improvements (>44px) | 3h | High |
| Mobile form optimization | 3h | Medium |
| Pull-to-refresh on lists | 2h | Low |

#### Micro-interactions (Week 3-4):
| Task | Effort | Impact |
|------|--------|--------|
| Button hover animations enhanced | 2h | Low |
| Success celebrations (confetti on post publish) | 3h | Medium |
| Smooth page transitions | 4h | Medium |
| Loading state improvements | 3h | Medium |
| Skeleton loading refinements | 2h | Low |

**Components to Create:**
- `components/ui/confirmation-dialog.tsx`
- `components/ui/mobile-bottom-nav.tsx`
- `components/ui/celebration-effect.tsx`

---

### 1.4 Complete F001 Draft Management (If Not Already Done)
**Priority:** P1 - High  
**Effort:** 29 hours (as per F001.md spec)

**Remaining Tasks:**
- API implementation (15h)
  - `POST /api/posts/drafts` - Create draft
  - `GET /api/posts/drafts` - List drafts with pagination
  - `PATCH /api/posts/drafts/[id]` - Update draft
  - `DELETE /api/posts/drafts/[id]` - Delete draft
  - `POST /api/upload/image` - Image upload to Vercel Blob
- Integration with existing components (4h)
- Testing & validation (10h)

**Dependencies:**
- Existing `posts` table with `status='draft'` support ✅
- Vercel Blob for image storage ✅
- Rate limiting infrastructure ✅

---

### 1.5 Performance Baseline & Optimization
**Priority:** P1 - High  
**Effort:** 15-20 hours

**Tasks:**
- Establish performance baselines with Lighthouse
- Bundle size analysis and optimization
- Image optimization with Next.js Image component
- Database query optimization (add missing indexes)
- API response caching strategy
- CDN configuration optimization

**Performance Targets:**
| Metric | Current | Target |
|--------|---------|--------|
| Lighthouse Performance | ~75 | 90+ |
| First Contentful Paint | ~2.5s | <1.5s |
| Time to Interactive | ~4s | <3s |
| Bundle Size (initial) | ~350KB | <200KB |
| API Response (p95) | ~800ms | <500ms |

---

## Phase 1 Summary

| Task | Priority | Effort | Owner | Status |
|------|----------|--------|-------|--------|
| 1.1 Production Monitoring | P0 | 20-30h | DevOps | ⬜ |
| 1.2 User Feedback System | P1 | 40-60h | Full-stack | ⬜ |
| 1.3 UI/UX Polish | P1 | 30-40h | Frontend | ⬜ |
| 1.4 F001 Completion | P1 | 29h | Backend | ⬜ |
| 1.5 Performance Baseline | P1 | 15-20h | Full-stack | ⬜ |

**Phase 1 Exit Criteria:**
- [ ] 99.9% uptime for 30 consecutive days
- [ ] Error rate < 0.5%
- [ ] Feedback system collecting data
- [ ] Mobile UX significantly improved
- [ ] F001 Draft Management 100% complete
- [ ] Lighthouse score > 85

---

## Phase 2: Advanced Features (Months 3-4)
**Timeline:** May - June 2026  
**Focus:** High-value features that differentiate from competitors

### 2.1 Post Analytics Dashboard
**Priority:** P1 - High  
**Effort:** 60-80 hours

**Business Value:** Users need to understand what content performs best to improve their social media strategy. This is a key differentiator from basic scheduling tools.

**Features:**
- Real-time analytics from social platforms
- Engagement metrics (likes, comments, shares, reach)
- Performance comparison across platforms
- Best-performing content analysis
- Hashtag performance tracking
- Audience demographics (where available)
- Growth trends and insights
- Engagement rate calculations

**Platform APIs to Integrate:**

| Platform | API | Metrics Available |
|----------|-----|-------------------|
| Facebook | Graph API Insights | Likes, comments, shares, reach, impressions |
| Instagram | Instagram Insights API | Likes, comments, saves, reach, impressions |
| Twitter/X | Twitter Analytics API | Likes, retweets, replies, impressions, clicks |
| LinkedIn | LinkedIn Analytics API | Likes, comments, shares, impressions, clicks |

**Database Schema (Leveraging Existing):**
```typescript
// Already exists in schema.ts - postAnalytics table
// Just need to populate with real data from platform APIs
export const postAnalytics = pgTable("post_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => posts.id),
  userId: text("user_id").references(() => user.id),
  platform: platformEnum("platform").notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  engagementScore: integer("engagement_score").default(0),
  // ... existing fields
});
```

**Implementation Plan:**

1. **Analytics Fetcher Service** (20h)
   - `lib/analytics/facebook-analytics.ts`
   - `lib/analytics/instagram-analytics.ts`
   - `lib/analytics/twitter-analytics.ts`
   - `lib/analytics/linkedin-analytics.ts`
   - Inngest cron job to fetch analytics every 6 hours

2. **Analytics API Endpoints** (15h)
   - `GET /api/analytics/overview` - Dashboard summary
   - `GET /api/analytics/posts/[id]` - Single post analytics
   - `GET /api/analytics/trends` - Time-series data
   - `GET /api/analytics/top-performing` - Best posts

3. **Analytics Dashboard UI** (25h)
   - `components/analytics/analytics-dashboard.tsx`
   - `components/analytics/engagement-chart.tsx`
   - `components/analytics/platform-comparison.tsx`
   - `components/analytics/top-posts-list.tsx`
   - `components/analytics/hashtag-performance.tsx`

4. **PDF Report Export** (10h)
   - Weekly/monthly report generation
   - White-label PDF with branding
   - Email delivery option

**Deliverables:**
- Full analytics dashboard accessible from main nav
- Automated analytics fetching (Inngest)
- PDF export functionality
- API for programmatic access

**Currently:** Placeholder exists (`lib/ai/analytics-service.ts:240` has TODO)

---

### 2.2 Video Content Support
**Priority:** P1 - High  
**Effort:** 80-100 hours

**Business Value:** Video content generates 1200% more shares than text and images combined. Essential for modern social media management.

**Features:**
- Video upload (up to 500MB)
- Video processing and compression
- Thumbnail generation (auto + manual selection)
- Platform-specific video formatting
- Video preview player
- Progress tracking for uploads
- Video duration validation per platform

**Platform Video Specifications:**

| Platform | Max Duration | Max Size | Formats | Aspect Ratios |
|----------|--------------|----------|---------|---------------|
| Facebook | 240 min | 4GB | MP4, MOV | 16:9, 9:16, 1:1 |
| Instagram Feed | 60 sec | 100MB | MP4, MOV | 1:1, 4:5, 16:9 |
| Instagram Reels | 90 sec | 100MB | MP4, MOV | 9:16 |
| Twitter/X | 140 sec | 512MB | MP4 | 1:1, 16:9 |
| LinkedIn | 10 min | 200MB | MP4 | 1:1, 16:9, 9:16 |

**Technical Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     Video Upload Flow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Browser ──► Chunked Upload ──► Vercel Blob (temp) ──►          │
│                                                                  │
│  ──► FFmpeg Processing (Vercel Function/External) ──►           │
│                                                                  │
│  ──► Transcoded Video (Vercel Blob) ──► Ready for Posting       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation Options:**

1. **Option A: Vercel Blob + External Processing**
   - Upload raw video to Vercel Blob
   - Use external service (Cloudinary, Mux) for processing
   - Store processed video in Vercel Blob
   - Cost: ~R500-2000/month based on usage

2. **Option B: Direct Platform Upload**
   - Upload directly to each platform
   - Let platforms handle transcoding
   - Simpler but less control
   - Cost: Free

**Recommended:** Start with Option B, upgrade to Option A for premium tiers.

**Database Schema Addition:**
```typescript
// Extend posts table (videoUrl already exists)
// Add video metadata table
export const videoMetadata = pgTable("video_metadata", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").references(() => posts.id),
  originalUrl: text("original_url").notNull(),
  processedUrl: text("processed_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // seconds
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size"), // bytes
  format: text("format"),
  status: text("status").default("processing"), // 'processing', 'ready', 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

**Components to Create:**
- `components/video-uploader.tsx`
- `components/video-player.tsx`
- `components/video-thumbnail-selector.tsx`

---

### 2.3 Instagram Stories Support
**Priority:** P2 - Medium  
**Effort:** 40-60 hours

**Business Value:** Stories reach millions daily and are essential for brand engagement. Currently not supported.

**Features:**
- Create Stories content
- Vertical video/image format (1080x1920)
- Story-specific AI content generation
- Basic overlays (text, stickers conceptually)
- Schedule Stories (Instagram allows up to 75 scheduled Stories)
- Story analytics (views, taps forward/back, exits, replies)

**Instagram Stories API Requirements:**
- Business or Creator account required
- OAuth scope: `instagram_content_publish`, `instagram_manage_insights`
- Stories Container API for scheduling

**Implementation Plan:**

1. **Stories Content Creator** (20h)
   - `components/stories/story-creator.tsx`
   - Vertical canvas editor
   - Text overlay positioning
   - Background color/gradient options

2. **Stories Templates** (15h)
   - `components/stories/story-templates.tsx`
   - Pre-designed SA-themed templates
   - Quote templates, announcement templates
   - Product showcase templates

3. **Stories API Integration** (15h)
   - `lib/posting/instagram-stories-poster.ts`
   - Story scheduling with Inngest
   - Story analytics fetching

4. **Stories Management View** (10h)
   - `components/stories/stories-manager.tsx`
   - Calendar view for scheduled stories
   - Analytics integration

**Limitations:**
- No interactive elements (polls, quizzes) via API
- Text/stickers must be burned into image/video
- 24-hour automatic expiry

---

### 2.4 Post Recurrence Feature
**Priority:** P2 - Medium  
**Effort:** 30-40 hours

**Business Value:** Users want "set and forget" posting for recurring content themes. Currently marked as TODO in codebase.

**Currently:** TODO comment in `app/api/posts/schedule/route.ts:19`
```typescript
// recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(), // TODO: Implement recurrence
```

**Features:**
- Recurring post schedules (daily, weekly, monthly, yearly)
- Dynamic content templates with variables
- Automatic content variation (avoid duplicate detection)
- Recurring post management dashboard
- Pause/resume recurring posts
- End date for recurring series

**Use Cases:**
- "Every Monday morning" motivational posts
- "First of month" promotion posts
- "Weekly tip Tuesday" series
- "Monthly newsletter" reminders
- "Anniversary" celebration posts (yearly)

**Implementation Plan:**

1. **Schema Updates** (5h)
```typescript
// Add to posts table or new recurring_posts table
export const recurringPosts = pgTable("recurring_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  templateContent: text("template_content").notNull(), // With {{variables}}
  platform: platformEnum("platform").notNull(),
  frequency: text("frequency").notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  dayOfWeek: integer("day_of_week"), // 0-6 for weekly
  dayOfMonth: integer("day_of_month"), // 1-31 for monthly
  timeOfDay: text("time_of_day").notNull(), // "09:00" SAST
  timezone: text("timezone").default("Africa/Johannesburg"),
  variationEnabled: boolean("variation_enabled").default(true),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  lastGeneratedAt: timestamp("last_generated_at"),
  nextScheduledAt: timestamp("next_scheduled_at"),
  postsGenerated: integer("posts_generated").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

2. **Variable Substitution Engine** (10h)
```typescript
// lib/recurring/variable-engine.ts
const variables = {
  '{{date}}': () => formatDate(new Date(), 'MMMM d, yyyy'),
  '{{day}}': () => formatDate(new Date(), 'EEEE'),
  '{{week_number}}': () => getWeekNumber(new Date()),
  '{{random_emoji}}': () => getRandomEmoji('positive'),
  '{{random_greeting}}': () => getRandomSAGreeting(),
  '{{tip_of_day}}': async (topic) => await generateTip(topic),
};
```

3. **Inngest Recurring Processor** (10h)
```typescript
// lib/inngest/functions/process-recurring-posts.ts
export const processRecurringPosts = inngest.createFunction(
  { id: "process-recurring-posts" },
  { cron: "*/15 * * * *" }, // Every 15 minutes
  async ({ step }) => {
    const dueRecurring = await getDueRecurringPosts();
    for (const recurring of dueRecurring) {
      await step.run(`generate-${recurring.id}`, async () => {
        const content = await processTemplate(recurring.templateContent);
        const varied = recurring.variationEnabled 
          ? await varyContent(content) 
          : content;
        await createScheduledPost(recurring.userId, varied, recurring);
        await updateNextScheduled(recurring.id);
      });
    }
  }
);
```

4. **UI Components** (10h)
- `components/recurring/recurring-post-creator.tsx`
- `components/recurring/recurring-posts-list.tsx`
- `components/recurring/template-editor.tsx`

---

### 2.5 Advanced AI Content Optimization
**Priority:** P2 - Medium  
**Effort:** 50-60 hours

**Business Value:** Leverage the existing AI feedback loop schema to provide smarter content suggestions.

**Features (Building on Existing Schema):**
- Best time to post recommendations (personalized)
- Hashtag effectiveness scoring
- Content sentiment analysis
- Topic performance predictions
- A/B testing suggestions
- Trending topic integration

**Existing Infrastructure to Leverage:**
- `postAnalytics` table ✅
- `userLearningProfiles` table ✅
- `contentFeedback` table ✅
- `promptPatterns` table ✅
- `highPerformingExamples` table ✅

**New AI Features:**

1. **Smart Posting Time** (15h)
```typescript
// lib/ai/posting-time-optimizer.ts
async function getOptimalPostingTime(
  userId: string, 
  platform: Platform
): Promise<Date[]> {
  const profile = await getUserLearningProfile(userId);
  const analytics = await getPostAnalyticsByPlatform(userId, platform);
  
  // Analyze when user's posts perform best
  const performanceByHour = analyzePerformanceByTime(analytics);
  
  // Factor in SA-specific patterns
  const saPatterns = getSouthAfricanPeakTimes(platform);
  
  // Return top 3 optimal times
  return calculateOptimalTimes(performanceByHour, saPatterns);
}
```

2. **Content Performance Predictor** (20h)
```typescript
// lib/ai/performance-predictor.ts
async function predictEngagement(
  content: string,
  platform: Platform,
  userId: string
): Promise<{
  predictedEngagement: number; // 0-100
  confidence: number;
  suggestions: string[];
}> {
  const profile = await getUserLearningProfile(userId);
  const patterns = await getEffectivePatterns(platform, profile.industry);
  const examples = await getHighPerformingExamples(platform);
  
  // Use Gemini to analyze content against successful patterns
  return await analyzeContentPotential(content, patterns, examples);
}
```

3. **Hashtag Analyzer** (15h)
- Track hashtag performance over time
- Suggest trending hashtags for SA market
- Warn about overused/banned hashtags
- Recommend optimal hashtag count per platform

---

## Phase 2 Summary

| Task | Priority | Effort | Owner | Status |
|------|----------|--------|-------|--------|
| 2.1 Post Analytics Dashboard | P1 | 60-80h | Full-stack | ⬜ |
| 2.2 Video Content Support | P1 | 80-100h | Full-stack | ⬜ |
| 2.3 Instagram Stories | P2 | 40-60h | Full-stack | ⬜ |
| 2.4 Post Recurrence | P2 | 30-40h | Backend | ⬜ |
| 2.5 Advanced AI Optimization | P2 | 50-60h | AI/Backend | ⬜ |

**Phase 2 Exit Criteria:**
- [ ] Analytics dashboard live with real data
- [ ] Video upload working for at least 2 platforms
- [ ] Instagram Stories beta available
- [ ] Recurring posts functional
- [ ] AI predictions showing in content studio

---

## Phase 3: Platform Expansion (Months 5-6)
**Timeline:** July - August 2026  
**Focus:** More platforms, more reach for South African businesses

### 3.1 TikTok Integration
**Priority:** P1 - High  
**Effort:** 60-80 hours

**Business Value:** TikTok is the fastest-growing platform in SA with 11+ million users. Essential for reaching younger demographics.

**Features:**
- OAuth connection to TikTok Business accounts
- Video post publishing (vertical 9:16)
- TikTok-specific AI content generation (trends, sounds context)
- Hashtag challenge integration
- Analytics integration (views, likes, shares, comments)
- Scheduled posting support

**TikTok API Requirements:**
- TikTok for Developers account
- OAuth 2.0 with PKCE (similar to Twitter)
- Content Posting API (requires approval)
- Scopes: `video.upload`, `video.publish`, `user.info.basic`

**Implementation Plan:**

1. **OAuth Provider** (15h)
```typescript
// lib/oauth/tiktok-provider.ts
export class TikTokProvider extends BaseOAuthProvider {
  protected clientId = process.env.TIKTOK_CLIENT_KEY!;
  protected clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
  protected authUrl = 'https://www.tiktok.com/v2/auth/authorize/';
  protected tokenUrl = 'https://open.tiktokapis.com/v2/oauth/token/';
  protected scopes = ['user.info.basic', 'video.upload', 'video.publish'];
}
```

2. **Posting Service** (20h)
   - `lib/posting/tiktok-poster.ts`
   - Video upload (chunked for large files)
   - Caption and hashtag handling
   - Sound/music selection (if API allows)

3. **AI Content Adaptation** (15h)
   - TikTok-specific prompts in Gemini service
   - Trending hashtag integration
   - Hook-based content structure (grab attention in 3 seconds)
   - SA TikTok trends awareness

4. **UI Integration** (10h)
   - Add TikTok to platform selector
   - TikTok-specific preview (vertical video)
   - Connected accounts card for TikTok

**Database Changes:**
```typescript
// Update platformEnum
export const platformEnum = pgEnum("platform", [
  "facebook", "instagram", "twitter", "linkedin", 
  "tiktok" // NEW
]);
```

---

### 3.2 Pinterest Integration
**Priority:** P2 - Medium  
**Effort:** 40-50 hours

**Business Value:** Pinterest is powerful for e-commerce and visual businesses. Strong for DIY, fashion, and food sectors popular in SA.

**Features:**
- OAuth connection to Pinterest Business accounts
- Pin creation with images
- Board management
- Rich Pins support
- Pinterest-specific content (visual descriptions, keywords)
- Analytics integration

**Implementation Plan:**

1. **OAuth Provider** (10h)
   - `lib/oauth/pinterest-provider.ts`
   - Scopes: `boards:read`, `pins:read`, `pins:write`

2. **Posting Service** (15h)
   - `lib/posting/pinterest-poster.ts`
   - Image pin creation
   - Board selection
   - Rich metadata (title, description, link)

3. **AI Content Adaptation** (10h)
   - Pinterest-optimized descriptions
   - Keyword-rich captions
   - Visual content suggestions

4. **UI Integration** (5h)
   - Platform selector addition
   - Board picker component

---

### 3.3 YouTube Integration
**Priority:** P2 - Medium  
**Effort:** 50-60 hours

**Business Value:** YouTube is the second-largest search engine. Video content has massive reach and longevity.

**Features:**
- OAuth connection to YouTube channels
- Video upload and publishing
- Title, description, tags optimization
- Thumbnail upload
- YouTube Shorts support (vertical, <60s)
- Playlist management
- Analytics integration (views, watch time, subscribers)

**Implementation Plan:**

1. **OAuth Provider** (10h)
   - `lib/oauth/youtube-provider.ts`
   - Google OAuth with YouTube scopes
   - Scopes: `youtube.upload`, `youtube.readonly`

2. **Video Upload Service** (25h)
   - `lib/posting/youtube-poster.ts`
   - Resumable upload for large files
   - Processing status tracking
   - Thumbnail selection/upload

3. **AI Content Adaptation** (10h)
   - SEO-optimized titles and descriptions
   - Tag suggestions
   - Thumbnail text suggestions

4. **UI Integration** (10h)
   - YouTube-specific upload flow
   - Shorts vs long-form selection
   - Playlist assignment

---

### 3.4 LinkedIn Company Pages
**Priority:** P2 - Medium  
**Effort:** 30-40 hours

**Business Value:** Currently only personal profiles supported. Company pages are essential for B2B marketing.

**Currently:** Only personal LinkedIn profiles via OAuth

**Features:**
- Connect LinkedIn Company Pages (admin access required)
- Post as company instead of personal
- Multiple company page management
- Company page analytics
- Employee advocacy features (optional)

**Implementation Plan:**

1. **OAuth Scope Update** (5h)
```typescript
// Update LinkedIn OAuth scopes
const LINKEDIN_SCOPES = [
  'w_member_social',      // Personal posting (existing)
  'r_organization_admin', // Read company pages
  'w_organization_social', // Post as company
  'r_organization_social', // Read company posts
];
```

2. **Company Page Selection** (10h)
   - Fetch admin pages for user
   - Store company page connections separately
   - Allow switching between personal/company

3. **Posting Updates** (10h)
   - `lib/posting/linkedin-poster.ts` - Add company posting
   - Organization URN handling
   - Company-specific content formatting

4. **UI Updates** (10h)
   - Company page connection flow
   - Account switcher in posting flow
   - Company analytics view

---

### 3.5 WhatsApp Business API (Future Consideration)
**Priority:** P3 - Low  
**Effort:** 80-100 hours

**Business Value:** WhatsApp has 95% penetration in SA. Direct customer engagement channel.

**Note:** Complex API with strict approval process. Consider for Phase 5+.

**Potential Features:**
- Message scheduling to broadcast lists
- Status updates (similar to Stories)
- Template message management
- Customer response handling

**Complexity Factors:**
- Meta Business verification required
- Strict messaging policies
- 24-hour response window rules
- Template approval process

---

### 3.6 Multi-Account Management
**Priority:** P2 - Medium  
**Effort:** 40-50 hours

**Business Value:** Agencies and businesses with multiple brands need to manage multiple accounts per platform.

**Features:**
- Connect multiple accounts per platform
- Account groups (e.g., "Client A", "Client B")
- Bulk posting to multiple accounts
- Switch between accounts easily
- Account-level analytics
- Role-based access per account group

**Database Schema Addition:**
```typescript
// Account groups for organization
export const accountGroups = pgTable("account_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"), // For UI identification
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Link accounts to groups
export const accountGroupMembers = pgTable("account_group_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").references(() => accountGroups.id),
  connectedAccountId: text("connected_account_id").references(() => connectedAccounts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

**Use Cases:**
- Marketing agency managing 10 client Instagram accounts
- Business with personal + company LinkedIn
- Influencer with multiple brand accounts
- Franchise with location-specific pages

---

## Phase 3 Summary

| Task | Priority | Effort | Owner | Status |
|------|----------|--------|-------|--------|
| 3.1 TikTok Integration | P1 | 60-80h | Full-stack | ⬜ |
| 3.2 Pinterest Integration | P2 | 40-50h | Full-stack | ⬜ |
| 3.3 YouTube Integration | P2 | 50-60h | Full-stack | ⬜ |
| 3.4 LinkedIn Company Pages | P2 | 30-40h | Backend | ⬜ |
| 3.5 WhatsApp Business | P3 | 80-100h | Full-stack | ⬜ (Future) |
| 3.6 Multi-Account Management | P2 | 40-50h | Full-stack | ⬜ |

**Phase 3 Exit Criteria:**
- [ ] TikTok posting functional
- [ ] At least 2 additional platforms available
- [ ] LinkedIn Company Pages working
- [ ] Multi-account basics implemented
- [ ] Total platform count: 6+ (from 4)

---

## Phase 4: Enterprise Features (Months 7-8)
**Timeline:** September - October 2026  
**Focus:** Features for larger businesses and agencies

### 4.1 Team Collaboration
**Priority:** P1 - High (for Business tier)  
**Effort:** 80-100 hours

**Business Value:** Essential for agencies and businesses with marketing teams. Currently single-user only.

**Features:**
- Team member invitations via email
- Role-based permissions (Owner, Admin, Editor, Viewer)
- Approval workflows (drafts need approval before publishing)
- Comment threads on drafts/scheduled posts
- Activity feed (who did what, when)
- Team analytics and reporting
- Workspace isolation

**Role Definitions:**

| Role | Create | Edit | Publish | Delete | Manage Team | Billing |
|------|--------|------|---------|--------|-------------|---------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Editor | ✅ | ✅ | ✅ | Own only | ❌ | ❌ |
| Viewer | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Database Schema:**
```typescript
// Teams
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  ownerId: text("owner_id").notNull().references(() => user.id),
  tier: tierEnum("tier").default("business"),
  settings: jsonb("settings"), // Team-specific settings
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Team memberships
export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  userId: text("user_id").notNull().references(() => user.id),
  role: text("role").notNull().default("editor"), // 'owner', 'admin', 'editor', 'viewer'
  invitedBy: text("invited_by").references(() => user.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  status: text("status").default("pending"), // 'pending', 'active', 'removed'
});

// Team invitations
export const teamInvitations = pgTable("team_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  email: text("email").notNull(),
  role: text("role").notNull().default("editor"),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdBy: text("created_by").references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Approval workflows
export const approvalWorkflows = pgTable("approval_workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").notNull().references(() => teams.id),
  postId: uuid("post_id").references(() => posts.id),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  requestedBy: text("requested_by").references(() => user.id),
  reviewedBy: text("reviewed_by").references(() => user.id),
  comments: text("comments"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});
```

**Implementation Plan:**

1. **Team Management API** (25h)
   - `POST /api/teams` - Create team
   - `GET /api/teams/[id]` - Get team details
   - `POST /api/teams/[id]/invite` - Invite member
   - `POST /api/teams/[id]/members/[userId]/role` - Update role
   - `DELETE /api/teams/[id]/members/[userId]` - Remove member

2. **Permission System** (20h)
   - Middleware for team context
   - Permission checking utilities
   - Role-based route protection

3. **Approval Workflow** (20h)
   - Submit for approval action
   - Approval notification emails
   - Approval/rejection UI
   - History tracking

4. **Team UI Components** (25h)
   - `components/team/team-settings.tsx`
   - `components/team/member-list.tsx`
   - `components/team/invite-modal.tsx`
   - `components/team/approval-queue.tsx`
   - `components/team/activity-feed.tsx`

---

### 4.2 White-Label Solution
**Priority:** P2 - Medium  
**Effort:** 100-150 hours

**Business Value:** Agencies can offer Purple Glow as their own product to clients.

**Features:**
- Custom branding (logo, colors, fonts)
- Remove "Purple Glow" branding completely
- Custom domain support (client.agency.co.za)
- Custom email templates with agency branding
- Reseller dashboard for agency owners
- Client management portal
- Custom pricing for resellers

**Implementation Plan:**

1. **Branding Configuration** (30h)
```typescript
// White-label settings per team/tenant
export const whiteLabelSettings = pgTable("white_label_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id").references(() => teams.id),
  
  // Branding
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  primaryColor: text("primary_color").default("#9D4EDD"),
  secondaryColor: text("secondary_color").default("#00E0FF"),
  fontFamily: text("font_family"),
  
  // Custom domain
  customDomain: text("custom_domain").unique(),
  domainVerified: boolean("domain_verified").default(false),
  
  // Email
  emailFromName: text("email_from_name"),
  emailFromAddress: text("email_from_address"),
  
  // Footer/Legal
  companyName: text("company_name"),
  privacyPolicyUrl: text("privacy_policy_url"),
  termsUrl: text("terms_url"),
  
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

2. **Multi-Tenancy Architecture** (40h)
   - Subdomain routing
   - Custom domain verification (DNS TXT record)
   - Tenant context middleware
   - Isolated data per tenant

3. **Theming System** (30h)
   - CSS custom properties injection
   - Dynamic logo/favicon loading
   - Email template customization

4. **Reseller Dashboard** (30h)
   - Client management
   - Usage analytics per client
   - Billing rollup
   - White-label settings UI

---

### 4.3 Advanced Admin Features
**Priority:** P2 - Medium  
**Effort:** 60-80 hours

**Business Value:** Enhanced admin capabilities for platform management and support.

**Features:**
- User impersonation (for support, with audit trail)
- Advanced analytics (cohort analysis, retention curves)
- Custom admin reports
- Fraud detection and prevention
- Billing management enhancements
- Subscription lifecycle management
- Refund processing
- Usage-based pricing options
- Feature flags management
- A/B testing dashboard

**Implementation Plan:**

1. **User Impersonation** (15h)
```typescript
// Admin can view platform as specific user
// Strict audit logging required
export async function impersonateUser(
  adminId: string, 
  targetUserId: string
): Promise<ImpersonationSession> {
  // Log impersonation start
  await logAuditEvent({
    type: 'admin.impersonation.start',
    adminId,
    targetUserId,
    timestamp: new Date(),
  });
  
  // Create temporary impersonation token
  return createImpersonationSession(adminId, targetUserId);
}
```

2. **Advanced Analytics** (25h)
   - User retention analysis
   - Cohort comparison
   - Revenue metrics
   - Churn prediction
   - Platform health dashboard

3. **Feature Flags** (15h)
   - `lib/feature-flags/index.ts`
   - Database-backed flags
   - User/tier targeting
   - Percentage rollouts
   - A/B test integration

4. **Billing Enhancements** (20h)
   - Manual credit adjustments (with audit)
   - Subscription pause/resume
   - Proration handling
   - Invoice history
   - Refund workflow

---

### 4.4 API for Developers
**Priority:** P3 - Low  
**Effort:** 60-80 hours

**Business Value:** Enable integrations with other tools (CRMs, e-commerce, etc.)

**Features:**
- RESTful API for content management
- API key management
- Rate limiting per API key
- Webhook system for events
- API documentation (OpenAPI/Swagger)
- SDK for common languages (optional)

**API Endpoints:**
```
POST   /api/v1/posts              - Create post
GET    /api/v1/posts              - List posts
GET    /api/v1/posts/:id          - Get post
PATCH  /api/v1/posts/:id          - Update post
DELETE /api/v1/posts/:id          - Delete post

POST   /api/v1/posts/:id/publish  - Publish immediately
POST   /api/v1/posts/:id/schedule - Schedule post

GET    /api/v1/analytics/posts    - Get analytics
GET    /api/v1/analytics/summary  - Get summary

POST   /api/v1/content/generate   - Generate AI content

GET    /api/v1/accounts           - List connected accounts
GET    /api/v1/credits            - Get credit balance
```

**Database Schema:**
```typescript
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(), // SHA-256 of actual key
  keyPrefix: text("key_prefix").notNull(), // First 8 chars for identification
  scopes: jsonb("scopes").$type<string[]>().default([]),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiUsage = pgTable("api_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  apiKeyId: uuid("api_key_id").references(() => apiKeys.id),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code"),
  responseTimeMs: integer("response_time_ms"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

---

## Phase 4 Summary

| Task | Priority | Effort | Owner | Status |
|------|----------|--------|-------|--------|
| 4.1 Team Collaboration | P1 | 80-100h | Full-stack | ⬜ |
| 4.2 White-Label Solution | P2 | 100-150h | Full-stack | ⬜ |
| 4.3 Advanced Admin | P2 | 60-80h | Backend | ⬜ |
| 4.4 Developer API | P3 | 60-80h | Backend | ⬜ |

**Phase 4 Exit Criteria:**
- [ ] Team features live for Business tier
- [ ] Approval workflows functional
- [ ] White-label MVP available
- [ ] Admin impersonation with audit trail
- [ ] API beta available for early adopters

---

## Phase 5: Performance & Scale (Months 9-10)
**Timeline:** November - December 2026  
**Focus:** Optimization for growth, infrastructure improvements

### 5.1 Database Optimization
**Priority:** P1 - High  
**Effort:** 30-40 hours

**Business Value:** As user base grows, database performance becomes critical for user experience.

**Tasks:**
- Query analysis and optimization (EXPLAIN ANALYZE)
- Index optimization for common queries
- Connection pooling optimization
- Read replica configuration (if needed)
- Vacuum and maintenance automation
- Query caching strategy

**Key Queries to Optimize:**
```sql
-- Posts by user with status (very frequent)
CREATE INDEX idx_posts_user_status ON posts(user_id, status);

-- Scheduled posts for processing (cron job)
CREATE INDEX idx_posts_scheduled ON posts(status, scheduled_date) 
WHERE status = 'scheduled';

-- Analytics by post (dashboard queries)
CREATE INDEX idx_analytics_post ON post_analytics(post_id, fetched_at);

-- Connected accounts lookup
CREATE INDEX idx_connected_accounts_user ON connected_account(user_id, platform);
```

**Performance Targets:**
| Query Type | Current p95 | Target p95 |
|------------|-------------|------------|
| User dashboard load | ~500ms | <200ms |
| Post list (20 items) | ~300ms | <100ms |
| Analytics summary | ~800ms | <300ms |
| Scheduled posts query | ~400ms | <150ms |

---

### 5.2 Caching Layer
**Priority:** P1 - High  
**Effort:** 40-50 hours

**Business Value:** Reduce database load and improve response times significantly.

**Implementation:**
- Redis caching via Upstash (already configured for rate limiting)
- Cache user session data
- Cache connected accounts list
- Cache post analytics (TTL: 5 minutes)
- Cache AI generation results (for similar prompts)

**Caching Strategy:**
```typescript
// lib/cache/redis-cache.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const cache = {
  // User-related (longer TTL)
  async getUserProfile(userId: string) {
    const key = `user:${userId}:profile`;
    let profile = await redis.get(key);
    if (!profile) {
      profile = await fetchUserFromDB(userId);
      await redis.set(key, profile, { ex: 300 }); // 5 min
    }
    return profile;
  },

  // Analytics (medium TTL)
  async getPostAnalytics(postId: string) {
    const key = `analytics:${postId}`;
    let analytics = await redis.get(key);
    if (!analytics) {
      analytics = await fetchAnalyticsFromDB(postId);
      await redis.set(key, analytics, { ex: 300 }); // 5 min
    }
    return analytics;
  },

  // Invalidation
  async invalidateUser(userId: string) {
    await redis.del(`user:${userId}:*`);
  },
};
```

---

### 5.3 CDN & Asset Optimization
**Priority:** P2 - Medium  
**Effort:** 20-30 hours

**Tasks:**
- Image optimization pipeline
- Automatic WebP conversion
- Responsive image generation
- Video thumbnail CDN caching
- Static asset caching headers
- Edge caching for API responses

**Vercel Edge Config:**
```json
{
  "headers": [
    {
      "source": "/api/public/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=60, stale-while-revalidate" }
      ]
    },
    {
      "source": "/(.*).jpg",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

### 5.4 Horizontal Scaling Preparation
**Priority:** P2 - Medium  
**Effort:** 30-40 hours

**Tasks:**
- Ensure stateless API design
- Session storage in Redis (not file)
- Queue-based job processing (Inngest already handles this ✅)
- Database connection pooling
- Rate limiting with distributed counters
- Load testing with k6

**Load Testing Targets:**
| Metric | Current | Target |
|--------|---------|--------|
| Concurrent users | 100 | 1,000 |
| Requests per second | 50 | 500 |
| Error rate under load | <1% | <0.1% |
| Response time p99 | 2s | <1s |

---

### 5.5 Monitoring & Observability Enhancements
**Priority:** P1 - High  
**Effort:** 25-35 hours

**Tasks:**
- Custom Sentry dashboards
- Business metrics tracking
- Real-time alerting rules
- Distributed tracing
- Log aggregation and analysis
- Status page setup

**Key Metrics to Track:**
```typescript
// lib/monitoring/business-metrics.ts
export const metrics = {
  // User engagement
  'posts.published': Counter,
  'posts.scheduled': Counter,
  'ai.generations': Counter,
  'ai.generation_time': Histogram,
  
  // Platform health
  'oauth.connections': Gauge,
  'oauth.failures': Counter,
  'api.latency': Histogram,
  
  // Business
  'revenue.mrr': Gauge,
  'users.active_daily': Gauge,
  'subscriptions.new': Counter,
  'subscriptions.churned': Counter,
};
```

---

## Phase 5 Summary

| Task | Priority | Effort | Owner | Status |
|------|----------|--------|-------|--------|
| 5.1 Database Optimization | P1 | 30-40h | Backend | ⬜ |
| 5.2 Caching Layer | P1 | 40-50h | Backend | ⬜ |
| 5.3 CDN & Assets | P2 | 20-30h | DevOps | ⬜ |
| 5.4 Scaling Preparation | P2 | 30-40h | Backend | ⬜ |
| 5.5 Monitoring Enhancements | P1 | 25-35h | DevOps | ⬜ |

**Phase 5 Exit Criteria:**
- [ ] p95 response times < 500ms for all endpoints
- [ ] Support 1,000 concurrent users
- [ ] Redis caching operational
- [ ] Comprehensive monitoring dashboard
- [ ] Load testing automated in CI/CD

---

## Phase 6: Mobile App (Months 11-12+)
**Timeline:** January 2027+  
**Focus:** Native mobile experience for on-the-go social media management

### 6.1 React Native Mobile App
**Priority:** P1 - High  
**Effort:** 400-600 hours (6-9 months with dedicated team)

**Business Value:** Mobile-first users expect native app experience. Enables notifications and quick posting on the go.

**Platforms:**
- iOS (App Store)
- Android (Google Play)

**Core Features (MVP):**
- User authentication (biometric + password)
- Dashboard overview (credits, scheduled posts)
- Content generation (AI)
- Quick post creation
- Scheduled posts list
- Push notifications
- Connected accounts management
- Basic analytics view

**Future Features (Post-MVP):**
- Camera integration for images/video
- Offline draft creation
- Widget for quick posting
- Apple Watch/Wear OS companion
- AR filters for Stories
- Voice-to-post feature

**Technology Stack:**
```
React Native (code sharing with web)
├── Expo (rapid development)
├── React Navigation (routing)
├── React Query (data fetching)
├── AsyncStorage (local storage)
├── Expo SecureStore (sensitive data)
├── Expo Notifications (push)
├── Expo Camera/ImagePicker
└── Native modules for OAuth
```

**Project Structure:**
```
mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── create.tsx     # Create post
│   │   ├── schedule.tsx   # Scheduled posts
│   │   └── settings.tsx   # Settings
│   ├── login.tsx
│   └── _layout.tsx
├── components/
├── hooks/
├── lib/
│   ├── api/               # API client (shared with web)
│   ├── auth/              # Mobile-specific auth
│   └── storage/           # AsyncStorage helpers
└── assets/
```

**Implementation Phases:**

1. **Foundation (4 weeks)** - 80h
   - Expo project setup
   - Authentication flow
   - API client integration
   - Basic navigation

2. **Core Features (6 weeks)** - 120h
   - Dashboard implementation
   - AI content generation
   - Post creation flow
   - Schedule management

3. **Advanced Features (4 weeks)** - 80h
   - Push notifications
   - Camera integration
   - Analytics views
   - Settings & accounts

4. **Polish & Testing (4 weeks)** - 80h
   - UI/UX refinement
   - Performance optimization
   - Beta testing
   - Bug fixes

5. **App Store Submission (2 weeks)** - 40h
   - App Store assets (screenshots, descriptions)
   - Privacy policy for apps
   - Review process
   - Launch preparation

**App Store Requirements:**

| Platform | Requirements |
|----------|--------------|
| iOS | Apple Developer Account (R1,900/year), App Store Connect |
| Android | Google Play Developer Account (R400 one-time) |

---

### 6.2 Progressive Web App (PWA) - Alternative/Complement
**Priority:** P2 - Medium  
**Effort:** 40-60 hours

**Business Value:** Faster to implement than native app, works across all platforms.

**Features:**
- Install to home screen
- Offline support (drafts)
- Push notifications (via Web Push API)
- App-like experience
- Automatic updates

**Implementation:**
```typescript
// next.config.js - PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // existing config
});
```

**Service Worker Strategy:**
- Cache-first for static assets
- Network-first for API calls
- Background sync for offline posts

---

## Phase 6 Summary

| Task | Priority | Effort | Owner | Status |
|------|----------|--------|-------|--------|
| 6.1 React Native App | P1 | 400-600h | Mobile Team | ⬜ |
| 6.2 PWA Implementation | P2 | 40-60h | Frontend | ⬜ |

**Phase 6 Exit Criteria:**
- [ ] iOS app in App Store
- [ ] Android app in Play Store
- [ ] Push notifications working
- [ ] 4+ star rating target
- [ ] PWA installable from web

---

## Month-by-Month Breakdown

### Month 1 (March 2026): Stabilization
- Production monitoring setup
- Bug fixes from launch
- Performance baseline
- User feedback collection begins

### Month 2 (April 2026): Quick Wins
- UI polish (dialogs, loading states, mobile nav)
- F001 completion (if pending)
- Feedback system live
- Initial performance optimizations

### Month 3 (May 2026): Analytics Foundation
- Platform analytics integration starts
- Analytics dashboard MVP
- PDF report export

### Month 4 (June 2026): Video & Stories
- Video upload implementation
- Platform video publishing
- Instagram Stories beta
- Video analytics

### Month 5 (July 2026): New Platforms
- TikTok integration
- LinkedIn Company Pages
- Post recurrence feature

### Month 6 (August 2026): Platform Expansion
- Pinterest integration
- YouTube integration
- Multi-account management

### Month 7 (September 2026): Team Features
- Team collaboration launch
- Approval workflows
- Permission system

### Month 8 (October 2026): Enterprise
- White-label MVP
- Advanced admin features
- API beta launch

### Month 9 (November 2026): Optimization
- Database optimization
- Caching layer implementation
- Performance improvements

### Month 10 (December 2026): Scale Preparation
- Load testing
- Monitoring enhancements
- Infrastructure optimization
- Year-end review

### Month 11-12+ (January 2027+): Mobile
- React Native development begins
- iOS alpha/beta
- Android alpha/beta
- App Store submissions

---

## Success Metrics (12-Month Goals)

### User Growth
| Metric | Current | 6-Month Target | 12-Month Target |
|--------|---------|----------------|-----------------|
| Registered users | 0 | 500 | 2,000 |
| Active users (DAU) | 0 | 100 | 500 |
| Paying customers | 0 | 50 | 200 |
| Free → Paid conversion | N/A | 30% | 40% |
| Monthly churn rate | N/A | <8% | <5% |

### Platform Usage
| Metric | 6-Month Target | 12-Month Target |
|--------|----------------|-----------------|
| Posts published/month | 5,000 | 25,000 |
| AI generations/month | 10,000 | 50,000 |
| Automation rules active | 200 | 1,000 |
| Connected accounts | 1,000 | 5,000 |
| Platform uptime | 99.9% | 99.95% |

### Revenue (ZAR)
| Metric | 6-Month Target | 12-Month Target |
|--------|----------------|-----------------|
| MRR (Monthly Recurring Revenue) | R 25,000 | R 100,000 |
| ARR (Annual Recurring Revenue) | R 300,000 | R 1,200,000 |
| ARPU (Average Revenue Per User) | R 500 | R 500 |
| LTV (Lifetime Value) | R 3,000 | R 6,000 |

### Technical
| Metric | 6-Month Target | 12-Month Target |
|--------|----------------|-----------------|
| Tests passing | 200+ | 500+ |
| Code coverage | 70% | 85% |
| API response time p95 | <400ms | <300ms |
| Error rate | <0.3% | <0.1% |
| Platforms supported | 6 | 8 |

---

## Resource Requirements

### Team Growth Plan

**Current State:** Small team (1-2 developers)

| Month | Role | Total Team |
|-------|------|------------|
| Month 1 | Current team | 2 |
| Month 3 | +1 Backend Developer | 3 |
| Month 5 | +1 Frontend Developer | 4 |
| Month 7 | +1 QA Engineer | 5 |
| Month 9 | +1 DevOps Engineer | 6 |
| Month 11 | +1 Mobile Developer | 7 |

### Budget Estimates (Monthly)

**Infrastructure:**
| Service | Current | 6-Month | 12-Month |
|---------|---------|---------|----------|
| Vercel (hosting) | R 3,000 | R 8,000 | R 15,000 |
| Neon (database) | R 1,500 | R 4,000 | R 8,000 |
| Upstash (Redis) | R 500 | R 1,500 | R 3,000 |
| Inngest | R 0 | R 2,000 | R 5,000 |
| Sentry | R 500 | R 1,500 | R 3,000 |
| External APIs | R 2,000 | R 5,000 | R 10,000 |
| **Total Infra** | **R 7,500** | **R 22,000** | **R 44,000** |

**Development (South African salaries):**
| Role | Monthly Salary |
|------|----------------|
| Senior Developer | R 60,000 - 80,000 |
| Mid Developer | R 40,000 - 55,000 |
| Junior Developer | R 25,000 - 35,000 |
| QA Engineer | R 35,000 - 50,000 |
| DevOps Engineer | R 55,000 - 75,000 |

**12-Month Projected Costs:**
| Category | Monthly Average | Annual |
|----------|-----------------|--------|
| Infrastructure | R 30,000 | R 360,000 |
| Team (6 people avg) | R 280,000 | R 3,360,000 |
| Tools & Licenses | R 10,000 | R 120,000 |
| Marketing | R 20,000 | R 240,000 |
| **Total** | **R 340,000** | **R 4,080,000** |

---

## Strategic Priorities

### Must Have (Business Critical)
1. ✅ Production stability and monitoring
2. 📊 Analytics dashboard (key differentiator)
3. 📹 Video content support (market demand)
4. 👥 Team collaboration (enterprise sales)
5. 📱 Mobile app (user expectation)

### Should Have (Competitive Advantage)
1. Instagram Stories & Reels
2. Post recurrence automation
3. TikTok integration
4. Advanced AI optimization
5. LinkedIn Company Pages

### Nice to Have (Future Growth)
1. White-label solution
2. Pinterest & YouTube
3. Developer API
4. WhatsApp Business
5. PWA enhancements

---

## Risk Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Platform API changes | High | High | Monitor API changelogs, version abstraction layer |
| Scalability issues | Medium | High | Load testing, caching, gradual rollout |
| Third-party outages | Medium | Medium | Circuit breakers, graceful degradation, multi-region |
| Data loss | Low | Critical | Automated backups, disaster recovery plan |
| Security breach | Low | Critical | Regular audits, penetration testing, bug bounty |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Feature creep | High | Medium | Strict prioritization, user feedback driven |
| Resource constraints | Medium | High | Phased approach, MVP mindset |
| Competition | Medium | Medium | Focus on SA market, unique features |
| Slow adoption | Medium | High | Marketing investment, freemium model |
| Churn | Medium | High | User feedback, quick iteration, support |

### Platform-Specific Risks

| Platform | Risk | Mitigation |
|----------|------|------------|
| Instagram | API deprecation for Stories | Build with fallback, monitor Meta updates |
| Twitter/X | API pricing changes | Budget for higher costs, cache where possible |
| TikTok | Approval delays | Apply early, have alternatives |
| LinkedIn | Strict rate limits | Efficient batching, user education |

---

## Review Cadence

### Weekly
- Bug triage and prioritization
- Sprint progress review
- Blocker resolution

### Monthly
- Roadmap progress review
- Metrics analysis
- User feedback review
- Priority adjustments

### Quarterly
- Major roadmap revision
- Resource allocation review
- Strategic direction assessment
- Stakeholder update

### Annually
- Full strategic planning
- Market analysis
- Technology stack evaluation
- Team structure review

---

## Appendix A: Feature Priority Matrix

| Feature | User Value | Business Value | Effort | Priority Score |
|---------|------------|----------------|--------|----------------|
| Analytics Dashboard | 9 | 10 | High | P1 |
| Video Support | 8 | 9 | High | P1 |
| Team Collaboration | 7 | 10 | High | P1 |
| TikTok | 9 | 8 | Medium | P1 |
| Instagram Stories | 8 | 7 | Medium | P2 |
| Post Recurrence | 7 | 6 | Low | P2 |
| LinkedIn Companies | 6 | 8 | Low | P2 |
| Pinterest | 5 | 5 | Medium | P2 |
| YouTube | 6 | 6 | High | P2 |
| White-Label | 4 | 9 | Very High | P2 |
| Developer API | 4 | 7 | High | P3 |
| WhatsApp | 6 | 7 | Very High | P3 |
| Mobile App | 9 | 8 | Very High | P1 |

---

## Appendix B: South African Market Context

### Social Media Usage in SA (2026 Projections)

| Platform | Users (millions) | Growth | Primary Demographic |
|----------|------------------|--------|---------------------|
| WhatsApp | 28+ | Stable | All ages |
| Facebook | 24+ | Declining | 25-54 |
| YouTube | 22+ | Growing | All ages |
| Instagram | 14+ | Growing | 18-34 |
| TikTok | 14+ | Fast growth | 16-30 |
| Twitter/X | 5+ | Stable | 25-44 |
| LinkedIn | 10+ | Growing | 25-54 professionals |
| Pinterest | 3+ | Stable | 25-44 women |

### SA Business Considerations

**Pricing in ZAR:**
- Maintain ZAR pricing (15% VAT inclusive)
- Payment methods: Cards, EFT, mobile money
- Invoice requirements for businesses

**Content Considerations:**
- 11 official languages supported ✅
- Local events calendar (Heritage Day, Youth Day, etc.)
- SA-specific hashtags (#MzansiMagic, #ProudlySouthAfrican)
- Local business hours and time zones (SAST)

**Compliance:**
- POPIA (Protection of Personal Information Act) ✅
- Consumer Protection Act
- Electronic Communications Act

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-20 | Architecture Agent | Initial creation |

---

**Prepared by:** Architecture & Planning Agent  
**Approved by:** [Pending stakeholder review]  
**Version:** 1.0  
**Last Updated:** January 20, 2026

---

## Next Steps

1. **Immediate (This Week):**
   - Review roadmap with stakeholders
   - Prioritize Phase 1 tasks
   - Assign owners to critical items

2. **Short-term (Month 1):**
   - Complete production deployment
   - Set up monitoring infrastructure
   - Begin user feedback collection

3. **Medium-term (Quarter 1):**
   - Complete Phase 1 & begin Phase 2
   - Hire additional team members
   - Establish metrics baselines

---

**This roadmap is flexible and will adapt based on:**
- User feedback and feature requests
- Market trends and competition
- Resource availability
- Business priorities
- Platform API changes

---

*Lekker planning! Let's build something amazing for Mzansi.* 🚀🇿🇦
