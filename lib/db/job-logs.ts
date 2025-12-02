/**
 * Database Service: Job Logs
 * 
 * Tracks Inngest job execution for monitoring and debugging
 */

import { db } from '../../drizzle/db';
import { jobLogs } from '../../drizzle/schema';
import { eq, and, desc, sql, gte, count } from 'drizzle-orm';
import type { JobLog, NewJobLog } from '../../drizzle/schema';

type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Create a job log entry
 */
export async function logJob(data: {
  inngestEventId?: string;
  functionName: string;
  status: JobStatus;
  payload?: Record<string, unknown>;
}): Promise<JobLog> {
  const [log] = await db
    .insert(jobLogs)
    .values({
      inngestEventId: data.inngestEventId,
      functionName: data.functionName,
      status: data.status,
      payload: data.payload,
      retryCount: 0,
    })
    .returning();

  return log;
}

/**
 * Update job status
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  options: {
    result?: Record<string, unknown>;
    errorMessage?: string;
    incrementRetry?: boolean;
  } = {}
): Promise<JobLog | null> {
  // Build update object dynamically
  const updateValues: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (options.result !== undefined) {
    updateValues.result = options.result;
  }
  if (options.errorMessage !== undefined) {
    updateValues.errorMessage = options.errorMessage;
  }

  // Handle retry increment separately since it requires SQL
  if (options.incrementRetry) {
    const [updated] = await db
      .update(jobLogs)
      .set({
        ...updateValues,
        retryCount: sql`${jobLogs.retryCount} + 1`,
      })
      .where(eq(jobLogs.id, jobId))
      .returning();
    return updated || null;
  }

  const [updated] = await db
    .update(jobLogs)
    .set(updateValues)
    .where(eq(jobLogs.id, jobId))
    .returning();

  return updated || null;
}

/**
 * Update job by Inngest event ID
 */
export async function updateJobByEventId(
  inngestEventId: string,
  status: JobStatus,
  options: {
    result?: Record<string, unknown>;
    errorMessage?: string;
    incrementRetry?: boolean;
  } = {}
): Promise<JobLog | null> {
  // Build update object dynamically
  const updateValues: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (options.result !== undefined) {
    updateValues.result = options.result;
  }
  if (options.errorMessage !== undefined) {
    updateValues.errorMessage = options.errorMessage;
  }

  // Handle retry increment separately since it requires SQL
  if (options.incrementRetry) {
    const [updated] = await db
      .update(jobLogs)
      .set({
        ...updateValues,
        retryCount: sql`${jobLogs.retryCount} + 1`,
      })
      .where(eq(jobLogs.inngestEventId, inngestEventId))
      .returning();
    return updated || null;
  }

  const [updated] = await db
    .update(jobLogs)
    .set(updateValues)
    .where(eq(jobLogs.inngestEventId, inngestEventId))
    .returning();

  return updated || null;
}

/**
 * Get failed jobs
 */
export async function getFailedJobs(
  options: { limit?: number; functionName?: string } = {}
): Promise<JobLog[]> {
  const { limit = 50, functionName } = options;

  const conditions = [eq(jobLogs.status, 'failed')];
  if (functionName) {
    conditions.push(eq(jobLogs.functionName, functionName));
  }

  return await db
    .select()
    .from(jobLogs)
    .where(and(...conditions))
    .orderBy(desc(jobLogs.createdAt))
    .limit(limit);
}

/**
 * Get pending jobs
 */
export async function getPendingJobs(
  options: { limit?: number; functionName?: string } = {}
): Promise<JobLog[]> {
  const { limit = 50, functionName } = options;

  const conditions = [eq(jobLogs.status, 'pending')];
  if (functionName) {
    conditions.push(eq(jobLogs.functionName, functionName));
  }

  return await db
    .select()
    .from(jobLogs)
    .where(and(...conditions))
    .orderBy(desc(jobLogs.createdAt))
    .limit(limit);
}

/**
 * Get recent jobs
 */
export async function getRecentJobs(
  options: { limit?: number; status?: JobStatus; functionName?: string } = {}
): Promise<JobLog[]> {
  const { limit = 50, status, functionName } = options;

  const conditions = [];
  if (status) {
    conditions.push(eq(jobLogs.status, status));
  }
  if (functionName) {
    conditions.push(eq(jobLogs.functionName, functionName));
  }

  const query = db
    .select()
    .from(jobLogs)
    .orderBy(desc(jobLogs.createdAt))
    .limit(limit);

  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }

  return await query;
}

/**
 * Get job stats for monitoring
 */
export async function getJobStats(days: number = 7): Promise<{
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
  byFunction: Record<string, { total: number; failed: number }>;
  averageRetries: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await db
    .select()
    .from(jobLogs)
    .where(gte(jobLogs.createdAt, startDate));

  let total = 0;
  let pending = 0;
  let running = 0;
  let completed = 0;
  let failed = 0;
  let cancelled = 0;
  let totalRetries = 0;
  const byFunction: Record<string, { total: number; failed: number }> = {};

  for (const log of logs) {
    total++;
    totalRetries += log.retryCount;

    switch (log.status) {
      case 'pending':
        pending++;
        break;
      case 'running':
        running++;
        break;
      case 'completed':
        completed++;
        break;
      case 'failed':
        failed++;
        break;
      case 'cancelled':
        cancelled++;
        break;
    }

    if (!byFunction[log.functionName]) {
      byFunction[log.functionName] = { total: 0, failed: 0 };
    }
    byFunction[log.functionName].total++;
    if (log.status === 'failed') {
      byFunction[log.functionName].failed++;
    }
  }

  return {
    total,
    pending,
    running,
    completed,
    failed,
    cancelled,
    byFunction,
    averageRetries: total > 0 ? totalRetries / total : 0,
  };
}

/**
 * Get job by ID
 */
export async function getJobById(jobId: string): Promise<JobLog | null> {
  const [log] = await db
    .select()
    .from(jobLogs)
    .where(eq(jobLogs.id, jobId))
    .limit(1);

  return log || null;
}

/**
 * Get job by Inngest event ID
 */
export async function getJobByEventId(inngestEventId: string): Promise<JobLog | null> {
  const [log] = await db
    .select()
    .from(jobLogs)
    .where(eq(jobLogs.inngestEventId, inngestEventId))
    .limit(1);

  return log || null;
}

/**
 * Delete old job logs (for cleanup)
 */
export async function deleteOldJobs(daysToKeep: number = 30): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  await db
    .delete(jobLogs)
    .where(sql`${jobLogs.createdAt} < ${cutoffDate}`);
}
