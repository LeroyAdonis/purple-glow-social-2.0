import { NextRequest, NextResponse } from 'next/server';

/**
 * Safely parse JSON from request body
 * Returns null if JSON is malformed
 * 
 * @param request - Next.js request object
 * @returns Parsed body or null if invalid JSON
 */
export async function parseRequestBody<T>(request: NextRequest): Promise<T | null> {
  try {
    const body = await request.json();
    return body as T;
  } catch {
    return null;
  }
}

/**
 * Standard error response for invalid JSON
 * Returns consistent error format
 */
export function invalidJsonResponse() {
  return NextResponse.json(
    {
      error: 'Invalid JSON in request body',
      message: 'The request body must be valid JSON',
    },
    { status: 400 }
  );
}
