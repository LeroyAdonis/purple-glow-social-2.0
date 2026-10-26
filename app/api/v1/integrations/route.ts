/**
 * GET /api/v1/integrations — the caller's connected accounts.
 * Safe fields only: the token is not selected, so it cannot be leaked here.
 */
import { NextResponse } from "next/server";

import { apiAuthErrorResponse, authenticateApiRequest } from "../../../../lib/api/v1/auth";
import { getIntegrations, type ApiIntegration } from "../../../../lib/api/v1/store";

export const dynamic = "force-dynamic";

function tokenHealth(integration: ApiIntegration): "ok" | "needs_reauth" {
  if (!integration.isActive) return "needs_reauth";
  if (integration.tokenExpiresAt && integration.tokenExpiresAt.getTime() <= Date.now()) {
    return "needs_reauth";
  }
  return "ok";
}

export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);
  if (!auth.ok) return apiAuthErrorResponse(auth);

  const integrations = await getIntegrations(auth.userId);

  return NextResponse.json({
    integrations: integrations.map((integration) => ({
      platform: integration.platform,
      displayName: integration.displayName,
      connectedAt: integration.connectedAt,
      tokenHealth: tokenHealth(integration),
    })),
  });
}
