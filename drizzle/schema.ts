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
