/**
 * Security Utilities
 * 
 * Common security functions for the application
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Admin email addresses (from environment or hardcoded for now)
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

/**
 * Check if a user is an admin
 */
export function isAdmin(email: string): boolean {
  // Check against admin list
  if (ADMIN_EMAILS.includes(email)) {
    return true;
  }
  
  // Allow all purpleglow.co.za emails
  if (email.endsWith('@purpleglow.co.za')) {
    return true;
  }
  
  return false;
}

/**
 * Require authentication middleware
 */
export async function requireAuth(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: { id: string; email: string; name?: string };
  response?: NextResponse;
}> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Unauthorized', message: 'Please sign in to access this resource' },
          { status: 401 }
        ),
      };
    }
    
    return {
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || undefined,
      },
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Authentication error', message: 'Unable to verify authentication' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Require admin access middleware
 */
export async function requireAdmin(request: NextRequest): Promise<{
  authorized: boolean;
  user?: { id: string; email: string; name?: string };
  response?: NextResponse;
}> {
  const authResult = await requireAuth(request);
  
  if (!authResult.authenticated) {
    return {
      authorized: false,
      response: authResult.response,
    };
  }
  
  if (!authResult.user || !isAdmin(authResult.user.email)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      ),
    };
  }
  
  return {
    authorized: true,
    user: authResult.user,
  };
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
