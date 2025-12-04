/**
 * Database helpers for connected accounts
 */

import { db } from '@/drizzle/db';
import { connectedAccounts } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { encryptToken, decryptToken } from '@/lib/crypto/token-encryption';
import { logger } from '@/lib/logger';

/**
 * Get all connected accounts for a user
 */
export async function getConnectedAccounts(userId: string) {
  return await db
    .select()
    .from(connectedAccounts)
    .where(eq(connectedAccounts.userId, userId));
}

/**
 * Get a specific connected account for a user
 */
export async function getConnectedAccount(
  userId: string, 
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
) {
  const accounts = await db
    .select()
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.userId, userId),
        eq(connectedAccounts.platform, platform)
      )
    )
    .limit(1);
  
  return accounts[0] || null;
}

/**
 * Get decrypted access token for a platform
 */
export async function getDecryptedToken(
  userId: string,
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
): Promise<string | null> {
  const account = await getConnectedAccount(userId, platform);
  if (!account || !account.accessToken) return null;
  
  try {
    return decryptToken(account.accessToken);
  } catch (error) {
    logger.db.exception(error, { action: 'token-decryption', platform, userId });
    return null;
  }
}

/**
 * Disconnect a social media account
 */
export async function disconnectAccount(
  userId: string,
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
) {
  await db
    .delete(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.userId, userId),
        eq(connectedAccounts.platform, platform)
      )
    );
}

// Alias for disconnectAccount
export const deleteConnectedAccount = disconnectAccount;

/**
 * Check if a platform is connected for a user
 */
export async function isConnected(
  userId: string,
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
): Promise<boolean> {
  const account = await getConnectedAccount(userId, platform);
  return account !== null && account.isActive;
}

/**
 * Update connection last synced time
 */
export async function updateLastSynced(
  userId: string,
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
) {
  await db
    .update(connectedAccounts)
    .set({
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(connectedAccounts.userId, userId),
        eq(connectedAccounts.platform, platform)
      )
    );
}

/**
 * Mark connection as inactive
 */
export async function deactivateConnection(
  userId: string,
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
) {
  await db
    .update(connectedAccounts)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(connectedAccounts.userId, userId),
        eq(connectedAccounts.platform, platform)
      )
    );
}

/**
 * Count connected accounts by platform for a user
 * Used for tier limit enforcement
 */
export async function countConnectionsByPlatform(
  userId: string
): Promise<Record<string, number>> {
  const accounts = await db
    .select()
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.userId, userId),
        eq(connectedAccounts.isActive, true)
      )
    );

  const counts: Record<string, number> = {};
  for (const account of accounts) {
    counts[account.platform] = (counts[account.platform] || 0) + 1;
  }
  return counts;
}

/**
 * Get total count of active connected accounts for a user
 */
export async function countTotalConnections(userId: string): Promise<number> {
  const accounts = await db
    .select()
    .from(connectedAccounts)
    .where(
      and(
        eq(connectedAccounts.userId, userId),
        eq(connectedAccounts.isActive, true)
      )
    );
  return accounts.length;
}

/**
 * Save or update a connected account
 */
export interface ConnectedAccountData {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  platformUserId: string;
  platformUsername: string;
  platformDisplayName?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  profileImageUrl?: string;
  scope?: string;
}

export async function saveConnectedAccount(
  userId: string,
  data: ConnectedAccountData
) {
  // Check if account already exists
  const existing = await getConnectedAccount(userId, data.platform);
  
  // Encrypt tokens
  const encryptedAccessToken = encryptToken(data.accessToken);
  const encryptedRefreshToken = data.refreshToken ? encryptToken(data.refreshToken) : null;
  
  if (existing) {
    // Update existing account
    await db
      .update(connectedAccounts)
      .set({
        platformUserId: data.platformUserId,
        platformUsername: data.platformUsername,
        platformDisplayName: data.platformDisplayName || data.platformUsername,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: data.tokenExpiresAt,
        profileImageUrl: data.profileImageUrl,
        scope: data.scope || '',
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(connectedAccounts.id, existing.id));
    
    return existing.id;
  } else {
    // Generate a unique ID
    const id = crypto.randomUUID();
    
    // Create new account
    await db
      .insert(connectedAccounts)
      .values({
        id,
        userId,
        platform: data.platform,
        platformUserId: data.platformUserId,
        platformUsername: data.platformUsername,
        platformDisplayName: data.platformDisplayName || data.platformUsername,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: data.tokenExpiresAt,
        profileImageUrl: data.profileImageUrl,
        scope: data.scope || 'default',
        isActive: true,
        lastSyncedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    
    return id;
  }
}

// Re-export token functions for convenience
export { encryptToken, decryptToken } from '@/lib/crypto/token-encryption';
