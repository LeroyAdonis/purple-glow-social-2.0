/**
 * Structured Logger with Sentry Integration
 * 
 * Features:
 * - Log level filtering based on environment
 * - Sensitive data sanitization
 * - Sentry integration for error-level logs
 * - Consistent log formatting
 */

import * as Sentry from '@sentry/nextjs';

// Log levels in order of severity
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Patterns to sanitize in logs
const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /password[=:]\s*["']?[^"'\s]+["']?/gi,
  /secret[=:]\s*["']?[^"'\s]+["']?/gi,
  /token[=:]\s*["']?[^"'\s]+["']?/gi,
  /api[_-]?key[=:]\s*["']?[^"'\s]+["']?/gi,
  /authorization[=:]\s*["']?[^"'\s]+["']?/gi,
  /access[_-]?token[=:]\s*["']?[^"'\s]+["']?/gi,
  /refresh[_-]?token[=:]\s*["']?[^"'\s]+["']?/gi,
];

// Determine current environment
const isProduction = process.env.NODE_ENV === 'production' ||
                     process.env.VERCEL_ENV === 'production';

const isDevelopment = process.env.NODE_ENV === 'development';

// Minimum log level based on environment
function getMinLogLevel(): LogLevel {
  if (process.env.LOG_LEVEL) {
    const level = process.env.LOG_LEVEL.toLowerCase() as LogLevel;
    if (level in LOG_LEVELS) {
      return level;
    }
  }
  return isProduction ? 'info' : 'debug';
}

const minLogLevel = getMinLogLevel();

/**
 * Sanitize sensitive data from log messages
 */
function sanitize(value: unknown): unknown {
  if (typeof value === 'string') {
    let sanitized = value;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    return sanitized;
  }
  
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  
  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('password') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('token') ||
        lowerKey.includes('key') ||
        lowerKey.includes('authorization')
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitize(val);
      }
    }
    return sanitized;
  }
  
  return value;
}

/**
 * Check if log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLogLevel];
}

/**
 * Format log entry with timestamp and context
 */
function formatLogEntry(level: LogLevel, context: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
}

/**
 * Log a message with optional data
 */
function logMessage(
  level: LogLevel,
  context: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (!shouldLog(level)) {
    return;
  }

  const formattedMessage = formatLogEntry(level, context, message);
  const sanitizedData = data ? sanitize(data) : undefined;

  switch (level) {
    case 'debug':
      if (sanitizedData) {
        console.debug(formattedMessage, sanitizedData);
      } else {
        console.debug(formattedMessage);
      }
      break;
    case 'info':
      if (sanitizedData) {
        console.info(formattedMessage, sanitizedData);
      } else {
        console.info(formattedMessage);
      }
      break;
    case 'warn':
      if (sanitizedData) {
        console.warn(formattedMessage, sanitizedData);
      } else {
        console.warn(formattedMessage);
      }
      break;
    case 'error':
      if (sanitizedData) {
        console.error(formattedMessage, sanitizedData);
      } else {
        console.error(formattedMessage);
      }
      // Send errors to Sentry in production
      if (isProduction && process.env.SENTRY_DSN) {
        Sentry.captureMessage(message, {
          level: 'error',
          tags: { context },
          extra: sanitizedData as Record<string, unknown>,
        });
      }
      break;
  }
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, data?: Record<string, unknown>) => 
      logMessage('debug', context, message, data),
    
    info: (message: string, data?: Record<string, unknown>) => 
      logMessage('info', context, message, data),
    
    warn: (message: string, data?: Record<string, unknown>) => 
      logMessage('warn', context, message, data),
    
    error: (message: string, data?: Record<string, unknown>) => 
      logMessage('error', context, message, data),
    
    /**
     * Log an error with full stack trace
     * Automatically sends to Sentry in production
     */
    exception: (error: unknown, additionalData?: Record<string, unknown>) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      
      logMessage('error', context, errorMessage, {
        ...additionalData,
        stack: stack ? sanitize(stack) as string : undefined,
      });
      
      // Send to Sentry in production
      if (isProduction && process.env.SENTRY_DSN) {
        if (error instanceof Error) {
          Sentry.captureException(error, {
            tags: { context },
            extra: additionalData as Record<string, unknown>,
          });
        } else {
          Sentry.captureMessage(errorMessage, {
            level: 'error',
            tags: { context },
            extra: additionalData as Record<string, unknown>,
          });
        }
      }
    },
  };
}

// Pre-configured loggers for common contexts
export const logger = {
  auth: createLogger('Auth'),
  api: createLogger('API'),
  cron: createLogger('Cron'),
  oauth: createLogger('OAuth'),
  posting: createLogger('Posting'),
  ai: createLogger('AI'),
  polar: createLogger('Polar'),
  db: createLogger('Database'),
  admin: createLogger('Admin'),
  security: createLogger('Security'),
};

export default logger;
