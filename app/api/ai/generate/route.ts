import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GeminiService } from '@/lib/ai/gemini-service';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * API endpoint to generate AI content
 * POST /api/ai/generate
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

    // Check user credits
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (userRecord.credits <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please top up to continue.' },
        { status: 403 }
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

    // Deduct credits (1 credit per generation, regardless of variations)
    await db
      .update(user)
      .set({
        credits: userRecord.credits - 1,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({
      success: true,
      results,
      creditsRemaining: userRecord.credits - 1,
    });
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
