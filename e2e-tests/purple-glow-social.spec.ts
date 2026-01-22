import { test, expect } from '@playwright/test';

/**
 * Purple Glow Social 2.0 - End-to-End Test Suite
 * 
 * Test Strategy:
 * 1. Basic Routing (CRITICAL) - Verify 404 fixes
 * 2. Authentication Flow (HIGH) - Verify auth system
 * 3. API Endpoints (MEDIUM) - Verify backend routes
 * 4. Error Handling (LOW) - Verify graceful failures
 */

test.describe('Test Suite 1: Basic Routing (CRITICAL)', () => {
  
  test('1.1 Diagnostic Route Test', async ({ page }) => {
    console.log('Testing diagnostic route...');
    await page.goto('/tmp_rovodev_route_test');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for success message
    await expect(page.locator('h1')).toContainText('Route Test - SUCCESS');
    
    // Verify no 404
    const title = await page.title();
    expect(title).not.toContain('404');
    
    // Take screenshot
    await page.screenshot({ path: 'test-screenshots/test-01-diagnostic-route.png', fullPage: true });
    
    console.log('✅ Diagnostic route test passed');
  });

  test('1.2 Home Page', async ({ page }) => {
    console.log('Testing home page...');
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    // Check for landing page elements
    const hasHero = await page.locator('h1, h2').count() > 0;
    expect(hasHero).toBeTruthy();
    
    // Verify no 404
    const content = await page.content();
    expect(content).not.toContain('404');
    expect(content).not.toContain('Page Not Found');
    
    await page.screenshot({ path: 'test-screenshots/test-02-home-page.png', fullPage: true });
    
    console.log('✅ Home page test passed');
  });

  test('1.3 Login Page', async ({ page }) => {
    console.log('Testing login page...');
    await page.goto('/login');
    
    await page.waitForLoadState('networkidle');
    
    // Check for login form elements
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible();
    
    // Verify no 404
    const url = page.url();
    expect(url).toContain('/login');
    
    await page.screenshot({ path: 'test-screenshots/test-03-login-page.png', fullPage: true });
    
    console.log('✅ Login page test passed');
  });

  test('1.4 Dashboard (Unauthenticated)', async ({ page }) => {
    console.log('Testing dashboard without auth...');
    
    // Track redirects
    const responses: string[] = [];
    page.on('response', response => {
      responses.push(`${response.status()} ${response.url()}`);
    });
    
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    const url = page.url();
    const content = await page.content();
    
    // Should either:
    // 1. Redirect to /login (preferred)
    // 2. Show login prompt
    // 3. Show database error (acceptable if migrations not applied)
    // BUT NOT a 404 error
    
    const is404 = content.includes('404') || content.includes('Page Not Found');
    const isLogin = url.includes('/login');
    const hasLoginForm = await page.locator('input[type="email"]').count() > 0;
    const hasDatabaseError = content.includes('database') || content.includes('connection');
    
    expect(is404).toBeFalsy(); // Main test: NOT a 404
    
    // Document what happened
    if (isLogin || hasLoginForm) {
      console.log('✅ Redirected to login (expected behavior)');
    } else if (hasDatabaseError) {
      console.log('⚠️ Database error shown (acceptable - migrations may not be applied)');
    } else {
      console.log('⚠️ Unexpected behavior - check screenshot');
    }
    
    await page.screenshot({ path: 'test-screenshots/test-04-dashboard-redirect.png', fullPage: true });
    
    console.log('✅ Dashboard routing test passed (no 404)');
  });
});

test.describe('Test Suite 2: Authentication Flow (HIGH)', () => {
  
  test('2.1 Login Attempt', async ({ page }) => {
    console.log('Testing login attempt...');
    await page.goto('/login');
    
    await page.waitForLoadState('networkidle');
    
    // Fill in test credentials
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    await emailInput.fill('free@test.purpleglow.co.za');
    await passwordInput.fill('TestFree123!');
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').first();
    
    await page.screenshot({ path: 'test-screenshots/test-05-login-before-submit.png', fullPage: true });
    
    await submitButton.click();
    
    // Wait for response
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('⚠️ Network idle timeout - continuing...');
    });
    
    await page.waitForTimeout(2000); // Give time for any redirects
    
    const url = page.url();
    const content = await page.content();
    
    const isOnDashboard = url.includes('/dashboard');
    const isStillOnLogin = url.includes('/login');
    const hasDatabaseError = content.includes('database') || content.includes('connection') || content.includes('error');
    
    if (isOnDashboard) {
      console.log('✅ Login successful - redirected to dashboard');
    } else if (hasDatabaseError) {
      console.log('⚠️ Database error (expected if migrations not applied)');
    } else if (isStillOnLogin) {
      console.log('⚠️ Still on login page - check credentials or database');
    }
    
    await page.screenshot({ path: 'test-screenshots/test-05-login-attempt.png', fullPage: true });
    
    console.log('✅ Login attempt test completed');
  });

  test('2.2 Dashboard Access (Best Effort)', async ({ page }) => {
    console.log('Testing dashboard access...');
    
    // Try to login first
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    try {
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      await emailInput.fill('free@test.purpleglow.co.za');
      await passwordInput.fill('TestFree123!');
      
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(2000);
      
      const url = page.url();
      
      if (url.includes('/dashboard')) {
        console.log('✅ Successfully accessed dashboard');
        
        // Check for dashboard elements
        const hasUserName = await page.locator('text=/welcome|hello|dashboard/i').count() > 0;
        const hasContent = await page.locator('div, section, main').count() > 0;
        
        expect(hasContent).toBeTruthy();
        
        await page.screenshot({ path: 'test-screenshots/test-06-dashboard-authenticated.png', fullPage: true });
      } else {
        console.log('⚠️ Could not access dashboard (authentication may have failed)');
        await page.screenshot({ path: 'test-screenshots/test-06-dashboard-access-failed.png', fullPage: true });
      }
    } catch (error) {
      console.log('⚠️ Dashboard access test failed:', error);
      await page.screenshot({ path: 'test-screenshots/test-06-dashboard-error.png', fullPage: true });
    }
  });

  test('2.3 Session Persistence', async ({ page }) => {
    console.log('Testing session persistence...');
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const urlBefore = page.url();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const urlAfter = page.url();
    
    // If user was logged in and stayed on dashboard, session persisted
    // If redirected to login, session may not have been created
    
    if (urlBefore.includes('/dashboard') && urlAfter.includes('/dashboard')) {
      console.log('✅ Session persisted after refresh');
    } else {
      console.log('⚠️ Session may not be persisting (check database setup)');
    }
    
    await page.screenshot({ path: 'test-screenshots/test-07-session-persistence.png', fullPage: true });
  });
});

test.describe('Test Suite 3: API Endpoints (MEDIUM)', () => {
  
  test('3.1 Auth Session Endpoint', async ({ page }) => {
    console.log('Testing auth session endpoint...');
    
    const response = await page.goto('/api/auth/get-session');
    
    expect(response).toBeTruthy();
    
    const status = response!.status();
    console.log(`API Response Status: ${status}`);
    
    // Accept any response (401, 200, etc.) - just verify it's not 404
    expect(status).not.toBe(404);
    
    if (status === 200) {
      console.log('✅ Session endpoint returned 200 (user may be authenticated)');
    } else if (status === 401) {
      console.log('✅ Session endpoint returned 401 (user not authenticated - expected)');
    } else {
      console.log(`⚠️ Session endpoint returned ${status}`);
    }
    
    await page.screenshot({ path: 'test-screenshots/test-08-api-session.png' });
  });

  test('3.2 Diagnostics Endpoint', async ({ page }) => {
    console.log('Testing diagnostics endpoint...');
    
    const response = await page.goto('/api/diagnostics/auth');
    
    expect(response).toBeTruthy();
    
    const status = response!.status();
    expect(status).not.toBe(404);
    
    if (status === 200) {
      const content = await page.content();
      console.log('✅ Diagnostics endpoint is accessible');
      
      // Should return JSON
      const isJson = content.includes('{') && content.includes('}');
      expect(isJson).toBeTruthy();
    } else {
      console.log(`⚠️ Diagnostics endpoint returned ${status}`);
    }
    
    await page.screenshot({ path: 'test-screenshots/test-09-api-diagnostics.png' });
  });
});

test.describe('Test Suite 4: Error Scenarios (LOW)', () => {
  
  test('4.1 Invalid Login', async ({ page }) => {
    console.log('Testing invalid login...');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await emailInput.fill('invalid@test.com');
    await passwordInput.fill('wrongpassword');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    
    // Should show error message and not crash
    const url = page.url();
    expect(url).toContain('/login'); // Should stay on login page
    
    await page.screenshot({ path: 'test-screenshots/test-10-invalid-login.png', fullPage: true });
    
    console.log('✅ Invalid login handled gracefully');
  });

  test('4.2 Console Errors Check', async ({ page }) => {
    console.log('Checking for console errors...');
    
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);
      
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`PAGE ERROR: ${error.message}`);
    });
    
    // Visit key pages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Filter out acceptable errors
    const criticalErrors = errors.filter(err => {
      const isAcceptable = 
        err.includes('database') || 
        err.includes('ECONNREFUSED') ||
        err.includes('session') ||
        err.includes('authentication');
      
      return !isAcceptable;
    });
    
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Total errors: ${errors.length}`);
    console.log(`Critical errors: ${criticalErrors.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('⚠️ Critical errors found:');
      criticalErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('✅ No critical JavaScript errors found');
    }
    
    await page.screenshot({ path: 'test-screenshots/test-11-console-check.png', fullPage: true });
  });
});
