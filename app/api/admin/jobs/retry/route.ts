import { NextRequest, NextResponse } from 'next/server';
import { getJobById, updateJobStatus } from '@/lib/db/job-logs';
import { inngest } from '@/lib/inngest/client';
import { requireAdmin, handleAuthError } from '@/lib/security/auth-utils';
import { logger } from '@/lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';

/**
 * POST /api/admin/jobs/retry
 * Manually retry a failed job
 */
export async function POST(request: NextRequest) {
  try {
    // Centralized auth check with audit logging
    await requireAdmin(request);

    const body = await parseRequestBody<{ jobId: string }>(request);
    if (!body) {
      return invalidJsonResponse();
    }

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
    // Handle auth errors
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    
    // Handle other errors
    logger.admin.exception(error, { action: 'retry-job' });
    return NextResponse.json(
      { error: error.message || 'Failed to retry job' },
      { status: 500 }
    );
  }
}
