import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GeminiService } from '@/lib/ai/gemini-service';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { canGenerate } from '@/lib/tiers/validation';
import { getTierLimits } from '@/lib/tiers/config';
import { logGeneration, getDailyGenerations } from '@/lib/db/generation-logs';
import { incrementGenerations, checkGenerationLimit } from '@/lib/db/daily-usage';
import type { TierName } from '@/lib/tiers/types';

/**
 * API endpoint to generate AI content
 * POST /api/ai/generate
 * 
 * Credits are NOT deducted for generation - only for publishing.
 * Generation is limited by daily tier limits.
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

    // Get user info
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check tier-based daily generation limit
    const userTier = (userRecord.tier || 'free') as TierName;
    const tierLimits = getTierLimits(userTier);
    const todayGenerations = await getDailyGenerations(session.user.id);
    
    const generationCheck = canGenerate(userTier, todayGenerations);
    if (!generationCheck.allowed) {
      return NextResponse.json(
        { 
          error: generationCheck.message,
          limit: generationCheck.limit,
          current: generationCheck.current,
          remaining: 0,
        },
        { status: 429 } // Too Many Requests
      );
    }

    const body = await request.json();
    const { 
      topic, 
      platform, 
      language = 'en', 
      tone = 'friendly',
      includeHashtags = true,
      includeEmojis = true,
      variations = 1,
    } = body;

    // Validate input
    if (!topic || !platform) {
      return NextResponse.json(
        { error: 'Topic and platform are required' },
        { status: 400 }
      );
    }

    const validPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Generate content
    const geminiService = new GeminiService();
    
    let results;
    let generationSuccess = true;
    let errorMessage: string | undefined;

    try {
      if (variations > 1) {
        results = await geminiService.generateVariations(
          {
            topic,
            platform,
            language,
            tone,
            includeHashtags,
            includeEmojis,
          },
          Math.min(variations, 3) // Max 3 variations
        );
      } else {
        const result = await geminiService.generateContent({
          topic,
          platform,
          language,
          tone,
          includeHashtags,
          includeEmojis,
        });
        results = [result];
      }
    } catch (genError: any) {
      generationSuccess = false;
      errorMessage = genError.message || 'AI generation failed';
      throw genError;
    } finally {
      // Log generation to generationLogs table (regardless of success)
      await logGeneration({
        userId: session.user.id,
        platform: platform as 'facebook' | 'instagram' | 'twitter' | 'linkedin',
        topic,
        tone,
        language,
        success: generationSuccess,
        errorMessage,
      });

      // Increment daily usage counter (even for failed attempts to prevent abuse)
      if (generationSuccess) {
        await incrementGenerations(session.user.id);
      }
    }

    // Calculate remaining generations for today
    const updatedGenerations = todayGenerations + 1;
    const remainingGenerations = Math.max(0, tierLimits.dailyGenerations - updatedGenerations);

    return NextResponse.json({
      success: true,
      results,
      credits: userRecord.credits, // Credits unchanged (not deducted for generation)
      dailyGenerations: {
        used: updatedGenerations,
        limit: tierLimits.dailyGenerations,
        remaining: remainingGenerations,
      },
    });
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
