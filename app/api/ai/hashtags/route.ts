import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GeminiService } from '@/lib/ai/gemini-service';
import { rateLimiters } from '@/lib/security/rate-limit';
import { logger } from '@/lib/logger';

/**
 * API endpoint to generate hashtag suggestions
 * POST /api/ai/hashtags
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Apply rate limiting (20 requests per minute for hashtags)
    const rateLimitResult = await rateLimiters.contentGen.limit(`ai-hashtags:${session.user.id}`);
    if (!rateLimitResult.success) {
      const resetTime = Math.ceil(((rateLimitResult as any).reset - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: `Too many hashtag requests. Try again in ${resetTime} seconds.`,
          retryAfter: resetTime,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { topic, count = 10 } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Generate hashtags
    const geminiService = new GeminiService();
    const hashtags = await geminiService.generateHashtags(topic, count);

    return NextResponse.json({
      success: true,
      hashtags,
    });
  } catch (error: any) {
    logger.ai.error('Hashtag generation failed', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to generate hashtags' },
      { status: 500 }
    );
  }
}
