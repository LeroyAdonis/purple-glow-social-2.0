/**
 * /api/v1/keys — API key management for the dashboard.
 * Session-authed on purpose: a key must never be able to mint another key.
 *
 * The plaintext key exists in exactly one place: the create response.
 */
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "../../../../lib/auth";
import { generateApiKey } from "../../../../lib/api/v1/auth";
import { createApiKey, listApiKeys } from "../../../../lib/api/v1/store";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

async function sessionUserId(request: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id ?? null;
}

export async function GET(request: Request) {
  const userId = await sessionUserId(request);
  if (!userId) {
    return NextResponse.json(
      { error: "unauthorized", message: "Sign in to manage API keys." },
      { status: 401 }
    );
  }

  const keys = await listApiKeys(userId);
  // Explicit whitelist: a route must not be able to leak the hash even if the query changes.
  return NextResponse.json({
    keys: keys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix,
      lastUsedAt: key.lastUsedAt,
      revokedAt: key.revokedAt,
      createdAt: key.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const userId = await sessionUserId(request);
  if (!userId) {
    return NextResponse.json(
      { error: "unauthorized", message: "Sign in to manage API keys." },
      { status: 401 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "The request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: parsed.error.issues[0]?.message ?? "A key name is required.",
      },
      { status: 400 }
    );
  }

  const { key, keyHash, keyPrefix } = generateApiKey();
  const created = await createApiKey({ userId, name: parsed.data.name, keyHash, keyPrefix });

  return NextResponse.json(
    {
      id: created.id,
      name: created.name,
      key,
      keyPrefix: created.keyPrefix,
      createdAt: created.createdAt,
      message: "Copy this key now. It is not shown again.",
    },
    { status: 201 }
  );
}
