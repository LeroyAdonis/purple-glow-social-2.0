// Centralized tier limits configuration for Purple Glow Social 2.0

import type { TierInfo, TierLimits, TierName } from './types';

// Define tier limits
export const TIER_LIMITS: Record<TierName, TierLimits> = {
  free: {
    connectedAccountsPerPlatform: 1,
    totalConnectedAccounts: 4, // 1 per platform
    queueSize: 5,
    advanceSchedulingDays: 7,
    dailyPostsPerPlatform: 3,
    dailyGenerations: 5,
    automationEnabled: false,
    maxAutomationRules: 0,
    monthlyCredits: 10,
    maxCreditCarryover: 0, // No carryover for free tier
    videoCredits: 0,
  },
  pro: {
    connectedAccountsPerPlatform: 3,
    totalConnectedAccounts: 12, // 3 per platform
    queueSize: 50,
    advanceSchedulingDays: 30,
    dailyPostsPerPlatform: 10,
    dailyGenerations: 100,
    automationEnabled: true,
    maxAutomationRules: 5,
    monthlyCredits: 500,
    maxCreditCarryover: 0, // No carryover allowed
    videoCredits: 10,
  },
  business: {
    connectedAccountsPerPlatform: 100, // Unlimited
    totalConnectedAccounts: 400, // Unlimited
    queueSize: 10000, // Unlimited
    advanceSchedulingDays: 90,
    dailyPostsPerPlatform: 10000, // Unlimited
    dailyGenerations: 10000, // Unlimited
    automationEnabled: true,
    maxAutomationRules: 10000, // Unlimited
    monthlyCredits: 2000,
    maxCreditCarryover: 0, // No carryover allowed
    videoCredits: 50,
  },
};

// Full tier info including pricing
export const TIER_INFO: Record<TierName, TierInfo> = {
  free: {
    name: 'free',
    displayName: 'Free',
    description: 'Get started with basic social media management',
    limits: TIER_LIMITS.free,
    price: {
      monthly: 0,
      annual: 0,
    },
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    description: 'Perfect for small businesses and content creators',
    limits: TIER_LIMITS.pro,
    price: {
      monthly: 29900, // R299/month in cents
      annual: 299900, // R2,999/year in cents (save R590)
    },
  },
  business: {
    name: 'business',
    displayName: 'Business',
    description: 'Full power for agencies and large teams',
    limits: TIER_LIMITS.business,
    price: {
      monthly: 79900, // R799/month in cents
      annual: 799900, // R7,999/year in cents (save R1,589)
    },
  },
};

// Helper to get limits for a tier
export function getTierLimits(tier: TierName): TierLimits {
  return TIER_LIMITS[tier];
}

// Helper to get full tier info
export function getTierInfo(tier: TierName): TierInfo {
  return TIER_INFO[tier];
}

// Helper to format price in ZAR
export function formatPrice(priceInCents: number): string {
  if (priceInCents === 0) return 'Free';
  const priceInRand = priceInCents / 100;
  return `R${priceInRand.toLocaleString('en-ZA')}`;
}

// Platform display names
export const PLATFORM_DISPLAY_NAMES = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
} as const;

// All supported platforms
export const PLATFORMS = ['facebook', 'instagram', 'twitter', 'linkedin'] as const;
export type Platform = typeof PLATFORMS[number];
