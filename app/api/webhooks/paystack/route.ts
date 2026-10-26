import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/drizzle/db';
import { user, webhookEvents } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { createLogger } from '@/lib/logger';
import { recordCredit } from '@/lib/db/credit-ledger';
import { CENTS_PER_CREDIT } from '@/lib/credits/ledger';
import {
  verifyWebhookSignature,
} from '@/lib/paystack/client';
import {
  getWebhookEventByEventId,
  markEventProcessed,
  markEventFailed,
} from '@/lib/db/webhook-events';

const paystackLogger = createLogger('Paystack');

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

function isSubscriptionCharge(data: any): boolean {
  return Boolean(extractPlanCode(data) || data?.plan || data?.subscription);
}

/**
 * Cents actually paid, as reported by Paystack. metadata.credits * 100 is only a fallback: the credit
 * packs are not priced at R1/credit (100 credits sell for R150), so multiplying the credit count would
 * record less money than the customer paid. R299 is R299 because Paystack says 29900.
 */
function chargeAmountCents(data: any): number | null {
  const amount = Number(data?.amount);
  if (Number.isInteger(amount) && amount > 0) return amount;

  const credits = Number(data?.metadata?.credits ?? data?.metadata?.credit);
  if (Number.isInteger(credits) && credits > 0) return credits * CENTS_PER_CREDIT;

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
      // A top-up appends ONE positive ledger entry. There is no balance column to read-modify-write, which
      // is what used to lose credits when two deliveries arrived together. Idempotency is the (reason, ref)
      // unique index on credit_entries: a redelivery inserts nothing and the balance does not move.
      const userId = await resolveUserId(data);
      const cents = chargeAmountCents(data);

      if (!userId) {
        paystackLogger.warn('charge.success user not found', {});
      } else if (isSubscriptionCharge(data)) {
        // S1 is prepaid only: a plan charge is not a wallet top-up. Subscription tiering stays below.
        paystackLogger.info('charge.success is a subscription charge, not wallet credit', { userId });
      } else if (cents === null) {
        paystackLogger.warn('charge.success has no payable amount', { userId });
      } else {
        const entry = await recordCredit({
          userId,
          cents,
          reason: 'paystack_charge',
          ref: data?.reference ? String(data.reference) : key,
        });
        if (entry) {
          paystackLogger.info('Wallet credited (charge.success)', { userId, cents, ref: entry.ref });
        } else {
          paystackLogger.info('Duplicate charge already credited', { userId, ref: key });
        }
      }
    } else if (event === 'subscription.create' || event === 'invoice.payment_succeeded') {
      // Tier only. A subscription grant does NOT write a credit balance: the balance is the ledger, and
      // turning a plan into wallet credit is subscription logic that this slice deliberately excludes.
      const userId = await resolveUserId(data);
      const planCode = extractPlanCode(data);
      const tier = planCodeToTier(planCode);
      if (userId && tier) {
        await db
          .update(user)
          .set({ tier: tier as any, updatedAt: new Date() })
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