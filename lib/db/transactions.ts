/**
 * Database Service: Transactions
 * 
 * Handles all database operations related to payment transactions
 */

import { db } from '../../drizzle/db';
import { transactions, type Transaction, type NewTransaction } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Create a new transaction record
 */
export async function createTransaction(data: NewTransaction): Promise<Transaction> {
  const [transaction] = await db.insert(transactions).values(data).returning();
  return transaction;
}

/**
 * Get transaction by Polar order ID
 */
export async function getTransactionByPolarOrderId(polarOrderId: string): Promise<Transaction | null> {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.polarOrderId, polarOrderId))
    .limit(1);
  
  return transaction || null;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: Transaction['status'],
  metadata?: Record<string, any>
): Promise<Transaction> {
  const updateData: Partial<NewTransaction> = {
    status,
    updatedAt: new Date(),
  };

  if (metadata) {
    updateData.metadata = metadata;
  }

  const [transaction] = await db
    .update(transactions)
    .set(updateData)
    .where(eq(transactions.id, transactionId))
    .returning();
  
  return transaction;
}

/**
 * Get all transactions for a user
 */
export async function getUserTransactions(
  userId: string,
  limit: number = 50
): Promise<Transaction[]> {
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);
  
  return transaction || null;
}
