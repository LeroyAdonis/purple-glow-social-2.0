import crypto from 'crypto';

export const PAYSTACK_BASE = 'https://api.paystack.co';

export interface InitializeTransactionParams {
  email: string;
  amountKobo: number;
  planCode?: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeTransactionResult {
  authorizationUrl: string;
  reference: string;
  accessCode: string;
}

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error('PAYSTACK_SECRET_KEY is not set');
  }
  return key;
}

export function toKobo(rand: number): number {
  return Math.round(rand * 100);
}

export async function initializeTransaction(
  params: InitializeTransactionParams,
): Promise<InitializeTransactionResult> {
  const secret = getSecretKey();

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      plan: params.planCode,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const json = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; reference?: string; access_code?: string };
  };

  if (!response.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(json.message || 'Paystack transaction initialization failed');
  }

  return {
    authorizationUrl: json.data.authorization_url,
    reference: json.data.reference ?? params.reference,
    accessCode: json.data.access_code ?? '',
  };
}

export async function verifyTransaction(reference: string): Promise<unknown> {
  const secret = getSecretKey();

  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    },
  );

  const json = (await response.json()) as { status?: boolean; message?: string; data?: unknown };

  if (!response.ok || !json.status) {
    throw new Error(json.message || 'Paystack transaction verification failed');
  }

  return json.data ?? json;
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = getSecretKey();

  if (!signatureHeader) {
    return false;
  }

  const computed = crypto.createHmac('sha512', secret).update(rawBody, 'utf8').digest('hex');

  try {
    const a = Buffer.from(computed, 'utf8');
    const b = Buffer.from(signatureHeader, 'utf8');
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

