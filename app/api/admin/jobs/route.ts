import { NextRequest, NextResponse } from 'next/server';
import { getRecentJobs, getFailedJobs, getPendingJobs, getJobStats } from '@/lib/db/job-logs';
import { requireAdmin, handleAuthError } from '@/lib/security/auth-utils';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/jobs
 * Get job logs for admin monitoring
 */
export async function GET(request: NextRequest) {
  try {
    // Centralized auth check with audit logging
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | null;
    const limit = parseInt(searchParams.get('limit') || '50');
    const functionName = searchParams.get('function') || undefined;

    // Fetch jobs and stats in parallel
    const [jobs, stats] = await Promise.all([
      status === 'failed' 
        ? getFailedJobs({ limit, functionName })
        : status === 'pending'
        ? getPendingJobs({ limit, functionName })
        : getRecentJobs({ limit, status: status || undefined, functionName }),
      getJobStats(7),
    ]);

    return NextResponse.json({
      jobs: jobs.map(job => ({
        id: job.id,
        inngestEventId: job.inngestEventId,
        functionName: job.functionName,
        status: job.status,
        payload: job.payload,
        result: job.result,
        errorMessage: job.errorMessage,
        retryCount: job.retryCount,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      })),
      stats,
    });
  } catch (error: any) {
    // Handle auth errors
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    
    // Handle other errors
    logger.admin.exception(error, { action: 'fetch-jobs' });
    return NextResponse.json(
      { error: error.message || 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
