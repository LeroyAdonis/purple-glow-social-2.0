/**
 * Bearer-key auth for /api/v1.
 *
 * Three failures that look alike to an attacker are three different problems for a customer, so they stay
 * distinct: no credential (401), a credential we never issued (403), and a credential we killed (410).
 * Only a SHA-256 of the key is ever stored, so a database leak does not hand out working keys.
 */
import { createHash, randomBytes } from "node:crypto";

import { findApiKeyByHash, touchApiKey } from "./store";

export const API_KEY_PREFIX = "posta_";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function generateApiKey(): { key: string; keyHash: string; keyPrefix: string } {
  const key = `${API_KEY_PREFIX}${randomBytes(24).toString("hex")}`;
  return { key, keyHash: hashApiKey(key), keyPrefix: key.slice(0, 8) };
}

export type ApiAuthFailure = {
  ok: false;
  error: "missing_key" | "unknown_key" | "revoked_key";
  status: 401 | 403 | 410;
  message: string;
};

export type ApiAuthSuccess = { ok: true; userId: string; apiKeyId: string };

export type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure;

const MISSING: ApiAuthFailure = {
  ok: false,
  error: "missing_key",
  status: 401,
  message: "Missing API key. Send it as: Authorization: Bearer <key>",
};

export function apiAuthErrorResponse(failure: ApiAuthFailure): Response {
  return Response.json({ error: failure.error, message: failure.message }, { status: failure.status });
}

export async function authenticateApiRequest(request: Request): Promise<ApiAuthResult> {
  const header = request.headers.get("authorization")?.trim();
  if (!header) return MISSING;

  const match = /^Bearer\s+(\S+)$/i.exec(header);
  const key = match?.[1];
  if (!key) return MISSING;

  const row = await findApiKeyByHash(hashApiKey(key));
  if (!row) {
    return {
      ok: false,
      error: "unknown_key",
      status: 403,
      message: "Unknown API key. Check the key or create a new one.",
    };
  }

  if (row.revokedAt) {
    return {
      ok: false,
      error: "revoked_key",
      status: 410,
      message: "This API key was revoked. Create a new one.",
    };
  }

  await touchApiKey(row.id, new Date());
  return { ok: true, userId: row.userId, apiKeyId: row.id };
}
