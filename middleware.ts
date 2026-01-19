import { NextRequest, NextResponse } from 'next/server';

/**
 * Global Middleware for Purple Glow Social 2.0
 * 
 * Handles route protection, authentication redirects, and admin access control.
 * Uses Better-auth session cookies for authentication state.
 * 
 * IMPORTANT: This is NOT a security boundary - it's a convenience layer.
 * Full authentication validation still happens in route handlers via requireAuth().
 */

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/oauth/callback/success',
  '/oauth/callback/error',
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

/**
 * Check if a path matches any of the given prefixes
 */
function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * Check if user email has admin access
 */
function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  
  // Check specific admin emails
  if (ADMIN_EMAILS.includes(email)) return true;
  
  // Check admin domains
  return ADMIN_EMAIL_DOMAINS.some(domain => email.endsWith(`@${domain}`));
}

/**
 * Get session from Better-auth cookies
 * Note: This is a lightweight check - full validation happens in API routes
 */
function getSessionFromCookies(request: NextRequest): {
  isAuthenticated: boolean;
  userEmail?: string;
} {
  // Better-auth stores session in cookies
  // Cookie name depends on configuration - check both patterns
  const sessionCookie = request.cookies.get('better-auth.session_token') ||
                        request.cookies.get('better-auth.session');
  
  if (!sessionCookie?.value) {
    return { isAuthenticated: false };
  }

  // For middleware, we just check if session cookie exists
  // Full validation happens in the actual route handlers
  // We can decode the JWT to get user info if needed
  try {
    // Session token is a JWT - decode payload (not verify, that's expensive)
    const parts = sessionCookie.value.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return {
        isAuthenticated: true,
        userEmail: payload.email,
      };
    }
  } catch {
    // If decoding fails, still consider authenticated if cookie exists
    // Let the actual route handler do full validation
  }

  return { isAuthenticated: true };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions (images, etc.)
  ) {
    return NextResponse.next();
  }

  const { isAuthenticated, userEmail } = getSessionFromCookies(request);
  const isApiRoute = pathname.startsWith('/api');

  // === PUBLIC ROUTES ===
  
  // Allow public pages
  if (matchesPrefix(pathname, PUBLIC_ROUTES)) {
    // Redirect authenticated users away from login/signup
    if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Allow public API routes
  if (isApiRoute && matchesPrefix(pathname, PUBLIC_API_ROUTES)) {
    return NextResponse.next();
  }

  // Special handling for OAuth connect/callback routes
  if (pathname.startsWith('/api/oauth/')) {
    // Callback routes are public (OAuth flow returning)
    if (pathname.includes('/callback')) {
      return NextResponse.next();
    }
    // Connect and disconnect routes require authentication
    // Let them through - they have their own auth checks
    // But we can add a quick check here for better UX
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to connect accounts' },
        { status: 401 }
      );
    }
  }

  // === PROTECTED ROUTES ===

  // Check authentication for protected routes
  if (!isAuthenticated) {
    if (isApiRoute) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to access this resource' },
        { status: 401 }
      );
    }
    
    // Redirect to login for page routes
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // === ADMIN ROUTES ===
  
  if (matchesPrefix(pathname, ADMIN_ROUTES)) {
    if (!isAdminEmail(userEmail)) {
      if (isApiRoute) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        );
      }
      
      // Redirect non-admins to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
