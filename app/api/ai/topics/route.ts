import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { GeminiService } from '@/lib/ai/gemini-service';

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

    const body = await request.json();
    const { industry = 'general business' } = body;

    // Generate topic suggestions
    const geminiService = new GeminiService();
    const topics = await geminiService.getTopicSuggestions(industry);

    return NextResponse.json({
      success: true,
      topics,
    });
  } catch (error: any) {
    console.error('Topic suggestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate topic suggestions' },
      { status: 500 }
    );
  }
}
