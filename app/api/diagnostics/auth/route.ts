/**
 * Authentication Diagnostic API Route
 *
 * GET /api/diagnostics/auth - Returns authentication configuration status
 */

import { diagnoseAuth } from "@/lib/diagnostics/auth-diagnostic";
import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";
import { healthCheck } from "@/drizzle/db";
import { useSecureCookies } from "@/lib/auth";
import { isDevFallbackActive } from "@/lib/auth-dev-fallback";

export async function GET(request: NextRequest) {
  try {
    const result = await diagnoseAuth();
    const dbHealth = await healthCheck();

    return Response.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        isProduction: result.isProduction,
      },
      configuration: {
        databaseConfigured: result.databaseConfigured,
        secretConfigured: result.secretConfigured,
        baseUrl: result.baseUrl,
        publicUrl: result.publicUrl,
      },
      diagnostics: {
        dbHealth,
        cookie: { useSecureCookies },
        runtime: { auth: 'nodejs', dynamic: 'force-dynamic' },
        devFallbackActive: isDevFallbackActive(),
      },
      issues: result.success ? [] : [result],
    });
  } catch (error) {
    logger.auth.exception(error, { action: 'diagnostics' });
    return Response.json(
      {
        success: false,
        error: "Diagnostic failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
