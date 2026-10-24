import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';
import { initializeTransaction } from '@/lib/paystack/client';

const TIER_CREDITS: Record<string, number> = { pro: 500, business: 2000 };
const TIER_AMOUNT_KOBO: Record<string, number> = { pro: 29900, business: 99900 };

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await parseRequestBody<{ tier?: unknown }>(request);
    if (!body) {
      return invalidJsonResponse();
    }

    const tier = body.tier;
    if (tier !== 'pro' && tier !== 'business') {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const planCodeVar = tier === 'pro' ? 'PAYSTACK_PLAN_PRO' : 'PAYSTACK_PLAN_BUSINESS';
    const planCode = process.env[planCodeVar];
    if (!planCode) {
      return NextResponse.json(
        { error: `${planCodeVar} is not set` },
        { status: 503 },
      );
    }

    const reference = `posta_${session.user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const callbackUrl = `${request.nextUrl.origin}/dashboard`;

    const result = await initializeTransaction({
      email: session.user.email,
      amountKobo: TIER_AMOUNT_KOBO[tier] ?? 0,
      planCode,
      reference,
      callbackUrl,
      metadata: {
        userId: session.user.id,
        tier,
        credits: TIER_CREDITS[tier],
      },
    });

    return NextResponse.json({
      authorizationUrl: result.authorizationUrl,
      reference: result.reference,
    });
  } catch (error) {
    logger.api.exception(error instanceof Error ? error : new Error(String(error)), {
      action: 'paystack-checkout',
    });
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}