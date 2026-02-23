import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

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

const allResults: AuditResult[] = [];
let sessionTestResult: any = null;

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
    const error = `FAILED: ${request.url()}`;
    result.networkErrors.push(error);
  });
}

async function loginUser(page: Page, email: string, password: string, result: AuditResult): Promise<boolean> {
  try {
    console.log(`  Navigating to /login...`);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    console.log(`  Filling login form...`);
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(email);
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    console.log(`  Waiting for navigation...`);
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log(`  Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      result.loginSuccess = false;
      result.errorMessage = 'Still on login page';
      return false;
    }
    
    result.loginSuccess = true;
    return true;
  } catch (error: any) {
    result.errorMessage = `Login error: ${error.message}`;
    return false;
  }
}

async function logoutUser(page: Page) {
  try {
    const logoutSelectors = [
      'button:has-text("Log out")',
      'button:has-text("Logout")',
      'a:has-text("Log out")'
    ];
    
    for (const selector of logoutSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          await element.click();
          await page.waitForLoadState('networkidle', { timeout: 5000 });
          return;
        }
      } catch {
        continue;
      }
    }
    
    await page.goto('/api/auth/sign-out');
    await page.waitForLoadState('networkidle');
  } catch (error) {
    console.log(`  [LOGOUT ERROR] ${error}`);
  }
}

async function checkAccessibility(page: Page, result: AuditResult) {
  const h1Count = await page.locator('h1').count();
  if (h1Count === 0) {
    result.accessibilityObservations.push('No H1 heading');
  } else if (h1Count > 1) {
    result.accessibilityObservations.push(`${h1Count} H1 headings`);
  }
  
  const title = await page.title();
  if (title) {
    result.visualObservations.push(`Title: ${title}`);
  }
  
  const navExists = await page.locator('nav').count() > 0;
  if (navExists) {
    result.visualObservations.push('Navigation present');
  }
}

test.describe('Authenticated Pages Audit', () => {
  
  test('Scenario 1: Pro user dashboard', async ({ page }) => {
    console.log('\n=== Scenario 1: Pro User Dashboard ===');
    const result = createAuditResult('Pro User Dashboard');
    result.screenshotPath = 'docs/audit-screenshots/dashboard-pro.png';
    
    setupConsoleListeners(page, result);
    setupNetworkListeners(page, result);
    
    if (!await loginUser(page, ACCOUNTS.pro.email, ACCOUNTS.pro.password, result)) {
      await page.screenshot({ path: result.screenshotPath, fullPage: true });
      allResults.push(result);
      return;
    }
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    result.finalUrl = page.url();
    
    await checkAccessibility(page, result);
    
    const content = await page.content();
    if (content.toLowerCase().includes('pro') || content.toLowerCase().includes('premium')) {
      result.visualObservations.push('Pro/Premium indicators visible');
    }
    
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    console.log(`  Screenshot saved: ${result.screenshotPath}`);
    
    await logoutUser(page);
    allResults.push(result);
  });
  
  test('Scenario 2: Free user dashboard', async ({ page }) => {
    console.log('\n=== Scenario 2: Free User Dashboard ===');
    const result = createAuditResult('Free User Dashboard');
    result.screenshotPath = 'docs/audit-screenshots/dashboard-free.png';
    
    setupConsoleListeners(page, result);
    setupNetworkListeners(page, result);
    
    if (!await loginUser(page, ACCOUNTS.free.email, ACCOUNTS.free.password, result)) {
      await page.screenshot({ path: result.screenshotPath, fullPage: true });
      allResults.push(result);
      return;
    }
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    result.finalUrl = page.url();
    
    await checkAccessibility(page, result);
    
    const content = (await page.content()).toLowerCase();
    if (content.includes('credit')) {
      result.visualObservations.push('Credit information visible');
    }
    if (content.includes('free') || content.includes('upgrade')) {
      result.visualObservations.push('Free tier indicators visible');
    }
    
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    console.log(`  Screenshot saved: ${result.screenshotPath}`);
    
    await logoutUser(page);
    allResults.push(result);
  });
  
  test('Scenario 3: Admin user dashboard', async ({ page }) => {
    console.log('\n=== Scenario 3: Admin User Dashboard ===');
    const result = createAuditResult('Admin User Dashboard');
    result.screenshotPath = 'docs/audit-screenshots/dashboard-admin.png';
    
    setupConsoleListeners(page, result);
    setupNetworkListeners(page, result);
    
    if (!await loginUser(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password, result)) {
      await page.screenshot({ path: result.screenshotPath, fullPage: true });
      allResults.push(result);
      return;
    }
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    result.finalUrl = page.url();
    
    await checkAccessibility(page, result);
    
    const content = (await page.content()).toLowerCase();
    if (content.includes('admin')) {
      result.visualObservations.push('Admin indicators visible');
    }
    
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    console.log(`  Screenshot saved: ${result.screenshotPath}`);
    
    await logoutUser(page);
    allResults.push(result);
  });
  
  test('Scenario 4: Unauthenticated redirect', async ({ page }) => {
    console.log('\n=== Scenario 4: Unauthenticated Redirect ===');
    const result = createAuditResult('Unauthenticated Dashboard Access');
    result.screenshotPath = 'docs/audit-screenshots/dashboard-unauth-redirect.png';
    
    setupConsoleListeners(page, result);
    setupNetworkListeners(page, result);
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    result.finalUrl = page.url();
    
    if (result.finalUrl.includes('/login')) {
      result.redirected = true;
      result.visualObservations.push('✓ Redirected to login');
      console.log(`  ✓ Redirected to login page`);
    } else {
      result.redirected = false;
      result.visualObservations.push(`✗ Not redirected! URL: ${result.finalUrl}`);
      console.log(`  ✗ Not redirected!`);
    }
    
    await checkAccessibility(page, result);
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    
    allResults.push(result);
  });
  
  test('Scenario 5: Post-login redirect', async ({ page }) => {
    console.log('\n=== Scenario 5: Post-Login Redirect ===');
    const result = createAuditResult('Post-Login Redirect');
    result.screenshotPath = 'docs/audit-screenshots/post-login-redirect.png';
    
    setupConsoleListeners(page, result);
    setupNetworkListeners(page, result);
    
    if (!await loginUser(page, ACCOUNTS.pro.email, ACCOUNTS.pro.password, result)) {
      await page.screenshot({ path: result.screenshotPath, fullPage: true });
      allResults.push(result);
      return;
    }
    
    result.finalUrl = page.url();
    
    if (result.finalUrl.includes('/dashboard')) {
      result.redirected = true;
      result.visualObservations.push('✓ Redirected to dashboard');
      console.log(`  ✓ Redirected to dashboard`);
    } else if (result.finalUrl.includes('/login')) {
      result.redirected = false;
      result.visualObservations.push('✗ Stuck on login page!');
      console.log(`  ✗ Still on login!`);
    }
    
    await checkAccessibility(page, result);
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    
    await logoutUser(page);
    allResults.push(result);
  });
  
  test('Scenario 6: Admin page access', async ({ page }) => {
    console.log('\n=== Scenario 6: Admin Page Access ===');
    const result = createAuditResult('Admin Page Access');
    result.screenshotPath = 'docs/audit-screenshots/admin-page.png';
    
    setupConsoleListeners(page, result);
    setupNetworkListeners(page, result);
    
    if (!await loginUser(page, ACCOUNTS.admin.email, ACCOUNTS.admin.password, result)) {
      await page.screenshot({ path: result.screenshotPath, fullPage: true });
      allResults.push(result);
      return;
    }
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    result.finalUrl = page.url();
    
    if (result.finalUrl.includes('/admin')) {
      result.visualObservations.push('✓ Admin page accessible');
      console.log(`  ✓ Admin page loaded`);
    } else {
      result.visualObservations.push(`✗ Redirected to ${result.finalUrl}`);
      console.log(`  ✗ Redirected away from admin`);
    }
    
    await checkAccessibility(page, result);
    await page.screenshot({ path: result.screenshotPath, fullPage: true });
    
    await logoutUser(page);
    allResults.push(result);
  });
  
  test('Session persistence test', async ({ page }) => {
    console.log('\n=== Session Persistence Test ===');
    
    const result = {
      loginSuccess: false,
      urlBeforeRefresh: '',
      urlAfterRefresh: '',
      sessionPersisted: false,
      observations: [] as string[]
    };
    
    const tempResult = createAuditResult('temp');
    if (!await loginUser(page, ACCOUNTS.pro.email, ACCOUNTS.pro.password, tempResult)) {
      result.observations.push('Login failed');
      sessionTestResult = result;
      return;
    }
    
    result.loginSuccess = true;
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    result.urlBeforeRefresh = page.url();
    console.log(`  URL before refresh: ${result.urlBeforeRefresh}`);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    result.urlAfterRefresh = page.url();
    console.log(`  URL after refresh: ${result.urlAfterRefresh}`);
    
    if (result.urlAfterRefresh.includes('/dashboard')) {
      result.sessionPersisted = true;
      result.observations.push('✓ Session persisted');
      console.log(`  ✓ Session persisted!`);
    } else if (result.urlAfterRefresh.includes('/login')) {
      result.sessionPersisted = false;
      result.observations.push('✗ Session lost - redirected to login');
      console.log(`  ✗ Session lost!`);
    }
    
    await logoutUser(page);
    sessionTestResult = result;
  });
  
  test.afterAll(async () => {
    console.log('\n=== Generating Report ===');
    
    const lines: string[] = [];
    lines.push('# Authenticated Pages Audit Report');
    lines.push('');
    lines.push(`**Generated:** ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`);
    lines.push(`**Base URL:** ${BASE_URL}`);
    lines.push('');
    
    // Summary
    lines.push('## Summary');
    lines.push('');
    const totalScenarios = allResults.length;
    const successfulLogins = allResults.filter(r => r.loginSuccess).length;
    const scenariosWithConsoleErrors = allResults.filter(r => r.consoleErrors.length > 0).length;
    const scenariosWithNetworkErrors = allResults.filter(r => r.networkErrors.length > 0).length;
    
    lines.push(`- **Total scenarios tested:** ${totalScenarios}`);
    lines.push(`- **Successful logins:** ${successfulLogins}/${totalScenarios}`);
    lines.push(`- **Scenarios with console errors:** ${scenariosWithConsoleErrors}`);
    lines.push(`- **Scenarios with network errors:** ${scenariosWithNetworkErrors}`);
    if (sessionTestResult) {
      lines.push(`- **Session persistence:** ${sessionTestResult.sessionPersisted ? '✓ PASSED' : '✗ FAILED'}`);
    }
    lines.push('');
    
    // Scenario Results
    lines.push('## Scenario Results');
    lines.push('');
    
    allResults.forEach((result, idx) => {
      lines.push(`### Scenario ${idx + 1}: ${result.scenarioName}`);
      lines.push('');
      lines.push(`- **Screenshot:** \`${result.screenshotPath}\``);
      lines.push(`- **Login success:** ${result.loginSuccess ? '✓ Yes' : '✗ No'}`);
      lines.push(`- **Final URL:** \`${result.finalUrl}\``);
      
      if (result.errorMessage) {
        lines.push(`- **Error:** ${result.errorMessage}`);
      }
      
      if (result.consoleErrors.length > 0) {
        lines.push(`- **Console errors:** (${result.consoleErrors.length} found)`);
        result.consoleErrors.slice(0, 10).forEach(error => {
          lines.push(`  - \`${error.substring(0, 100)}\``);
        });
        if (result.consoleErrors.length > 10) {
          lines.push(`  - _(... and ${result.consoleErrors.length - 10} more)_`);
        }
      } else {
        lines.push('- **Console errors:** None');
      }
      
      if (result.networkErrors.length > 0) {
        lines.push(`- **Network errors:** (${result.networkErrors.length} found)`);
        result.networkErrors.slice(0, 10).forEach(error => {
          lines.push(`  - \`${error}\``);
        });
      } else {
        lines.push('- **Network errors:** None');
      }
      
      if (result.visualObservations.length > 0) {
        lines.push('- **Visual observations:**');
        result.visualObservations.forEach(obs => {
          lines.push(`  - ${obs}`);
        });
      }
      
      if (result.accessibilityObservations.length > 0) {
        lines.push('- **Accessibility observations:**');
        result.accessibilityObservations.forEach(obs => {
          lines.push(`  - ${obs}`);
        });
      }
      
      lines.push('');
    });
    
    // Session Persistence
    if (sessionTestResult) {
      lines.push('## Session Persistence Test');
      lines.push('');
      lines.push(`- **Login success:** ${sessionTestResult.loginSuccess ? '✓ Yes' : '✗ No'}`);
      lines.push(`- **URL before refresh:** \`${sessionTestResult.urlBeforeRefresh}\``);
      lines.push(`- **URL after refresh:** \`${sessionTestResult.urlAfterRefresh}\``);
      lines.push(`- **Session persisted:** ${sessionTestResult.sessionPersisted ? '✓ Yes' : '✗ No'}`);
      
      if (sessionTestResult.observations.length > 0) {
        lines.push('- **Observations:**');
        sessionTestResult.observations.forEach((obs: string) => {
          lines.push(`  - ${obs}`);
        });
      }
      lines.push('');
    }
    
    // Critical Issues
    lines.push('## Critical Issues Requiring Immediate Attention');
    lines.push('');
    
    const criticalIssues: string[] = [];
    
    allResults.forEach(result => {
      if (!result.loginSuccess && !result.scenarioName.includes('Unauthenticated')) {
        criticalIssues.push(`❌ **Login failed for ${result.scenarioName}**: ${result.errorMessage}`);
      }
    });
    
    allResults.forEach(result => {
      if (result.scenarioName.includes('Post-Login Redirect')) {
        if (!result.redirected || result.finalUrl.includes('/login')) {
          criticalIssues.push('❌ **Post-login redirect broken**');
        }
      }
    });
    
    allResults.forEach(result => {
      if (result.scenarioName.includes('Unauthenticated')) {
        if (!result.redirected || !result.finalUrl.includes('/login')) {
          criticalIssues.push('❌ **Authentication bypass vulnerability**');
        }
      }
    });
    
    if (sessionTestResult && !sessionTestResult.sessionPersisted) {
      criticalIssues.push('❌ **Session persistence broken**');
    }
    
    allResults.forEach(result => {
      if (result.consoleErrors.length > 5) {
        criticalIssues.push(`⚠️ **Excessive console errors on ${result.scenarioName}**: ${result.consoleErrors.length} errors`);
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
    lines.push('---');
    lines.push('*End of report*');
    
    const reportContent = lines.join('\n');
    const reportPath = 'docs/audit-screenshots/report-authenticated.md';
    fs.writeFileSync(reportPath, reportContent, 'utf-8');
    
    console.log(`\n✓ Report saved to: ${reportPath}`);
  });
});
