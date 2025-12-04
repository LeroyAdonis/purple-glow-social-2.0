import { NextRequest, NextResponse } from 'next/server';
import { refreshExpiringTokens } from '@/lib/oauth/token-refresh-service';
import { logger } from '@/lib/logger';

/**
 * Cron job to refresh expiring OAuth tokens
 * Should be called via Vercel Cron or similar scheduler
 * 
 * Recommended schedule: Every 6 hours (0 0,6,12,18 * * *)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.oauth.warn('Unauthorized cron access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    logger.oauth.info('Starting token refresh cron job');
    
    const results = await refreshExpiringTokens();
    
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      details: results.map(r => ({
        platform: r.platform,
        userId: r.userId.substring(0, 8) + '...', // Partial ID for privacy
        success: r.success,
        error: r.error,
        newExpiresAt: r.newExpiresAt?.toISOString(),
      })),
    };
    
    logger.oauth.info('Token refresh cron completed', summary);
    
    return NextResponse.json({
      success: true,
      message: 'Token refresh completed',
      summary,
    });
  } catch (error) {
    logger.oauth.exception(error, { action: 'cron-refresh-tokens' });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Token refresh cron failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
