import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { deductCreditsAtomic } from '@/lib/db/users';
import { db } from '@/drizzle/db';
import { user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Credit Race Condition Prevention', () => {
  const testUserId = 'test-race-condition-user';
  
  // Helper to reset credits and wait a bit to avoid connection issues
  const resetCredits = async (amount: number) => {
    try {
      await db.update(user)
        .set({ credits: amount })
        .where(eq(user.id, testUserId));
      // Small delay to let connection pool recover
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error('Failed to reset credits:', error);
      throw error;
    }
  };
  
  beforeAll(async () => {
    // Create test user with 10 credits
    try {
      // Delete if exists first
      await db.delete(user).where(eq(user.id, testUserId));
    } catch (error) {
      // Ignore errors - user might not exist
    }
    
    try {
      await db.insert(user).values({
        id: testUserId,
        email: 'race-test@test.com',
        name: 'Race Test User',
        credits: 10,
        tier: 'free',
      });
    } catch (error) {
      console.warn('Test user creation failed:', error);
    }
  });
  
  afterAll(async () => {
    // Cleanup
    try {
      await db.delete(user).where(eq(user.id, testUserId));
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });
  
  it('should prevent race condition with concurrent deductions', async () => {
    await resetCredits(10);
    
    // Launch 5 concurrent requests, each trying to deduct 3 credits
    // Only 3 should succeed (10 / 3 = 3 with 1 remaining)
    const promises = Array(5).fill(null).map((_, i) => 
      // Stagger slightly to reduce connection pressure
      new Promise(resolve => setTimeout(resolve, i * 10)).then(() =>
        deductCreditsAtomic(testUserId, 3)
      )
    );
    
    const results = await Promise.all(promises);
    
    // Count successes and failures
    const successes = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success).length;
    
    // Should have exactly 3 successes (10 credits / 3 per request)
    expect(successes).toBe(3);
    expect(failures).toBe(2);
    
    // Final balance should be 1 (10 - 3*3 = 1)
    const [finalUser] = await db
      .select({ credits: user.credits })
      .from(user)
      .where(eq(user.id, testUserId));
    
    expect(finalUser.credits).toBe(1);
    
    // Balance should NEVER be negative
    expect(finalUser.credits).toBeGreaterThanOrEqual(0);
  }, 15000);
  
  it('should handle rapid concurrent requests without negative balance', async () => {
    await resetCredits(6);
    
    // Launch 10 concurrent requests, each needing 5 credits
    // Only 1 should succeed (6 / 5 = 1)
    const promises = Array(10).fill(null).map((_, i) => 
      new Promise(resolve => setTimeout(resolve, i * 10)).then(() =>
        deductCreditsAtomic(testUserId, 5)
      )
    );
    
    const results = await Promise.all(promises);
    
    const successes = results.filter(r => r.success).length;
    
    expect(successes).toBe(1);
    
    // Final balance should be 1 (6 - 5 = 1)
    const [finalUser] = await db
      .select({ credits: user.credits })
      .from(user)
      .where(eq(user.id, testUserId));
    
    expect(finalUser.credits).toBe(1);
    expect(finalUser.credits).toBeGreaterThanOrEqual(0);
  }, 15000);
  
  it('should fail all requests when insufficient credits', async () => {
    await resetCredits(2);
    
    // Try to deduct 5 credits 3 times
    const promises = Array(3).fill(null).map((_, i) => 
      new Promise(resolve => setTimeout(resolve, i * 10)).then(() =>
        deductCreditsAtomic(testUserId, 5)
      )
    );
    
    const results = await Promise.all(promises);
    
    // All should fail
    const failures = results.filter(r => !r.success).length;
    expect(failures).toBe(3);
    
    // Balance should remain 2
    const [finalUser] = await db
      .select({ credits: user.credits })
      .from(user)
      .where(eq(user.id, testUserId));
    
    expect(finalUser.credits).toBe(2);
  }, 15000);
  
  it('should handle exact balance scenario', async () => {
    await resetCredits(15);
    
    // Launch 5 concurrent requests, each needing 3 credits
    // All 5 should succeed (15 / 3 = 5)
    const promises = Array(5).fill(null).map((_, i) => 
      new Promise(resolve => setTimeout(resolve, i * 10)).then(() =>
        deductCreditsAtomic(testUserId, 3)
      )
    );
    
    const results = await Promise.all(promises);
    
    const successes = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success).length;
    
    expect(successes).toBe(5);
    expect(failures).toBe(0);
    
    // Final balance should be 0
    const [finalUser] = await db
      .select({ credits: user.credits })
      .from(user)
      .where(eq(user.id, testUserId));
    
    expect(finalUser.credits).toBe(0);
  }, 15000);
  
  it('should return correct error information on failure', async () => {
    await resetCredits(5);
    
    // Try to deduct 10 credits
    const result = await deductCreditsAtomic(testUserId, 10);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Insufficient credits');
    expect(result.newBalance).toBe(5);
  }, 15000);
  
  it('should return correct balance on success', async () => {
    await resetCredits(10);
    
    // Deduct 3 credits
    const result = await deductCreditsAtomic(testUserId, 3);
    
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(7);
    expect(result.error).toBeUndefined();
  }, 15000);
});
