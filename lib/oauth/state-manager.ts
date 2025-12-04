/**
 * OAuth State Manager
 * Secure state token generation and validation to prevent CSRF attacks
 * 
 * Reference: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics
 */

import crypto from 'crypto';
import { generatePKCEChallenge, PKCEChallenge } from './pkce-utils';

export interface OAuthState {
  state: string;
  pkce: PKCEChallenge;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  createdAt: number;
  expiresAt: number;
  returnUrl?: string;
}

// In-memory state storage (for serverless, consider Redis or database)
// Each state expires after 10 minutes
const stateStore = new Map<string, OAuthState>();

// Clean up expired states every 5 minutes
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Start the cleanup interval (call once on server start)
 */
export function startStateCleanup(): void {
  if (cleanupInterval) return;
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of stateStore.entries()) {
      if (value.expiresAt < now) {
        stateStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);
  
  // Don't prevent process exit
  cleanupInterval.unref();
}

/**
 * Generate a cryptographically secure state token
 */
export function generateStateToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Create and store a new OAuth state with PKCE
 */
export function createOAuthState(
  platform: OAuthState['platform'],
  returnUrl?: string
): OAuthState {
  const state = generateStateToken();
  const pkce = generatePKCEChallenge();
  const now = Date.now();
  
  const oauthState: OAuthState = {
    state,
    pkce,
    platform,
    createdAt: now,
    expiresAt: now + STATE_EXPIRY_MS,
    returnUrl,
  };
  
  stateStore.set(state, oauthState);
  
  // Start cleanup if not running
  startStateCleanup();
  
  return oauthState;
}

/**
 * Validate and consume a state token (one-time use)
 */
export function validateAndConsumeState(
  state: string,
  expectedPlatform: OAuthState['platform']
): OAuthState | null {
  const storedState = stateStore.get(state);
  
  if (!storedState) {
    return null;
  }
  
  // Remove state immediately (one-time use)
  stateStore.delete(state);
  
  // Check expiry
  if (storedState.expiresAt < Date.now()) {
    return null;
  }
  
  // Check platform match
  if (storedState.platform !== expectedPlatform) {
    return null;
  }
  
  return storedState;
}

/**
 * Get a state without consuming it (for debugging only)
 */
export function peekState(state: string): OAuthState | null {
  return stateStore.get(state) || null;
}

/**
 * Get the code verifier for a state token
 */
export function getCodeVerifier(state: string): string | null {
  const storedState = stateStore.get(state);
  return storedState?.pkce.codeVerifier || null;
}

/**
 * Clean up all states (for testing)
 */
export function clearAllStates(): void {
  stateStore.clear();
}

/**
 * Get current state count (for monitoring)
 */
export function getStateCount(): number {
  return stateStore.size;
}
