/**
 * Database Service: Automation Rules
 * 
 * Handles all database operations related to automation rules
 */

import { db } from '../../drizzle/db';
import { automationRules, type AutomationRule } from '../../drizzle/schema';
import { eq, desc, and, count } from 'drizzle-orm';

type NewAutomationRule = typeof automationRules.$inferInsert;

/**
 * Create a new automation rule
 */
export async function createAutomationRule(data: NewAutomationRule): Promise<AutomationRule> {
  const [rule] = await db.insert(automationRules).values(data).returning();
  return rule;
}

/**
 * Get automation rule by ID
 */
export async function getAutomationRuleById(ruleId: string): Promise<AutomationRule | null> {
  const [rule] = await db
    .select()
    .from(automationRules)
    .where(eq(automationRules.id, ruleId))
    .limit(1);
  
  return rule || null;
}

/**
 * Get all automation rules for a user
 */
export async function getUserAutomationRules(
  userId: string,
  options: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<AutomationRule[]> {
  const { isActive, limit = 50, offset = 0 } = options;

  const conditions = [eq(automationRules.userId, userId)];
  
  if (isActive !== undefined) {
    conditions.push(eq(automationRules.isActive, isActive));
  }

  return await db
    .select()
    .from(automationRules)
    .where(and(...conditions))
    .orderBy(desc(automationRules.createdAt))
    .limit(limit)
    .offset(offset);
}

/**
 * Get active automation rules (for cron job)
 */
export async function getActiveAutomationRules(): Promise<AutomationRule[]> {
  return await db
    .select()
    .from(automationRules)
    .where(eq(automationRules.isActive, true))
    .orderBy(automationRules.createdAt);
}

/**
 * Update automation rule
 */
export async function updateAutomationRule(
  ruleId: string,
  data: Partial<NewAutomationRule>
): Promise<AutomationRule> {
  const [rule] = await db
    .update(automationRules)
    .set(data)
    .where(eq(automationRules.id, ruleId))
    .returning();
  
  return rule;
}

/**
 * Toggle automation rule active status
 */
export async function toggleAutomationRule(ruleId: string): Promise<AutomationRule> {
  // First get the current status
  const current = await getAutomationRuleById(ruleId);
  if (!current) {
    throw new Error('Automation rule not found');
  }

  const [rule] = await db
    .update(automationRules)
    .set({
      isActive: !current.isActive,
    })
    .where(eq(automationRules.id, ruleId))
    .returning();
  
  return rule;
}

/**
 * Delete automation rule
 */
export async function deleteAutomationRule(ruleId: string): Promise<void> {
  await db.delete(automationRules).where(eq(automationRules.id, ruleId));
}

/**
 * Count automation rules for a user
 */
export async function countUserAutomationRules(
  userId: string,
  isActive?: boolean
): Promise<number> {
  const conditions = [eq(automationRules.userId, userId)];
  
  if (isActive !== undefined) {
    conditions.push(eq(automationRules.isActive, isActive));
  }

  const [result] = await db
    .select({ count: count() })
    .from(automationRules)
    .where(and(...conditions));
  
  return result?.count || 0;
}
