/**
 * Inngest API Route Handler
 * 
 * Handles Inngest webhook events and function invocations
 */

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import {
  processScheduledPost,
  executeAutomationRule,
  checkCreditExpiry,
  resetMonthlyCredits,
  checkLowCredits,
} from '@/lib/inngest/functions';

// Create the serve handler with all functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processScheduledPost,
    executeAutomationRule,
    checkCreditExpiry,
    resetMonthlyCredits,
    checkLowCredits,
  ],
});
