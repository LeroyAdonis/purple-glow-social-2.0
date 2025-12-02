/**
 * Database Service: Credit Reservations
 * 
 * Handles credit reservations for scheduled posts
 */

import { db } from '../../drizzle/db';
import { creditReservations, user } from '../../drizzle/schema';
import { eq, and, sql, lt } from 'drizzle-orm';
import type { CreditReservation, NewCreditReservation } from '../../drizzle/schema';

/**
 * Reserve credits for a scheduled post
 */
export async function reserveCredits(
  userId: string,
  postId: string,
  credits: number,
  expiresAt?: Date
): Promise<CreditReservation> {
  // Default expiration: 30 days from now
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 30);

  const [reservation] = await db
    .insert(creditReservations)
    .values({
      userId,
      postId,
      credits,
      status: 'pending',
      expiresAt: expiresAt || defaultExpiry,
    })
    .returning();

  return reservation;
}

/**
 * Consume a credit reservation (when post is successfully published)
 */
export async function consumeReservation(reservationId: string): Promise<CreditReservation | null> {
  const [reservation] = await db
    .update(creditReservations)
    .set({ status: 'consumed' })
    .where(
      and(
        eq(creditReservations.id, reservationId),
        eq(creditReservations.status, 'pending')
      )
    )
    .returning();

  return reservation || null;
}

/**
 * Consume reservation by post ID
 */
export async function consumeReservationByPostId(postId: string): Promise<CreditReservation | null> {
  const [reservation] = await db
    .update(creditReservations)
    .set({ status: 'consumed' })
    .where(
      and(
        eq(creditReservations.postId, postId),
        eq(creditReservations.status, 'pending')
      )
    )
    .returning();

  return reservation || null;
}

/**
 * Release a credit reservation (when post fails after all retries or is cancelled)
 */
export async function releaseReservation(reservationId: string): Promise<CreditReservation | null> {
  const [reservation] = await db
    .update(creditReservations)
    .set({ status: 'released' })
    .where(
      and(
        eq(creditReservations.id, reservationId),
        eq(creditReservations.status, 'pending')
      )
    )
    .returning();

  return reservation || null;
}

/**
 * Release reservation by post ID
 */
export async function releaseReservationByPostId(postId: string): Promise<CreditReservation | null> {
  const [reservation] = await db
    .update(creditReservations)
    .set({ status: 'released' })
    .where(
      and(
        eq(creditReservations.postId, postId),
        eq(creditReservations.status, 'pending')
      )
    )
    .returning();

  return reservation || null;
}

/**
 * Get total reserved credits for a user
 */
export async function getReservedCredits(userId: string): Promise<number> {
  const [result] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${creditReservations.credits}), 0)`,
    })
    .from(creditReservations)
    .where(
      and(
        eq(creditReservations.userId, userId),
        eq(creditReservations.status, 'pending')
      )
    );

  return result?.total || 0;
}

/**
 * Get all pending reservations for a user
 */
export async function getUserReservations(userId: string): Promise<CreditReservation[]> {
  return await db
    .select()
    .from(creditReservations)
    .where(
      and(
        eq(creditReservations.userId, userId),
        eq(creditReservations.status, 'pending')
      )
    );
}

/**
 * Get reservation by ID
 */
export async function getReservationById(reservationId: string): Promise<CreditReservation | null> {
  const [reservation] = await db
    .select()
    .from(creditReservations)
    .where(eq(creditReservations.id, reservationId))
    .limit(1);

  return reservation || null;
}

/**
 * Get reservation by post ID
 */
export async function getReservationByPostId(postId: string): Promise<CreditReservation | null> {
  const [reservation] = await db
    .select()
    .from(creditReservations)
    .where(eq(creditReservations.postId, postId))
    .limit(1);

  return reservation || null;
}

/**
 * Get available credits (total - reserved)
 */
export async function getAvailableCredits(userId: string): Promise<number> {
  const [userData] = await db
    .select({ credits: user.credits })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const totalCredits = userData?.credits || 0;
  const reserved = await getReservedCredits(userId);

  return Math.max(0, totalCredits - reserved);
}

/**
 * Release expired reservations
 */
export async function releaseExpiredReservations(): Promise<number> {
  const now = new Date();

  const result = await db
    .update(creditReservations)
    .set({ status: 'released' })
    .where(
      and(
        eq(creditReservations.status, 'pending'),
        lt(creditReservations.expiresAt, now)
      )
    );

  // Drizzle doesn't return count directly, we'd need to do a separate query
  // For now, just return a success indicator
  return 0;
}

/**
 * Check if user has enough available credits
 */
export async function hasAvailableCredits(userId: string, requiredCredits: number): Promise<boolean> {
  const available = await getAvailableCredits(userId);
  return available >= requiredCredits;
}
