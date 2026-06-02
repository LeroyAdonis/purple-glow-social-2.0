/**
 * PKCE Verifier Database Storage
 * Securely stores PKCE code verifiers for OAuth flows
 * 
 * Security Improvement: Stores verifiers in database instead of cookies
 * Reference: RFC 7636 - Proof Key for Code Exchange
 */

import { db } from '@/drizzle/db';
import { pkceVerifiers } from '@/drizzle/schema';
import { eq, lt, and, gt } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * Store a PKCE code verifier in the database
 * Automatically expires after 10 minutes
 * 
 * @param state - OAuth state parameter
 * @param verifier - PKCE code verifier
 */
export async function storePKCEVerifier(state: string, verifier: string): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await db.insert(pkceVerifiers).values({
      state,
      codeVerifier: verifier,
      expiresAt,
    });
    
    logger.oauth.debug('PKCE verifier stored', { state: state.substring(0, 8) + '...' });
  } catch (error) {
    logger.oauth.exception(error, { action: 'store-pkce-verifier' });
    throw new Error('Failed to store PKCE verifier');
  }
}

/**
 * Retrieve and delete a PKCE code verifier (single use)
 * 
 * @param state - OAuth state parameter
 * @returns The code verifier or null if not found/expired
 */
export async function retrievePKCEVerifier(state: string): Promise<string | null> {
  try {
    // Retrieve non-expired verifier
    const result = await db.select()
      .from(pkceVerifiers)
      .where(and(
        eq(pkceVerifiers.state, state),
        gt(pkceVerifiers.expiresAt, new Date())
      ))
      .limit(1);
    
    if (result.length === 0) {
      logger.oauth.warn('PKCE verifier not found or expired', { 
        state: state.substring(0, 8) + '...' 
      });
      return null;
    }
    
    const verifier = result[0]!.codeVerifier;
    
    // Delete after retrieval (single use)
    await db.delete(pkceVerifiers)
      .where(eq(pkceVerifiers.state, state));
    
    logger.oauth.debug('PKCE verifier retrieved and deleted', { 
      state: state.substring(0, 8) + '...' 
    });
    
    return verifier;
  } catch (error) {
    logger.oauth.exception(error, { action: 'retrieve-pkce-verifier' });
    return null;
  }
}

/**
 * Clean up expired PKCE verifiers
 * Should be called periodically via cron job
 * 
 * @returns Number of deleted verifiers
 */
export async function cleanupExpiredPKCEVerifiers(): Promise<number> {
  try {
    const result = await db.delete(pkceVerifiers)
      .where(lt(pkceVerifiers.expiresAt, new Date()));
    
    const count = result.rowCount || 0;
    
    if (count > 0) {
      logger.oauth.info('Cleaned up expired PKCE verifiers', { count });
    }
    
    return count;
  } catch (error) {
    logger.oauth.exception(error, { action: 'cleanup-pkce-verifiers' });
    return 0;
  }
}

/**
 * Get count of active PKCE verifiers (for monitoring)
 */
export async function getActivePKCECount(): Promise<number> {
  try {
    const result = await db.select()
      .from(pkceVerifiers)
      .where(gt(pkceVerifiers.expiresAt, new Date()));
    
    return result.length;
  } catch (error) {
    logger.oauth.exception(error, { action: 'get-pkce-count' });
    return 0;
  }
}
