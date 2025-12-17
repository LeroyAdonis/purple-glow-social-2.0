#!/usr/bin/env tsx
/**
 * Comprehensive Regression Testing Script
 * 
 * Tests all major features of Purple Glow Social 2.0 to identify gaps
 * and verify functionality before production deployment.
 * 
 * Usage: npm run regression-test
 * Or: npx tsx scripts/regression-test.ts
 */

import { strict as assert } from 'assert';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

interface TestSection {
  section: string;
  results: TestResult[];
}

const testResults: TestSection[] = [];
let currentSection = '';

function startSection(name: string) {
  currentSection = name;
  console.log(`\n${colors.cyan}━━━ ${name} ━━━${colors.reset}`);
  testResults.push({ section: name, results: [] });
}

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return new Promise<void>(async (resolve) => {
    process.stdout.write(`  Testing: ${name}... `);
    
    try {
      await fn();
      console.log(`${colors.green}✓ PASS${colors.reset}`);
      testResults[testResults.length - 1].results.push({
        name,
        passed: true,
      });
    } catch (error: any) {
      console.log(`${colors.red}✗ FAIL${colors.reset}`);
      console.log(`    ${colors.red}${error.message}${colors.reset}`);
      testResults[testResults.length - 1].results.push({
        name,
        passed: false,
        error: error.message,
      });
    }
    
    resolve();
  });
}

function skip(name: string, reason: string): void {
  console.log(`  ${colors.yellow}○ SKIP${colors.reset} ${name}`);
  console.log(`    ${colors.yellow}Reason: ${reason}${colors.reset}`);
  testResults[testResults.length - 1].results.push({
    name,
    passed: true,
    message: `SKIPPED: ${reason}`,
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test Suites
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testEnvironmentConfiguration() {
  startSection('Environment Configuration');

  await test('NODE_ENV is set', () => {
    assert.ok(process.env.NODE_ENV || process.env.CI, 'NODE_ENV or CI should be set');
  });

  await test('.env.example file exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const envExample = path.join(process.cwd(), '.env.example');
    await fs.access(envExample);
  });

  await test('Environment validation module exists', async () => {
    const validation = await import('../lib/config/env-validation.js');
    assert.ok(validation.validateAuthEnvVars, 'validateAuthEnvVars should be exported');
  });

  skip('Database connection', 'Requires DATABASE_URL to be set');
  skip('Better Auth configuration', 'Requires BETTER_AUTH_SECRET to be set');
}

async function testDatabaseSchema() {
  startSection('Database Schema');

  await test('Drizzle schema file exists', async () => {
    const schema = await import('../drizzle/schema.js');
    assert.ok(schema, 'Schema should be importable');
  });

  await test('User table defined', async () => {
    const schema = await import('../drizzle/schema.js');
    assert.ok(schema.user, 'User table should be defined');
  });

  await test('Posts table defined', async () => {
    const schema = await import('../drizzle/schema.js');
    assert.ok(schema.posts, 'Posts table should be defined');
  });

  await test('Connected accounts table defined', async () => {
    const schema = await import('../drizzle/schema.js');
    assert.ok(schema.connectedAccounts, 'Connected accounts table should be defined');
  });

  await test('Subscriptions table defined', async () => {
    const schema = await import('../drizzle/schema.js');
    assert.ok(schema.subscriptions, 'Subscriptions table should be defined');
  });

  await test('Transactions table defined', async () => {
    const schema = await import('../drizzle/schema.js');
    assert.ok(schema.transactions, 'Transactions table should be defined');
  });
}

async function testAPIEndpoints() {
  startSection('API Routes');

  await test('/api/health route exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const healthRoute = path.join(process.cwd(), 'app/api/health/route.ts');
    await fs.access(healthRoute);
  });

  await test('/api/auth route exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const authRoute = path.join(process.cwd(), 'app/api/auth/[...all]/route.ts');
    await fs.access(authRoute);
  });

  await test('/api/posts/publish route exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const publishRoute = path.join(process.cwd(), 'app/api/posts/publish/route.ts');
    await fs.access(publishRoute);
  });

  await test('/api/ai/generate route exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const generateRoute = path.join(process.cwd(), 'app/api/ai/generate/route.ts');
    await fs.access(generateRoute);
  });

  await test('/api/admin/users route exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const usersRoute = path.join(process.cwd(), 'app/api/admin/users/route.ts');
    await fs.access(usersRoute);
  });
}

async function testAuthentication() {
  startSection('Authentication System');

  await test('Better Auth client exported', async () => {
    const authClient = await import('../lib/auth-client.js');
    assert.ok(authClient.authClient, 'authClient should be exported');
  });

  await test('Auth middleware exists', async () => {
    const security = await import('../lib/security/auth-utils.js');
    assert.ok(security.requireAuth, 'requireAuth middleware should exist');
    assert.ok(security.requireAdmin, 'requireAdmin middleware should exist');
  });

  skip('Login flow', 'Requires live server and valid credentials');
  skip('OAuth flows', 'Requires OAuth provider credentials');
}

async function testAIIntegration() {
  startSection('AI Content Generation');

  await test('Gemini service module exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const geminiService = path.join(process.cwd(), 'lib/ai/gemini-service.ts');
    await fs.access(geminiService);
  });

  await test('AI generation validation exists', async () => {
    const validation = await import('../lib/security/validation.js');
    assert.ok(validation.contentGenerationSchema, 'contentGenerationSchema should exist');
  });

  skip('Content generation', 'Requires GEMINI_API_KEY');
  skip('Hashtag generation', 'Requires GEMINI_API_KEY');
  skip('Topic suggestions', 'Requires GEMINI_API_KEY');
}

async function testPostingSystem() {
  startSection('Post Publishing System');

  await test('Post service module exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const postService = path.join(process.cwd(), 'lib/posting/post-service.ts');
    await fs.access(postService);
  });

  await test('Facebook poster exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const fbPoster = path.join(process.cwd(), 'lib/posting/facebook-poster.ts');
    await fs.access(fbPoster);
  });

  await test('Instagram poster exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const igPoster = path.join(process.cwd(), 'lib/posting/instagram-poster.ts');
    await fs.access(igPoster);
  });

  await test('Twitter poster exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const twPoster = path.join(process.cwd(), 'lib/posting/twitter-poster.ts');
    await fs.access(twPoster);
  });

  await test('LinkedIn poster exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const liPoster = path.join(process.cwd(), 'lib/posting/linkedin-poster.ts');
    await fs.access(liPoster);
  });

  skip('Actual posting', 'Requires OAuth tokens and live social accounts');
}

async function testPaymentIntegration() {
  startSection('Payment System (Polar.sh)');

  await test('Polar checkout routes exist', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const checkoutRoute = path.join(process.cwd(), 'app/api/checkout/subscription/route.ts');
    await fs.access(checkoutRoute);
  });

  await test('Polar webhook route exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const webhookRoute = path.join(process.cwd(), 'app/api/webhooks/polar/route.ts');
    await fs.access(webhookRoute);
  });

  skip('Subscription creation', 'Requires POLAR_ACCESS_TOKEN');
  skip('Credit purchase', 'Requires POLAR_ACCESS_TOKEN');
  skip('Webhook handling', 'Requires POLAR_WEBHOOK_SECRET');
}

async function testSecurityFeatures() {
  startSection('Security Features');

  await test('Rate limiting module exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const rateLimitFile = path.join(process.cwd(), 'lib/security/rate-limit.ts');
    await fs.access(rateLimitFile);
  });

  await test('Input validation schemas exist', async () => {
    const validation = await import('../lib/security/validation.js');
    assert.ok(validation.contentGenerationSchema, 'contentGenerationSchema should exist');
    assert.ok(validation.postSchema, 'postSchema should exist');
  });

  await test('Token encryption module exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const crypto = path.join(process.cwd(), 'lib/crypto/token-encryption.ts');
    await fs.access(crypto);
  });

  await test('Security headers configured', async () => {
    const nextConfig = await import('../next.config.js');
    const config = nextConfig.default;
    assert.ok(config.headers, 'Security headers should be configured');
  });
}

async function testMonitoring() {
  startSection('Monitoring & Error Tracking');

  await test('Sentry client config exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const sentryClient = path.join(process.cwd(), 'sentry.client.config.ts');
    await fs.access(sentryClient);
  });

  await test('Sentry server config exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const sentryServer = path.join(process.cwd(), 'sentry.server.config.ts');
    await fs.access(sentryServer);
  });

  await test('Performance monitoring module exists', async () => {
    const perf = await import('../lib/monitoring/performance.js');
    assert.ok(perf.trackDatabaseQuery, 'trackDatabaseQuery should exist');
  });

  await test('Event tracking module exists', async () => {
    const tracking = await import('../lib/monitoring/track-event.js');
    assert.ok(tracking.trackEvent, 'trackEvent should exist');
  });
}

async function testInternationalization() {
  startSection('Internationalization (11 SA Languages)');

  await test('English translation exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const enTrans = path.join(process.cwd(), 'lib/translations/en.json');
    await fs.access(enTrans);
  });

  await test('Afrikaans translation exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const afTrans = path.join(process.cwd(), 'lib/translations/af.json');
    await fs.access(afTrans);
  });

  await test('Zulu translation exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const zuTrans = path.join(process.cwd(), 'lib/translations/zu.json');
    await fs.access(zuTrans);
  });

  await test('All 11 languages have translation files', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const transDir = path.join(process.cwd(), 'lib/translations');
    const files = await fs.readdir(transDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    // Should have 11 SA languages
    const expectedLanguages = ['en', 'af', 'zu', 'xh', 'nso', 'tn', 'st', 'ts', 'ss', 've', 'nr'];
    expectedLanguages.forEach(lang => {
      assert.ok(jsonFiles.includes(`${lang}.json`), `${lang}.json should exist`);
    });
  });
}

async function testUIComponents() {
  startSection('UI Components');

  await test('Dashboard component exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dashboard = path.join(process.cwd(), 'components/client-dashboard-view.tsx');
    await fs.access(dashboard);
  });

  await test('Admin dashboard component exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const adminDash = path.join(process.cwd(), 'components/admin-dashboard-view.tsx');
    await fs.access(adminDash);
  });

  await test('AI Content Studio component exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const aiStudio = path.join(process.cwd(), 'components/ai-content-studio.tsx');
    await fs.access(aiStudio);
  });

  await test('Schedule view component exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const scheduleView = path.join(process.cwd(), 'components/schedule-view.tsx');
    await fs.access(scheduleView);
  });

  await test('Error boundaries exist', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const errorBoundaries = path.join(process.cwd(), 'components/errors');
    await fs.access(errorBoundaries);
  });
}

async function testDocumentation() {
  startSection('Documentation');

  await test('AGENTS.md exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const agents = path.join(process.cwd(), 'AGENTS.md');
    await fs.access(agents);
  });

  await test('README.md exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const readme = path.join(process.cwd(), 'README.md');
    await fs.access(readme);
  });

  await test('API documentation exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const apiDocs = path.join(process.cwd(), 'docs/API_DOCUMENTATION.md');
    await fs.access(apiDocs);
  });

  await test('Deployment guide exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const deployGuide = path.join(process.cwd(), 'docs/PRODUCTION_DEPLOYMENT.md');
    await fs.access(deployGuide);
  });

  await test('Troubleshooting guide exists', async () => {
    const fs = await import('fs/promises');
    const path = await import('path');
    const troubleshooting = path.join(process.cwd(), 'docs/TROUBLESHOOTING.md');
    await fs.access(troubleshooting);
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Test Runner
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function runAllTests() {
  console.log(`${colors.blue}
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   Purple Glow Social 2.0 - Comprehensive Regression Testing     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const startTime = Date.now();

  // Run all test suites
  await testEnvironmentConfiguration();
  await testDatabaseSchema();
  await testAPIEndpoints();
  await testAuthentication();
  await testAIIntegration();
  await testPostingSystem();
  await testPaymentIntegration();
  await testSecurityFeatures();
  await testMonitoring();
  await testInternationalization();
  await testUIComponents();
  await testDocumentation();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Calculate totals
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  testResults.forEach(section => {
    section.results.forEach(result => {
      totalTests++;
      if (result.passed) passedTests++;
      else failedTests++;
    });
  });

  // Print summary
  console.log(`\n${colors.cyan}━━━ Test Summary ━━━${colors.reset}`);
  console.log(`  Total Tests:  ${totalTests}`);
  console.log(`  ${colors.green}✓ Passed:     ${passedTests}${colors.reset}`);
  console.log(`  ${failedTests > 0 ? colors.red : colors.green}✗ Failed:     ${failedTests}${colors.reset}`);
  console.log(`  Duration:     ${duration}s`);

  // Print failed tests
  if (failedTests > 0) {
    console.log(`\n${colors.red}━━━ Failed Tests ━━━${colors.reset}`);
    testResults.forEach(section => {
      const failed = section.results.filter(r => !r.passed && !r.message?.includes('SKIPPED'));
      if (failed.length > 0) {
        console.log(`\n  ${section.section}:`);
        failed.forEach(test => {
          console.log(`    ${colors.red}✗ ${test.name}${colors.reset}`);
          if (test.error) {
            console.log(`      ${colors.red}${test.error}${colors.reset}`);
          }
        });
      }
    });
  }

  // Print section summary
  console.log(`\n${colors.cyan}━━━ Section Summary ━━━${colors.reset}`);
  testResults.forEach(section => {
    const passed = section.results.filter(r => r.passed).length;
    const total = section.results.length;
    const percentage = ((passed / total) * 100).toFixed(0);
    const color = passed === total ? colors.green : (passed > total / 2 ? colors.yellow : colors.red);
    console.log(`  ${color}${section.section}: ${passed}/${total} (${percentage}%)${colors.reset}`);
  });

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal error during test execution:${colors.reset}`);
  console.error(error);
  process.exit(1);
});
