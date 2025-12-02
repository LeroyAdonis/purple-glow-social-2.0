import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getJobById, updateJobStatus } from '@/lib/db/job-logs';
import { inngest } from '@/lib/inngest/client';

/**
 * Check if user is admin
 */
function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email) || email.endsWith('@purpleglow.co.za');
}

/**
 * POST /api/admin/jobs/retry
 * Manually retry a failed job
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    // Get the job
    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'failed') {
      return NextResponse.json({ error: 'Only failed jobs can be retried' }, { status: 400 });
    }

    // Update job status to pending
    await updateJobStatus(jobId, 'pending', {
      errorMessage: undefined,
    });

    // Re-send the Inngest event based on function name
    const payload = job.payload as Record<string, unknown> || {};
    
    try {
      // Send a new event to Inngest
      if (job.functionName.includes('scheduled-post')) {
        await inngest.send({
          name: 'post/scheduled.process',
          data: payload as any,
        });
      } else if (job.functionName.includes('automation')) {
        await inngest.send({
          name: 'automation/rule.execute',
          data: payload as any,
        });
      } else if (job.functionName.includes('credits')) {
        // Credits-related jobs
        if (job.functionName.includes('expiry')) {
          await inngest.send({
            name: 'credits/check.expiry',
            data: {},
          });
        } else if (job.functionName.includes('low')) {
          await inngest.send({
            name: 'credits/check.low',
            data: payload as any,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Job queued for retry',
        jobId,
      });
    } catch (inngestError: any) {
      // If Inngest fails, revert job status
      await updateJobStatus(jobId, 'failed', {
        errorMessage: `Retry failed: ${inngestError.message}`,
      });
      
      return NextResponse.json({
        error: 'Failed to queue job for retry',
        details: inngestError.message,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Job retry error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retry job' },
      { status: 500 }
    );
  }
}
