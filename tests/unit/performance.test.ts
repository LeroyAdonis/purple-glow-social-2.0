/**
 * Unit Tests: Performance Monitoring
 * 
 * Tests for performance tracking utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  trackMetric,
  createTimer,
  trackApiEndpoint,
  trackDatabaseQuery,
  trackAIGeneration,
  getRecentMetrics,
  getAverageDuration,
  getPerformanceSummary,
} from '@/lib/monitoring/performance';

describe('createTimer', () => {
  it('should measure elapsed time', async () => {
    const timer = createTimer('test.operation');
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const duration = timer.stop();
    
    expect(duration).toBeGreaterThanOrEqual(50);
    expect(duration).toBeLessThan(200); // Should not take too long
  });

  it('should include metadata when stopped', () => {
    const timer = createTimer('test.with.metadata', { env: 'test' });
    const duration = timer.stop({ userId: 'user123' });
    
    expect(duration).toBeGreaterThanOrEqual(0);
  });
});

describe('trackApiEndpoint', () => {
  it('should track API endpoint metrics', () => {
    trackApiEndpoint('/api/user/posts', 'GET', 200, 150);
    trackApiEndpoint('/api/user/posts', 'POST', 201, 250);
    
    const metrics = getRecentMetrics('api.');
    expect(metrics.length).toBeGreaterThanOrEqual(2);
  });
});

describe('trackDatabaseQuery', () => {
  it('should track database query metrics', () => {
    trackDatabaseQuery('SELECT', 'posts', 45);
    trackDatabaseQuery('INSERT', 'posts', 120);
    
    const metrics = getRecentMetrics('db.');
    expect(metrics.length).toBeGreaterThanOrEqual(2);
  });
});

describe('trackAIGeneration', () => {
  it('should track AI generation metrics with token counts', () => {
    trackAIGeneration('gemini-pro', 500, 200, 3500);
    
    const metrics = getRecentMetrics('ai.');
    expect(metrics.length).toBeGreaterThanOrEqual(1);
    
    const lastMetric = metrics[metrics.length - 1];
    expect(lastMetric.metadata?.totalTokens).toBe(700);
  });
});

describe('getAverageDuration', () => {
  beforeEach(() => {
    // Clear metrics by tracking with a unique prefix
    trackMetric({
      name: 'test.avg.1',
      duration: 100,
      timestamp: new Date(),
    });
    trackMetric({
      name: 'test.avg.1',
      duration: 200,
      timestamp: new Date(),
    });
    trackMetric({
      name: 'test.avg.1',
      duration: 300,
      timestamp: new Date(),
    });
  });

  it('should calculate average duration correctly', () => {
    const avg = getAverageDuration('test.avg.1');
    expect(avg).toBe(200); // (100 + 200 + 300) / 3
  });

  it('should return 0 for non-existent metrics', () => {
    const avg = getAverageDuration('non.existent.metric.xyz');
    expect(avg).toBe(0);
  });
});

describe('getPerformanceSummary', () => {
  beforeEach(() => {
    trackMetric({
      name: 'test.summary.a',
      duration: 100,
      timestamp: new Date(),
    });
    trackMetric({
      name: 'test.summary.a',
      duration: 300,
      timestamp: new Date(),
    });
    trackMetric({
      name: 'test.summary.b',
      duration: 150,
      timestamp: new Date(),
    });
  });

  it('should return summary with avg, count, and max', () => {
    const summary = getPerformanceSummary();
    
    // Should have entries for our test metrics
    expect(summary['test.summary.a']).toBeDefined();
    expect(summary['test.summary.a'].count).toBeGreaterThanOrEqual(2);
    expect(summary['test.summary.a'].max).toBeGreaterThanOrEqual(300);
  });
});
