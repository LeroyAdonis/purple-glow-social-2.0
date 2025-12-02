/**
 * Inngest Function: Execute Automation Rule
 * 
 * Generates content and posts based on automation rules
 */

import { inngest } from '../client';
import { db } from '@/drizzle/db';
import { automationRules, posts, user } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { logJob, updateJobStatus } from '@/lib/db/job-logs';
import { getAvailableCredits, reserveCredits } from '@/lib/db/credit-reservations';
import { notifyTierLimitReached } from '@/lib/db/notifications';
import { canUseAutomation } from '@/lib/tiers/validation';
import type { TierName } from '@/lib/tiers/types';

export const executeAutomationRule = inngest.createFunction(
  {
    id: 'execute-automation-rule',
    name: 'Execute Automation Rule',
    retries: 2,
  },
  { event: 'automation/rule.execute' },
  async ({ event, step }) => {
    const { ruleId, userId } = event.data;

    // Log job start
    const jobLog = await step.run('log-job-start', async () => {
      return await logJob({
        inngestEventId: event.id,
        functionName: 'execute-automation-rule',
        status: 'running',
        payload: { ruleId, userId },
      });
    });

    try {
      // Step 1: Validate rule and user
      const validation = await step.run('validate-rule', async () => {
        // Get user
        const userData = await db.query.user.findFirst({
          where: eq(user.id, userId),
        });

        if (!userData) {
          throw new Error('User not found');
        }

        // Check tier allows automation
        const tier = (userData.tier || 'free') as TierName;
        const automationCheck = canUseAutomation(tier, 0);

        if (!automationCheck.allowed) {
          return { valid: false, reason: 'tier_not_allowed', tier, coreTopic: null };
        }

        // Get rule
        const rule = await db.query.automationRules.findFirst({
          where: eq(automationRules.id, ruleId),
        });

        if (!rule) {
          throw new Error('Automation rule not found');
        }

        if (!rule.isActive) {
          return { valid: false, reason: 'rule_inactive', tier: null, coreTopic: null };
        }

        // Check credits
        const availableCredits = await getAvailableCredits(userId);
        if (availableCredits < 1) {
          return { valid: false, reason: 'no_credits', tier: null, coreTopic: null };
        }

        return { valid: true, reason: null, tier, coreTopic: rule.coreTopic };
      });

      if (!validation.valid) {
        await step.run('handle-validation-failure', async () => {
          if (validation.reason === 'tier_not_allowed' && validation.tier) {
            await notifyTierLimitReached(userId, 'automation', validation.tier);
          }

          await updateJobStatus(jobLog.id, 'completed', {
            result: { status: 'skipped', reason: validation.reason },
          });
        });

        return { status: 'skipped', reason: validation.reason };
      }

      const coreTopic = validation.coreTopic;

      // Step 2: Generate content using AI
      const generatedContent = await step.run('generate-content', async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/api/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: coreTopic,
            platform: 'instagram',
            tone: 'professional',
            language: 'en',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate content');
        }

        const data = await response.json();
        return data.content as string;
      });

      // Step 3: Create post
      const newPost = await step.run('create-post', async () => {
        const scheduledDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        const [post] = await db
          .insert(posts)
          .values({
            userId,
            content: generatedContent,
            platform: 'instagram',
            status: 'scheduled',
            topic: coreTopic,
            scheduledDate,
          })
          .returning();

        return { id: post.id, scheduledDate: scheduledDate.toISOString() };
      });

      // Step 4: Reserve credits
      await step.run('reserve-credits', async () => {
        await reserveCredits(userId, newPost.id, 1);
      });

      // Step 5: Schedule the post via Inngest
      await step.run('schedule-post', async () => {
        await inngest.send({
          name: 'post/scheduled.process',
          data: {
            postId: newPost.id,
            userId,
            platform: 'instagram',
            scheduledAt: newPost.scheduledDate,
          },
          ts: new Date(newPost.scheduledDate).getTime(),
        });
      });

      // Update job log
      await updateJobStatus(jobLog.id, 'completed', {
        result: {
          status: 'created',
          postId: newPost.id,
          scheduledAt: newPost.scheduledDate,
        },
      });

      return {
        status: 'created',
        postId: newPost.id,
        content: generatedContent.substring(0, 100) + '...',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await updateJobStatus(jobLog.id, 'failed', {
        errorMessage,
      });

      throw error;
    }
  }
);
