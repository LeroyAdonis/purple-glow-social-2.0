/**
 * Audit Logging for POPIA Compliance
 * 
 * Logs sensitive operations for security audit trail.
 * Required for POPIA compliance to track personal data access.
 */

import { logger } from '@/lib/logger';

export type AuditAction = 
  | 'data_export'
  | 'account_delete'
  | 'profile_view'
  | 'profile_update'
  | 'oauth_connect'
  | 'oauth_disconnect'
  | 'admin_user_view'
  | 'admin_user_update'
  | 'credit_purchase'
  | 'subscription_change'
  | 'post_publish';

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  performedBy?: string; // For admin actions
  details: Record<string, unknown>;
  timestamp: string;
  ip?: string;
}

/**
 * Log an audit event for security tracking
 * 
 * @param userId - User whose data is being accessed
 * @param action - Type of action being performed
 * @param details - Additional context about the action
 * @param performedBy - User performing the action (for admin operations)
 */
export async function auditLog(
  userId: string,
  action: AuditAction,
  details: Record<string, unknown>,
  performedBy?: string
): Promise<void> {
  const logEntry: AuditLogEntry = {
    userId,
    action,
    performedBy: performedBy || userId,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip as string || 'unknown',
  };

  // Log to structured logger (goes to Sentry in production)
  logger.security.info(`Audit: ${action}`, logEntry as unknown as Record<string, unknown>);

  // Future enhancement: Store in database table for long-term compliance
  // await db.insert(auditLogs).values(logEntry);
}

/**
 * Audit helper for data access operations
 */
export async function auditDataAccess(
  userId: string,
  dataType: string,
  performedBy?: string
): Promise<void> {
  await auditLog(userId, 'profile_view', { dataType }, performedBy);
}

/**
 * Audit helper for data modification operations
 */
export async function auditDataModification(
  userId: string,
  dataType: string,
  changes: Record<string, unknown>,
  performedBy?: string
): Promise<void> {
  await auditLog(userId, 'profile_update', { dataType, changes }, performedBy);
}
