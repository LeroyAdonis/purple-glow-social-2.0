import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { logger } from "@/lib/logger";
import { withDbTimeoutRetry } from "@/drizzle/db";
import { createDevSessionCookie, isDevFallbackActive } from "@/lib/auth-dev-fallback";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handlers = toNextJsHandler(auth);

export const GET = async (req: Request) => {
    const url = new URL(req.url);
    if (process.env.NODE_ENV !== 'production') {
      logger.auth.info('GET request received', {
          path: url.pathname,
          // avoid logging search params in prod
          timestamp: new Date().toISOString()
      });
    }
    try {
        const response = await withDbTimeoutRetry(() => handlers.GET(req));
        if (process.env.NODE_ENV !== 'production') {
          logger.auth.debug('GET response', { status: response.status });
        }
        return response;
    } catch (error) {
        logger.auth.error('GET request failed', { error });
        throw error;
    }
};

export const POST = async (req: Request) => {
    const url = new URL(req.url);
    if (process.env.NODE_ENV !== 'production') {
      logger.auth.info('POST request received', {
          path: url.pathname,
          timestamp: new Date().toISOString()
      });
    }
    try {
        let response = await withDbTimeoutRetry(() => handlers.POST(req));

        // Dev-only fallback: if Better-auth didn't set cookies (common on PSL domains),
        // issue a short-lived dev session cookie for local development only.
        if (isDevFallbackActive() && !response.headers.get('set-cookie')) {
          const devCookie = createDevSessionCookie();
          const newHeaders = new Headers(response.headers);
          newHeaders.append('Set-Cookie', devCookie);
          response = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        }

        if (process.env.NODE_ENV !== 'production') {
          logger.auth.debug('POST response', { status: response.status });
          // Intentionally no Set-Cookie logging in production
        }
        return response;
    } catch (error) {
        logger.auth.error('POST request failed', { error });
        throw error;
    }
};
