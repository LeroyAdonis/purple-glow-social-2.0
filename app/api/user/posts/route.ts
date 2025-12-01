import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserPosts, getPostStats } from '@/lib/db/posts';

/**
 * GET /api/user/posts
 * Fetch current user's posts with optional filtering
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'draft' | 'scheduled' | 'posted' | 'failed' | null;
    const platform = searchParams.get('platform') as 'facebook' | 'instagram' | 'twitter' | 'linkedin' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await getUserPosts(session.user.id, {
      status: status || undefined,
      platform: platform || undefined,
      limit,
      offset,
    });

    const stats = await getPostStats(session.user.id);

    return NextResponse.json({
      posts,
      stats,
      pagination: {
        limit,
        offset,
        hasMore: posts.length === limit,
      },
    });
  } catch (error: any) {
    console.error('Posts fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
