import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PostService } from '@/lib/posting/post-service';
import { db } from '@/drizzle/db';
import { posts } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * API endpoint to publish a specific scheduled post
 * POST /api/posts/scheduled/publish
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
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Verify post belongs to user
    const post = await db.query.posts.findFirst({
      where: and(
        eq(posts.id, postId),
        eq(posts.userId, session.user.id)
      ),
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.status !== 'scheduled' && post.status !== 'draft') {
      return NextResponse.json(
        { error: 'Post is not scheduled or draft' },
        { status: 400 }
      );
    }

    // Publish the post
    const postService = new PostService();
    const results = await postService.publishScheduledPost(postId);

    if (results[0].success) {
      return NextResponse.json({
        success: true,
        platform: results[0].platform,
        postId: results[0].postId,
        postUrl: results[0].postUrl,
      });
    } else {
      return NextResponse.json(
        { error: results[0].error || 'Failed to publish post' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Publish scheduled post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish scheduled post' },
      { status: 500 }
    );
  }
}
