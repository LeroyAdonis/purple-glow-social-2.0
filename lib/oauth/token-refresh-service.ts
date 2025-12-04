/**
 * Token Refresh Service
 * Centralized token refresh with proactive refresh and retry logic
 */

import { db } from '@/drizzle/db';
import { connectedAccounts } from '@/drizzle/schema';
import { eq, and, lt } from 'drizzle-orm';
import { FacebookProvider } from './facebook-provider';
import { TwitterProvider } from './twitter-provider';
import { encryptToken, decryptToken } from '@/lib/db/connected-accounts';
import { logger } from '@/lib/logger';

type Platform = 'facebook' | 'instagram' | 'twitter' | 'linkedin';

interface RefreshResult {
  success: boolean;
  platform: Platform;
  userId: string;
  error?: string;
  newExpiresAt?: Date;
}

// Refresh tokens 24 hours before expiry
const PROACTIVE_REFRESH_HOURS = 24;

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number): number {
  return BASE_DELAY_MS * Math.pow(2, attempt);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Refresh a single token with retry logic
 */
async function refreshTokenWithRetry(
  platform: Platform,
  accessToken: string,
  refreshToken: string | null
): Promise<{ accessToken: string; refreshToken?: string; expiresIn: number } | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      switch (platform) {
        case 'facebook':
        case 'instagram': {
          // Facebook/Instagram use token exchange for refresh
          const provider = new FacebookProvider();
          const result = await provider.refreshAccessToken(accessToken);
          return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
          };
        }
        
        case 'twitter': {
          if (!refreshToken) {
            throw new Error('Twitter requires refresh token');
          }
          const provider = new TwitterProvider();
          const result = await provider.refreshAccessToken(refreshToken);
          return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
          };
        }
        
        case 'linkedin': {
          // LinkedIn refresh will be implemented in linkedin-provider.ts
          logger.oauth.warn('LinkedIn token refresh not yet implemented');
          return null;
        }
        
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.oauth.warn(`Token refresh attempt ${attempt + 1} failed for ${platform}: ${lastError.message}`);
      
      if (attempt < MAX_RETRIES - 1) {
        await sleep(getBackoffDelay(attempt));
      }
    }
  }
  
  logger.oauth.error(`Token refresh failed after ${MAX_RETRIES} attempts for ${platform}`, {
    error: lastError?.message,
  });
  
  return null;
}

/**
 * Refresh tokens for accounts expiring soon
 */
export async function refreshExpiringTokens(): Promise<RefreshResult[]> {
  const results: RefreshResult[] = [];
  
  try {
    // Find accounts expiring within PROACTIVE_REFRESH_HOURS
    const expiryThreshold = new Date();
    expiryThreshold.setHours(expiryThreshold.getHours() + PROACTIVE_REFRESH_HOURS);
    
    const expiringAccounts = await db
      .select()
      .from(connectedAccounts)
      .where(
        and(
          eq(connectedAccounts.isActive, true),
          lt(connectedAccounts.tokenExpiresAt, expiryThreshold)
        )
      );
    
    logger.oauth.info(`Found ${expiringAccounts.length} accounts with expiring tokens`);
    
    for (const account of expiringAccounts) {
      const platform = account.platform as Platform;
      
      try {
        // Decrypt current tokens
        const accessToken = account.accessToken ? decryptToken(account.accessToken) : null;
        const refreshToken = account.refreshToken ? decryptToken(account.refreshToken) : null;
        
        if (!accessToken) {
          results.push({
            success: false,
            platform,
            userId: account.userId,
            error: 'No access token found',
          });
          continue;
        }
        
        // Attempt refresh
        const newTokens = await refreshTokenWithRetry(platform, accessToken, refreshToken);
        
        if (!newTokens) {
          // Mark account as needing reconnection
          await db
            .update(connectedAccounts)
            .set({
              isActive: false,
              updatedAt: new Date(),
            })
            .where(eq(connectedAccounts.id, account.id));
          
          results.push({
            success: false,
            platform,
            userId: account.userId,
            error: 'Token refresh failed after retries',
          });
          continue;
        }
        
        // Calculate new expiry
        const newExpiresAt = new Date();
        newExpiresAt.setSeconds(newExpiresAt.getSeconds() + newTokens.expiresIn);
        
        // Update database with new tokens
        await db
          .update(connectedAccounts)
          .set({
            accessToken: encryptToken(newTokens.accessToken),
            refreshToken: newTokens.refreshToken 
              ? encryptToken(newTokens.refreshToken) 
              : account.refreshToken,
            tokenExpiresAt: newExpiresAt,
            updatedAt: new Date(),
          })
          .where(eq(connectedAccounts.id, account.id));
        
        results.push({
          success: true,
          platform,
          userId: account.userId,
          newExpiresAt,
        });
        
        logger.oauth.info(`Successfully refreshed ${platform} token for user ${account.userId}`);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.oauth.exception(error, { platform, userId: account.userId });
        
        results.push({
          success: false,
          platform,
          userId: account.userId,
          error: errorMessage,
        });
      }
    }
    
  } catch (error) {
    logger.oauth.exception(error, { action: 'refresh-expiring-tokens' });
    throw error;
  }
  
  return results;
}

/**
 * Refresh token for a specific account
 */
export async function refreshAccountToken(
  userId: string,
  platform: Platform
): Promise<RefreshResult> {
  try {
    const account = await db.query.connectedAccounts.findFirst({
      where: and(
        eq(connectedAccounts.userId, userId),
        eq(connectedAccounts.platform, platform)
      ),
    });
    
    if (!account) {
      return {
        success: false,
        platform,
        userId,
        error: 'Account not found',
      };
    }
    
    const accessToken = account.accessToken ? decryptToken(account.accessToken) : null;
    const refreshToken = account.refreshToken ? decryptToken(account.refreshToken) : null;
    
    if (!accessToken) {
      return {
        success: false,
        platform,
        userId,
        error: 'No access token found',
      };
    }
    
    const newTokens = await refreshTokenWithRetry(platform, accessToken, refreshToken);
    
    if (!newTokens) {
      return {
        success: false,
        platform,
        userId,
        error: 'Token refresh failed',
      };
    }
    
    const newExpiresAt = new Date();
    newExpiresAt.setSeconds(newExpiresAt.getSeconds() + newTokens.expiresIn);
    
    await db
      .update(connectedAccounts)
      .set({
        accessToken: encryptToken(newTokens.accessToken),
        refreshToken: newTokens.refreshToken 
          ? encryptToken(newTokens.refreshToken) 
          : account.refreshToken,
        tokenExpiresAt: newExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(connectedAccounts.id, account.id));
    
    return {
      success: true,
      platform,
      userId,
      newExpiresAt,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      platform,
      userId,
      error: errorMessage,
    };
  }
}

/**
 * Get accounts needing attention (expired or expiring soon)
 */
export async function getAccountsNeedingRefresh(userId: string): Promise<{
  platform: Platform;
  status: 'expired' | 'expiring_soon' | 'ok';
  expiresAt: Date | null;
}[]> {
  const accounts = await db
    .select()
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.userId, userId),
        eq(connectedAccounts.isActive, true)
      )
    );
  
  const now = new Date();
  const warningThreshold = new Date();
  warningThreshold.setDate(warningThreshold.getDate() + 7); // 7 days warning
  
  return accounts.map(account => {
    const expiresAt = account.tokenExpiresAt;
    let status: 'expired' | 'expiring_soon' | 'ok' = 'ok';
    
    if (expiresAt) {
      if (expiresAt < now) {
        status = 'expired';
      } else if (expiresAt < warningThreshold) {
        status = 'expiring_soon';
      }
    }
    
    return {
      platform: account.platform as Platform,
      status,
      expiresAt,
    };
  });
}
