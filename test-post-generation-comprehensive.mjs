/**
 * Comprehensive test script for Purple Glow Social 2.0 post generation flow
 * Captures ALL errors: console, network, UI, and stack traces
 */
import { chromium } from '@playwright/test';
import { writeFileSync } from 'fs';

// Storage for all captured errors and events
const consoleMessages = [];
const networkErrors = [];
const javascriptExceptions = [];
const uiErrors = [];
const screenshotsTaken = [];

function logSection(title) {
  console.log('\n' + '='.repeat(80));
  console.log(` ${title}`);
  console.log('='.repeat(80));
}

async function saveScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `/tmp/${name}_${timestamp}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  screenshotsTaken.push(filename);
  console.log(`📸 Screenshot saved: ${filename}`);
  return filename;
}

function setupConsoleListener(page) {
  page.on('console', msg => {
    const entry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString()
    };
    consoleMessages.push(entry);
    
    const prefix = {
      error: '❌ CONSOLE ERROR',
      warning: '⚠️  CONSOLE WARNING',
      log: '📝 CONSOLE LOG',
      info: 'ℹ️  CONSOLE INFO'
    }[msg.type()] || `CONSOLE ${msg.type().toUpperCase()}`;
    
    console.log(`${prefix}: ${msg.text()}`);
  });
}

function setupPageErrorListener(page) {
  page.on('pageerror', error => {
    javascriptExceptions.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.log(`💥 JAVASCRIPT EXCEPTION: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  });
}

function setupNetworkListener(page) {
  page.on('response', async response => {
    if (response.status() >= 400) {
      let body;
      try {
        body = await response.text();
      } catch {
        body = '<unable to read response body>';
      }
      
      const errorData = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        headers: await response.allHeaders(),
        body: body,
        timestamp: new Date().toISOString()
      };
      networkErrors.push(errorData);
      console.log(`🌐 NETWORK ERROR [${response.status()}]: ${response.url()}`);
      console.log(`   Response: ${body.substring(0, 200)}...`);
    }
  });
  
  page.on('requestfailed', request => {
    const errorData = {
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText || 'Unknown',
      timestamp: new Date().toISOString()
    };
    networkErrors.push(errorData);
    console.log(`🌐 REQUEST FAILED: ${request.method()} ${request.url()}`);
    console.log(`   Failure: ${errorData.failure}`);
  });
}

async function checkForUIErrors(page, stepName) {
  const errorSelectors = [
    '[role="alert"]',
    '.error',
    '.error-message',
    '[class*="error"]',
    '[class*="Error"]',
    '.alert-error',
    '.text-red-500',
    '.text-red-600',
    '.text-destructive'
  ];
  
  for (const selector of errorSelectors) {
    try {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        if (await element.isVisible()) {
          const text = await element.textContent();
          if (text && text.trim()) {
            uiErrors.push({
              step: stepName,
              selector: selector,
              text: text,
              timestamp: new Date().toISOString()
            });
            console.log(`🔴 UI ERROR at '${stepName}': ${text}`);
          }
        }
      }
    } catch {
      // Selector not found, continue
    }
  }
}

function printFinalReport() {
  logSection('FINAL ERROR REPORT');
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Console Messages: ${consoleMessages.length}`);
  console.log(`   Network Errors: ${networkErrors.length}`);
  console.log(`   JavaScript Exceptions: ${javascriptExceptions.length}`);
  console.log(`   UI Errors: ${uiErrors.length}`);
  console.log(`   Screenshots Taken: ${screenshotsTaken.length}`);
  
  // Console Messages
  if (consoleMessages.length > 0) {
    logSection('CONSOLE MESSAGES (ALL)');
    consoleMessages.forEach((msg, i) => {
      console.log(`\n[${i + 1}] Type: ${msg.type.toUpperCase()}`);
      console.log(`    Time: ${msg.timestamp}`);
      console.log(`    Text: ${msg.text}`);
      if (msg.location) {
        console.log(`    Location: ${JSON.stringify(msg.location)}`);
      }
    });
  }
  
  // Network Errors
  if (networkErrors.length > 0) {
    logSection('NETWORK ERRORS (ALL)');
    networkErrors.forEach((error, i) => {
      console.log(`\n[${i + 1}] ${error.method || 'GET'} ${error.url}`);
      console.log(`    Status: ${error.status || 'FAILED'} ${error.statusText || ''}`);
      if (error.failure) {
        console.log(`    Failure: ${error.failure}`);
      }
      console.log(`    Time: ${error.timestamp}`);
      if (error.body) {
        console.log(`    Response Body:`);
        console.log(`    ${error.body}`);
      }
      if (error.headers) {
        console.log(`    Headers: ${JSON.stringify(error.headers, null, 2)}`);
      }
    });
  }
  
  // JavaScript Exceptions
  if (javascriptExceptions.length > 0) {
    logSection('JAVASCRIPT EXCEPTIONS (ALL)');
    javascriptExceptions.forEach((exc, i) => {
      console.log(`\n[${i + 1}] Time: ${exc.timestamp}`);
      console.log(`    Message: ${exc.message}`);
      console.log(`    Stack:`);
      console.log(`    ${exc.stack}`);
    });
  }
  
  // UI Errors
  if (uiErrors.length > 0) {
    logSection('UI ERROR MESSAGES (ALL)');
    uiErrors.forEach((error, i) => {
      console.log(`\n[${i + 1}] Step: ${error.step}`);
      console.log(`    Selector: ${error.selector}`);
      console.log(`    Time: ${error.timestamp}`);
      console.log(`    Text: ${error.text}`);
    });
  }
  
  // Screenshots
  if (screenshotsTaken.length > 0) {
    logSection('SCREENSHOTS TAKEN');
    screenshotsTaken.forEach((screenshot, i) => {
      console.log(`[${i + 1}] ${screenshot}`);
    });
  }
  
  // Overall result
  logSection('TEST RESULT');
  if (networkErrors.length > 0 || javascriptExceptions.length > 0 || 
      consoleMessages.some(msg => msg.type === 'error')) {
    console.log('❌ TEST COMPLETED WITH ERRORS');
  } else {
    console.log('✅ TEST COMPLETED (check details above)');
  }
  
  // Save detailed report to file
  const report = {
    summary: {
      consoleMessages: consoleMessages.length,
      networkErrors: networkErrors.length,
      javascriptExceptions: javascriptExceptions.length,
      uiErrors: uiErrors.length,
      screenshots: screenshotsTaken.length
    },
    consoleMessages,
    networkErrors,
    javascriptExceptions,
    uiErrors,
    screenshots: screenshotsTaken,
    timestamp: new Date().toISOString()
  };
  
  const reportFile = '/tmp/test_report.json';
  writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportFile}`);
}

async function main() {
  logSection('Purple Glow Social 2.0 - Post Generation Flow Test');
  console.log(`Start Time: ${new Date().toISOString()}`);
  console.log(`Target URL: http://localhost:3000`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  
  // Set up all listeners BEFORE navigation
  console.log('🎧 Setting up event listeners...');
  setupConsoleListener(page);
  setupPageErrorListener(page);
  setupNetworkListener(page);
  
  try {
    // STEP 1: Navigate to dashboard
    logSection('STEP 1: Navigate to Dashboard');
    console.log('Navigating to http://localhost:3000/dashboard...');
    await page.goto('http://localhost:3000/dashboard', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    await saveScreenshot(page, 'step1_dashboard_initial');
    await checkForUIErrors(page, 'Dashboard Initial Load');
    console.log(`Current URL: ${page.url()}`);
    
    // STEP 2: Login
    logSection('STEP 2: Login');
    console.log('Attempting login...');
    console.log('  Email: pro@test.purpleglow.co.za');
    console.log('  Password: TestPro123!');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check if login form is visible
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const isLoginFormVisible = await emailInput.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isLoginFormVisible) {
      console.log('Login form found, entering credentials...');
      
      // First, check for and dismiss any cookie banners
      const cookieBannerSelectors = [
        'button:has-text("Accept")',
        'button:has-text("Accept All")',
        'button:has-text("Got it")',
        'button:has-text("OK")',
        '[aria-label*="cookie" i] button',
        '[role="dialog"] button:has-text("Accept")'
      ];
      
      for (const selector of cookieBannerSelectors) {
        try {
          const cookieButton = page.locator(selector).first();
          if (await cookieButton.isVisible({ timeout: 1000 })) {
            console.log(`Found cookie banner, clicking: ${selector}`);
            await cookieButton.click();
            await page.waitForTimeout(500);
            break;
          }
        } catch {
          continue;
        }
      }
      
      await emailInput.fill('pro@test.purpleglow.co.za');
      
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      await passwordInput.fill('TestPro123!');
      
      await saveScreenshot(page, 'step2_credentials_filled');
      
      const loginButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In"), button:has-text("Login")').first();
      
      // Try to click with force if blocked by overlay
      try {
        await loginButton.click({ timeout: 5000 });
      } catch (e) {
        console.log('⚠️  Normal click failed, trying force click...');
        await loginButton.click({ force: true });
      }
      console.log('Login button clicked, waiting for navigation...');
      
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await page.waitForTimeout(2000);
      await saveScreenshot(page, 'step2_after_login');
      await checkForUIErrors(page, 'After Login');
      console.log(`Current URL after login: ${page.url()}`);
    } else {
      console.log('Already logged in or login form not found');
      await saveScreenshot(page, 'step2_already_logged_in');
    }
    
    // STEP 3: Navigate to AI Content Studio
    logSection('STEP 3: Navigate to AI Content Studio');
    console.log('Looking for AI Content Studio / Content Generator...');
    
    await saveScreenshot(page, 'step3_before_navigation');
    
    // Try to find and click AI Content Studio link
    const contentStudioSelectors = [
      'a:has-text("AI Content Studio")',
      'a:has-text("Content Generator")',
      'a:has-text("Content Studio")',
      'nav a:has-text("Studio")',
      '[href*="content"]',
      '[href*="studio"]',
      '[href*="generator"]'
    ];
    
    let clicked = false;
    for (const selector of contentStudioSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`Found element with selector: ${selector}`);
          await element.click();
          clicked = true;
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!clicked) {
      console.log('⚠️  Could not find AI Content Studio link, trying direct navigation...');
      const urlsToTry = [
        'http://localhost:3000/content-studio',
        'http://localhost:3000/content-generator',
        'http://localhost:3000/ai-studio',
        'http://localhost:3000/dashboard/content',
        'http://localhost:3000/dashboard/studio',
        'http://localhost:3000/dashboard/generator'
      ];
      
      for (const url of urlsToTry) {
        try {
          console.log(`Trying: ${url}`);
          await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
          await page.waitForTimeout(1000);
          if (page.url() === url) {
            console.log(`✅ Successfully navigated to ${url}`);
            clicked = true;
            break;
          }
        } catch (e) {
          console.log(`❌ Failed: ${e.message}`);
          continue;
        }
      }
    }
    
    if (clicked) {
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await page.waitForTimeout(2000);
    }
    
    await saveScreenshot(page, 'step3_content_studio');
    await checkForUIErrors(page, 'AI Content Studio Page');
    console.log(`Current URL: ${page.url()}`);
    
    // STEP 4: Fill in topic
    logSection('STEP 4: Fill in Topic');
    console.log('Looking for topic input field...');
    
    const topicSelectors = [
      'input[placeholder*="topic" i]',
      'input[placeholder*="content" i]',
      'input[name*="topic" i]',
      'textarea[placeholder*="topic" i]',
      'textarea[placeholder*="content" i]',
      'input[type="text"]',
      'textarea'
    ];
    
    let topicFilled = false;
    for (const selector of topicSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`Found topic input with selector: ${selector}`);
          await element.fill('social media marketing tips');
          topicFilled = true;
          console.log('✅ Topic filled: "social media marketing tips"');
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!topicFilled) {
      console.log('⚠️  Could not find topic input field');
    }
    
    await saveScreenshot(page, 'step4_topic_filled');
    await checkForUIErrors(page, 'After Topic Fill');
    
    // STEP 5: Select platform
    logSection('STEP 5: Select Platform');
    console.log('Looking for platform selector...');
    
    const platformSelectors = [
      'select[name*="platform" i]',
      'button:has-text("LinkedIn")',
      'button:has-text("Twitter")',
      'button:has-text("Facebook")',
      '[role="combobox"]',
      'input[type="radio"][value*="linkedin" i]',
      'input[type="radio"][value*="twitter" i]'
    ];
    
    let platformSelected = false;
    for (const selector of platformSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`Found platform selector: ${selector}`);
          if (selector.includes('select')) {
            await element.selectOption({ label: 'LinkedIn' });
          } else if (selector.includes('LinkedIn') || selector.includes('Twitter')) {
            await element.click();
          } else if (selector.includes('radio')) {
            await element.check();
          }
          platformSelected = true;
          console.log('✅ Platform selected');
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!platformSelected) {
      console.log('⚠️  Could not find or select platform');
    }
    
    await page.waitForTimeout(1000);
    await saveScreenshot(page, 'step5_platform_selected');
    await checkForUIErrors(page, 'After Platform Selection');
    
    // STEP 6: Click Generate button
    logSection('STEP 6: Click Generate Button');
    console.log('Looking for Generate button...');
    
    const generateSelectors = [
      'button:has-text("Generate")',
      'button:has-text("Create")',
      'button:has-text("Create Post")',
      'button[type="submit"]',
      'button:has-text("AI Generate")'
    ];
    
    let generateClicked = false;
    for (const selector of generateSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`Found Generate button: ${selector}`);
          await saveScreenshot(page, 'step6_before_generate_click');
          await element.click();
          generateClicked = true;
          console.log('✅ Generate button clicked!');
          break;
        }
      } catch (e) {
        console.log(`Failed with selector ${selector}: ${e.message}`);
        continue;
      }
    }
    
    if (!generateClicked) {
      console.log('❌ Could not find or click Generate button');
      await saveScreenshot(page, 'step6_generate_button_not_found');
    } else {
      console.log('Waiting for generation to complete...');
      await page.waitForTimeout(3000);
      await page.waitForLoadState('networkidle', { timeout: 60000 });
      await page.waitForTimeout(2000);
      
      await saveScreenshot(page, 'step6_after_generate');
      await checkForUIErrors(page, 'After Generate Click');
    }
    
    // STEP 7: Observe results
    logSection('STEP 7: Observe Results');
    console.log('Checking for generated content or errors...');
    
    const successIndicators = [
      'text=successfully',
      'text=generated',
      'text=created',
      '[class*="success"]',
      '.text-green-500',
      '.text-green-600'
    ];
    
    let hasSuccess = false;
    for (const selector of successIndicators) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          const text = await element.textContent();
          console.log(`✅ Success indicator found: ${text}`);
          hasSuccess = true;
        }
      } catch {
        continue;
      }
    }
    
    await saveScreenshot(page, 'step7_final_state');
    await checkForUIErrors(page, 'Final State');
    
    // STEP 8: Try to schedule/publish
    logSection('STEP 8: Try to Schedule/Publish');
    
    const publishSelectors = [
      'button:has-text("Publish")',
      'button:has-text("Schedule")',
      'button:has-text("Post Now")',
      'button:has-text("Save")'
    ];
    
    let publishFound = false;
    for (const selector of publishSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`Found publish/schedule button: ${selector}`);
          await element.click();
          publishFound = true;
          console.log('✅ Clicked publish/schedule button');
          await page.waitForTimeout(2000);
          await page.waitForLoadState('networkidle', { timeout: 30000 });
          await saveScreenshot(page, 'step8_after_publish_click');
          await checkForUIErrors(page, 'After Publish Click');
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!publishFound) {
      console.log('⚠️  No publish/schedule button found');
    }
    
    await saveScreenshot(page, 'step8_final');
    
  } catch (error) {
    logSection('CRITICAL ERROR');
    console.log(`❌ Test failed with exception: ${error.message}`);
    console.log(error.stack);
    await saveScreenshot(page, 'error_critical').catch(() => {});
  } finally {
    console.log('\n🔒 Closing browser...');
    await browser.close();
  }
  
  printFinalReport();
  
  logSection('TEST COMPLETE');
  console.log(`End Time: ${new Date().toISOString()}`);
}

main().catch(console.error);
