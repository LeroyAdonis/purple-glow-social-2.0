/**
 * API Route: Create Credit Checkout
 * 
 * POST /api/checkout/credits
 * Creates a Polar checkout session for credit purchases
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { createCreditCheckout } from '../../../../lib/polar/checkout-service';
import { db } from '../../../../drizzle/db';
import { user as userTable } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../../../lib/logger';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';
import { creditCheckoutSchema } from '@/lib/security/validation';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await parseRequestBody(request);
    if (!body) {
      return invalidJsonResponse();
    }

    // Validate with Zod schema
    const validationResult = creditCheckoutSchema.safeParse(body);
    if (!validationResult.success) {
      logger.polar.warn('Invalid credit checkout request', {
        userId: session.user.id,
        errors: validationResult.error.format(),
      });
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { packageId } = validationResult.data;

    // Get full user data from database
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create checkout session
    const checkout = await createCreditCheckout({
      user,
      packageId,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: checkout.checkoutUrl,
      checkoutId: checkout.checkoutId,
    });

  } catch (error) {
    logger.polar.exception(error, { action: 'create-checkout' });
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
