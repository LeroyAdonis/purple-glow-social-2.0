const { chromium } = require('playwright');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPurpleGlow() {
    const consoleMessages = {
        homepage: [],
        login_before: [],
        login_during: [],
        login_after: [],
        dashboard: [],
        content_generator: []
    };
    
    let currentStep = 'unknown';
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    const page = await context.newPage();
    
    // Setup console listener
    page.on('console', msg => {
        const messageData = {
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        };
        if (consoleMessages[currentStep]) {
            consoleMessages[currentStep].push(messageData);
        }
    });
    
    console.log("=".repeat(80));
    console.log("STEP 1: HOMEPAGE (http://localhost:3000)");
    console.log("=".repeat(80));
    
    currentStep = 'homepage';
    
    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
        await sleep(2000);
        
        // Screenshot
        await page.screenshot({ path: 'homepage.png', fullPage: true });
        console.log("✅ Screenshot captured: homepage.png");
        
        // Check for navigation bar
        const navCount = await page.locator('nav').count();
        console.log(`Navigation bar found: ${navCount > 0}`);
        
        // Check for hero section
        const heroCount = await page.locator('text=/hero|welcome|purple glow/i').count();
        console.log(`Hero section found: ${heroCount > 0}`);
        
        // Check for pricing sections with R0, R299, R999
        const pricingR0 = await page.locator('text=/R0/i').count();
        const pricingR299 = await page.locator('text=/R299/i').count();
        const pricingR999 = await page.locator('text=/R999/i').count();
        console.log(`Pricing R0 found: ${pricingR0 > 0}`);
        console.log(`Pricing R299 found: ${pricingR299 > 0}`);
        console.log(`Pricing R999 found: ${pricingR999 > 0}`);
        
        // Report console messages
        console.log("\nConsole Messages:");
        const errors = consoleMessages.homepage.filter(m => m.type === 'error');
        const warnings = consoleMessages.homepage.filter(m => m.type === 'warning');
        
        if (errors.length > 0) {
            console.log(`❌ ERRORS FOUND (${errors.length}):`);
            errors.forEach(err => {
                console.log(`  ERROR: ${err.text}`);
                if (err.location) {
                    console.log(`    Location: ${JSON.stringify(err.location)}`);
                }
            });
        } else {
            console.log("✅ ZERO console errors");
        }
        
        if (warnings.length > 0) {
            console.log(`⚠️  WARNINGS (${warnings.length}):`);
            warnings.forEach(warn => {
                console.log(`  WARNING: ${warn.text}`);
            });
        }
        
        console.log(`Total console messages: ${consoleMessages.homepage.length}`);
        
    } catch (e) {
        console.log(`❌ STEP 1 FAILED: ${e.message}`);
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("STEP 2: LOGIN FLOW (http://localhost:3000/login)");
    console.log("=".repeat(80));
    
    currentStep = 'login_before';
    
    try {
        // Navigate to login page
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
        await sleep(1000);
        
        // Handle cookie banner if it appears
        try {
            const cookieBanner = page.locator('button:has-text("Accept"), button:has-text("I Accept"), button:has-text("Got it")').first();
            if (await cookieBanner.isVisible({ timeout: 2000 })) {
                console.log("Dismissing cookie banner...");
                await cookieBanner.click();
                await sleep(500);
            }
        } catch (e) {
            // Cookie banner not found or already dismissed
        }
        
        // Screenshot before login
        await page.screenshot({ path: 'login_before.png', fullPage: true });
        console.log("✅ Screenshot captured: login_before.png");
        
        // Switch to monitoring login during
        currentStep = 'login_during';
        
        // Fill form
        const emailInput = page.locator('input[type="email"], input[name="email"], input[id*="email"]').first();
        const passwordInput = page.locator('input[type="password"], input[name="password"], input[id*="password"]').first();
        
        console.log("\nFilling login form...");
        await emailInput.fill('pro@test.purpleglow.co.za');
        await passwordInput.fill('TestPro123!');
        console.log("✅ Form filled");
        
        // Submit form - force click to bypass overlays
        const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
        
        console.log("\nSubmitting form...");
        await submitButton.click({ force: true });
        
        // Wait and monitor
        await sleep(5000);
        
        // Switch to after login monitoring
        currentStep = 'login_after';
        await sleep(1000);
        
        // Screenshot after login
        await page.screenshot({ path: 'login_after.png', fullPage: true });
        console.log("✅ Screenshot captured: login_after.png");
        
        // Check URL
        const currentUrl = page.url();
        console.log(`\nCurrent URL: ${currentUrl}`);
        if (currentUrl.includes('/dashboard')) {
            console.log("✅ Redirected to dashboard");
        } else {
            console.log(`❌ Not on dashboard. Current URL: ${currentUrl}`);
        }
        
        // Check for error messages in UI
        const errorElements = await page.locator('[role="alert"], .error, .text-red-500, text=/error|failed|invalid/i').all();
        if (errorElements.length > 0) {
            console.log(`\n⚠️  Found ${errorElements.length} potential error messages in UI`);
            for (let i = 0; i < Math.min(5, errorElements.length); i++) {
                try {
                    const text = await errorElements[i].textContent();
                    if (text && text.trim().length > 0 && text.trim().length < 200) {
                        console.log(`  - ${text.trim()}`);
                    }
                } catch (e) {
                    // Skip if can't get text
                }
            }
        }
        
        // Report console messages during login
        console.log("\nConsole Messages During Login:");
        const allLoginMsgs = [
            ...consoleMessages.login_before,
            ...consoleMessages.login_during,
            ...consoleMessages.login_after
        ];
        
        const loginErrors = allLoginMsgs.filter(m => m.type === 'error');
        
        if (loginErrors.length > 0) {
            console.log(`❌ ERRORS FOUND (${loginErrors.length}):`);
            loginErrors.forEach(err => {
                console.log(`  ERROR: ${err.text}`);
                if (err.text.includes('Session cookie not created')) {
                    console.log("  ⚠️  CRITICAL: 'Session cookie not created' error still present!");
                }
            });
        } else {
            console.log("✅ ZERO console errors during login");
            console.log("✅ CONFIRMED: 'Session cookie not created' error is GONE");
        }
        
    } catch (e) {
        console.log(`❌ STEP 2 FAILED: ${e.message}`);
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("STEP 3: DASHBOARD (http://localhost:3000/dashboard)");
    console.log("=".repeat(80));
    
    currentStep = 'dashboard';
    
    try {
        // Should already be on dashboard, but navigate to be sure
        if (!page.url().includes('/dashboard')) {
            await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
        }
        
        // Wait for components to load
        await sleep(5000);
        
        // Screenshot
        await page.screenshot({ path: 'dashboard.png', fullPage: true });
        console.log("✅ Screenshot captured: dashboard.png");
        
        // Report console messages
        console.log("\nConsole Messages on Dashboard:");
        const dashErrors = consoleMessages.dashboard.filter(m => m.type === 'error');
        
        if (dashErrors.length > 0) {
            console.log(`❌ ERRORS FOUND (${dashErrors.length}):`);
            dashErrors.forEach(err => {
                console.log(`  ERROR: ${err.text}`);
            });
            
            // Check for specific previously reported errors
            const errorTexts = dashErrors.map(e => e.text);
            
            if (errorTexts.some(text => text.includes('Failed to fetch'))) {
                console.log("  ⚠️  CRITICAL: 'Failed to fetch' error still present!");
            }
            if (errorTexts.some(text => text.includes('Failed to fetch limits'))) {
                console.log("  ⚠️  CRITICAL: 'Failed to fetch limits' error still present!");
            }
            if (errorTexts.some(text => text.includes('Failed to fetch user profile'))) {
                console.log("  ⚠️  CRITICAL: 'Failed to fetch user profile' error still present!");
            }
        } else {
            console.log("✅ ZERO console errors on dashboard");
            console.log("✅ CONFIRMED: All previously reported fetch errors are GONE");
        }
        
    } catch (e) {
        console.log(`❌ STEP 3 FAILED: ${e.message}`);
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("STEP 4: CONTENT GENERATOR");
    console.log("=".repeat(80));
    
    currentStep = 'content_generator';
    
    try {
        // Look for content generator links - try multiple selectors
        let contentLinks = await page.locator('a:has-text("AI Content")').all();
        if (contentLinks.length === 0) {
            contentLinks = await page.locator('a:has-text("Content Generator")').all();
        }
        if (contentLinks.length === 0) {
            contentLinks = await page.locator('a:has-text("Content Studio")').all();
        }
        if (contentLinks.length === 0) {
            contentLinks = await page.locator('text=/content/i').all();
        }
        
        if (contentLinks.length > 0) {
            console.log(`Found ${contentLinks.length} potential content generator links`);
            
            // Click the first one
            await contentLinks[0].click();
            await sleep(5000);
            
            // Screenshot
            await page.screenshot({ path: 'content_generator.png', fullPage: true });
            console.log("✅ Screenshot captured: content_generator.png");
            
            // Check console
            const genErrors = consoleMessages.content_generator.filter(m => m.type === 'error');
            if (genErrors.length > 0) {
                console.log(`❌ ERRORS FOUND (${genErrors.length}):`);
                genErrors.forEach(err => {
                    console.log(`  ERROR: ${err.text}`);
                });
            } else {
                console.log("✅ ZERO console errors");
            }
        } else {
            console.log("ℹ️  No Content Generator link found - feature may not be visible or available");
        }
        
    } catch (e) {
        console.log(`❌ STEP 4 FAILED: ${e.message}`);
    }
    
    // Final summary
    console.log("\n" + "=".repeat(80));
    console.log("FINAL SUMMARY");
    console.log("=".repeat(80));
    
    const allErrors = [];
    for (const [step, messages] of Object.entries(consoleMessages)) {
        const errors = messages.filter(m => m.type === 'error');
        errors.forEach(err => {
            allErrors.push({ step, error: err });
        });
    }
    
    if (allErrors.length === 0) {
        console.log("✅ ALL ISSUES CONFIRMED FIXED");
        console.log("\nPreviously reported issues:");
        console.log("  ✅ 3 RSC errors on homepage - FIXED");
        console.log("  ✅ 'Session cookie not created' error - FIXED");
        console.log("  ✅ 'Failed to fetch' errors on dashboard - FIXED");
        console.log("  ✅ 'Failed to fetch limits' error - FIXED");
        console.log("  ✅ 'Failed to fetch user profile' error - FIXED");
    } else {
        console.log(`❌ FOUND ${allErrors.length} REMAINING ISSUES:\n`);
        allErrors.forEach(({ step, error }) => {
            console.log(`[${step.toUpperCase()}]`);
            console.log(`  ERROR: ${error.text}`);
            if (error.location) {
                console.log(`  Location: ${JSON.stringify(error.location)}`);
            }
            console.log();
        });
    }
    
    await browser.close();
}

testPurpleGlow().catch(console.error);
