/**
 * URL Configuration Utilities
 * 
 * Provides consistent base URL resolution across the application
 * with proper fallbacks for development and production environments.
 */

/**
 * Get the base URL for the application
 * 
 * Resolution order:
 * 1. NEXT_PUBLIC_BASE_URL (explicitly set production URL)
 * 2. VERCEL_URL (auto-set by Vercel during deployment)
 * 3. localhost:3000 (development fallback)
 * 
 * @returns The base URL without trailing slash
 */
export function getBaseUrl(): string {
  // Check for explicitly set base URL first
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  }

  // Vercel auto-sets this during deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Development fallback
  return 'http://localhost:3000';
}

/**
 * Get the API base URL (same as base URL for Next.js API routes)
 */
export function getApiBaseUrl(): string {
  return getBaseUrl();
}

/**
 * Build a full URL from a path
 * 
 * @param path - The path to append (should start with /)
 * @returns Full URL
 */
export function buildUrl(path: string): string {
  const base = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/**
 * Get trusted origins for authentication
 * Combines environment-configured origins with auto-detected ones
 * 
 * @returns Array of unique trusted origin URLs
 */
export function getTrustedOrigins(): string[] {
  const origins: (string | null | undefined)[] = [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    process.env.NEXT_PUBLIC_BASE_URL,
  ];

  // Add any additional trusted origins from environment
  if (process.env.ADDITIONAL_TRUSTED_ORIGINS) {
    const additionalOrigins = process.env.ADDITIONAL_TRUSTED_ORIGINS
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean);
    origins.push(...additionalOrigins);
  }

  // Filter out nulls/undefined and remove duplicates
  const uniqueOrigins = [...new Set(
    origins.filter((origin): origin is string => Boolean(origin))
  )];

  return uniqueOrigins;
}
