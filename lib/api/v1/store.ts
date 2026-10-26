/**
 * Data access for the public /api/v1 surface.
 *
 * One module so the routes stay pure logic: every query the v1 API makes lives here, which keeps the
 * security-sensitive parts (never selecting tokens, all-or-nothing post inserts) in one reviewable place.
 */
import { and, count, desc, eq, isNull } from "drizzle-orm";

import { db } from "../../../drizzle/db";
import { apiKeys, connectedAccounts, posts, user } from "../../../drizzle/schema";

export type ApiPlatform = "facebook" | "instagram" | "twitter" | "linkedin";

export type ApiKeyRow = {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
};

export type ApiUser = {
  id: string;
  tier: "free" | "pro" | "business" | null;
  credits: number;
};

export type ApiIntegration = {
  platform: ApiPlatform;
  displayName: string;
  connectedAt: Date;
  tokenExpiresAt: Date | null;
  isActive: boolean;
};

export type NewScheduledPost = {
  userId: string;
  content: string;
  imageUrl: string | null;
  platform: ApiPlatform;
  status: "scheduled";
  scheduledDate: Date;
};

export type ScheduledPostResult = {
  id: string;
  platform: ApiPlatform;
  status: string;
};

export async function findApiKeyByHash(keyHash: string): Promise<ApiKeyRow | null> {
  const [row] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);
  return row ?? null;
}

export async function touchApiKey(id: string, at: Date): Promise<void> {
  await db.update(apiKeys).set({ lastUsedAt: at }).where(eq(apiKeys.id, id));
}

export async function createApiKey(input: {
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string;
}): Promise<ApiKeyRow> {
  const [row] = await db.insert(apiKeys).values(input).returning();
  return row!;
}

/** Prefix and lifecycle only: the hash is never needed outside this module. */
export async function listApiKeys(
  userId: string
): Promise<Array<Omit<ApiKeyRow, "keyHash" | "userId">>> {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      revokedAt: apiKeys.revokedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt));
}

export async function revokeApiKey(
  id: string,
  userId: string,
  at: Date
): Promise<ApiKeyRow | null> {
  const [row] = await db
    .update(apiKeys)
    .set({ revokedAt: at })
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
    .returning();
  return row ?? null;
}

export async function getUser(userId: string): Promise<ApiUser | null> {
  const [row] = await db
    .select({ id: user.id, tier: user.tier, credits: user.credits })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return row ?? null;
}

export async function countQueuedPosts(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(posts)
    .where(and(eq(posts.userId, userId), eq(posts.status, "scheduled")));
  return Number(row?.total ?? 0);
}

/** Deliberately does not select accessToken/refreshToken: a leak is impossible from a field never read. */
export async function getIntegrations(userId: string): Promise<ApiIntegration[]> {
  return db
    .select({
      platform: connectedAccounts.platform,
      displayName: connectedAccounts.platformDisplayName,
      connectedAt: connectedAccounts.createdAt,
      tokenExpiresAt: connectedAccounts.tokenExpiresAt,
      isActive: connectedAccounts.isActive,
    })
    .from(connectedAccounts)
    .where(eq(connectedAccounts.userId, userId));
}

/** One row per platform, in one transaction: a half-written multi-platform request must not exist. */
export async function insertScheduledPosts(
  rows: NewScheduledPost[]
): Promise<ScheduledPostResult[]> {
  return db.transaction(async (tx) => {
    const inserted: ScheduledPostResult[] = [];
    for (const row of rows) {
      const [created] = await tx.insert(posts).values(row).returning();
      inserted.push({ id: created!.id, platform: created!.platform, status: created!.status ?? "scheduled" });
    }
    return inserted;
  });
}
