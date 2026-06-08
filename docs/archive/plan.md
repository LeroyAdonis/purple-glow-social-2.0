# Implementation Plan: File-Based Logging System for Purple Glow Social 2.0

## Executive Summary

This plan details the implementation of a comprehensive file-based logging system to replace the current console-only logger. The system will use **Pino** (not Winston) for maximum performance in Next.js 16 Server Actions, implement rotating file transports, capture all errors/requests, and fix silent error swallowing across 15+ locations.

**Technology Decision: Pino**
- **3-5x faster** than Winston (114ms vs 270ms average)
- **Structured JSON by default** (better for production analysis)
- **Next.js 16 optimized** (Server Actions, Edge Runtime compatible)
- **Production-proven** on Vercel with Logflare integration
- **Lighter weight** (minimal dependencies vs Winston's heavy abstraction)

Winston is overkill for this use case and slower, with potential client-side bundling issues due to `fs` dependencies.

---

## Phase 1: Core Logger Infrastructure

### 1.1 Install Dependencies

```bash
npm install pino pino-pretty pino-roll@1.3.0
npm install -D @types/pino
```

**Package Justification:**
- `pino` - Core logger (v9.x, latest stable)
- `pino-pretty` - Human-readable dev formatting
- `pino-roll` - File rotation with size/time limits (simplest solution)
- Alternative considered: `rotating-file-stream` (more complex, unnecessary)

### 1.2 Create New Logger Module (`lib/logger/index.ts`)

**Location:** `lib/logger/index.ts` (replace existing `lib/logger.ts`)

**Features:**
- Dual transports: console (dev) + rotating files (all envs)
- SAST timezone formatting (Africa/Johannesburg)
- Per-context log level configuration via env vars
- Preserve existing sanitization logic
- Maintain Sentry integration
- Async writes (non-blocking)

**File Structure:**
```
lib/logger/
├── index.ts              # Main logger export
├── transports.ts         # File/console transport config
├── sanitizer.ts          # Sensitive data sanitization (extracted)
├── formatters.ts         # SAST timestamps, custom formats
└── contexts.ts           # Pre-configured context loggers
```

### 1.3 Log File Structure

**Directory:** `logs/` (gitignored, auto-created)

**Files:**
```
logs/
├── combined.log          # All logs (JSON, structured)
├── error.log             # Errors only (human-readable + JSON)
├── app.log               # Human-readable for dev debugging
├── combined.log.1        # Rotated archives
├── combined.log.2
└── ...
```

**Rotation Policy:**
- **Trigger:** Daily rotation OR max 100MB per file
- **Retention:** 30 days (30 files max)
- **Compression:** gzip old files (optional, add if disk constrained)
- **Naming:** `{filename}.{timestamp}.log`

### 1.4 Configuration Schema

**Environment Variables:**
```bash
# Global log level
LOG_LEVEL=info                    # debug|info|warn|error

# Per-context overrides
LOG_LEVEL_AUTH=debug              # Auth debugging
LOG_LEVEL_AI=warn                 # Reduce AI noise
LOG_LEVEL_POSTING=info            # Default posting
LOG_LEVEL_DB=error                # Only DB errors

# File logging
LOG_DIR=logs                      # Log directory path
LOG_RETENTION_DAYS=30             # Days to keep logs
LOG_MAX_FILE_SIZE=100             # Max MB per file
LOG_ROTATION_INTERVAL=1d          # 1d|12h|1h

# Feature flags
ENABLE_FILE_LOGGING=true          # Toggle file logs
ENABLE_CONSOLE_LOGGING=true       # Toggle console logs
LOG_SAMPLE_RATE=1.0               # 1.0 = 100%, 0.1 = 10%
```

**Defaults (in code):**
```typescript
const defaults = {
  level: isDev ? 'debug' : 'info',
  dir: 'logs',
  retention: 30,
  maxSize: 100,
  interval: '1d',
  sampleRate: isDev ? 1.0 : (process.env.LOG_SAMPLE_RATE || 0.1),
};
```

---

## Phase 2: Transport Implementation

### 2.1 File Transports (`lib/logger/transports.ts`)

```typescript
import pino from 'pino';
import { createWriteStream } from 'pino-roll';
import path from 'path';
import fs from 'fs';

export function createFileTransports(logDir: string) {
  // Ensure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  return [
    // 1. Combined logs (JSON, all levels)
    pino.transport({
      target: 'pino-roll',
      options: {
        file: path.join(logDir, 'combined.log'),
        frequency: 'daily',
        size: '100M',
        limit: { count: 30 },
      },
    }),

    // 2. Error logs (JSON + human-readable)
    pino.transport({
      target: 'pino/file',
      level: 'error',
      options: {
        destination: path.join(logDir, 'error.log'),
        mkdir: true,
      },
    }),

    // 3. App logs (human-readable for dev)
    pino.transport({
      target: 'pino-pretty',
      level: isDev ? 'debug' : 'info',
      options: {
        destination: path.join(logDir, 'app.log'),
        colorize: false,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }),
  ];
}
```

**Error Handling:**
- Graceful degradation: If file writes fail, log to console only
- Directory creation: Auto-create `logs/` on first write
- Permission errors: Log warning, continue with console transport
- Disk full: Rotate immediately, log critical warning

### 2.2 SAST Timezone Formatting (`lib/logger/formatters.ts`)

```typescript
export function formatSASTTimestamp(): string {
  // Use Intl API (built-in, no dependencies)
  const formatter = new Intl.DateTimeFormat('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  });

  return formatter.format(new Date());
}

export const pinoTimestamp = () => `,"time":"${formatSASTTimestamp()}"`;
```

**Integration:** Pass to Pino config `timestamp: pinoTimestamp`

---

## Phase 3: Request/Response Logging Middleware

### 3.1 API Route Middleware (`lib/logger/api-middleware.ts`)

**Pattern:** Next.js 16 doesn't support Express-style middleware. Use a **wrapper function** for API routes.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { nanoid } from 'nanoid';

interface LogContext {
  requestId: string;
  userId?: string;
  duration?: number;
}

export function withLogging<T>(
  handler: (req: NextRequest, context: LogContext) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    const requestId = nanoid(10);
    const startTime = Date.now();
    const { method, url } = req;

    // Extract user from session (if authenticated)
    const userId = await getUserIdFromRequest(req); // Helper function

    const logContext: LogContext = { requestId, userId };

    // Log request
    logger.api.info('Incoming request', {
      requestId,
      method,
      url,
      userId,
      headers: sanitizeHeaders(req.headers),
      body: await sanitizeBody(req),
    });

    try {
      const response = await handler(req, logContext);
      const duration = Date.now() - startTime;

      // Log response (success)
      logger.api.info('Request completed', {
        requestId,
        method,
        url,
        statusCode: response.status,
        duration,
        responseSize: response.headers.get('content-length'),
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      logger.api.exception(error, {
        requestId,
        method,
        url,
        userId,
        duration,
      });

      throw error;
    }
  };
}
```

**Exclusions:**
- Health checks: `/api/health`
- Static assets: `/_next/*`, `/favicon.ico`
- Inngest webhooks: `/api/inngest` (already has internal logging)

**Sampling:**
- Dev: 100% of requests
- Prod: 10% successful (2xx/3xx), 100% errors (4xx/5xx)
- Override via `LOG_SAMPLE_RATE` env var

### 3.2 Apply to All API Routes

**Migration Strategy:**
```typescript
// BEFORE
export async function GET(req: NextRequest) {
  // handler logic
}

// AFTER
import { withLogging } from '@/lib/logger/api-middleware';

export const GET = withLogging(async (req, logContext) => {
  logger.api.debug('Processing GET', { requestId: logContext.requestId });
  // handler logic
});
```

**Files to modify:** All 47 API routes (see glob results)

---

## Phase 4: Error Aggregation

### 4.1 Global Error Handlers

**1. Next.js Error Boundaries (Client)**

Update existing: `lib/ErrorBoundary.tsx`

```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  // Log to file via API endpoint
  fetch('/api/log/client-error', {
    method: 'POST',
    body: JSON.stringify({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
    }),
  });

  // Also send to Sentry (existing)
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error);
  }
}
```

**2. Server-Side Error Handler (`app/error.tsx`)**

Create global error page:
```typescript
'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log server error
    logger.security.exception(error, {
      digest: error.digest,
      page: 'global-error',
    });
  }, [error]);

  return (/* Error UI */);
}
```

**3. Unhandled Rejections (`instrumentation.ts`)**

Next.js 16 instrumentation hook:
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { logger } = await import('@/lib/logger');

    process.on('unhandledRejection', (reason, promise) => {
      logger.security.error('Unhandled Promise Rejection', {
        reason: String(reason),
        promise: String(promise),
      });
    });

    process.on('uncaughtException', (error) => {
      logger.security.exception(error, { type: 'uncaught-exception' });
      process.exit(1); // Required for uncaught exceptions
    });
  }
}
```

Enable in `next.config.js`:
```javascript
experimental: {
  instrumentationHook: true,
}
```

### 4.2 API Route Error Wrapper

```typescript
// lib/logger/api-error-handler.ts
export async function apiErrorHandler<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.api.exception(error, { context });
    throw error; // Re-throw for Next.js error handling
  }
}
```

---

## Phase 5: Startup Logging

### 5.1 Startup Sequence Logger (`lib/logger/startup.ts`)

```typescript
import { logger } from '@/lib/logger';

export async function logStartup() {
  logger.api.info('🚀 Purple Glow Social starting...', {
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    nodeVersion: process.version,
    env: process.env.NODE_ENV,
  });

  // 1. Environment validation
  const requiredEnvVars = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'GEMINI_API_KEY',
  ];

  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    logger.security.error('Missing required environment variables', {
      missing: missingVars,
    });
    throw new Error(`Missing env vars: ${missingVars.join(', ')}`);
  }

  logger.api.info('✅ Environment variables validated');

  // 2. Database connection
  try {
    const { db } = await import('@/drizzle/db');
    await db.execute('SELECT 1'); // Test query
    logger.db.info('✅ Database connection established');
  } catch (error) {
    logger.db.exception(error, { step: 'database-connection' });
    throw error;
  }

  // 3. Inngest client
  try {
    const { inngest } = await import('@/lib/inngest/client');
    logger.cron.info('✅ Inngest client initialized', {
      eventKey: !!process.env.INNGEST_EVENT_KEY,
    });
  } catch (error) {
    logger.cron.warn('Inngest client failed (non-critical)', { error });
  }

  // 4. Auth module
  try {
    const { auth } = await import('@/lib/auth');
    logger.auth.info('✅ Auth module loaded');
  } catch (error) {
    logger.auth.exception(error, { step: 'auth-initialization' });
    throw error;
  }

  logger.api.info('🎉 Startup complete');
}
```

**Call from:** `instrumentation.ts` (Next.js 16 hook)

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await logStartup();
  }
}
```

**Critical:** If startup fails, logger MUST write to file before process exits.

---

## Phase 6: Fix Silent Error Swallowing

### 6.1 Priority Fixes (15+ locations)

**1. `lib/ai/gemini-service.ts` line 303-320**
```typescript
// BEFORE
} catch (error) {
  logger.ai.exception(error, { variation: i + 1 });
}

// AFTER - Add context
} catch (error) {
  logger.ai.exception(error, {
    variation: i + 1,
    topic: params.topic,
    platform: params.platform,
    attemptedVariations: count,
  });
  // Continue to next variation
}
```

**2. `app/actions/generate.ts` line 113-116**
```typescript
// BEFORE
} catch (imgError: unknown) {
  // Continue without image
}

// AFTER
} catch (imgError: unknown) {
  logger.ai.warn('Image generation failed, continuing without image', {
    topic,
    platform,
    error: imgError instanceof Error ? imgError.message : String(imgError),
  });
  // Continue without image (non-critical)
}
```

**3. `lib/inngest/functions/process-scheduled-post.ts` (already good!)**
- Lines 52-54 correctly log cleanup errors
- **No changes needed**

**4. `app/api/posts/schedule/route.ts` line 219-221**
```typescript
// BEFORE
} catch (inngestError) {
  logger.cron.warn('Inngest send failed (non-critical)', { error: inngestError });
}

// AFTER - Add more context
} catch (inngestError) {
  logger.cron.warn('Inngest send failed (non-critical)', {
    error: inngestError instanceof Error ? inngestError.message : String(inngestError),
    postId: validated.postId,
    userId: session.user.id,
    platform: post.platform,
    scheduledDate: scheduledDate.toISOString(),
  });
}
```

**5. `lib/posting/post-service.ts` line 309-314**
```typescript
// AFTER - Add retry mechanism
async publishScheduledPost(postId: string) {
  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await this.attemptPublish(postId);
      logger.posting.info('Post published successfully', { postId, attempt });
      return;
    } catch (error) {
      lastError = error as Error;
      logger.posting.warn('Post publish failed, will retry', {
        postId,
        attempt,
        maxRetries: MAX_RETRIES,
        error: lastError.message,
      });

      if (attempt < MAX_RETRIES) {
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
      }
    }
  }

  // All retries exhausted
  logger.posting.error('Post publish failed after all retries', {
    postId,
    attempts: MAX_RETRIES,
    error: lastError?.message,
  });
  throw lastError;
}
```

### 6.2 Additional Silent Errors (from grep)

Search for all `catch` blocks with empty bodies or just `console.error`:

```bash
npx ripgrep "catch.*\{[\s\n]*\}" --multiline
npx ripgrep "console\.(log|error|warn)" -l
```

**Files to audit:**
- `components/ai-content-studio.tsx`
- `components/automation-view.tsx`
- `components/test-posting.tsx`
- All error boundaries
- All OAuth providers

---

## Phase 7: Console.log Migration

### 7.1 Files with console.log (8+ occurrences)

**1. `app/actions/generate.ts`**
- Line 147: `console.error("Database operation failed:", dbError);`
- Line 162: `console.error("Generation Error:", error);`

**Fix:**
```typescript
// Replace
console.error("Database operation failed:", dbError);
// With
logger.db.exception(dbError, { action: 'save-generated-post' });

// Replace
console.error("Generation Error:", error);
// With
logger.ai.exception(error, { action: 'generate-post' });
```

**2. `lib/inngest/database-config.ts`**
- Lines 13-16, 31-35, 41-47: Info messages

**Fix:**
```typescript
// Replace all console.log with
logger.cron.info("Inngest database configuration...", { ... });
```

**3. Audit scripts** (`scripts/` directory)
- **Keep console.log** in CLI scripts (expected behavior)
- Only migrate server-side runtime code

### 7.2 Automated Migration

```bash
# Find all console.log in src (not scripts)
npx ripgrep "console\.(log|error|warn|debug)" \
  --glob "!scripts/**" \
  --glob "!node_modules/**" \
  --glob "!e2e-tests/**" \
  -l

# Output to file for tracking
npx ripgrep "console\.(log|error|warn|debug)" \
  --glob "!scripts/**" \
  --glob "!node_modules/**" \
  -n > console-log-migration.txt
```

**Migration checklist:** Create `CONSOLE_LOG_MIGRATION.md` with checkboxes

---

## Phase 8: Testing Strategy

### 8.1 Unit Tests (`tests/unit/logger.test.ts`)

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { logger, createLogger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

describe('File-Based Logger', () => {
  const testLogDir = 'logs-test';

  beforeEach(() => {
    // Clean test logs
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true });
    }
  });

  it('should create log directory on first write', async () => {
    logger.api.info('test message');
    await delay(100); // Async writes

    expect(fs.existsSync('logs')).toBe(true);
  });

  it('should write to combined.log', async () => {
    logger.api.info('test message', { foo: 'bar' });
    await delay(100);

    const logContent = fs.readFileSync('logs/combined.log', 'utf-8');
    expect(logContent).toContain('test message');
    expect(logContent).toContain('"foo":"bar"');
  });

  it('should sanitize sensitive data', async () => {
    logger.auth.info('Login attempt', {
      password: 'secret123',
      token: 'Bearer abc123',
    });
    await delay(100);

    const logContent = fs.readFileSync('logs/combined.log', 'utf-8');
    expect(logContent).toContain('[REDACTED]');
    expect(logContent).not.toContain('secret123');
    expect(logContent).not.toContain('abc123');
  });

  it('should rotate logs at 100MB', async () => {
    // Write 101MB of logs
    const largeLog = 'x'.repeat(1024 * 1024); // 1MB
    for (let i = 0; i < 101; i++) {
      logger.api.info(largeLog);
    }
    await delay(1000);

    const files = fs.readdirSync('logs');
    expect(files.some(f => f.startsWith('combined.log.'))).toBe(true);
  });

  it('should respect per-context log levels', () => {
    process.env.LOG_LEVEL_AUTH = 'error';
    const authLogger = createLogger('Auth');

    authLogger.debug('debug message'); // Should NOT log
    authLogger.error('error message'); // SHOULD log

    // Assert via file content
  });
});
```

### 8.2 Integration Tests

**Test Scenarios:**
1. API request logging (full lifecycle)
2. Error boundary triggers file write
3. Startup failure logs to file
4. Inngest job error logs to file
5. Disk full scenario (graceful degradation)
6. Log rotation triggers correctly

### 8.3 Manual Verification

**Checklist:**
- [ ] Start dev server, check `logs/` created
- [ ] Make API call, verify request in `combined.log`
- [ ] Trigger error, verify in `error.log`
- [ ] Check SAST timestamps (Africa/Johannesburg)
- [ ] Verify sensitive data sanitized
- [ ] Check log rotation after 24h
- [ ] Verify Sentry still receives errors

---

## Phase 9: Edge Cases & Error Handling

### 9.1 Disk Full Scenario

```typescript
// lib/logger/transports.ts
const fileTransport = pino.transport({
  target: 'pino-roll',
  options: {
    file: path.join(logDir, 'combined.log'),
    // ...
  },
});

fileTransport.on('error', (error) => {
  // Fallback to console only
  console.error('[LOGGER] File write failed:', error.message);
  
  if (error.code === 'ENOSPC') {
    console.error('[LOGGER] Disk full! Rotating logs immediately...');
    // Trigger emergency rotation
    // Delete oldest logs to free space
  }
});
```

### 9.2 Permission Denied

```typescript
try {
  fs.mkdirSync(logDir, { recursive: true });
} catch (error) {
  if (error.code === 'EACCES') {
    console.warn('[LOGGER] Cannot create log directory, using console only');
    // Disable file logging
    useFileLogging = false;
  } else {
    throw error;
  }
}
```

### 9.3 Log Directory Not Writable

```typescript
function testLogDirectory(dir: string): boolean {
  try {
    const testFile = path.join(dir, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch {
    return false;
  }
}

if (!testLogDirectory(logDir)) {
  console.warn('[LOGGER] Log directory not writable, using /tmp/purple-glow-logs');
  logDir = '/tmp/purple-glow-logs';
}
```

### 9.4 Next.js Edge Runtime

**Edge Runtime Limitation:** File system access not available.

```typescript
// lib/logger/index.ts
const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

if (isEdgeRuntime) {
  // Edge runtime: console only
  logger = pino({
    level: 'info',
    transport: { target: 'pino-pretty' },
  });
} else {
  // Node.js runtime: console + files
  logger = pino({
    level: 'info',
    transport: {
      targets: [
        ...fileTransports,
        consoleTransport,
      ],
    },
  });
}
```

---

## Phase 10: Performance Impact Analysis

### 10.1 Benchmarks (Expected)

**Pino Performance:**
- **Async writes:** Non-blocking, ~0.1ms overhead per log
- **Structured JSON:** Faster than string concatenation
- **File I/O:** Buffered writes (minimal impact)

**Estimated Overhead:**
- Dev: ~5ms per request (100% logging + pretty formatting)
- Prod: ~0.5ms per request (10% sampling + JSON only)

**Compared to Console-only:**
- Console: 0ms (but no persistence)
- Pino: +0.5ms (worth it for debugging)

### 10.2 Load Testing

```bash
# Benchmark API endpoint
npx autocannon -c 100 -d 30 http://localhost:3000/api/health

# Compare:
# 1. With file logging enabled
# 2. With file logging disabled
# 3. With sampling at 10%
```

**Target:** <5% performance degradation with file logging enabled.

### 10.3 Memory Usage

**Pino Buffering:**
- Default buffer: 4KB per transport
- Max memory: ~12KB (3 transports)
- Flush interval: 1 second

**Monitor:**
```bash
# Check memory usage
process.memoryUsage().heapUsed
```

**Threshold:** Alert if heap usage increases >10% after migration.

---

## File Changes Summary

### New Files (9)
1. `lib/logger/index.ts` - Main logger
2. `lib/logger/transports.ts` - File transports
3. `lib/logger/sanitizer.ts` - Data sanitization
4. `lib/logger/formatters.ts` - SAST timestamps
5. `lib/logger/contexts.ts` - Pre-configured loggers
6. `lib/logger/api-middleware.ts` - Request logging
7. `lib/logger/startup.ts` - Startup logging
8. `lib/logger/api-error-handler.ts` - Error wrapper
9. `instrumentation.ts` - Next.js instrumentation hook

### Modified Files (55+)
1. `lib/logger.ts` - **DELETE** (replaced by new structure)
2. `app/actions/generate.ts` - Fix console.log (2 locations)
3. `lib/inngest/database-config.ts` - Fix console.log (3 locations)
4. `lib/ai/gemini-service.ts` - Add error context
5. `app/api/posts/schedule/route.ts` - Add Inngest error context
6. `lib/posting/post-service.ts` - Add retry mechanism
7. `lib/ErrorBoundary.tsx` - Add file logging
8. `app/error.tsx` - Create global error handler
9. All 47 API routes - Add `withLogging` wrapper
10. All error boundaries (4 files) - Add file logging

### Configuration Changes
1. `next.config.js` - Enable `instrumentationHook`
2. `package.json` - Add pino dependencies
3. `.gitignore` - Already ignores `logs/` (line 2)
4. `.env.example` - Add logging env vars

---

## Dependencies

### NPM Packages
```json
{
  "dependencies": {
    "pino": "^9.6.0",
    "pino-roll": "^1.3.0"
  },
  "devDependencies": {
    "pino-pretty": "^13.0.0",
    "@types/pino": "^7.0.5"
  }
}
```

**Total size:** ~2.5MB (Pino + transports)
**Comparison:** Winston would be ~4MB

---

## Timeline

### Week 1: Core Infrastructure
- Day 1-2: Install deps, create logger module
- Day 3-4: Implement file transports
- Day 5: Unit tests

### Week 2: Integration
- Day 1-2: API middleware
- Day 3: Error handlers
- Day 4: Startup logging
- Day 5: Integration tests

### Week 3: Migration
- Day 1-2: Fix silent errors (15+ locations)
- Day 3-4: Migrate console.log (8+ files)
- Day 5: E2E testing

### Week 4: Deployment
- Day 1-2: Deploy to dev
- Day 3: Deploy to staging
- Day 4: Deploy to production
- Day 5: Monitoring & documentation

**Total: 4 weeks**

---

## Success Criteria

### Functional Requirements
- ✅ All logs written to `logs/combined.log`
- ✅ Errors written to `logs/error.log`
- ✅ Human-readable logs in `logs/app.log`
- ✅ Log rotation every 24h or 100MB
- ✅ 30-day retention
- ✅ SAST timestamps
- ✅ Sensitive data sanitized
- ✅ Sentry integration preserved

### Non-Functional Requirements
- ✅ <5% performance overhead
- ✅ <10MB disk usage per day (dev)
- ✅ <100MB disk usage per day (prod)
- ✅ Graceful degradation on errors
- ✅ Zero console.log in production code

### Business Requirements
- ✅ Can debug auth failures from logs
- ✅ Can trace API requests end-to-end
- ✅ Can identify silent error patterns
- ✅ Can monitor system health

---

## Architecture Integration

### How It Fits with Existing Code

**1. Current Logger (`lib/logger.ts`):**
- **Replace entirely** with new `lib/logger/` directory
- Preserve all existing context loggers (auth, api, cron, etc.)
- Maintain sanitization patterns
- Keep Sentry integration

**2. Next.js 16 Server Actions:**
- File I/O only in Node.js runtime (checked via `process.env.NEXT_RUNTIME`)
- Server Actions can write to files (they run in Node.js)
- Edge Runtime falls back to console only

**3. Inngest Integration:**
- Inngest functions already use logger
- No changes needed to function logic
- Just improve error context

**4. Sentry Integration:**
- Keep existing Sentry calls
- Add file logging alongside Sentry
- Both will capture errors independently

### Data Flow

```
Request → API Route → withLogging wrapper
          ↓
  Log to: 1. Console (dev)
          2. logs/combined.log (JSON)
          3. logs/app.log (human-readable)
          4. logs/error.log (if error)
          5. Sentry (if error + prod)
```

---

## Risk Mitigation

### Risk 1: Disk Full on Vercel
**Impact:** High (service disruption)
**Likelihood:** Medium (depends on log volume)

**Mitigation:**
- Aggressive rotation (daily)
- Short retention (30 days)
- Sampling in production (10%)
- Monitoring alerts

### Risk 2: Performance Degradation
**Impact:** Medium (slower API responses)
**Likelihood:** Low (Pino is optimized)

**Mitigation:**
- Async writes (non-blocking)
- Sampling in production
- Benchmarking before deployment
- Rollback plan ready

### Risk 3: Missed Errors During Migration
**Impact:** High (silent failures continue)
**Likelihood:** Medium (manual migration)

**Mitigation:**
- Automated grep for console.log
- Peer review all changes
- E2E tests cover critical paths
- Gradual rollout (dev → staging → prod)

---

## Next Steps (Immediate Actions)

1. **Approve this plan** ✅
2. **Install Pino dependencies**
3. **Create `lib/logger/index.ts`**
4. **Implement file transports**
5. **Write unit tests**

---

**Plan Complete. Ready for Implementation.**
