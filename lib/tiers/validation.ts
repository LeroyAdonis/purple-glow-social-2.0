// Tier validation helper functions

import { getTierLimits } from './config';
import type { TierName, LimitCheckResult, PlatformBreakdown } from './types';

// Check if user can connect more accounts
export function canConnect(
  tier: TierName,
  currentAccountsPerPlatform: Record<string, number>,
  platform: string
): LimitCheckResult {
  const limits = getTierLimits(tier);
  const currentForPlatform = currentAccountsPerPlatform[platform] ?? 0;
  const totalCurrent = Object.values(currentAccountsPerPlatform).reduce((sum, count) => sum + count, 0);

  // Check per-platform limit
  if (currentForPlatform >= limits.connectedAccountsPerPlatform) {
    return {
      allowed: false,
      current: currentForPlatform,
      limit: limits.connectedAccountsPerPlatform,
      message: `You've reached the maximum of ${limits.connectedAccountsPerPlatform} ${platform} account(s) for your ${tier} tier`,
    };
  }

  // Check total limit
  if (totalCurrent >= limits.totalConnectedAccounts) {
    return {
      allowed: false,
      current: totalCurrent,
      limit: limits.totalConnectedAccounts,
      message: `You've reached the maximum of ${limits.totalConnectedAccounts} total connected accounts for your ${tier} tier`,
    };
  }

  return {
    allowed: true,
    current: currentForPlatform,
    limit: limits.connectedAccountsPerPlatform,
  };
}

// Check if user can schedule more posts
export function canSchedule(
  tier: TierName,
  currentQueueSize: number,
  scheduledDate: Date
): LimitCheckResult {
  const limits = getTierLimits(tier);

  // Check queue size
  if (currentQueueSize >= limits.queueSize) {
    return {
      allowed: false,
      current: currentQueueSize,
      limit: limits.queueSize,
      message: `Your scheduled queue is full (${limits.queueSize} posts). Delete or publish some posts first.`,
    };
  }

  // Check advance scheduling
  const now = new Date();
  const daysInAdvance = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysInAdvance > limits.advanceSchedulingDays) {
    return {
      allowed: false,
      current: daysInAdvance,
      limit: limits.advanceSchedulingDays,
      message: `Your ${tier} tier allows scheduling up to ${limits.advanceSchedulingDays} days in advance`,
    };
  }

  return {
    allowed: true,
    current: currentQueueSize,
    limit: limits.queueSize,
  };
}

// Check if user can generate more content today
export function canGenerate(
  tier: TierName,
  todayGenerations: number
): LimitCheckResult {
  const limits = getTierLimits(tier);

  if (todayGenerations >= limits.dailyGenerations) {
    return {
      allowed: false,
      current: todayGenerations,
      limit: limits.dailyGenerations,
      message: `You've used all ${limits.dailyGenerations} AI generations for today. Upgrade or wait until tomorrow.`,
    };
  }

  return {
    allowed: true,
    current: todayGenerations,
    limit: limits.dailyGenerations,
  };
}

// Check if user can post to a platform today
export function canPost(
  tier: TierName,
  platform: string,
  todayPlatformBreakdown: PlatformBreakdown
): LimitCheckResult {
  const limits = getTierLimits(tier);
  const currentForPlatform = todayPlatformBreakdown[platform as keyof PlatformBreakdown] ?? 0;

  if (currentForPlatform >= limits.dailyPostsPerPlatform) {
    return {
      allowed: false,
      current: currentForPlatform,
      limit: limits.dailyPostsPerPlatform,
      message: `You've reached the daily limit of ${limits.dailyPostsPerPlatform} posts for ${platform}`,
    };
  }

  return {
    allowed: true,
    current: currentForPlatform,
    limit: limits.dailyPostsPerPlatform,
  };
}

// Check if user can use automation features
export function canUseAutomation(
  tier: TierName,
  currentRulesCount: number
): LimitCheckResult {
  const limits = getTierLimits(tier);

  if (!limits.automationEnabled) {
    return {
      allowed: false,
      current: currentRulesCount,
      limit: 0,
      message: 'Automation is not available on the Free tier. Upgrade to Pro or Business to use automation.',
    };
  }

  if (currentRulesCount >= limits.maxAutomationRules) {
    return {
      allowed: false,
      current: currentRulesCount,
      limit: limits.maxAutomationRules,
      message: `You've reached the maximum of ${limits.maxAutomationRules} automation rules for your ${tier} tier`,
    };
  }

  return {
    allowed: true,
    current: currentRulesCount,
    limit: limits.maxAutomationRules,
  };
}

// Get a specific limit value
export function getLimit(tier: TierName, limitKey: keyof ReturnType<typeof getTierLimits>): number | boolean {
  const limits = getTierLimits(tier);
  return limits[limitKey];
}

// Check if user has enough credits for an action
export function hasEnoughCredits(
  availableCredits: number,
  reservedCredits: number,
  requiredCredits: number
): LimitCheckResult {
  const effectiveCredits = availableCredits - reservedCredits;

  if (effectiveCredits < requiredCredits) {
    return {
      allowed: false,
      current: effectiveCredits,
      limit: requiredCredits,
      message: `Insufficient credits. You need ${requiredCredits} but only have ${effectiveCredits} available.`,
    };
  }

  return {
    allowed: true,
    current: effectiveCredits,
    limit: requiredCredits,
  };
}

// Calculate credits needed for multi-platform post
export function calculatePostCredits(platforms: string[]): number {
  // 1 credit per platform
  return platforms.length;
}
