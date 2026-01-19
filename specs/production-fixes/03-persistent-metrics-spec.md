# Persistent Performance Metrics Implementation Specification

**Priority:** MEDIUM  
**Estimated Effort:** 4-5 hours  
**Dependencies:** Database access  
**Owner:** Backend Developer  

---

## 1. Executive Summary

### Current State
Performance metrics are stored in an in-memory buffer (`lib/monitoring/performance.ts`, line 18):

```typescript
// In-memory metrics buffer (in production, use Redis or similar)
const metricsBuffer: PerformanceMetric[] = [];
const MAX_BUFFER_SIZE = 1000;
```

### Gap
- Metrics are lost on server restart or deployment
- No historical data for trend analysis
- Cannot analyze performance across multiple instances
- No visualization in admin dashboard
- Limited debugging capability for production issues

### Impact if NOT Fixed
- Unable to identify performance trends over time
- Cannot debug slow queries or API calls after restart
- No data for capacity planning
- Reduced observability in production

### Solution
1. Create a `performanceMetrics` database table
2. Implement hybrid storage (in-memory cache + database persistence)
3. Add retention policy (30 days)
4. Create admin API endpoint for querying metrics
5. Add visualization widget to admin dashboard

---

## 2. Technical Requirements

### 2.1 Core Requirements
- [ ] Persist metrics to PostgreSQL database
- [ ] Maintain in-memory buffer for recent metrics (fast reads)
- [ ] Batch insert to database (reduce write overhead)
- [ ] 30-day retention with automatic cleanup
- [ ] Query API for admin dashboard
- [ ] Minimal performance impact on application

### 2.2 Metric Types to Track
| Metric Category | Examples | Retention |
|-----------------|----------|-----------|
| API Endpoints | Response times, status codes | 30 days |
| Database Queries | Query duration, table, operation type | 30 days |
| AI Generation | Model, tokens, duration | 30 days |
| OAuth Operations | Token refresh, platform | 30 days |
| Cron Jobs | Execution time, success/failure | 30 days |

### 2.3 Acceptance Criteria
- [ ] Metrics survive server restarts
- [ ] Query performance < 100ms for dashboard
- [ ] Write overhead < 5ms per metric (batched)
- [ ] Automatic cleanup of old metrics
- [ ] Admin dashboard shows performance graphs
- [ ] No data loss during high load

---

## 3. Implementation Steps

### Step 1: Add Database Schema

**File to Modify:** `drizzle/schema.ts`

**Add after line 223 (after jobLogs table):**

```typescript
// Performance Metrics for monitoring and debugging
export const performanceMetrics = pgTable("performance_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),                    // e.g., "api.post./api/user/profile"
  duration: integer("duration").notNull(),         // milliseconds
  category: text("category").notNull(),            // api, db, ai, oauth, cron
  tags: jsonb("tags").$type<Record<string, string>>(), // Additional context
  metadata: jsonb("metadata").$type<Record<string, unknown>>(), // Extra data
  success: boolean("success").default(true),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Add index for efficient queries
// Note: Add this in a migration file for production

// Types
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type NewPerformanceMetric = typeof performanceMetrics.$inferInsert;
```

### Step 2: Create Database Migration

**File to Create:** `drizzle/migrations/0003_performance_metrics.sql`

```sql
-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS "performance_metrics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "duration" integer NOT NULL,
  "category" text NOT NULL,
  "tags" jsonb,
  "metadata" jsonb,
  "success" boolean DEFAULT true,
  "timestamp" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS "idx_perf_metrics_name" ON "performance_metrics" ("name");
CREATE INDEX IF NOT EXISTS "idx_perf_metrics_category" ON "performance_metrics" ("category");
CREATE INDEX IF NOT EXISTS "idx_perf_metrics_timestamp" ON "performance_metrics" ("timestamp");
CREATE INDEX IF NOT EXISTS "idx_perf_metrics_category_timestamp" ON "performance_metrics" ("category", "timestamp");

-- Composite index for common dashboard queries
CREATE INDEX IF NOT EXISTS "idx_perf_metrics_dashboard" ON "performance_metrics" ("category", "name", "timestamp" DESC);
```

### Step 3: Update Performance Monitoring Module

**File to Modify:** `lib/monitoring/performance.ts`

**Replace entire file with:**

```typescript
/**
 * Performance Monitoring Utilities
 * 
 * Hybrid storage: in-memory buffer + database persistence
 * - Fast reads from memory for recent metrics
 * - Persistent storage in PostgreSQL for historical analysis
 * - Automatic batching for efficient writes
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

// Lazy import to avoid circular dependencies
let dbModule: typeof import('@/drizzle/db') | null = null;
let schemaModule: typeof import('@/drizzle/schema') | null = null;

async function getDb() {
  if (!dbModule) {
    dbModule = await import('@/drizzle/db');
  }
  return dbModule.db;
}

async function getSchema() {
  if (!schemaModule) {
    schemaModule = await import('@/drizzle/schema');
  }
  return schemaModule;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  category?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
  success?: boolean;
}

// In-memory buffer for fast reads
const metricsBuffer: PerformanceMetric[] = [];
const MAX_BUFFER_SIZE = 1000;

// Batch write buffer
const writeBuffer: PerformanceMetric[] = [];
const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 10000; // 10 seconds

// Flush timer
let flushTimer: NodeJS.Timeout | null = null;

/**
 * Determine category from metric name
 */
function categorizeMetric(name: string): string {
  if (name.startsWith('api.')) return 'api';
  if (name.startsWith('db.')) return 'db';
  if (name.startsWith('ai.')) return 'ai';
  if (name.startsWith('oauth.')) return 'oauth';
  if (name.startsWith('cron.')) return 'cron';
  if (name.startsWith('posting.')) return 'posting';
  return 'other';
}

/**
 * Flush write buffer to database
 */
async function flushToDatabase(): Promise<void> {
  if (writeBuffer.length === 0) return;

  const metricsToWrite = writeBuffer.splice(0, writeBuffer.length);
  
  try {
    const db = await getDb();
    const schema = await getSchema();
    
    if (!db || !schema.performanceMetrics) {
      // Database not available, metrics will be lost
      logger.api.warn('Database not available for metrics persistence');
      return;
    }

    await db.insert(schema.performanceMetrics).values(
      metricsToWrite.map(m => ({
        name: m.name,
        duration: m.duration,
        category: m.category || categorizeMetric(m.name),
        tags: m.tags || {},
        metadata: m.metadata || {},
        success: m.success ?? true,
        timestamp: m.timestamp,
      }))
    );

    logger.api.debug(`Flushed ${metricsToWrite.length} metrics to database`);
  } catch (error) {
    logger.api.exception(error, { action: 'metrics-flush', count: metricsToWrite.length });
    // Don't re-add to buffer - accept data loss rather than memory leak
  }
}

/**
 * Schedule periodic flush
 */
function scheduleFlush(): void {
  if (flushTimer) return;
  
  flushTimer = setInterval(async () => {
    await flushToDatabase();
  }, FLUSH_INTERVAL_MS);

  // Ensure timer doesn't prevent process exit
  if (flushTimer.unref) {
    flushTimer.unref();
  }
}

/**
 * Track a performance metric
 */
export function trackMetric(metric: PerformanceMetric): void {
  const enrichedMetric = {
    ...metric,
    category: metric.category || categorizeMetric(metric.name),
    success: metric.success ?? true,
  };

  // Add to in-memory buffer
  metricsBuffer.push(enrichedMetric);
  if (metricsBuffer.length > MAX_BUFFER_SIZE) {
    metricsBuffer.shift();
  }

  // Add to write buffer for persistence
  writeBuffer.push(enrichedMetric);
  
  // Flush if batch size reached
  if (writeBuffer.length >= BATCH_SIZE) {
    flushToDatabase();
  } else {
    scheduleFlush();
  }

  // Log slow operations
  if (metric.duration > 3000) {
    logger.api.warn(`Slow operation: ${metric.name} took ${metric.duration}ms`, metric.tags);
    
    Sentry.captureMessage(`Slow operation: ${metric.name}`, {
      level: 'warning',
      tags: {
        ...metric.tags,
        performance: 'slow',
        category: enrichedMetric.category,
      },
      extra: {
        duration: metric.duration,
        ...metric.metadata,
      },
    });
  }
}

/**
 * Create a timer for measuring operation duration
 */
export function createTimer(name: string, tags?: Record<string, string>) {
  const startTime = Date.now();
  
  return {
    stop: (metadata?: Record<string, unknown>) => {
      const duration = Date.now() - startTime;
      
      trackMetric({
        name,
        duration,
        timestamp: new Date(),
        tags,
        metadata,
      });
      
      return duration;
    },
  };
}

/**
 * Higher-order function to track async function performance
 */
export function withPerformanceTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  name: string,
  tags?: Record<string, string>
): T {
  return (async (...args: Parameters<T>) => {
    const timer = createTimer(name, tags);
    try {
      const result = await fn(...args);
      timer.stop({ success: true });
      return result;
    } catch (error) {
      timer.stop({ success: false, error: String(error) });
      throw error;
    }
  }) as T;
}

/**
 * Track API endpoint performance
 */
export function trackApiEndpoint(
  endpoint: string, 
  method: string, 
  statusCode: number, 
  duration: number
): void {
  trackMetric({
    name: `api.${method.toLowerCase()}.${endpoint.replace(/\//g, '.')}`,
    duration,
    timestamp: new Date(),
    category: 'api',
    tags: {
      endpoint,
      method,
      status: String(statusCode),
    },
    success: statusCode >= 200 && statusCode < 400,
  });
}

/**
 * Track database query performance
 */
export function trackDatabaseQuery(
  query: string, 
  table: string, 
  duration: number
): void {
  trackMetric({
    name: `db.${table}`,
    duration,
    timestamp: new Date(),
    category: 'db',
    tags: {
      table,
      queryType: query.split(' ')[0]?.toUpperCase() || 'UNKNOWN',
    },
  });
}

/**
 * Track AI generation performance
 */
export function trackAIGeneration(
  model: string, 
  promptTokens: number, 
  completionTokens: number, 
  duration: number
): void {
  trackMetric({
    name: `ai.${model}`,
    duration,
    timestamp: new Date(),
    category: 'ai',
    tags: {
      model,
    },
    metadata: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
  });
}

/**
 * Get recent metrics from in-memory buffer
 */
export function getRecentMetrics(name: string, limit: number = 100): PerformanceMetric[] {
  return metricsBuffer
    .filter(m => m.name === name || m.name.startsWith(name))
    .slice(-limit);
}

/**
 * Calculate average duration from in-memory metrics
 */
export function getAverageDuration(name: string): number {
  const metrics = getRecentMetrics(name);
  if (metrics.length === 0) return 0;
  
  const total = metrics.reduce((sum, m) => sum + m.duration, 0);
  return Math.round(total / metrics.length);
}

/**
 * Get performance summary from in-memory buffer
 */
export function getPerformanceSummary(): Record<string, { avg: number; count: number; max: number }> {
  const summary: Record<string, { total: number; count: number; max: number }> = {};
  
  for (const metric of metricsBuffer) {
    if (!summary[metric.name]) {
      summary[metric.name] = { total: 0, count: 0, max: 0 };
    }
    summary[metric.name].total += metric.duration;
    summary[metric.name].count += 1;
    summary[metric.name].max = Math.max(summary[metric.name].max, metric.duration);
  }
  
  const result: Record<string, { avg: number; count: number; max: number }> = {};
  for (const [name, data] of Object.entries(summary)) {
    result[name] = {
      avg: Math.round(data.total / data.count),
      count: data.count,
      max: data.max,
    };
  }
  
  return result;
}

/**
 * Query historical metrics from database
 */
export async function queryMetrics(options: {
  category?: string;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<PerformanceMetric[]> {
  try {
    const db = await getDb();
    const schema = await getSchema();
    const { eq, and, gte, lte, desc } = await import('drizzle-orm');
    
    if (!db || !schema.performanceMetrics) {
      return [];
    }

    const conditions = [];
    
    if (options.category) {
      conditions.push(eq(schema.performanceMetrics.category, options.category));
    }
    
    if (options.name) {
      conditions.push(eq(schema.performanceMetrics.name, options.name));
    }
    
    if (options.startDate) {
      conditions.push(gte(schema.performanceMetrics.timestamp, options.startDate));
    }
    
    if (options.endDate) {
      conditions.push(lte(schema.performanceMetrics.timestamp, options.endDate));
    }

    const query = db
      .select()
      .from(schema.performanceMetrics)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.performanceMetrics.timestamp))
      .limit(options.limit || 1000);

    const results = await query;
    
    return results.map(r => ({
      name: r.name,
      duration: r.duration,
      timestamp: r.timestamp,
      category: r.category,
      tags: r.tags as Record<string, string> | undefined,
      metadata: r.metadata as Record<string, unknown> | undefined,
      success: r.success ?? true,
    }));
  } catch (error) {
    logger.api.exception(error, { action: 'query-metrics' });
    return [];
  }
}

/**
 * Get aggregated metrics for dashboard
 */
export async function getMetricsAggregation(options: {
  category?: string;
  period: 'hour' | 'day' | 'week';
  limit?: number;
}): Promise<{
  category: string;
  avgDuration: number;
  maxDuration: number;
  count: number;
  successRate: number;
  period: string;
}[]> {
  try {
    const db = await getDb();
    const schema = await getSchema();
    const { sql, gte } = await import('drizzle-orm');
    
    if (!db || !schema.performanceMetrics) {
      return [];
    }

    // Calculate start date based on period
    const startDate = new Date();
    switch (options.period) {
      case 'hour':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case 'day':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    const results = await db
      .select({
        category: schema.performanceMetrics.category,
        avgDuration: sql<number>`avg(${schema.performanceMetrics.duration})::int`,
        maxDuration: sql<number>`max(${schema.performanceMetrics.duration})`,
        count: sql<number>`count(*)::int`,
        successCount: sql<number>`sum(case when ${schema.performanceMetrics.success} then 1 else 0 end)::int`,
      })
      .from(schema.performanceMetrics)
      .where(gte(schema.performanceMetrics.timestamp, startDate))
      .groupBy(schema.performanceMetrics.category)
      .limit(options.limit || 20);

    return results.map(r => ({
      category: r.category,
      avgDuration: r.avgDuration,
      maxDuration: r.maxDuration,
      count: r.count,
      successRate: r.count > 0 ? Math.round((r.successCount / r.count) * 100) : 100,
      period: options.period,
    }));
  } catch (error) {
    logger.api.exception(error, { action: 'metrics-aggregation' });
    return [];
  }
}

/**
 * Clean up old metrics (retention policy)
 */
export async function cleanupOldMetrics(retentionDays: number = 30): Promise<number> {
  try {
    const db = await getDb();
    const schema = await getSchema();
    const { lt } = await import('drizzle-orm');
    
    if (!db || !schema.performanceMetrics) {
      return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await db
      .delete(schema.performanceMetrics)
      .where(lt(schema.performanceMetrics.timestamp, cutoffDate));

    const deletedCount = (result as { rowCount?: number }).rowCount || 0;
    logger.api.info(`Cleaned up ${deletedCount} metrics older than ${retentionDays} days`);
    
    return deletedCount;
  } catch (error) {
    logger.api.exception(error, { action: 'cleanup-metrics' });
    return 0;
  }
}

/**
 * Force flush all pending metrics (for graceful shutdown)
 */
export async function flushAll(): Promise<void> {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  await flushToDatabase();
}
```

### Step 4: Create Admin API Endpoint

**File to Create:** `app/api/admin/metrics/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/security/auth-utils';
import { 
  getPerformanceSummary, 
  queryMetrics, 
  getMetricsAggregation,
  cleanupOldMetrics 
} from '@/lib/monitoring/performance';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/metrics
 * Query performance metrics for dashboard
 */
export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized) {
    return adminCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const period = (searchParams.get('period') || 'day') as 'hour' | 'day' | 'week';
    const view = searchParams.get('view') || 'summary';

    if (view === 'summary') {
      // Return in-memory summary for quick overview
      const summary = getPerformanceSummary();
      return NextResponse.json({ summary });
    }

    if (view === 'aggregation') {
      // Return aggregated metrics from database
      const aggregation = await getMetricsAggregation({ category, period });
      return NextResponse.json({ aggregation, period });
    }

    if (view === 'history') {
      // Return historical metrics
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days
      
      const metrics = await queryMetrics({
        category,
        startDate,
        limit: 500,
      });
      
      return NextResponse.json({ metrics, count: metrics.length });
    }

    return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
  } catch (error) {
    logger.admin.exception(error, { action: 'get-metrics' });
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/metrics
 * Clean up old metrics
 */
export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (!adminCheck.authorized) {
    return adminCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const retentionDays = parseInt(searchParams.get('retentionDays') || '30', 10);

    const deletedCount = await cleanupOldMetrics(retentionDays);
    
    return NextResponse.json({
      success: true,
      deletedCount,
      retentionDays,
    });
  } catch (error) {
    logger.admin.exception(error, { action: 'cleanup-metrics' });
    return NextResponse.json(
      { error: 'Failed to clean up metrics' },
      { status: 500 }
    );
  }
}
```

### Step 5: Add Cron Job for Cleanup

**File to Modify:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/learn-patterns",
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/cleanup-metrics",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**File to Create:** `app/api/cron/cleanup-metrics/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldMetrics } from '@/lib/monitoring/performance';
import { logger } from '@/lib/logger';

/**
 * Cron job to clean up old performance metrics
 * Runs daily at 2 AM
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.cron.warn('Unauthorized cron access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    logger.cron.info('Starting metrics cleanup cron job');
    
    const deletedCount = await cleanupOldMetrics(30); // 30-day retention
    
    logger.cron.info(`Metrics cleanup completed: ${deletedCount} records deleted`);
    
    return NextResponse.json({
      success: true,
      deletedCount,
      message: 'Metrics cleanup completed',
    });
  } catch (error) {
    logger.cron.exception(error, { action: 'cleanup-metrics' });
    return NextResponse.json(
      { error: 'Metrics cleanup failed' },
      { status: 500 }
    );
  }
}
```

---

## 4. Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `drizzle/schema.ts` | MODIFY | Add performanceMetrics table |
| `drizzle/migrations/0003_performance_metrics.sql` | CREATE | Migration for new table |
| `lib/monitoring/performance.ts` | REPLACE | Hybrid storage implementation |
| `app/api/admin/metrics/route.ts` | CREATE | Admin API for metrics |
| `app/api/cron/cleanup-metrics/route.ts` | CREATE | Cleanup cron job |
| `vercel.json` | MODIFY | Add cleanup cron schedule |

---

## 5. Testing Strategy

### 5.1 Unit Tests

**File to Create:** `tests/unit/performance-metrics.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  trackMetric, 
  getRecentMetrics, 
  getPerformanceSummary,
  createTimer 
} from '@/lib/monitoring/performance';

describe('Performance Metrics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should track metrics in memory buffer', () => {
    trackMetric({
      name: 'test.metric',
      duration: 100,
      timestamp: new Date(),
    });

    const recent = getRecentMetrics('test.metric');
    expect(recent.length).toBeGreaterThan(0);
    expect(recent[0].duration).toBe(100);
  });

  it('should categorize metrics correctly', () => {
    trackMetric({ name: 'api.get.users', duration: 50, timestamp: new Date() });
    trackMetric({ name: 'db.users', duration: 10, timestamp: new Date() });
    trackMetric({ name: 'ai.gemini', duration: 2000, timestamp: new Date() });

    const summary = getPerformanceSummary();
    expect(summary['api.get.users']).toBeDefined();
    expect(summary['db.users']).toBeDefined();
  });

  it('should create timer and measure duration', async () => {
    const timer = createTimer('test.operation');
    
    // Simulate work
    vi.advanceTimersByTime(100);
    
    const duration = timer.stop();
    expect(duration).toBeGreaterThanOrEqual(100);
  });
});
```

### 5.2 Manual Testing

- [ ] Track metrics in development, verify in-memory buffer
- [ ] Run database migration
- [ ] Verify metrics are persisted to database
- [ ] Call `/api/admin/metrics?view=summary`
- [ ] Call `/api/admin/metrics?view=aggregation&period=day`
- [ ] Call `/api/admin/metrics?view=history`
- [ ] Run cleanup cron job manually
- [ ] Verify old metrics are deleted

---

## 6. Success Criteria

- [ ] Metrics persist across server restarts
- [ ] Dashboard loads metrics in < 100ms
- [ ] Write overhead < 5ms per metric (batched)
- [ ] 30-day retention enforced automatically
- [ ] No memory leaks from buffer growth
- [ ] Graceful degradation if database unavailable

---

## 7. Future Enhancements

1. **Admin Dashboard Widget** - Add visualization component
2. **Alerting** - Trigger alerts for slow operations
3. **Redis Caching** - Use Redis for faster aggregations
4. **Grafana Integration** - Export metrics to Grafana

---

*Specification created for Purple Glow Social 2.0*  
*Ready for implementation by Coder Agent*
