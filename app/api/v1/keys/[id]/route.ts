/**
 * DELETE /api/v1/keys/[id] — revoke a key. Session-authed, and only for the owner's keys.
 * Revoking is a soft delete so the audit trail of a key's life survives.
 */
import { NextResponse } from "next/server";

import { auth } from "../../../../../lib/auth";
import { revokeApiKey } from "../../../../../lib/api/v1/store";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "unauthorized", message: "Sign in to manage API keys." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const revoked = await revokeApiKey(id, session.user.id, new Date());

  if (!revoked) {
    return NextResponse.json(
      { error: "not_found", message: "Key not found or already revoked." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: revoked.id,
    name: revoked.name,
    keyPrefix: revoked.keyPrefix,
    revokedAt: revoked.revokedAt,
  });
}
