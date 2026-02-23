/**
 * Playwright Audit: Authenticated Pages for Purple Glow Social 2.0
 * Tests various user tiers and authenticated page scenarios
 */

import { chromium, Page, Browser, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';

// Test accounts
const ACCOUNTS = {
  pro: { email: 'pro@test.purpleglow.co.za', password: 'TestPro123!' },
  free: { email: 'free@test.purpleglow.co.za', password: 'TestFree123!' },
  admin: { email: 'admin@test.purpleglow.co.za', password: 'TestAdmin123!' }
};

interface AuditResult {
  scenarioName: string;
  screenshotPath: string;
  loginSuccess: boolean;
  consoleErrors: string[];
  consoleWarnings: string[];
  networkErrors: string[];
  visualObservations: string[];
  accessibilityObservations: string[];
  finalUrl: string;
  redirected: boolean;
  errorMessage: string;
}

interface SessionTestResult {
  loginSuccess: boolean;
  urlBeforeRefresh: string;
  urlAfterRefresh: string;
  sessionPersisted: boolean;
  observations: string[];
}

function createAuditResult(scenarioName: string): AuditResult {
  return {
    scenarioName,
    screenshotPath: '',
    loginSuccess: false,
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
    visualObservations: [],
    accessibilityObservations: [],
    finalUrl: '',
    redirected: false,
    errorMessage: ''
  };
}

function setupConsoleListeners(page: Page, result: AuditResult) {
  page.on('console', (msg) => {
    const msgType = msg.type();
    const text = msg.text();
    
    if (msgType === 'error') {
      result.consoleErrors.push(text);
      console.log(`  [CONSOLE ERROR] ${text}`);
    } else if (msgType === 'warning') {
      result.consoleWarnings.push(text);
      console.log(`  [CONSOLE WARNING] ${text}`);
    }
  });
}

function setupNetworkListeners(page: Page, result: AuditResult) {
  page.on('response', (response) => {
    if (response.status() >= 400) {
      const error = `${response.status()} ${response.url()}`;
      result.networkErrors.push(error);
      console.log(`  [NETWORK ERROR] ${error}`);
    }
  });
  
  page.on('requestfailed', (request) => {
    const error = `FAILED: ${request.url()} - ${request.failure()?.errorText || 'Unknown error'}`;
    result.networkErrors.push(error);
    console.log(`  [REQUEST FAILED] ${error}`);
  });
}

async function login(page: Page, email: string, password: string, result: AuditResult): Promise<boolean> {
  try {
    console.log(`  Navigating to /login...`);
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    console.log(`  Filling login form...`);
    // Try to find email input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    await emailInput.fill(email);
    
    // Try to find password input
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(password);
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")').first();
    await submitButton.click();
    
    console.log(`  Waiting for navigation after login...`);
    // Wait for navigation or network idle
    await page.waitForTimeout(2000); // Give time for redirect
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    const currentUrl = page.url();
    console.log(`  Current URL after login: ${currentUrl}`);
    
    // Check if we're still on login page (login failed)
    if (currentUrl.includes('/login')) {
      result.loginSuccess = false;
      result.errorMessage = 'Still on login page after attempting login';
      return false;
    }
    
    result.loginSuccess = true;
    return true;
    
  } catch (error) {
    result.errorMessage = `Login error: ${error}`;
    console.log(`  [LOGIN ERROR] ${error}`);
    return false;
  }
}

async function logout(page: Page) {
  try {
    console.log(`  Attempting logout...`);
    // Try to find logout button/link
    const logoutSelectors = [
      'button:has-text("Log out")',
      'button:has-text("Logout")',
      'button:has-text("Sign out")',
      'a:has-text("Log out")',
      'a:has-text("Logout")',
      'a:has-text("Sign out")'
    ];
    
    for (const selector of logoutSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          await element.click();
          await page.waitForLoadState('networkidle', { timeout: 5000 });
          console.log(`  Logged out successfully`);
          return;
        }
      } catch {
        continue;
      }
    }
    
    // Fallback: navigate to sign-out endpoint
    console.log(`  No logout button found, navigating to sign-out endpoint...`);
    await page.goto(`${BASE_URL}/api/auth/sign-out`, { waitUntil: 'networkidle' });
    
  } catch (error) {
    console.log(`  [LOGOUT ERROR] ${error}`);
  }
}

async function checkPageAccessibility(page: Page, result: AuditResult) {
  try {
    // Check for headings
    const h1Count = await page.locator('h1').count();
    if (h1Count === 0) {
      result.accessibilityObservations.push('No H1 heading found');
    } else if (h1Count > 1) {
      result.accessibilityObservations.push(`Multiple H1 headings found (${h1Count})`);
    }
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    let imagesWithoutAlt = 0;
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt) {
        imagesWithoutAlt++;
      }
    }
    
    if (imagesWithoutAlt > 0) {
      result.accessibilityObservations.push(`${imagesWithoutAlt} images without alt text`);
    }
    
    // Check for form labels
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], textarea').all();
    let inputsWithoutLabels = 0;
    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      
      let hasLabel = false;
      if (inputId) {
        hasLabel = await page.locator(`label[for="${inputId}"]`).count() > 0;
      }
      
      if (!hasLabel && !ariaLabel && !ariaLabelledby) {
        inputsWithoutLabels++;
      }
    }
    
    if (inputsWithoutLabels > 0) {
      result.accessibilityObservations.push(`${inputsWithoutLabels} form inputs without labels`);
    }
    
  } catch (error) {
    console.log(`  [ACCESSIBILITY CHECK ERROR] ${error}`);
  }
}

async function checkVisualElements(page: Page, result: AuditResult) {
  // Check page title
  const title = await page.title();
  if (title) {
    result.visualObservations.push(`Page title: ${title}`);
  } else {
    result.visualObservations.push('No page title set');
  }
  
  // Check for main navigation
  const navExists = await page.locator('nav').count() > 0;
  if (navExists) {
    result.visualObservations.push('Navigation element present');
  } else {
    result.visualObservations.push('No navigation element found');
  }
}

async function runScenario1(page: Page): Promise<AuditResult> {
  console.log('\n=== Scenario 1: Pro User Dashboard ===');
  const result = createAuditResult('Pro User Dashboard');
  result.screenshotPath = 'docs/audit-screenshots/dashboard-pro.png';
  
  setupConsoleListeners(page, result);
  setupNetworkListeners(page, result);
  
  // Login
  if (!await login(page, ACCOUNTS.pro.email, ACCOUNTS.pro.password, result)) {
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    return result;
  }
  
  // Navigate to dashboard
  console.log(`  Navigating to /dashboard...`);
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  result.finalUrl = page.url();
  
  // Visual checks
  await checkVisualElements(page, result);
  
  // Check for Pro-specific elements
  const content = await page.content();
  if (content.toLowerCase().includes('pro') || content.toLowerCase().includes('premium')) {
    result.visualObservations.push('Pro/Premium indicators visible');
  }
  
  // Accessibility
  await checkPageAccessibility(page, result);
  
  // Screenshot
  await page.screenshot({ path: result.screenshotPath, fullPage: true });
  console.log(`  Screenshot saved: ${result.screenshotPath}`);
  
  // Logout
  await logout(page);
  
  return result;
}

async function runScenario2(page: Page): Promise<AuditResult> {
  console.log('\n=== Scenario 2: Free User Dashboard ===');
  const result = createAuditResult('Free User Dashboard');
  result.screenshotPath = 'docs/audit-screenshots/dashboard-free.png';
  
  setupConsoleListeners(page, result);
  setupNetworkListeners(page, result);
  
  // Login
  if (!await login(page, ACCOUNTS.free.email, ACCOUNTS.free.password, result)) {
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    return result;
  }
  
  // Navigate to dashboard
  console.log(`  Navigating to /dashboard...`);
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  result.finalUrl = page.url();
  
  // Visual checks
  await checkVisualElements(page, result);
  
  // Check for Free tier indicators
  const content = (await page.content()).toLowerCase();
  if (content.includes('credit')) {
    result.visualObservations.push('Credit information visible');
  }
  if (content.includes('free') || content.includes('upgrade')) {
    result.visualObservations.push('Free tier indicators/upgrade prompts visible');
  }
  
  // Accessibility
  await checkPageAccessibility(page, result);
  
  // Screenshot
  await page.screenshot({ path: result.screenshotPath, fullPage: true });
  console.log(`  Screenshot saved: ${result.screenshotPath}`);
  
  // Logout
  await logout(page);
  
  return result;
}

async function runScenario3(page: Page): Promise<AuditResult> {
  console.log('\n=== Scenario 3: Admin User Dashboard ===');
  const result = createAuditResult('Admin User Dashboard');
  result.screenshotPath = 'docs/audit-screenshots/dashboard-admin.png';
  
  setupConsoleListeners(page, result);
  setupNetworkListeners(page, result);
  
  // Login
  if (!await login(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password, result)) {
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    return result;
  }
  
  // Navigate to dashboard
  console.log(`  Navigating to /dashboard...`);
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  result.finalUrl = page.url();
  
  // Visual checks
  await checkVisualElements(page, result);
  
  // Check for Admin-specific elements
  const content = (await page.content()).toLowerCase();
  if (content.includes('admin')) {
    result.visualObservations.push('Admin indicators visible');
  }
  
  // Accessibility
  await checkPageAccessibility(page, result);
  
  // Screenshot
  await page.screenshot({ path: result.screenshotPath, fullPage: true });
  console.log(`  Screenshot saved: ${result.screenshotPath}`);
  
  // Logout
  await logout(page);
  
  return result;
}

async function runScenario4(page: Page): Promise<AuditResult> {
  console.log('\n=== Scenario 4: Unauthenticated Redirect Test ===');
  const result = createAuditResult('Unauthenticated Dashboard Access');
  result.screenshotPath = 'docs/audit-screenshots/dashboard-unauth-redirect.png';
  
  setupConsoleListeners(page, result);
  setupNetworkListeners(page, result);
  
  // Navigate to dashboard without login
  console.log(`  Navigating to /dashboard without authentication...`);
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  
  result.finalUrl = page.url();
  
  // Check if redirected
  if (result.finalUrl.includes('/login')) {
    result.redirected = true;
    result.visualObservations.push('Successfully redirected to login page');
    console.log(`  ✓ Redirected to login page`);
  } else {
    result.redirected = false;
    result.visualObservations.push(`WARNING: Not redirected to login! Current URL: ${result.finalUrl}`);
    console.log(`  ✗ Not redirected to login page!`);
  }
  
  // Accessibility
  await checkPageAccessibility(page, result);
  
  // Screenshot
  await page.screenshot({ path: result.screenshotPath, fullPage: true });
  console.log(`  Screenshot saved: ${result.screenshotPath}`);
  
  return result;
}

async function runScenario5(page: Page): Promise<AuditResult> {
  console.log('\n=== Scenario 5: Post-Login Redirect Test ===');
  const result = createAuditResult('Post-Login Redirect');
  result.screenshotPath = 'docs/audit-screenshots/post-login-redirect.png';
  
  setupConsoleListeners(page, result);
  setupNetworkListeners(page, result);
  
  // Login
  if (!await login(page, ACCOUNTS.pro.email, ACCOUNTS.pro.password, result)) {
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    return result;
  }
  
  result.finalUrl = page.url();
  
  // Check if redirected to dashboard
  if (result.finalUrl.includes('/dashboard')) {
    result.redirected = true;
    result.visualObservations.push('Successfully redirected to dashboard after login');
    console.log(`  ✓ Redirected to dashboard`);
  } else if (result.finalUrl.includes('/login')) {
    result.redirected = false;
    result.visualObservations.push('ERROR: Stuck on login page after successful login!');
    console.log(`  ✗ Still on login page!`);
  } else {
    result.redirected = true;
    result.visualObservations.push(`Redirected to: ${result.finalUrl}`);
    console.log(`  Redirected to: ${result.finalUrl}`);
  }
  
  // Accessibility
  await checkPageAccessibility(page, result);
  
  // Screenshot
  await page.screenshot({ path: result.screenshotPath, fullPage: true });
  console.log(`  Screenshot saved: ${result.screenshotPath}`);
  
  // Logout
  await logout(page);
  
  return result;
}

async function runScenario6(page: Page): Promise<AuditResult> {
  console.log('\n=== Scenario 6: Admin Page Check ===');
  const result = createAuditResult('Admin Page Access');
  result.screenshotPath = 'docs/audit-screenshots/admin-page.png';
  
  setupConsoleListeners(page, result);
  setupNetworkListeners(page, result);
  
  // Login as admin
  if (!await login(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password, result)) {
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    return result;
  }
  
  // Navigate to admin page
  console.log(`  Navigating to /admin...`);
  await page.goto(`${BASE_URL}/admin`);
  await page.waitForLoadState('networkidle');
  result.finalUrl = page.url();
  
  // Check if admin page loaded
  if (result.finalUrl.includes('/admin')) {
    result.visualObservations.push('Admin page loaded successfully');
    console.log(`  ✓ Admin page accessible`);
  } else {
    result.visualObservations.push(`WARNING: Redirected from /admin to ${result.finalUrl}`);
    console.log(`  ✗ Redirected away from admin page`);
  }
  
  // Visual checks
  await checkVisualElements(page, result);
  
  // Accessibility
  await checkPageAccessibility(page, result);
  
  // Screenshot
  await page.screenshot({ path: result.screenshotPath, fullPage: true });
  console.log(`  Screenshot saved: ${result.screenshotPath}`);
  
  // Logout
  await logout(page);
  
  return result;
}

async function runSessionPersistenceTest(page: Page): Promise<SessionTestResult> {
  console.log('\n=== Session Persistence Test ===');
  
  const result: SessionTestResult = {
    loginSuccess: false,
    urlBeforeRefresh: '',
    urlAfterRefresh: '',
    sessionPersisted: false,
    observations: []
  };
  
  // Login as pro user
  console.log(`  Logging in as Pro user...`);
  const tempResult = createAuditResult('temp');
  if (!await login(page, ACCOUNTS.pro.email, ACCOUNTS.pro.password, tempResult)) {
    result.observations.push('Login failed');
    return result;
  }
  
  result.loginSuccess = true;
  
  // Navigate to dashboard
  console.log(`  Navigating to /dashboard...`);
  await page.goto(`${BASE_URL}/dashboard`);
  await page.waitForLoadState('networkidle');
  result.urlBeforeRefresh = page.url();
  console.log(`  URL before refresh: ${result.urlBeforeRefresh}`);
  
  // Refresh
  console.log(`  Refreshing page...`);
  await page.reload();
  await page.waitForLoadState('networkidle');
  result.urlAfterRefresh = page.url();
  console.log(`  URL after refresh: ${result.urlAfterRefresh}`);
  
  // Check if session persisted
  if (result.urlAfterRefresh.includes('/dashboard')) {
    result.sessionPersisted = true;
    result.observations.push('✓ Session persisted after refresh - stayed on dashboard');
    console.log(`  ✓ Session persisted!`);
  } else if (result.urlAfterRefresh.includes('/login')) {
    result.sessionPersisted = false;
    result.observations.push('✗ Session did NOT persist - redirected to login');
    console.log(`  ✗ Session lost - redirected to login!`);
  } else {
    result.sessionPersisted = false;
    result.observations.push(`✗ Unexpected redirect to: ${result.urlAfterRefresh}`);
    console.log(`  ✗ Unexpected redirect!`);
  }
  
  // Logout
  await logout(page);
  
  return result;
}

function generateReport(results: AuditResult[], sessionTest: SessionTestResult): string {
  const lines: string[] = [];
  lines.push('# Authenticated Pages Audit Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`);
  lines.push(`**Base URL:** ${BASE_URL}`);
  lines.push('');
  
  // Summary
  lines.push('## Summary');
  lines.push('');
  
  const totalScenarios = results.length;
  const successfulLogins = results.filter(r => r.loginSuccess).length;
  const scenariosWithConsoleErrors = results.filter(r => r.consoleErrors.length > 0).length;
  const scenariosWithNetworkErrors = results.filter(r => r.networkErrors.length > 0).length;
  
  lines.push(`- **Total scenarios tested:** ${totalScenarios}`);
  lines.push(`- **Successful logins:** ${successfulLogins}/${totalScenarios}`);
  lines.push(`- **Scenarios with console errors:** ${scenariosWithConsoleErrors}`);
  lines.push(`- **Scenarios with network errors:** ${scenariosWithNetworkErrors}`);
  lines.push(`- **Session persistence:** ${sessionTest.sessionPersisted ? '✓ PASSED' : '✗ FAILED'}`);
  lines.push('');
  
  // Scenario Results
  lines.push('## Scenario Results');
  lines.push('');
  
  results.forEach((result, idx) => {
    lines.push(`### Scenario ${idx + 1}: ${result.scenarioName}`);
    lines.push('');
    lines.push(`- **Screenshot:** \`${result.screenshotPath}\``);
    lines.push(`- **Login success:** ${result.loginSuccess ? '✓ Yes' : '✗ No'}`);
    lines.push(`- **Final URL:** \`${result.finalUrl}\``);
    
    if (result.errorMessage) {
      lines.push(`- **Error:** ${result.errorMessage}`);
    }
    
    // Console errors
    if (result.consoleErrors.length > 0) {
      lines.push(`- **Console errors:** (${result.consoleErrors.length} found)`);
      result.consoleErrors.slice(0, 10).forEach(error => {
        lines.push(`  - \`${error}\``);
      });
      if (result.consoleErrors.length > 10) {
        lines.push(`  - _(... and ${result.consoleErrors.length - 10} more)_`);
      }
    } else {
      lines.push('- **Console errors:** None');
    }
    
    // Console warnings
    if (result.consoleWarnings.length > 0) {
      lines.push(`- **Console warnings:** (${result.consoleWarnings.length} found)`);
      result.consoleWarnings.slice(0, 5).forEach(warning => {
        lines.push(`  - \`${warning}\``);
      });
      if (result.consoleWarnings.length > 5) {
        lines.push(`  - _(... and ${result.consoleWarnings.length - 5} more)_`);
      }
    }
    
    // Network errors
    if (result.networkErrors.length > 0) {
      lines.push(`- **Network errors:** (${result.networkErrors.length} found)`);
      result.networkErrors.slice(0, 10).forEach(error => {
        lines.push(`  - \`${error}\``);
      });
      if (result.networkErrors.length > 10) {
        lines.push(`  - _(... and ${result.networkErrors.length - 10} more)_`);
      }
    } else {
      lines.push('- **Network errors:** None');
    }
    
    // Visual observations
    if (result.visualObservations.length > 0) {
      lines.push('- **Visual observations:**');
      result.visualObservations.forEach(obs => {
        lines.push(`  - ${obs}`);
      });
    }
    
    // Accessibility observations
    if (result.accessibilityObservations.length > 0) {
      lines.push('- **Accessibility observations:**');
      result.accessibilityObservations.forEach(obs => {
        lines.push(`  - ${obs}`);
      });
    }
    
    lines.push('');
  });
  
  // Session Persistence Test
  lines.push('## Session Persistence Test');
  lines.push('');
  lines.push(`- **Login success:** ${sessionTest.loginSuccess ? '✓ Yes' : '✗ No'}`);
  lines.push(`- **URL before refresh:** \`${sessionTest.urlBeforeRefresh}\``);
  lines.push(`- **URL after refresh:** \`${sessionTest.urlAfterRefresh}\``);
  lines.push(`- **Session persisted:** ${sessionTest.sessionPersisted ? '✓ Yes' : '✗ No'}`);
  
  if (sessionTest.observations.length > 0) {
    lines.push('- **Observations:**');
    sessionTest.observations.forEach(obs => {
      lines.push(`  - ${obs}`);
    });
  }
  
  lines.push('');
  
  // Critical Issues
  lines.push('## Critical Issues Requiring Immediate Attention');
  lines.push('');
  
  const criticalIssues: string[] = [];
  
  // Check for failed logins
  results.forEach(result => {
    if (!result.loginSuccess && !result.scenarioName.includes('Unauthenticated')) {
      criticalIssues.push(`❌ **Login failed for ${result.scenarioName}**: ${result.errorMessage}`);
    }
  });
  
  // Check for post-login redirect issues
  results.forEach(result => {
    if (result.scenarioName.includes('Post-Login Redirect')) {
      if (!result.redirected || result.finalUrl.includes('/login')) {
        criticalIssues.push('❌ **Post-login redirect broken**: Users stuck on login page after authentication');
      }
    }
  });
  
  // Check for unauthenticated access
  results.forEach(result => {
    if (result.scenarioName.includes('Unauthenticated')) {
      if (!result.redirected || !result.finalUrl.includes('/login')) {
        criticalIssues.push('❌ **Authentication bypass vulnerability**: Unauthenticated users can access /dashboard');
      }
    }
  });
  
  // Check for session persistence
  if (!sessionTest.sessionPersisted) {
    criticalIssues.push('❌ **Session persistence broken**: Users logged out after page refresh');
  }
  
  // Check for excessive console errors
  results.forEach(result => {
    if (result.consoleErrors.length > 5) {
      criticalIssues.push(`⚠️ **Excessive console errors on ${result.scenarioName}**: ${result.consoleErrors.length} errors detected`);
    }
  });
  
  // Check for excessive network errors
  results.forEach(result => {
    if (result.networkErrors.length > 3) {
      criticalIssues.push(`⚠️ **Excessive network errors on ${result.scenarioName}**: ${result.networkErrors.length} failed requests`);
    }
  });
  
  if (criticalIssues.length > 0) {
    criticalIssues.forEach(issue => {
      lines.push(`- ${issue}`);
    });
  } else {
    lines.push('✅ **None found** - All scenarios passed successfully!');
  }
  
  lines.push('');
  
  // Recommendations
  lines.push('## Recommendations');
  lines.push('');
  
  const recommendations: string[] = [];
  
  // Check accessibility issues
  const accessibilityIssueCount = results.reduce((sum, r) => sum + r.accessibilityObservations.length, 0);
  if (accessibilityIssueCount > 0) {
    recommendations.push(`- **Accessibility**: Address ${accessibilityIssueCount} accessibility observations across all pages`);
  }
  
  // Check console warnings
  const warningCount = results.reduce((sum, r) => sum + r.consoleWarnings.length, 0);
  if (warningCount > 10) {
    recommendations.push(`- **Console warnings**: Investigate and resolve ${warningCount} console warnings`);
  }
  
  if (recommendations.length > 0) {
    recommendations.forEach(rec => {
      lines.push(rec);
    });
  } else {
    lines.push('- No additional recommendations at this time');
  }
  
  lines.push('');
  lines.push('---');
  lines.push('*End of report*');
  
  return lines.join('\n');
}

async function main() {
  console.log('='.repeat(60));
  console.log('Purple Glow Social 2.0 - Authenticated Pages Audit');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();
  
  const results: AuditResult[] = [];
  
  // Run all scenarios
  results.push(await runScenario1(page));
  results.push(await runScenario2(page));
  results.push(await runScenario3(page));
  results.push(await runScenario4(page));
  results.push(await runScenario5(page));
  results.push(await runScenario6(page));
  
  // Run session persistence test
  const sessionTest = await runSessionPersistenceTest(page);
  
  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('Generating report...');
  console.log('='.repeat(60));
  
  const reportContent = generateReport(results, sessionTest);
  
  // Save report
  const reportPath = 'docs/audit-screenshots/report-authenticated.md';
  fs.writeFileSync(reportPath, reportContent, 'utf-8');
  
  console.log(`\n✓ Report saved to: ${reportPath}`);
  
  await browser.close();
  
  console.log('\n' + '='.repeat(60));
  console.log('Audit complete!');
  console.log('='.repeat(60));
}

main().catch(console.error);
