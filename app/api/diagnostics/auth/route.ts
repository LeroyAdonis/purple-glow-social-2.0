/**
 * Authentication Diagnostic API Route
 *
 * GET /api/diagnostics/auth - Returns authentication configuration status
 */

import { diagnoseAuth } from '@/lib/diagnostics/auth-diagnostic';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const result = await diagnoseAuth();

    return Response.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        isProduction: result.isProduction
      },
      configuration: {
        databaseConfigured: result.databaseConfigured,
        secretConfigured: result.secretConfigured,
        baseUrl: result.baseUrl,
        publicUrl: result.publicUrl
      },
      issues: result.success ? [] : [result]
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return Response.json({
      success: false,
      error: 'Diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}