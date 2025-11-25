import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PostService } from '@/lib/posting/post-service';

/**
 * API endpoint to publish a post immediately
 * POST /api/posts/publish
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
    const { platform, content, imageUrl, link } = body;

    // Validate input
    if (!platform || !content) {
      return NextResponse.json(
        { error: 'Platform and content are required' },
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

    // Special validation for Instagram
    if (platform === 'instagram' && !imageUrl) {
      return NextResponse.json(
        { error: 'Instagram posts require an image' },
        { status: 400 }
      );
    }

    // Post to platform
    const postService = new PostService();
    const result = await postService.postToPlatform(
      session.user.id,
      platform as any,
      {
        content,
        imageUrl,
        link,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to publish post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      platform: result.platform,
      postId: result.postId,
      postUrl: result.postUrl,
    });
  } catch (error: any) {
    console.error('Publish post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to publish post' },
      { status: 500 }
    );
  }
}
