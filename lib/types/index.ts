/**
 * Shared Type Definitions for Purple Glow Social
 * 
 * Centralized type interfaces for type safety across the application
 */

// =============================================================================
// Payment & Success Modal Types
// =============================================================================

/** Data for payment success modals */
export interface SuccessData {
  type: 'credits' | 'subscription';
  amount: number;
  credits?: number;
  plan?: string;
}

// =============================================================================
// Webhook Types
// =============================================================================

/** Base webhook payload structure */
export interface WebhookPayloadBase {
  id: string;
  metadata?: {
    userId?: string;
    planId?: string;
    billingCycle?: string;
    credits?: string;
    type?: string;
  };
}

/** Order webhook payload */
export interface OrderWebhookPayload extends WebhookPayloadBase {
  customer: {
    id: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
  };
  amount: number;
  currency: string;
}

/** Subscription webhook payload */
export interface SubscriptionWebhookPayload extends WebhookPayloadBase {
  customerId: string;
  product: {
    id: string;
    name: string;
  };
  currentPeriodStart: string;
  currentPeriodEnd: string;
  status: string;
  canceledAt?: string;
  cancelAtPeriodEnd?: boolean;
}

/** Union type for all webhook payloads */
export type WebhookPayload = OrderWebhookPayload | SubscriptionWebhookPayload;

// =============================================================================
// Automation Types
// =============================================================================

/** Automation rule definition */
export interface AutomationRule {
  id?: string;
  name: string;
  template: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  days: string[];
  time: string;
  timezone: string;
  topic: string;
  tone: string;
  platforms: string[];
  isActive?: boolean;
  userId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// =============================================================================
// AI Generation Types
// =============================================================================

/** Result from AI content generation */
export interface GenerationResult {
  content: string;
  hashtags: string[];
  suggestedImagePrompt?: string;
  platform: string;
  tone: string;
  language: string;
}

/** AI content generation request */
export interface GenerationRequest {
  topic: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  language: string;
  tone: 'professional' | 'casual' | 'friendly' | 'energetic';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  variations?: number;
}

// =============================================================================
// Post Types
// =============================================================================

/** Social media post */
export interface Post {
  id: string;
  userId: string;
  content: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  status: 'draft' | 'scheduled' | 'posted' | 'failed';
  imageUrl?: string | null;
  topic?: string | null;
  scheduledDate?: Date | string | null;
  errorMessage?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/** Post publishing result */
export interface PublishResult {
  success: boolean;
  platform: string;
  postId?: string;
  postUrl?: string;
  error?: string;
}

// =============================================================================
// User Types
// =============================================================================

/** User tier levels */
export type UserTier = 'free' | 'pro' | 'business';

/** User record */
export interface User {
  id: string;
  name: string | null;
  email: string;
  tier: UserTier | null;
  credits: number;
  image?: string | null;
  createdAt?: Date | string | null;
}

// =============================================================================
// Admin Types
// =============================================================================

/** Admin user with stats */
export interface AdminUser extends User {
  postsCreated: number;
}

/** Admin transaction record */
export interface AdminTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'subscription' | 'credit_purchase' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  createdAt: Date | string;
  description: string;
}

/** User update data for admin */
export interface UserUpdateData {
  tier?: UserTier;
  name?: string;
  email?: string;
  image?: string | null;
}

// =============================================================================
// Error Types
// =============================================================================

/** Generation error record */
export interface GenerationError {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  platform: string;
  topic?: string;
  tone?: string;
  language?: string;
  errorMessage: string;
  createdAt: string;
}

/** Publishing error record */
export interface PublishingError {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  platform: string;
  content: string;
  status: string;
  errorMessage?: string | null;
  scheduledDate?: string | null;
  createdAt?: string | null;
}

// =============================================================================
// Analytics Types
// =============================================================================

/** Analytics data structure */
export interface AnalyticsData {
  credits?: {
    total: number;
    used: number;
    remaining: number;
    history?: Array<{ date: string; amount: number }>;
  };
  generation?: {
    total: number;
    byPlatform: Record<string, number>;
    byLanguage: Record<string, number>;
    successRate: number;
  };
  publishing?: {
    total: number;
    successful: number;
    failed: number;
    byPlatform: Record<string, number>;
  };
  tiers?: {
    free: number;
    pro: number;
    business: number;
  };
  automation?: {
    rules: AutomationRule[];
    stats: {
      totalRules: number;
      activeRules: number;
      totalCreditsConsumed: number;
      totalPostsGenerated: number;
    };
  };
}

// =============================================================================
// Translation Types
// =============================================================================

/** Language codes for SA languages */
export type LanguageCode = 'en' | 'af' | 'zu' | 'xh' | 'nso' | 'tn' | 'st' | 'ts' | 'ss' | 've' | 'nr';

/** Nested translation value - can be string, array, or nested object */
export type TranslationValue = string | string[] | TranslationRecord;

/** Translation record type - deeply nested JSON structure */
export interface TranslationRecord {
  [key: string]: TranslationValue;
}

/** Translations by language */
export type TranslationsByLanguage = Record<LanguageCode, TranslationRecord>;
