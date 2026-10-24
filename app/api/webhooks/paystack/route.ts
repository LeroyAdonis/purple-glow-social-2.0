import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/drizzle/db';
import { user, webhookEvents } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { createLogger } from '@/lib/logger';
import {
  verifyWebhookSignature,
} from '@/lib/paystack/client';
import {
  getWebhookEventByEventId,
  markEventProcessed,
  markEventFailed,
} from '@/lib/db/webhook-events';

const paystackLogger = createLogger('Paystack');

const TIER_CREDITS: Record<string, number> = { pro: 500, business: 2000 };

function planCodeToTier(planCode: string | undefined): 'pro' | 'business' | null {
  if (!planCode) return null;
  const pro = process.env.PAYSTACK_PLAN_PRO;
  const business = process.env.PAYSTACK_PLAN_BUSINESS;
  if (pro && planCode === pro) return 'pro';
  if (business && planCode === business) return 'business';
  return null;
}

function extractPlanCode(data: any): string | undefined {
  return (
    data?.plan?.plan_code ||
    data?.plan_code ||
    data?.subscription?.plan?.plan_code ||
    data?.plan?.code
  );
}

async function resolveUserId(data: any): Promise<string | null> {
  const meta = data?.metadata || {};
  const fromMeta = meta.userId || meta.user_id || meta.userid;
  if (fromMeta) return String(fromMeta);

  const email =
    data?.customer?.email ||
    data?.email ||
    meta.email;
  if (email) {
    const [record] = await db.select().from(user).where(eq(user.email, String(email))).limit(1);
    return record?.id ?? null;
  }
  return null;
}

function idempotencyKey(event: string, data: any, rawBody: string): string {
  const primary =
    data?.reference ||
    data?.id ||
    data?.subscription_code ||
    data?.invoice_code ||
    data?.transaction?.reference;
  if (primary) return `${event}:${primary}`;
  // Fallback: hash the raw body so identical retries dedupe.
  return `${event}:${crypto.createHash('sha256').update(rawBody).digest('hex')}`;
}

export async function POST(request: NextRequest) {
  // 1. Read raw body FIRST.
  const rawBody = await request.text();

  // 2. Verify signature BEFORE any DB write.
  const signature = request.headers.get('x-paystack-signature');
  let verified = false;
  try {
    verified = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    paystackLogger.warn('Webhook signature verification threw', {
      reason: err instanceof Error ? err.message : String(err),
    });
    verified = false;
  }

  if (!verified) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 3. Parse JSON.
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event: string = payload?.event || 'unknown';
  const data = payload?.data;

  const key = idempotencyKey(event, data, rawBody);

  // 4. Idempotency check.
  const existing = await getWebhookEventByEventId(key);
  if (existing && existing.status === 'processed') {
    paystackLogger.info('Duplicate webhook ignored', { event, key });
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (!existing) {
    try {
      await db.insert(webhookEvents).values({
        eventType: event,
        eventId: key,
        payload: payload,
        status: 'pending',
      });
    } catch (err) {
      // Race: another request inserted. Re-check.
      const again = await getWebhookEventByEventId(key);
      if (again && again.status === 'processed') {
        return NextResponse.json({ received: true }, { status: 200 });
      }
      paystackLogger.warn('Webhook event insert failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 5. Process event.
  try {
    if (event === 'charge.success') {
      const userId = await resolveUserId(data);
      const credits = Number(data?.metadata?.credits ?? data?.metadata?.credit ?? 0);
      if (userId && credits > 0) {
        const [u] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
        if (u) {
          await db
            .update(user)
            .set({ credits: (u.credits ?? 0) + credits, updatedAt: new Date() })
            .where(eq(user.id, userId));
          paystackLogger.info('Credited user (charge.success)', { userId, credits });
        } else {
          paystackLogger.warn('charge.success user not found', { userId });
        }
      } else {
        paystackLogger.info('charge.success missing userId/credits', { userId, credits });
      }
    } else if (event === 'subscription.create' || event === 'invoice.payment_succeeded') {
      const userId = await resolveUserId(data);
      const planCode = extractPlanCode(data);
      const tier = planCodeToTier(planCode);
      if (userId && tier) {
        await db
          .update(user)
          .set({ tier: tier as any, credits: TIER_CREDITS[tier], updatedAt: new Date() })
          .where(eq(user.id, userId));
        paystackLogger.info('Subscription activated', { userId, tier });
      } else {
        paystackLogger.warn('subscription event could not resolve user/tier', {
          userId,
          planCode,
        });
      }
    } else if (event === 'subscription.disable' || event === 'subscription.not_renew') {
      const userId = await resolveUserId(data);
      if (userId) {
        await db
          .update(user)
          .set({ tier: 'free' as any, updatedAt: new Date() })
          .where(eq(user.id, userId));
        paystackLogger.info('Subscription disabled', { userId });
      } else {
        paystackLogger.warn('subscription.disable user not found', {});
      }
    } else {
      paystackLogger.info('Ignored webhook event', { event });
    }

    await markEventProcessed(key);
  } catch (error) {
    paystackLogger.exception(error instanceof Error ? error : new Error(String(error)), {
      event,
      key,
    });
    try {
      await markEventFailed(key, error instanceof Error ? error.message : String(error));
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}