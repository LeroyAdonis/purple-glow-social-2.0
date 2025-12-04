/**
 * Content Feedback API
 * Allows users to provide feedback on generated content
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { enhancedGeminiService } from '@/lib/ai/enhanced-gemini-service';
import { promptPatternAnalyzer } from '@/lib/ai/prompt-pattern-analyzer';
import { z } from 'zod';

const feedbackSchema = z.object({
  content: z.string().min(1),
  feedbackType: z.enum(['thumbs_up', 'thumbs_down', 'selected', 'edited', 'rejected']),
  platform: z.enum(['facebook', 'instagram', 'twitter', 'linkedin']),
  topic: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'energetic']).optional(),
  language: z.string().optional(),
  editedContent: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // Submit feedback to learning system
    await enhancedGeminiService.submitFeedback(
      session.user.id,
      validatedData.content,
      validatedData.feedbackType,
      {
        platform: validatedData.platform,
        topic: validatedData.topic,
        tone: validatedData.tone,
        language: validatedData.language,
        editedContent: validatedData.editedContent,
        rejectionReason: validatedData.rejectionReason,
      }
    );

    // Update pattern effectiveness based on feedback
    const isPositive = validatedData.feedbackType === 'thumbs_up' || 
                       validatedData.feedbackType === 'selected';
    await promptPatternAnalyzer.processFeedbackForPatterns(
      validatedData.content,
      validatedData.platform,
      isPositive
    );

    return NextResponse.json({ 
      success: true,
      message: 'Feedback recorded successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid feedback data', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}
