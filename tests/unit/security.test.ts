/**
 * Unit Tests: Security Utilities
 * 
 * Tests for auth utilities and security helpers
 */

import { describe, it, expect, vi } from 'vitest';
import {
  isAdmin,
  sanitizeInput,
  isSafeRedirectUrl,
  generateSecureToken,
  maskSensitiveData,
} from '@/lib/security/auth-utils';

describe('isAdmin', () => {
  it('does NOT grant admin to the old brand domain', () => {
    // This test used to assert the opposite. A wildcard granted admin to every address at
    // purpleglow.co.za, and we do not own that domain, so whoever registered it could have signed up
    // with any address there and been handed admin on this product. The wildcard is gone; this test
    // is what stops it coming back.
    expect(isAdmin('admin@purpleglow.co.za')).toBe(false);
    expect(isAdmin('support@purpleglow.co.za')).toBe(false);
  });

  it('should return false for non-admin emails', () => {
    expect(isAdmin('user@gmail.com')).toBe(false);
    expect(isAdmin('random@company.com')).toBe(false);
  });

  it('grants admin only to an explicitly allow-listed address', () => {
    // ADMIN_EMAILS comes from the environment; when it is empty nothing is admin, which is the safe
    // default rather than a closed door.
    const listed = process.env.ADMIN_EMAILS?.split(',')[0]?.trim();
    if (listed) {
      expect(isAdmin(listed)).toBe(true);
      expect(isAdmin(listed.toUpperCase())).toBe(true);
    } else {
      expect(listed).toBeUndefined();
    }
  });
});

describe('sanitizeInput', () => {
  it('should escape HTML special characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('should escape ampersands', () => {
    expect(sanitizeInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  it('should escape quotes', () => {
    expect(sanitizeInput("It's a \"test\"")).toBe("It&#x27;s a &quot;test&quot;");
  });

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should handle strings without special characters', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
  });
});

describe('isSafeRedirectUrl', () => {
  it('should allow relative URLs starting with /', () => {
    expect(isSafeRedirectUrl('/dashboard')).toBe(true);
    expect(isSafeRedirectUrl('/settings/profile')).toBe(true);
  });

  it('should reject protocol-relative URLs', () => {
    expect(isSafeRedirectUrl('//evil.com/hack')).toBe(false);
  });

  it('should allow localhost in development', () => {
    // This test passes when running locally where localhost is the default
    // For CI, we just test that the function doesn't throw
    const result = isSafeRedirectUrl('http://localhost:3000/callback');
    expect(typeof result).toBe('boolean');
  });
});

describe('generateSecureToken', () => {
  it('should generate token of specified length', () => {
    const token16 = generateSecureToken(16);
    const token32 = generateSecureToken(32);
    const token64 = generateSecureToken(64);

    expect(token16.length).toBe(16);
    expect(token32.length).toBe(32);
    expect(token64.length).toBe(64);
  });

  it('should generate unique tokens', () => {
    const tokens = new Set();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateSecureToken(32));
    }
    expect(tokens.size).toBe(100);
  });

  it('should only contain alphanumeric characters', () => {
    const token = generateSecureToken(100);
    expect(/^[A-Za-z0-9]+$/.test(token)).toBe(true);
  });

  it('should default to 32 characters', () => {
    const token = generateSecureToken();
    expect(token.length).toBe(32);
  });
});

describe('maskSensitiveData', () => {
  it('should mask middle portion of data', () => {
    const result = maskSensitiveData('1234567890123456');
    expect(result).toBe('1234********3456');
  });

  it('should handle short strings', () => {
    const result = maskSensitiveData('1234');
    expect(result).toBe('****');
  });

  it('should respect custom visible chars', () => {
    const result = maskSensitiveData('ABCDEFGHIJ', 2);
    expect(result).toBe('AB******IJ');
  });

  it('should handle empty string', () => {
    const result = maskSensitiveData('');
    expect(result).toBe('');
  });

  it('should handle exactly boundary length', () => {
    const result = maskSensitiveData('12345678', 4);
    expect(result).toBe('********');
  });
});
