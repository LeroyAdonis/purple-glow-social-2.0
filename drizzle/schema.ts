import { pgTable, text, timestamp, boolean, uuid, integer, pgEnum } from "drizzle-orm/pg-core";

export const tierEnum = pgEnum("tier", ["free", "pro", "business"]);
export const platformEnum = pgEnum("platform", ["facebook", "instagram", "twitter", "linkedin"]);
export const statusEnum = pgEnum("status", ["draft", "scheduled", "posted", "failed"]);

// Better Auth expects these specific export names (singular)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  tier: tierEnum("tier").default("free"),
  credits: integer("credits").notNull().default(10),
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

// Note: users table above already includes credits field

// TypeScript types for better type safety
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type AutomationRule = typeof automationRules.$inferSelect;
export type ConnectedAccount = typeof connectedAccounts.$inferSelect;
export type NewConnectedAccount = typeof connectedAccounts.$inferInsert;
