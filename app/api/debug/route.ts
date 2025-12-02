/**
 * Debug API Route
 *
 * Simple endpoint to check environment variables and auth configuration
 */

export async function GET() {
  const config = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
    },
    auth: {
      baseUrl: process.env.BETTER_AUTH_URL,
      publicUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
      hasSecret: !!process.env.BETTER_AUTH_SECRET,
      secretLength: process.env.BETTER_AUTH_SECRET?.length || 0,
    },
    database: {
      hasUrl: !!process.env.DATABASE_URL,
      urlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      isPostgres: process.env.DATABASE_URL?.startsWith('postgresql://'),
    },
    inngest: {
      hasSigningKey: !!process.env.INNGEST_SIGNING_KEY,
      hasEventKey: !!process.env.INNGEST_EVENT_KEY,
      eventUrl: process.env.INNGEST_EVENT_API_URL,
    }
  };

  return Response.json(config);
}