import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GeminiService } from '@/lib/ai/gemini-service';
import { rateLimiters } from '@/lib/security/rate-limit';
import { logger } from '@/lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';

/**
 * API endpoint to get topic suggestions
 * POST /api/ai/topics
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

    // Apply rate limiting (20 requests per minute for topics)
    const rateLimitResult = await rateLimiters.contentGen.limit(`ai-topics:${session.user.id}`);
    if (!rateLimitResult.success) {
      const resetTime = Math.ceil(((rateLimitResult as any).reset - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          message: `Too many topic requests. Try again in ${resetTime} seconds.`,
          retryAfter: resetTime,
        },
        { status: 429 }
      );
    }

    const body = await parseRequestBody<{ industry?: string }>(request);
    if (!body) {
      return invalidJsonResponse();
    }

    const { industry = 'general business' } = body;

    // Generate topic suggestions
    const geminiService = new GeminiService();
    const topics = await geminiService.getTopicSuggestions(industry);

    return NextResponse.json({
      success: true,
      topics,
    });
  } catch (error: any) {
    logger.ai.error('Topic suggestion failed', { error });
    return NextResponse.json(
      { error: error.message || 'Failed to generate topic suggestions' },
      { status: 500 }
    );
  }
}
