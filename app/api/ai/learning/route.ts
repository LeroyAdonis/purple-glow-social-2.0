/**
 * Learning API
 * Manages user learning profiles and triggers learning updates
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { learningProfileService } from '@/lib/ai/learning-profile-service';
import { promptPatternAnalyzer } from '@/lib/ai/prompt-pattern-analyzer';
import { z } from 'zod';

const updateProfileSchema = z.object({
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  brandVoice: z.string().optional(),
});

// GET: Get user's learning profile
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const platform = url.searchParams.get('platform') || 'instagram';

    const context = await learningProfileService.getLearningContext(
      session.user.id,
      platform
    );

    return NextResponse.json({ 
      success: true,
      data: context,
    });
  } catch (error) {
    console.error('Learning profile error:', error);
    return NextResponse.json({ error: 'Failed to get learning profile' }, { status: 500 });
  }
}

// POST: Update user's industry context
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    if (validatedData.industry) {
      await learningProfileService.updateIndustryContext(
        session.user.id,
        validatedData.industry,
        validatedData.targetAudience,
        validatedData.brandVoice
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Learning profile updated',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid profile data', 
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// PUT: Trigger learning analysis
export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run learning analysis for the user
    await learningProfileService.runLearningAnalysis(session.user.id);

    return NextResponse.json({ 
      success: true,
      message: 'Learning analysis triggered',
    });
  } catch (error) {
    console.error('Learning analysis error:', error);
    return NextResponse.json({ error: 'Failed to run learning analysis' }, { status: 500 });
  }
}
