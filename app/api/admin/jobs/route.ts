import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecentJobs, getFailedJobs, getPendingJobs, getJobStats } from '@/lib/db/job-logs';

/**
 * Check if user is admin
 */
function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email) || email.endsWith('@purpleglow.co.za');
}

/**
 * GET /api/admin/jobs
 * Get job logs for admin monitoring
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

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
    console.error('Admin jobs fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
