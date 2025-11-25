import { NextResponse } from 'next/server';
import { db } from '@/drizzle/db';

/**
 * Health check endpoint for monitoring
 * GET /api/health
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connection
    let dbStatus = 'unknown';
    let dbResponseTime = 0;

    try {
      const dbStart = Date.now();
      await db.execute('SELECT 1');
      dbResponseTime = Date.now() - dbStart;
      dbStatus = dbResponseTime < 1000 ? 'healthy' : 'slow';
    } catch (error) {
      console.error('Database health check failed:', error);
      dbStatus = 'unhealthy';
    }

    // Check environment variables
    const envCheck = {
      database: !!process.env.DATABASE_URL,
      auth: !!process.env.BETTER_AUTH_SECRET,
      gemini: !!process.env.GEMINI_API_KEY,
      meta: !!process.env.META_APP_ID,
      twitter: !!process.env.TWITTER_CLIENT_ID,
      linkedin: !!process.env.LINKEDIN_CLIENT_ID,
      encryption: !!process.env.TOKEN_ENCRYPTION_KEY,
      cron: !!process.env.CRON_SECRET,
    };

    const allEnvConfigured = Object.values(envCheck).every(v => v);

    // Overall health status
    const isHealthy = dbStatus === 'healthy' && allEnvConfigured;
    const totalResponseTime = Date.now() - startTime;

    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: totalResponseTime,
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
        },
        environment: {
          status: allEnvConfigured ? 'configured' : 'missing_variables',
          checks: envCheck,
        },
      },
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
    };

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
