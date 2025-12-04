/**
 * PKCE (Proof Key for Code Exchange) Utilities
 * Implements RFC 7636 for enhanced OAuth 2.0 security
 * 
 * Reference: https://datatracker.ietf.org/doc/html/rfc7636
 */

import crypto from 'crypto';

export interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

/**
 * Generate a cryptographically random code verifier
 * Must be between 43-128 characters using unreserved URI characters
 */
export function generateCodeVerifier(): string {
  // Generate 32 bytes = 43 characters in base64url
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Generate code challenge from verifier using SHA-256
 */
export function generateCodeChallenge(verifier: string): string {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

/**
 * Generate a complete PKCE challenge pair
 */
export function generatePKCEChallenge(): PKCEChallenge {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}

/**
 * Validate a code verifier format
 */
export function isValidCodeVerifier(verifier: string): boolean {
  // RFC 7636: code_verifier = 43*128unreserved
  // unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
  const validPattern = /^[A-Za-z0-9\-._~]{43,128}$/;
  return validPattern.test(verifier);
}

/**
 * Verify that a code challenge matches a verifier
 */
export function verifyPKCEChallenge(verifier: string, challenge: string): boolean {
  const expectedChallenge = generateCodeChallenge(verifier);
  return expectedChallenge === challenge;
}
