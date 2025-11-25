import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/lib/posting/post-service';

/**
 * Cron job endpoint to process scheduled posts
 * GET /api/cron/process-scheduled-posts
 * 
 * This should be called every minute by a cron service like:
 * - Vercel Cron
 * - Upstash QStash
 * - External cron service
 * 
 * Add this to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-scheduled-posts",
 *     "schedule": "* * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting scheduled post processing...');

    const postService = new PostService();
    await postService.processScheduledPosts();

    return NextResponse.json({
      success: true,
      message: 'Scheduled posts processed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to process scheduled posts',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger endpoint (for testing)
 * POST /api/cron/process-scheduled-posts
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Manual trigger: Processing scheduled posts...');

    const postService = new PostService();
    await postService.processScheduledPosts();

    return NextResponse.json({
      success: true,
      message: 'Scheduled posts processed successfully (manual trigger)',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Manual cron trigger error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to process scheduled posts',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
