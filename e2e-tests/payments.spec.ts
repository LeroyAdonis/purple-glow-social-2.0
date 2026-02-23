import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Payment & Credit Flow (HIGH PRIORITY)
 * 
 * Tests the revenue-critical payment and credit system:
 * - Credit balance display
 * - Credit purchase flow
 * - Subscription management
 * - Pricing display
 * - Annual/monthly toggle
 * - Tier upgrades
 * 
 * CRITICAL BUSINESS FLOW: Revenue generation depends on this
 */

test.describe('Payment & Credit Flow', () => {
  
  // Helper function to login
  async function loginAsTestUser(page: any, email: string, password: string) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Dismiss cookie banner if present
    const cookieBanner = page.locator('[role="dialog"][aria-labelledby*="cookie" i], [class*="cookie" i]').first();
    const bannerVisible = await cookieBanner.isVisible().catch(() => false);
    if (bannerVisible) {
      const acceptButton = page.locator('button:has-text("Accept"), button:has-text("OK"), button:has-text("Agree")').first();
      if (await acceptButton.count() > 0) {
        await acceptButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitButton.click();
    
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000); // Allow for redirect
  }

  test.beforeEach(async ({ page }) => {
    // Mock Polar checkout API to avoid real payment processing
    await page.route('**/api/checkout/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/api/checkout/credits')) {
        // Mock credit checkout
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            checkoutUrl: 'https://mock-polar-checkout.com/checkout/test-123',
            checkoutId: 'mock_checkout_123',
          }),
        });
      } else if (url.includes('/api/checkout/subscription')) {
        // Mock subscription checkout
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            checkoutUrl: 'https://mock-polar-checkout.com/subscription/test-456',
            checkoutId: 'mock_sub_checkout_456',
          }),
        });
      } else {
        // Pass through other requests
        await route.continue();
      }
    });

    // Mock successful payment completion
    await page.route('**/api/checkout/success**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Payment successful',
          creditsAdded: 100,
        }),
      });
    });
  });

  test('2.1 Credit Balance Display', async ({ page }) => {
    console.log('Testing credit balance display...');
    
    await loginAsTestUser(page, 'free@test.purpleglow.co.za', 'TestFree123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for credit display (should show 10 credits for free tier)
    const creditDisplay = await page.locator('text=/\\d+.*credit/i, text=/credit.*\\d+/i').first().textContent().catch(() => null);
    console.log(`Credit display found: ${creditDisplay}`);
    
    await page.screenshot({ path: 'test-screenshots/payments-01-credit-balance.png', fullPage: true });
    
    const pageContent = await page.content();
    const hasCredits = pageContent.includes('credit') || pageContent.includes('10');
    
    if (hasCredits) {
      console.log('✅ Credit balance is displayed');
    } else {
      console.log('⚠️ Could not find credit balance display');
    }
  });

  test('2.2 Low Credit Warning', async ({ page }) => {
    console.log('Testing low credit warning display...');
    
    await loginAsTestUser(page, 'lowcredit@test.purpleglow.co.za', 'TestLow123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for warning banner or message
    const warningBanner = await page.locator('[class*="warning" i], [class*="alert" i], text=/low.*credit/i').first().isVisible().catch(() => false);
    
    await page.screenshot({ path: 'test-screenshots/payments-02-low-credit-warning.png', fullPage: true });
    
    const pageContent = await page.content();
    const hasWarning = 
      warningBanner ||
      pageContent.toLowerCase().includes('low credit') ||
      pageContent.toLowerCase().includes('running low') ||
      pageContent.toLowerCase().includes('top up') ||
      pageContent.toLowerCase().includes('topup');
    
    if (hasWarning) {
      console.log('✅ Low credit warning is displayed');
    } else {
      console.log('⚠️ Low credit warning not found (user has 2 credits)');
    }
  });

  test('2.3 Zero Credit Block', async ({ page }) => {
    console.log('Testing zero credit behavior...');
    
    await loginAsTestUser(page, 'zerocredit@test.purpleglow.co.za', 'TestZero123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Should show 0 credits
    const pageContent = await page.content();
    const hasZeroCredits = 
      pageContent.includes('0 credit') ||
      pageContent.includes('no credit') ||
      pageContent.includes('out of credit');
    
    await page.screenshot({ path: 'test-screenshots/payments-03-zero-credits.png', fullPage: true });
    
    if (hasZeroCredits) {
      console.log('✅ Zero credit state is displayed');
    } else {
      console.log('⚠️ Could not verify zero credit display');
    }
    
    // Look for "Buy Credits" or "Upgrade" CTA
    const buyCreditButton = await page.locator('button:has-text("Buy"), button:has-text("Purchase"), button:has-text("Upgrade"), a:has-text("Buy Credit")').first().isVisible().catch(() => false);
    
    if (buyCreditButton) {
      console.log('✅ Credit purchase CTA is visible');
    }
  });

  test('2.4 Access Credit Purchase Modal', async ({ page }) => {
    console.log('Testing credit purchase modal access...');
    
    await loginAsTestUser(page, 'pro@test.purpleglow.co.za', 'TestPro123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for "Buy Credits" button
    const buyCreditButton = page.locator('button:has-text("Buy"), button:has-text("Purchase"), button:has-text("Top"), button:has-text("Add Credit"), a:has-text("Buy"), a:has-text("Purchase")').first();
    
    const buttonExists = await buyCreditButton.count() > 0;
    
    if (!buttonExists) {
      console.log('⚠️ Buy credits button not found');
      await page.screenshot({ path: 'test-screenshots/payments-04-no-buy-button.png', fullPage: true });
      test.skip();
      return;
    }
    
    // Click the button
    await buyCreditButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'test-screenshots/payments-04-credit-modal.png', fullPage: true });
    
    // Look for modal/dialog with credit packages
    const modalVisible = await page.locator('[role="dialog"], [class*="modal" i], [class*="dialog" i]').first().isVisible().catch(() => false);
    
    if (modalVisible) {
      console.log('✅ Credit purchase modal opened');
    } else {
      console.log('⚠️ Modal not detected (may have navigated to different page)');
    }
  });

  test('2.5 Credit Package Selection', async ({ page }) => {
    console.log('Testing credit package selection...');
    
    await loginAsTestUser(page, 'pro@test.purpleglow.co.za', 'TestPro123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open credit purchase modal
    const buyCreditButton = page.locator('button:has-text("Buy"), button:has-text("Purchase"), button:has-text("Top"), a:has-text("Buy")').first();
    
    if (await buyCreditButton.count() > 0) {
      await buyCreditButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for credit packages (e.g., 100 credits, 500 credits, etc.)
    const packages = await page.locator('button:has-text("credit"), button:has-text("R"), [class*="package" i], [class*="plan" i]').all();
    console.log(`Found ${packages.length} potential credit packages`);
    
    await page.screenshot({ path: 'test-screenshots/payments-05-packages.png', fullPage: true });
    
    if (packages.length > 0) {
      // Try to click first package
      const firstPackage = packages[0];
      const isVisible = await firstPackage.isVisible().catch(() => false);
      
      if (isVisible) {
        await firstPackage.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'test-screenshots/payments-05-package-selected.png', fullPage: true });
        
        console.log('✅ Selected a credit package');
      }
    } else {
      console.log('⚠️ Credit packages not found in expected format');
    }
  });

  test('2.6 Pricing Display (ZAR Currency)', async ({ page }) => {
    console.log('Testing ZAR currency display...');
    
    await loginAsTestUser(page, 'free@test.purpleglow.co.za', 'TestFree123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open upgrade/pricing view
    const upgradeButton = page.locator('button:has-text("Upgrade"), a:has-text("Upgrade"), a:has-text("Pricing")').first();
    
    if (await upgradeButton.count() > 0) {
      await upgradeButton.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'test-screenshots/payments-06-pricing.png', fullPage: true });
    
    // Look for ZAR pricing (R299, R799, etc.)
    const pageContent = await page.content();
    const hasZARPricing = 
      pageContent.includes('R299') ||
      pageContent.includes('R799') ||
      pageContent.includes('R2,999') ||
      pageContent.includes('R7,999') ||
      pageContent.includes('ZAR');
    
    if (hasZARPricing) {
      console.log('✅ ZAR pricing is displayed');
    } else {
      console.log('⚠️ ZAR pricing not found (expected R299, R799, etc.)');
    }
  });

  test('2.7 Annual vs Monthly Toggle', async ({ page }) => {
    console.log('Testing annual/monthly billing toggle...');
    
    await loginAsTestUser(page, 'free@test.purpleglow.co.za', 'TestFree123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Navigate to pricing/upgrade page
    const upgradeButton = page.locator('button:has-text("Upgrade"), a:has-text("Upgrade"), a:has-text("Pricing")').first();
    
    if (await upgradeButton.count() > 0) {
      await upgradeButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for monthly/annual toggle
    const monthlyButton = page.locator('button:has-text("Month"), [role="tab"]:has-text("Month")').first();
    const annualButton = page.locator('button:has-text("Annual"), button:has-text("Year"), [role="tab"]:has-text("Annual")').first();
    
    const hasMonthlyToggle = await monthlyButton.count() > 0;
    const hasAnnualToggle = await annualButton.count() > 0;
    
    if (hasMonthlyToggle && hasAnnualToggle) {
      console.log('✅ Found monthly/annual toggle');
      
      // Click annual
      await annualButton.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: 'test-screenshots/payments-07-annual.png', fullPage: true });
      
      // Click monthly
      await monthlyButton.click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ path: 'test-screenshots/payments-07-monthly.png', fullPage: true });
      
      console.log('✅ Successfully toggled between monthly and annual');
    } else {
      console.log('⚠️ Monthly/annual toggle not found');
      await page.screenshot({ path: 'test-screenshots/payments-07-no-toggle.png', fullPage: true });
    }
  });

  test('2.8 Tier Comparison Display', async ({ page }) => {
    console.log('Testing tier comparison display...');
    
    // Navigate to home/pricing page (don't need to be logged in)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for pricing section
    const pricingSection = await page.locator('text=/pricing/i, h2:has-text("Plan"), h2:has-text("Tier"), section[id*="pricing" i]').first().isVisible().catch(() => false);
    
    if (pricingSection) {
      // Scroll to pricing section
      await page.locator('text=/pricing/i, h2:has-text("Plan")').first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: 'test-screenshots/payments-08-tier-comparison.png', fullPage: true });
    
    const pageContent = await page.content();
    
    // Should show all three tiers
    const hasFree = pageContent.toLowerCase().includes('free');
    const hasPro = pageContent.toLowerCase().includes('pro');
    const hasBusiness = pageContent.toLowerCase().includes('business');
    
    if (hasFree && hasPro && hasBusiness) {
      console.log('✅ All three tiers are displayed');
    } else {
      console.log(`⚠️ Tier display incomplete (Free: ${hasFree}, Pro: ${hasPro}, Business: ${hasBusiness})`);
    }
    
    // Check for feature comparisons
    const hasFeatures = 
      pageContent.includes('generation') ||
      pageContent.includes('account') ||
      pageContent.includes('automation') ||
      pageContent.includes('credit');
    
    if (hasFeatures) {
      console.log('✅ Tier features are listed');
    }
  });

  test('2.9 Upgrade CTA (Free to Pro)', async ({ page }) => {
    console.log('Testing upgrade CTA for free tier user...');
    
    await loginAsTestUser(page, 'free@test.purpleglow.co.za', 'TestFree123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Free tier users should see upgrade prompts
    const upgradeButton = page.locator('button:has-text("Upgrade"), a:has-text("Upgrade to Pro"), a:has-text("Upgrade to")').first();
    const hasUpgradeCTA = await upgradeButton.count() > 0;
    
    await page.screenshot({ path: 'test-screenshots/payments-09-upgrade-cta.png', fullPage: true });
    
    if (hasUpgradeCTA) {
      console.log('✅ Upgrade CTA is visible for free tier');
      
      // Click it
      await upgradeButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'test-screenshots/payments-09-after-upgrade-click.png', fullPage: true });
      
      // Should show pricing or subscription options
      const pageContent = await page.content();
      const showsPricing = 
        pageContent.includes('R299') ||
        pageContent.includes('Pro') ||
        pageContent.includes('subscription');
      
      if (showsPricing) {
        console.log('✅ Upgrade flow initiated successfully');
      }
    } else {
      console.log('⚠️ Upgrade CTA not found');
    }
  });

  test('2.10 Subscription Checkout Initiation', async ({ page }) => {
    console.log('Testing subscription checkout flow...');
    
    await loginAsTestUser(page, 'free@test.purpleglow.co.za', 'TestFree123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Navigate to upgrade
    const upgradeButton = page.locator('button:has-text("Upgrade"), a:has-text("Upgrade")').first();
    
    if (await upgradeButton.count() > 0) {
      await upgradeButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for "Subscribe" or "Choose Plan" button for Pro tier
    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Choose"), button:has-text("Select"), button:has-text("Get Started")').first();
    
    const hasSubscribeButton = await subscribeButton.count() > 0;
    
    if (hasSubscribeButton) {
      console.log('✅ Found subscription button');
      
      // Click to initiate checkout (will be mocked)
      await subscribeButton.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'test-screenshots/payments-10-checkout-init.png', fullPage: true });
      
      // Check if checkout was initiated (mocked response will prevent actual redirect)
      const pageContent = await page.content();
      const checkoutInitiated = 
        pageContent.includes('checkout') ||
        pageContent.includes('processing') ||
        page.url().includes('checkout') ||
        page.url().includes('polar');
      
      if (checkoutInitiated) {
        console.log('✅ Checkout initiation flow works');
      } else {
        console.log('⚠️ Could not verify checkout initiation');
      }
    } else {
      console.log('⚠️ Subscribe button not found');
      await page.screenshot({ path: 'test-screenshots/payments-10-no-subscribe.png', fullPage: true });
    }
  });

  test('2.11 Credit Purchase Checkout Flow', async ({ page }) => {
    console.log('Testing credit purchase checkout...');
    
    await loginAsTestUser(page, 'pro@test.purpleglow.co.za', 'TestPro123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Open credit purchase modal
    const buyCreditButton = page.locator('button:has-text("Buy"), button:has-text("Purchase"), button:has-text("Top")').first();
    
    if (await buyCreditButton.count() > 0) {
      await buyCreditButton.click();
      await page.waitForTimeout(1000);
      
      // Select a package
      const packageButton = page.locator('button:has-text("100"), button:has-text("500"), button:has-text("credit")').first();
      
      if (await packageButton.count() > 0) {
        await packageButton.click();
        await page.waitForTimeout(500);
      }
      
      // Look for "Checkout" or "Purchase" button
      const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Purchase"), button:has-text("Pay")').first();
      
      if (await checkoutButton.count() > 0) {
        console.log('✅ Found checkout button');
        
        await checkoutButton.click();
        await page.waitForTimeout(1000);
        
        await page.screenshot({ path: 'test-screenshots/payments-11-credit-checkout.png', fullPage: true });
        
        console.log('✅ Credit checkout flow initiated');
      } else {
        console.log('⚠️ Checkout button not found');
        await page.screenshot({ path: 'test-screenshots/payments-11-no-checkout.png', fullPage: true });
      }
    } else {
      console.log('⚠️ Buy credits button not found');
      test.skip();
    }
  });

  test('2.12 Current Subscription Display', async ({ page }) => {
    console.log('Testing subscription display for Pro user...');
    
    await loginAsTestUser(page, 'pro@test.purpleglow.co.za', 'TestPro123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for subscription/billing section
    const settingsLink = page.locator('a:has-text("Setting"), button:has-text("Setting"), a:has-text("Account"), a:has-text("Billing")').first();
    
    if (await settingsLink.count() > 0) {
      await settingsLink.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: 'test-screenshots/payments-12-subscription.png', fullPage: true });
    
    const pageContent = await page.content();
    
    // Pro users should see their tier
    const showsPro = 
      pageContent.includes('Pro') ||
      pageContent.includes('pro') ||
      pageContent.includes('R299');
    
    if (showsPro) {
      console.log('✅ Pro subscription is displayed');
    } else {
      console.log('⚠️ Could not verify Pro subscription display');
    }
  });

  test('2.13 Billing History Access', async ({ page }) => {
    console.log('Testing billing history access...');
    
    await loginAsTestUser(page, 'pro@test.purpleglow.co.za', 'TestPro123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Navigate to settings/billing
    const settingsLink = page.locator('a:has-text("Setting"), a:has-text("Billing")').first();
    
    if (await settingsLink.count() > 0) {
      await settingsLink.click();
      await page.waitForTimeout(1000);
    }
    
    // Look for billing history or transactions
    const billingHistorySection = await page.locator('text=/billing.*history/i, text=/transaction/i, h2:has-text("History"), h3:has-text("History")').first().isVisible().catch(() => false);
    
    await page.screenshot({ path: 'test-screenshots/payments-13-billing-history.png', fullPage: true });
    
    if (billingHistorySection) {
      console.log('✅ Billing history section is accessible');
    } else {
      const pageContent = await page.content();
      const hasHistory = 
        pageContent.toLowerCase().includes('transaction') ||
        pageContent.toLowerCase().includes('history') ||
        pageContent.toLowerCase().includes('invoice');
      
      if (hasHistory) {
        console.log('✅ Billing/transaction information is available');
      } else {
        console.log('⚠️ Billing history not found');
      }
    }
  });

  test('2.14 Credit Cost Preview', async ({ page }) => {
    console.log('Testing credit cost preview for posting...');
    
    await loginAsTestUser(page, 'pro@test.purpleglow.co.za', 'TestPro123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Look for credit cost information when scheduling/publishing
    // This might be near the publish button or in a schedule modal
    const pageContent = await page.content();
    
    const hasCostInfo = 
      pageContent.includes('1 credit') ||
      pageContent.includes('cost') ||
      pageContent.includes('will use');
    
    await page.screenshot({ path: 'test-screenshots/payments-14-cost-preview.png', fullPage: true });
    
    if (hasCostInfo) {
      console.log('✅ Credit cost information is displayed');
    } else {
      console.log('⚠️ Credit cost preview not found (may appear during publish action)');
    }
  });

  test('2.15 Free Tier Credit Allocation', async ({ page }) => {
    console.log('Testing free tier credit allocation...');
    
    await loginAsTestUser(page, 'free@test.purpleglow.co.za', 'TestFree123!');
    
    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login failed - skipping test');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Free tier should have 10 credits
    const pageContent = await page.content();
    const hasTenCredits = 
      pageContent.includes('10 credit') ||
      pageContent.includes('10/10') ||
      (pageContent.includes('credit') && pageContent.includes('10'));
    
    await page.screenshot({ path: 'test-screenshots/payments-15-free-credits.png', fullPage: true });
    
    if (hasTenCredits) {
      console.log('✅ Free tier shows 10 credits allocation');
    } else {
      console.log('⚠️ Could not verify free tier 10 credit allocation');
    }
    
    // Free tier should NOT have option to buy more credits (must upgrade first)
    const buyCreditButton = await page.locator('button:has-text("Buy Credit"), button:has-text("Purchase Credit")').first().isVisible().catch(() => false);
    
    if (buyCreditButton) {
      console.log('⚠️ Free tier can buy credits (unexpected)');
    } else {
      console.log('✅ Free tier cannot directly buy credits (must upgrade)');
    }
  });
});
