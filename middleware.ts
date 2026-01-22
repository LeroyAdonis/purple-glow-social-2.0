import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Global Proxy (replaces middleware.ts UX behavior)
 *
 * Handles route protection, authentication redirects, and admin access control.
 * Uses Better Auth's official session API for reliable authentication.
 *
 * IMPORTANT: This is NOT a security boundary - it's a convenience layer.
 * Full authentication validation still happens in route handlers.
 */

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/oauth/callback/success',
  '/oauth/callback/error',
  '/tmp_rovodev_test-drafts-isolation', // Temporary test route for F001
  '/tmp_rovodev_simple-test', // Simple test route
  '/tmp_rovodev_draft-card-test', // DraftCard test
  '/tmp_rovodev_all-components-test', // All components test
  '/tmp_rovodev_image-uploader-test', // ImageUploader test
  '/tmp_rovodev_test-login', // Login flow debug test
  '/tmp_rovodev_route_test', // Route test for debugging 404 issues
];

// API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth',           // Better-auth handles its own auth
  '/api/webhooks',       // Webhooks have their own validation
  '/api/health',         // Health check
  '/api/cron',           // Cron jobs use CRON_SECRET
  '/api/inngest',        // Inngest has signing key validation
  '/api/debug',          // Debug endpoint
  '/api/diagnostics',    // Diagnostics
];

// Routes that require admin access
const ADMIN_ROUTES = [
  '/admin',
  '/api/admin',
];

// Admin email domains and specific emails
const ADMIN_EMAIL_DOMAINS = ['purpleglow.co.za'];
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
}

function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  if (ADMIN_EMAILS.includes(email)) return true;
  return ADMIN_EMAIL_DOMAINS.some(domain => email.endsWith(`@${domain}`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Debug logging (only in development)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    logger.auth.debug('Processing request', {
      pathname,
      cookieCount: request.cookies.getAll().length
    });
  }

  const isApiRoute = pathname.startsWith('/api');

  // Allow public routes without authentication check
  if (matchesPrefix(pathname, PUBLIC_ROUTES)) {
    // For login/signup, check if user is already authenticated and redirect to dashboard
    if (pathname === '/login' || pathname === '/signup') {
      try {
        const sessionData = await auth.api.getSession({ headers: request.headers });
        if (sessionData?.user) {
          if (isDev) {
            logger.auth.debug('Already authenticated, redirecting to dashboard');
          }
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // If session check fails, allow through to login/signup
        if (isDev) {
          logger.auth.debug('Session check failed for login/signup, allowing through');
        }
      }
    }
    return NextResponse.next();
  }

  // Allow public API routes
  if (isApiRoute && matchesPrefix(pathname, PUBLIC_API_ROUTES)) {
    return NextResponse.next();
  }

  // Special handling for OAuth callback routes
  if (pathname.startsWith('/api/oauth/')) {
    if (pathname.includes('/callback')) {
      return NextResponse.next();
    }
  }

  // Protected routes - require authentication
  try {
    const sessionData = await auth.api.getSession({ headers: request.headers });
    
    if (isDev) {
      logger.auth.debug('Session check result', {
        pathname,
        hasSession: !!sessionData,
        hasUser: !!sessionData?.user,
        userId: sessionData?.user?.id,
        userEmail: sessionData?.user?.email,
      });
    }

    const isAuthenticated = !!sessionData?.user;
    const userEmail = sessionData?.user?.email;

    if (!isAuthenticated) {
      if (isDev) {
        logger.auth.debug('Not authenticated, redirecting/blocking');
      }
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Please sign in to access this resource' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isDev) {
      logger.auth.debug('Authenticated, allowing access to', { pathname });
    }

    // Check admin routes
    if (matchesPrefix(pathname, ADMIN_ROUTES)) {
      if (!isAdminEmail(userEmail)) {
        if (isDev) {
          logger.security.warn('Admin access denied', { userEmail });
        }
        if (isApiRoute) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'Admin access required' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Enhanced error handling for common database issues
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDatabaseError = errorMessage.includes('relation') || 
                           errorMessage.includes('table') || 
                           errorMessage.includes('column') ||
                           errorMessage.includes('ETIMEDOUT') ||
                           errorMessage.includes('ECONNREFUSED');
    
    if (isDatabaseError) {
      logger.auth.error('Database connection error in middleware', { 
        error: errorMessage,
        pathname,
        hint: 'Run database migrations: npm run db:push'
      });
      
      if (isDev) {
        logger.db.error('Database error - migrations may not be applied', {
          hint: 'Run: npm run db:push or check DATABASE_FIX_GUIDE.md'
        });
      }
    } else {
      logger.auth.exception(error as Error, { action: 'middleware-session-validation', pathname });
    }
    
    if (isDev) {
      logger.auth.error('Session validation error', { error: (error as Error).message });
    }
    
    if (isApiRoute) {
      return NextResponse.json(
        { 
          error: 'Internal Server Error', 
          message: 'Authentication check failed',
          ...(isDev && isDatabaseError ? { hint: 'Database migrations may not be applied. Run: npm run db:push' } : {})
        },
        { status: 500 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
