/**
 * Inngest Client Configuration
 * 
 * Central Inngest client for Purple Glow Social 2.0
 */

import { Inngest } from 'inngest';

// Create the Inngest client
export const inngest = new Inngest({
  id: 'purple-glow-social',
  name: 'Purple Glow Social',
});

// Event types for type safety
export interface InngestEvents {
  // Scheduled post processing
  'post/scheduled.process': {
    data: {
      postId: string;
      userId: string;
      platform: string;
      scheduledAt: string;
    };
  };
  
  // Automation rule execution
  'automation/rule.execute': {
    data: {
      ruleId: string;
      userId: string;
    };
  };
  
  // Credit-related events
  'credits/check.expiry': {
    data: {
      // Empty - runs for all users
    };
  };
  
  'credits/reset.monthly': {
    data: {
      userId: string;
    };
  };
  
  'credits/check.low': {
    data: {
      userId: string;
      credits: number;
      monthlyAllocation: number;
    };
  };
  
  // Retry events
  'post/retry': {
    data: {
      postId: string;
      userId: string;
      retryCount: number;
      lastError: string;
    };
  };
}
