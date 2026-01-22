import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '@/drizzle/db';
import { user, jobLogs, posts, automationRules, connectedAccounts, notifications } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { randomUUID } from 'crypto';

describe('Account Deletion - POPIA Compliance', () => {
  const testUserId = `test-deletion-${nanoid()}`;
  const testEmail = `deletion-test-${nanoid()}@test.com`;
  
  beforeAll(async () => {
    // Create test user
    await db.insert(user).values({
      id: testUserId,
      email: testEmail,
      name: 'Deletion Test User',
      credits: 100,
      tier: 'free',
    });
  });
  
  afterAll(async () => {
    // Cleanup - force delete if test fails
    await db.execute(sql`DELETE FROM ${user} WHERE id = ${testUserId}`);
    await db.execute(sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`);
  });
  
  beforeEach(async () => {
    // Reset test data before each test
    await db.execute(sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`);
    await db.delete(posts).where(eq(posts.userId, testUserId));
    await db.delete(automationRules).where(eq(automationRules.userId, testUserId));
    await db.delete(connectedAccounts).where(eq(connectedAccounts.userId, testUserId));
    await db.delete(notifications).where(eq(notifications.userId, testUserId));
  });

  describe('Job Logs Deletion', () => {
    it('should delete job logs with userId in payload', async () => {
      // Insert test job logs with various payload structures
      await db.insert(jobLogs).values([
        {
          id: randomUUID(),
          functionName: 'process-scheduled-post',
          payload: { userId: testUserId, postId: 'post-1' },
          status: 'completed',
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          functionName: 'reset-monthly-credits',
          payload: { userId: testUserId },
          status: 'completed',
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          functionName: 'check-low-credits',
          payload: { userId: testUserId, threshold: 10 },
          status: 'completed',
          createdAt: new Date(),
        },
      ]);
      
      // Verify job logs exist
      const beforeDeletion = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      expect(beforeDeletion.rows).toHaveLength(3);
      
      // Delete job logs (using the fixed query)
      await db.execute(
        sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      
      // Verify job logs deleted
      const afterDeletion = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      expect(afterDeletion.rows).toHaveLength(0);
    });

    it('should not delete job logs for other users', async () => {
      const otherUserId = `test-other-${nanoid()}`;
      
      // Insert job logs for multiple users
      await db.insert(jobLogs).values([
        {
          id: randomUUID(),
          functionName: 'test-function',
          payload: { userId: testUserId },
          status: 'completed',
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          functionName: 'test-function',
          payload: { userId: otherUserId },
          status: 'completed',
          createdAt: new Date(),
        },
      ]);
      
      // Delete only test user's logs
      await db.execute(
        sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      
      // Verify test user's logs deleted
      const testUserLogs = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      expect(testUserLogs.rows).toHaveLength(0);
      
      // Verify other user's logs remain
      const otherUserLogs = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${otherUserId}`
      );
      expect(otherUserLogs.rows).toHaveLength(1);
      
      // Cleanup
      await db.execute(
        sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${otherUserId}`
      );
    });

    it('should handle job logs without userId in payload', async () => {
      // Insert job logs without userId
      const systemLogId = randomUUID();
      await db.insert(jobLogs).values([
        {
          id: systemLogId,
          functionName: 'system-maintenance',
          payload: { task: 'cleanup' },
          status: 'completed',
          createdAt: new Date(),
        },
      ]);
      
      // Attempt to delete (should not affect system logs)
      await db.execute(
        sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      
      // Verify system log still exists
      const systemLogs = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE id = ${systemLogId}`
      );
      expect(systemLogs.rows.length).toBeGreaterThan(0);
      
      // Cleanup
      await db.execute(sql`DELETE FROM ${jobLogs} WHERE id = ${systemLogId}`);
    });

    it('should handle empty payload correctly', async () => {
      // Insert job log with null payload
      const emptyLogId = randomUUID();
      await db.insert(jobLogs).values([
        {
          id: emptyLogId,
          functionName: 'system-task',
          payload: null,
          status: 'completed',
          createdAt: new Date(),
        },
      ]);
      
      // Attempt to delete
      await db.execute(
        sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      
      // Verify null payload log still exists
      const emptyLogs = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE id = ${emptyLogId}`
      );
      expect(emptyLogs.rows).toHaveLength(1);
      
      // Cleanup
      await db.execute(sql`DELETE FROM ${jobLogs} WHERE id = ${emptyLogId}`);
    });

    it('should handle nested userId in payload', async () => {
      // Insert job log with nested structure
      await db.insert(jobLogs).values([
        {
          id: randomUUID(),
          functionName: 'nested-task',
          payload: { userId: testUserId, metadata: { nested: 'value' } },
          status: 'completed',
          createdAt: new Date(),
        },
      ]);
      
      // Verify log exists
      const beforeDeletion = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      expect(beforeDeletion.rows).toHaveLength(1);
      
      // Delete
      await db.execute(
        sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      
      // Verify deleted
      const afterDeletion = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      expect(afterDeletion.rows).toHaveLength(0);
    });
  });

  describe('Complete Account Deletion Flow', () => {
    it('should delete all user-related data including job logs', async () => {
      // Create comprehensive test data
      await db.insert(posts).values({
        id: randomUUID(),
        userId: testUserId,
        content: 'Test post',
        platform: 'twitter',
        status: 'posted',
        createdAt: new Date(),
      });
      
      await db.insert(automationRules).values({
        id: randomUUID(),
        userId: testUserId,
        coreTopic: 'test',
        frequency: 'daily',
        isActive: true,
        createdAt: new Date(),
      });
      
      await db.insert(jobLogs).values({
        id: randomUUID(),
        functionName: 'test-job',
        payload: { userId: testUserId },
        status: 'completed',
        createdAt: new Date(),
      });
      
      // Verify data exists
      const postsCount = await db.select().from(posts).where(eq(posts.userId, testUserId));
      const rulesCount = await db.select().from(automationRules).where(eq(automationRules.userId, testUserId));
      const logsCount = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      
      expect(postsCount).toHaveLength(1);
      expect(rulesCount).toHaveLength(1);
      expect(logsCount.rows).toHaveLength(1);
      
      // Perform deletion (simulate the account deletion flow)
      await db.transaction(async (tx) => {
        // Delete related data
        await tx.delete(posts).where(eq(posts.userId, testUserId));
        await tx.delete(automationRules).where(eq(automationRules.userId, testUserId));
        await tx.delete(connectedAccounts).where(eq(connectedAccounts.userId, testUserId));
        await tx.delete(notifications).where(eq(notifications.userId, testUserId));
        
        // Delete job logs (FIXED QUERY)
        await tx.execute(
          sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
        );
        
        // Soft delete user (anonymize)
        await tx.update(user)
          .set({
            email: `deleted-${testUserId}@purpleglow.deleted`,
            name: 'Deleted User',
            image: null,
          })
          .where(eq(user.id, testUserId));
      });
      
      // Verify all data deleted
      const afterPosts = await db.select().from(posts).where(eq(posts.userId, testUserId));
      const afterRules = await db.select().from(automationRules).where(eq(automationRules.userId, testUserId));
      const afterLogs = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      
      expect(afterPosts).toHaveLength(0);
      expect(afterRules).toHaveLength(0);
      expect(afterLogs.rows).toHaveLength(0);
      
      // Verify user anonymized
      const [deletedUser] = await db.select().from(user).where(eq(user.id, testUserId));
      expect(deletedUser.email).toContain('deleted');
      expect(deletedUser.name).toBe('Deleted User');
    });

    it('should handle deletion when multiple job types exist', async () => {
      // Insert various job types
      await db.insert(jobLogs).values([
        {
          id: randomUUID(),
          functionName: 'process-scheduled-post',
          payload: { userId: testUserId, postId: 'p1' },
          status: 'completed',
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          functionName: 'execute-automation-rule',
          payload: { userId: testUserId, ruleId: 'r1' },
          status: 'failed',
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          functionName: 'check-low-credits',
          payload: { userId: testUserId },
          status: 'completed',
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          functionName: 'check-credit-expiry',
          payload: { userId: testUserId },
          status: 'completed',
          createdAt: new Date(),
        },
      ]);
      
      // Verify all exist
      const before = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      expect(before.rows).toHaveLength(4);
      
      // Delete all
      await db.execute(
        sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      
      // Verify all deleted
      const after = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      expect(after.rows).toHaveLength(0);
    });

    it('should handle deletion with mixed job statuses', async () => {
      // Insert jobs with different statuses
      await db.insert(jobLogs).values([
        {
          id: randomUUID(),
          functionName: 'test-job',
          payload: { userId: testUserId },
          status: 'pending',
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          functionName: 'test-job',
          payload: { userId: testUserId },
          status: 'running',
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          functionName: 'test-job',
          payload: { userId: testUserId },
          status: 'completed',
          createdAt: new Date(),
        },
        {
          id: randomUUID(),
          functionName: 'test-job',
          payload: { userId: testUserId },
          status: 'failed',
          createdAt: new Date(),
        },
      ]);
      
      // Delete all regardless of status
      await db.execute(
        sql`DELETE FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      
      // Verify all deleted
      const after = await db.execute(
        sql`SELECT * FROM ${jobLogs} WHERE payload->>'userId' = ${testUserId}`
      );
      expect(after.rows).toHaveLength(0);
    });
  });
});
