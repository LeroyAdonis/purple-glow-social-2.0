import { pgTable, text, timestamp, boolean, uuid, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const tierEnum = pgEnum("tier", ["free", "pro", "business"]);
export const platformEnum = pgEnum("platform", ["facebook", "instagram", "twitter", "linkedin"]);
export const statusEnum = pgEnum("status", ["draft", "scheduled", "posted", "failed"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["credit_purchase", "subscription", "refund"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed", "refunded"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due", "trialing"]);
export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "annual"]);
export const webhookStatusEnum = pgEnum("webhook_status", ["pending", "processed", "failed"]);
export const creditReservationStatusEnum = pgEnum("credit_reservation_status", ["pending", "consumed", "released"]);
export const notificationTypeEnum = pgEnum("notification_type", ["low_credits", "credits_expiring", "post_skipped", "post_failed", "tier_limit_reached"]);
export const jobStatusEnum = pgEnum("job_status", ["pending", "running", "completed", "failed", "cancelled"]);
export const feedbackTypeEnum = pgEnum("feedback_type", ["thumbs_up", "thumbs_down", "selected", "edited", "rejected"]);
export const toneEnum = pgEnum("tone", ["professional", "casual", "friendly", "energetic"]);

// Better Auth expects these specific export names (singular)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  tier: tierEnum("tier").default("free"),
  credits: integer("credits").notNull().default(10),
  videoCredits: integer("video_credits").notNull().default(0),
  lastCreditReset: timestamp("last_credit_reset").defaultNow(),
  tierLimits: jsonb("tier_limits"), // Cached tier limits for quick access
  polarCustomerId: text("polar_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  platform: platformEnum("platform").notNull(),
  status: statusEnum("status").default("draft"),
  topic: text("topic"),
  scheduledDate: timestamp("scheduled_date"),
  platformPostId: text("platform_post_id"), // ID from the platform (e.g., tweet ID)
  platformPostUrl: text("platform_post_url"), // URL to the post on the platform
  publishedAt: timestamp("published_at"), // When it was actually published
  errorMessage: text("error_message"), // Error if posting failed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const automationRules = pgTable("automation_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  frequency: text("frequency").default("weekly"), // e.g., 'weekly', 'daily'
  coreTopic: text("core_topic"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Connected Accounts for Social Media OAuth (Instagram, Facebook, Twitter, LinkedIn)
export const connectedAccounts = pgTable("connected_account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  platformUserId: text("platform_user_id").notNull(),
  platformUsername: text("platform_username").notNull(),
  platformDisplayName: text("platform_display_name").notNull(),
  profileImageUrl: text("profile_image_url"),
  accessToken: text("access_token").notNull(), // Encrypted
  refreshToken: text("refresh_token"), // Encrypted
  tokenExpiresAt: timestamp("token_expires_at"),
  scope: text("scope").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastSyncedAt: timestamp("last_synced_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Transactions table for payment records
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  polarOrderId: text("polar_order_id").unique(),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  currency: text("currency").notNull().default("ZAR"),
  status: transactionStatusEnum("status").notNull().default("pending"),
  credits: integer("credits"), // Credits added/removed (nullable for subscriptions)
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Additional data from Polar
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Subscriptions table for managing user subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  polarSubscriptionId: text("polar_subscription_id").notNull().unique(),
  polarCustomerId: text("polar_customer_id").notNull(),
  planId: text("plan_id").notNull(), // 'pro' or 'business'
  billingCycle: billingCycleEnum("billing_cycle").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Webhook events table for audit trail and idempotency
export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: text("event_type").notNull(),
  eventId: text("event_id").notNull().unique(), // Polar event ID for idempotency
  payload: jsonb("payload").notNull(),
  status: webhookStatusEnum("status").notNull().default("pending"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Note: users table above already includes credits field

// Credit Reservations for scheduled posts
export const creditReservations = pgTable("credit_reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  credits: integer("credits").notNull(),
  status: creditReservationStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// AI Generation logs for tracking and analytics
export const generationLogs = pgTable("generation_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  topic: text("topic"),
  tone: text("tone"),
  language: text("language"),
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Daily usage tracking for rate limiting
export const dailyUsage = pgTable("daily_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format for easy comparison
  generationsCount: integer("generations_count").notNull().default(0),
  postsCount: integer("posts_count").notNull().default(0),
  platformBreakdown: jsonb("platform_breakdown"), // { facebook: 2, instagram: 3, ... }
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Job logs for Inngest tracking
export const jobLogs = pgTable("job_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  inngestEventId: text("inngest_event_id"),
  functionName: text("function_name").notNull(),
  status: jobStatusEnum("status").notNull().default("pending"),
  payload: jsonb("payload"),
  result: jsonb("result"),
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// TypeScript types for better type safety
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type AutomationRule = typeof automationRules.$inferSelect;
export type ConnectedAccount = typeof connectedAccounts.$inferSelect;
export type NewConnectedAccount = typeof connectedAccounts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
export type CreditReservation = typeof creditReservations.$inferSelect;
export type NewCreditReservation = typeof creditReservations.$inferInsert;
export type GenerationLog = typeof generationLogs.$inferSelect;
export type NewGenerationLog = typeof generationLogs.$inferInsert;
export type DailyUsage = typeof dailyUsage.$inferSelect;
export type NewDailyUsage = typeof dailyUsage.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type JobLog = typeof jobLogs.$inferSelect;
export type NewJobLog = typeof jobLogs.$inferInsert;

// ========================================
// AI Feedback Loop & Analytics Learning
// ========================================

// Post Analytics - Tracks engagement metrics for learning
export const postAnalytics = pgTable("post_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  
  // Engagement metrics (fetched from platforms)
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  
  // Calculated engagement score (0-100)
  engagementScore: integer("engagement_score").default(0),
  
  // Generation context for learning correlation
  topic: text("topic"),
  tone: toneEnum("tone"),
  language: text("language"),
  promptVariation: text("prompt_variation"), // Track which prompt style was used
  
  // Timing
  fetchedAt: timestamp("fetched_at").defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User Learning Profiles - Stores accumulated learning per user
export const userLearningProfiles = pgTable("user_learning_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }).unique(),
  
  // Industry & audience context
  industry: text("industry"),
  targetAudience: text("target_audience"),
  brandVoice: text("brand_voice"), // User's preferred brand voice description
  
  // Learned preferences (updated by learning engine)
  preferredTones: jsonb("preferred_tones").$type<string[]>().default([]), // Ranked tones by performance
  preferredLanguages: jsonb("preferred_languages").$type<string[]>().default([]), // Ranked languages
  topHashtags: jsonb("top_hashtags").$type<string[]>().default([]), // Best performing hashtags
  topTopics: jsonb("top_topics").$type<string[]>().default([]), // Best performing topics
  
  // Platform-specific insights
  platformInsights: jsonb("platform_insights").$type<Record<string, {
    avgEngagement: number;
    bestPostingTimes: string[];
    topContentTypes: string[];
  }>>().default({}),
  
  // South African context learning
  effectiveSaExpressions: jsonb("effective_sa_expressions").$type<string[]>().default([]),
  localTrends: jsonb("local_trends").$type<string[]>().default([]),
  
  // Aggregate metrics
  totalPostsAnalyzed: integer("total_posts_analyzed").default(0),
  avgEngagementScore: integer("avg_engagement_score").default(0),
  
  // Learning timestamps
  lastLearningUpdate: timestamp("last_learning_update").defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Content Feedback - Explicit user feedback on generated content
export const contentFeedback = pgTable("content_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "set null" }),
  
  // What was generated
  generatedContent: text("generated_content").notNull(),
  platform: platformEnum("platform").notNull(),
  topic: text("topic"),
  tone: toneEnum("tone"),
  language: text("language"),
  
  // Feedback type
  feedbackType: feedbackTypeEnum("feedback_type").notNull(),
  
  // Additional context
  editedContent: text("edited_content"), // If user edited, what they changed to
  rejectionReason: text("rejection_reason"), // Why they rejected
  rating: integer("rating"), // 1-5 star rating if provided
  
  // Learning weight (how much this feedback should influence learning)
  learningWeight: integer("learning_weight").default(1),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Prompt Patterns - Stores successful prompt patterns for self-learning
export const promptPatterns = pgTable("prompt_patterns", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Pattern identification
  patternType: text("pattern_type").notNull(), // e.g., 'opening', 'cta', 'hashtag_style'
  platform: platformEnum("platform").notNull(),
  language: text("language"),
  tone: toneEnum("tone"),
  
  // The pattern itself
  patternContent: text("pattern_content").notNull(), // The actual prompt segment or example
  exampleOutput: text("example_output"), // Example of what this pattern produces
  
  // Effectiveness metrics
  usageCount: integer("usage_count").default(0),
  successCount: integer("success_count").default(0), // Posts with above-avg engagement
  avgEngagementScore: integer("avg_engagement_score").default(0),
  effectivenessScore: integer("effectiveness_score").default(0), // Calculated score 0-100
  
  // South African specifics
  saContext: jsonb("sa_context").$type<{
    expressions: string[];
    locations: string[];
    culturalNotes: string[];
  }>(),
  
  // Active status
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// High-Performing Examples - Few-shot examples from successful posts
export const highPerformingExamples = pgTable("high_performing_examples", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }), // Null for system-wide
  postId: uuid("post_id").references(() => posts.id, { onDelete: "set null" }),
  
  // Content details
  content: text("content").notNull(),
  platform: platformEnum("platform").notNull(),
  topic: text("topic"),
  tone: toneEnum("tone"),
  language: text("language"),
  hashtags: jsonb("hashtags").$type<string[]>().default([]),
  
  // Why it's high-performing
  engagementScore: integer("engagement_score").notNull(),
  engagementMetrics: jsonb("engagement_metrics").$type<{
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  }>(),
  
  // Usage in prompts
  usedInPromptCount: integer("used_in_prompt_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  
  // Scope
  isSystemWide: boolean("is_system_wide").default(false), // Available to all users
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Types
export type PostAnalytics = typeof postAnalytics.$inferSelect;
export type NewPostAnalytics = typeof postAnalytics.$inferInsert;
export type UserLearningProfile = typeof userLearningProfiles.$inferSelect;
export type NewUserLearningProfile = typeof userLearningProfiles.$inferInsert;
export type ContentFeedback = typeof contentFeedback.$inferSelect;
export type NewContentFeedback = typeof contentFeedback.$inferInsert;
export type PromptPattern = typeof promptPatterns.$inferSelect;
export type NewPromptPattern = typeof promptPatterns.$inferInsert;
export type HighPerformingExample = typeof highPerformingExamples.$inferSelect;
export type NewHighPerformingExample = typeof highPerformingExamples.$inferInsert;
