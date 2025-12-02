import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { updatePost, getPostById } from '@/lib/db/posts';
import { z } from 'zod';

const scheduleSchema = z.object({
  postId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
});

/**
 * POST /api/posts/schedule
 * Schedule a post for publishing
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = scheduleSchema.parse(body);

    // Verify post belongs to user
    const post = await getPostById(validated.postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update post with scheduled date and status
    const updatedPost = await updatePost(validated.postId, {
      status: 'scheduled',
      scheduledDate: new Date(validated.scheduledDate),
    });

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: 'Post scheduled successfully',
    });
  } catch (error: any) {
    console.error('Schedule post error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to schedule post' },
      { status: 500 }
    );
  }
}
