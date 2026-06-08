/**
 * Rate Limiting (disabled)
 * 
 * Rate limiting was previously handled by Upstash Redis.
 * Currently disabled while the stack is simplified.
 * Re-enable when users actually need rate limiting.
 */

type RateLimiter = {
  limit: (key: string) => Promise<{ success: boolean }>;
};

function createNoopLimiter(): RateLimiter {
  return {
    limit: async () => ({ success: true }),
  };
}

export const rateLimiters: {
  contentGen: RateLimiter;
  oauth: RateLimiter;
  api: RateLimiter;
  auth: RateLimiter;
  ai: RateLimiter;
  posting: RateLimiter;
} = {
  contentGen: createNoopLimiter(),
  oauth: createNoopLimiter(),
  api: createNoopLimiter(),
  auth: createNoopLimiter(),
  ai: createNoopLimiter(),
  posting: createNoopLimiter(),
};
