/**
 * Analytics API
 * Provides engagement analytics and insights for learning
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { analyticsService } from '@/lib/ai/analytics-service';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';

const recordAnalyticsSchema = z.object({
  postId: z.string().uuid(),
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin']),
  metrics: z.object({
    likes: z.number().optional(),
    comments: z.number().optional(),
    shares: z.number().optional(),
    saves: z.number().optional(),
    reach: z.number().optional(),
    impressions: z.number().optional(),
    clicks: z.number().optional(),
  }),
  generationContext: z.object({
    topic: z.string().optional(),
    tone: z.enum(['professional', 'casual', 'friendly', 'energetic']).optional(),
    language: z.string().optional(),
    promptVariation: z.string().optional(),
  }).optional(),
});

// GET: Get analytics summary for the user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');

    const summary = await analyticsService.getUserAnalyticsSummary(
      session.user.id,
      Math.min(days, 90) // Cap at 90 days
    );

    return NextResponse.json({ 
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.ai.error('Analytics retrieval failed', { error });
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 });
  }
}

// POST: Record analytics for a post
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await parseRequestBody<{
      postId: string;
      platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
      metrics: {
        likes?: number;
        comments?: number;
        shares?: number;
        saves?: number;
        reach?: number;
        impressions?: number;
        clicks?: number;
      };
      generationContext?: {
        topic?: string;
        tone?: 'professional' | 'casual' | 'friendly' | 'energetic';
        language?: string;
        promptVariation?: string;
      };
    }>(request);
    if (!body) {
      return invalidJsonResponse();
    }

    const validatedData = recordAnalyticsSchema.parse(body);

    await analyticsService.recordAnalytics(
      validatedData.postId,
      session.user.id,
      validatedData.platform,
      validatedData.metrics,
      validatedData.generationContext
    );

    return NextResponse.json({ 
      success: true,
      message: 'Analytics recorded successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid analytics data', 
        details: error.issues 
      }, { status: 400 });
    }
    
    logger.ai.error('Analytics recording failed', { error });
    return NextResponse.json({ error: 'Failed to record analytics' }, { status: 500 });
  }
}
