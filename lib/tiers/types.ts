// Tier system TypeScript types

export type TierName = 'free' | 'pro' | 'business';

export interface TierLimits {
  // Connected accounts per platform
  connectedAccountsPerPlatform: number;
  totalConnectedAccounts: number;
  
  // Scheduling limits
  queueSize: number; // Max posts in scheduled queue
  advanceSchedulingDays: number; // How far in advance can schedule
  dailyPostsPerPlatform: number; // Max posts per platform per day
  
  // Generation limits
  dailyGenerations: number; // Max AI content generations per day
  
  // Automation
  automationEnabled: boolean;
  maxAutomationRules: number;
  
  // Credits
  monthlyCredits: number;
  maxCreditCarryover: number; // Max credits that can carry over to next month
}

export interface TierInfo {
  name: TierName;
  displayName: string;
  description: string;
  limits: TierLimits;
  price: {
    monthly: number; // in ZAR cents
    annual: number; // in ZAR cents (per year)
  };
}

export interface PlatformBreakdown {
  facebook?: number;
  instagram?: number;
  twitter?: number;
  linkedin?: number;
}

export interface UsageStats {
  date: string;
  generationsCount: number;
  postsCount: number;
  platformBreakdown: PlatformBreakdown;
}

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
}
