/**
 * Rate Limiting Configuration
 * 
 * Uses Upstash Redis for distributed rate limiting
 * Falls back to in-memory rate limiting if Redis is not configured
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Redis client (only if credentials are available)
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory fallback for development/testing
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Create a rate limiter with specified limits
 */
function createRateLimiter(requests: number, windowMs: number) {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, `${windowMs}ms`),
      analytics: true,
    });
  }
  
  // In-memory fallback
  return {
    limit: async (identifier: string) => {
      const now = Date.now();
      const key = identifier;
      const stored = inMemoryStore.get(key);
      
      if (!stored || now > stored.resetAt) {
        inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
        return { success: true, remaining: requests - 1 };
      }
      
      if (stored.count >= requests) {
        return { 
          success: false, 
          remaining: 0,
          reset: stored.resetAt,
        };
      }
      
      stored.count += 1;
      return { success: true, remaining: requests - stored.count };
    },
  };
}

// Rate limiters for different endpoints
export const rateLimiters = {
  // General API: 100 requests per minute
  api: createRateLimiter(100, 60 * 1000),
  
  // Authentication: 5 attempts per 15 minutes
  auth: createRateLimiter(5, 15 * 60 * 1000),
  
  // Content generation: 10 per minute
  contentGen: createRateLimiter(10, 60 * 1000),
  
  // OAuth: 10 per minute
  oauth: createRateLimiter(10, 60 * 1000),
  
  // Webhooks: 100 per minute (higher for automated systems)
  webhooks: createRateLimiter(100, 60 * 1000),
  
  // Admin endpoints: 50 per minute
  admin: createRateLimiter(50, 60 * 1000),
};

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from session (would need to be passed or retrieved)
  // For now, use IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

/**
 * Apply rate limiting to a request
 */
export async function applyRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters = 'api'
): Promise<{ success: boolean; response?: NextResponse }> {
  const identifier = getClientIdentifier(request);
  const limiter = rateLimiters[limiterType];
  
  try {
    const result = await limiter.limit(identifier);
    
    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          { 
            error: 'Too many requests',
            message: 'Haai, slow down! Too many requests. Please try again later.',
            retryAfter: Math.ceil(((result as any).reset - Date.now()) / 1000),
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Remaining': '0',
              'Retry-After': String(Math.ceil(((result as any).reset - Date.now()) / 1000)),
            },
          }
        ),
      };
    }
    
    return { success: true };
  } catch (error) {
    // If rate limiting fails, allow the request (fail open)
    console.error('Rate limiting error:', error);
    return { success: true };
  }
}

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiterType: keyof typeof rateLimiters = 'api'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { success, response } = await applyRateLimit(request, limiterType);
    
    if (!success && response) {
      return response;
    }
    
    return handler(request);
  };
}
