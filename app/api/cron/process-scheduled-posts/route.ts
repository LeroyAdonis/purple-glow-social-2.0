import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/lib/posting/post-service';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/security/auth-utils';
import { logger } from '@/lib/logger';

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

    logger.cron.info('Starting scheduled post processing');

    const postService = new PostService();
    await postService.processScheduledPosts();

    return NextResponse.json({
      success: true,
      message: 'Scheduled posts processed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process scheduled posts';
    logger.cron.exception(error, { action: 'cron-get' });
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Manual trigger endpoint (for testing/admin use)
 * POST /api/cron/process-scheduled-posts
 * 
 * Requires authenticated admin user
 */
export async function POST(request: NextRequest) {
  try {
    // Require authenticated session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    // Require admin role
    if (!isAdmin(session.user.email)) {
      logger.cron.warn('Non-admin user attempted manual trigger', { email: session.user.email });
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      );
    }

    logger.cron.info('Manual trigger by admin', { email: session.user.email });

    const postService = new PostService();
    await postService.processScheduledPosts();

    return NextResponse.json({
      success: true,
      message: 'Scheduled posts processed successfully (manual trigger)',
      triggeredBy: session.user.email,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process scheduled posts';
    logger.cron.exception(error, { action: 'manual-trigger' });
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
