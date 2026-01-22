/**
 * Security Utilities
 * 
 * Common security functions for the application
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

/**
 * Admin email addresses (from environment or hardcoded for now)
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

/**
 * Custom error classes for authentication
 */
export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Check if a user is an admin
 * Centralized logic - DO NOT DUPLICATE elsewhere
 */
export function isAdmin(email: string): boolean {
  // Normalize email for comparison
  const normalizedEmail = email.trim().toLowerCase();
  
  // Check against admin list from environment
  const adminEmails = ADMIN_EMAILS.map(e => e.trim().toLowerCase());
  if (adminEmails.includes(normalizedEmail)) {
    return true;
  }
  
  // Allow all purpleglow.co.za emails
  if (normalizedEmail.endsWith('@purpleglow.co.za')) {
    return true;
  }
  
  return false;
}

/**
 * Centralized authentication helper
 * Throws UnauthorizedError if not authenticated
 * 
 * @throws {UnauthorizedError} If user is not authenticated
 * @returns The authenticated user object
 */
export async function requireAuth(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  if (!session?.user) {
    throw new UnauthorizedError('Please sign in to access this resource');
  }
  
  return session.user;
}

/**
 * Centralized admin authorization helper
 * Throws UnauthorizedError if not authenticated
 * Throws ForbiddenError if not admin
 * Logs all admin actions for audit trail
 * 
 * @throws {UnauthorizedError} If user is not authenticated
 * @throws {ForbiddenError} If user is not admin
 * @returns The authenticated admin user object
 */
export async function requireAdmin(request: NextRequest) {
  // First check authentication
  const user = await requireAuth(request);
  
  // Then check admin status
  if (!isAdmin(user.email)) {
    // Log failed admin access attempt
    logger.security.warn('Admin access denied', {
      userId: user.id,
      email: user.email,
      endpoint: request.nextUrl.pathname,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
    
    throw new ForbiddenError('Admin access required');
  }
  
  // Log successful admin action for audit trail
  logger.security.info('Admin action', {
    userId: user.id,
    email: user.email,
    action: request.nextUrl.pathname,
    method: request.method,
    timestamp: new Date().toISOString(),
  });
  
  return user;
}

/**
 * Helper to handle auth errors in API routes
 * Returns appropriate NextResponse for auth errors
 * Re-throws other errors for normal error handling
 * 
 * @param error The caught error
 * @returns NextResponse if auth error, otherwise re-throws
 */
export function handleAuthError(error: unknown): NextResponse | null {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }
  
  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    );
  }
  
  // Not an auth error, return null to signal re-throw
  return null;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate that a URL is safe to redirect to
 */
export function isSafeRedirectUrl(url: string, allowedHosts: string[] = []): boolean {
  try {
    const parsed = new URL(url);
    
    // Allow relative URLs
    if (!parsed.host) {
      return true;
    }
    
    // Check against allowed hosts
    const appHost = process.env.NEXT_PUBLIC_BETTER_AUTH_URL 
      ? new URL(process.env.NEXT_PUBLIC_BETTER_AUTH_URL).host 
      : 'localhost';
    
    const allowed = [appHost, ...allowedHosts];
    
    return allowed.includes(parsed.host);
  } catch {
    // If URL parsing fails, it might be a relative URL
    return url.startsWith('/') && !url.startsWith('//');
  }
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

/**
 * Hash sensitive data for logging (shows first/last chars only)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  const middle = '*'.repeat(Math.min(data.length - visibleChars * 2, 8));
  
  return `${start}${middle}${end}`;
}
