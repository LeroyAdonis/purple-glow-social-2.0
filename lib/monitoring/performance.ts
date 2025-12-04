/**
 * Performance Monitoring Utilities
 * 
 * Track API response times, database query times, and AI generation times
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

// In-memory metrics buffer (in production, use Redis or similar)
const metricsBuffer: PerformanceMetric[] = [];
const MAX_BUFFER_SIZE = 1000;

/**
 * Track a performance metric
 */
export function trackMetric(metric: PerformanceMetric) {
  // Add to buffer
  metricsBuffer.push(metric);
  
  // Keep buffer size manageable
  if (metricsBuffer.length > MAX_BUFFER_SIZE) {
    metricsBuffer.shift();
  }

  // Log slow operations
  if (metric.duration > 3000) {
    logger.api.warn(`Slow operation: ${metric.name} took ${metric.duration}ms`, metric.tags);
    
    // Report to Sentry as a custom event
    Sentry.captureMessage(`Slow operation: ${metric.name}`, {
      level: 'warning',
      tags: {
        ...metric.tags,
        performance: 'slow',
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
    stop: (metadata?: Record<string, any>) => {
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
export function withPerformanceTracking<T extends (...args: any[]) => Promise<any>>(
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
export function trackApiEndpoint(endpoint: string, method: string, statusCode: number, duration: number) {
  trackMetric({
    name: `api.${method.toLowerCase()}.${endpoint.replace(/\//g, '.')}`,
    duration,
    timestamp: new Date(),
    tags: {
      endpoint,
      method,
      status: String(statusCode),
    },
  });
}

/**
 * Track database query performance
 */
export function trackDatabaseQuery(query: string, table: string, duration: number) {
  trackMetric({
    name: `db.${table}`,
    duration,
    timestamp: new Date(),
    tags: {
      table,
      queryType: query.split(' ')[0]?.toUpperCase() || 'UNKNOWN',
    },
  });
}

/**
 * Track AI generation performance
 */
export function trackAIGeneration(model: string, promptTokens: number, completionTokens: number, duration: number) {
  trackMetric({
    name: `ai.${model}`,
    duration,
    timestamp: new Date(),
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
 * Get recent metrics for a given name
 */
export function getRecentMetrics(name: string, limit: number = 100): PerformanceMetric[] {
  return metricsBuffer
    .filter(m => m.name === name || m.name.startsWith(name))
    .slice(-limit);
}

/**
 * Calculate average duration for a metric
 */
export function getAverageDuration(name: string): number {
  const metrics = getRecentMetrics(name);
  if (metrics.length === 0) return 0;
  
  const total = metrics.reduce((sum, m) => sum + m.duration, 0);
  return Math.round(total / metrics.length);
}

/**
 * Get performance summary
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
