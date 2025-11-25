import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GeminiService } from '@/lib/ai/gemini-service';

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
    console.error('Hashtag generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate hashtags' },
      { status: 500 }
    );
  }
}
