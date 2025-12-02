/**
 * Database helpers for connected accounts
 */

import { db } from '@/drizzle/db';
import { connectedAccounts } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { encryptToken, decryptToken } from '@/lib/crypto/token-encryption';

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
  platform: 'instagram' | 'facebook' | 'twitter'
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
  platform: 'instagram' | 'facebook' | 'twitter'
): Promise<string | null> {
  const account = await getConnectedAccount(userId, platform);
  if (!account || !account.accessToken) return null;
  
  try {
    return decryptToken(account.accessToken);
  } catch (error) {
    console.error('Token decryption failed:', error);
    return null;
  }
}

/**
 * Disconnect a social media account
 */
export async function disconnectAccount(
  userId: string,
  platform: 'instagram' | 'facebook' | 'twitter'
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

/**
 * Check if a platform is connected for a user
 */
export async function isConnected(
  userId: string,
  platform: 'instagram' | 'facebook' | 'twitter'
): Promise<boolean> {
  const account = await getConnectedAccount(userId, platform);
  return account !== null && account.isActive;
}

/**
 * Update connection last synced time
 */
export async function updateLastSynced(
  userId: string,
  platform: 'instagram' | 'facebook' | 'twitter'
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
  platform: 'instagram' | 'facebook' | 'twitter'
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
