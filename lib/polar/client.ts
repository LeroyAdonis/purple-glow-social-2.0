/**
 * Polar SDK Client
 * 
 * Initialized Polar client for server-side API calls
 */

import { Polar } from '@polar-sh/sdk';
import { POLAR_CONFIG } from './config';

/**
 * Server-side Polar client instance
 * Use this for all server-side API calls to Polar
 */
export const polarClient = new Polar({
  accessToken: POLAR_CONFIG.accessToken,
  server: POLAR_CONFIG.server,
});

/**
 * Type exports for better type safety
 */
export type { Polar } from '@polar-sh/sdk';
