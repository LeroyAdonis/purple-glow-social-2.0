/**
 * Dev-only auth fallback utilities.
 *
 * When AUTH_DEV_MODE=1 and NODE_ENV !== 'production', we may synthesize a short-lived
 * session cookie if Better-auth cannot set cookies (e.g., PSL domain issues in dev).
 *
 * Cookie name: dev-better-auth.session
 * Format: base64url(JSON.stringify({ exp: unixSeconds, createdAt }))
 * TTL: 2 hours (DEV ONLY)
 */

const TWO_HOURS = 2 * 60 * 60; // seconds

export function isDevFallbackActive(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.AUTH_DEV_MODE === '1';
}

function toBase64Url(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

export function createDevSessionCookie(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    exp: now + TWO_HOURS,
    createdAt: now,
    dev: true,
  };
  const encoded = toBase64Url(JSON.stringify(payload));

  // HttpOnly to prevent JS access; Secure only in production normally, but here it's dev-only
  const parts = [
    `dev-better-auth.session=${encoded}`,
    'Path=/',
    // In dev we allow non-secure for localhost
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${TWO_HOURS}`,
  ];
  return parts.join('; ');
}

export function parseDevSessionCookie(value: string | undefined): { valid: boolean; exp?: number } {
  if (!value) return { valid: false };
  try {
    const json = Buffer.from(value.replaceAll('-', '+').replaceAll('_', '/'), 'base64').toString('utf8');
    const data = JSON.parse(json);
    const now = Math.floor(Date.now() / 1000);
    return { valid: typeof data.exp === 'number' && data.exp > now, exp: data.exp };
  } catch {
    return { valid: false };
  }
}
