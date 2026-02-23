/**
 * Test script to verify proxy.ts middleware functionality
 * Tests routes: /, /dashboard, /login
 */

import { chromium } from 'playwright';

async function testRoute(page, routePath, routeName, expectedBehavior) {
    console.log('\n' + '='.repeat(60));
    console.log(`Testing: ${routeName} (${routePath})`);
    console.log(`Expected: ${expectedBehavior}`);
    console.log('='.repeat(60));

    const consoleMessages = [];
    const consoleErrors = [];
    const pageErrors = [];

    // Capture console messages
    page.on('console', msg => {
        const msgType = msg.type();
        const msgText = msg.text();
        consoleMessages.push(`[${msgType}] ${msgText}`);
        if (msgType === 'error' || msgType === 'warning') {
            consoleErrors.push(`[${msgType}] ${msgText}`);
        }
    });

    // Capture page errors
    page.on('pageerror', error => {
        pageErrors.push(error.toString());
    });

    try {
        // Navigate to the route
        const response = await page.goto(`http://localhost:3000${routePath}`, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });

        // Wait a bit for any async operations
        await page.waitForTimeout(1000);

        // Get final URL (to detect redirects)
        const finalUrl = page.url();

        // Get page title
        const title = await page.title();

        // Take screenshot
        const screenshotPath = `screenshot_${routeName.replace(/\//g, '_')}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });

        // Get response status
        const statusCode = response ? response.status() : 'No response';

        // Results
        console.log(`\n✓ Initial URL: http://localhost:3000${routePath}`);
        console.log(`✓ Final URL: ${finalUrl}`);
        console.log(`✓ Status Code: ${statusCode}`);
        console.log(`✓ Page Title: ${title}`);
        console.log(`✓ Screenshot saved: ${screenshotPath}`);

        // Check for redirects
        if (finalUrl !== `http://localhost:3000${routePath}`) {
            console.log(`\n⚠ REDIRECT DETECTED:`);
            console.log(`  From: ${routePath}`);
            console.log(`  To: ${finalUrl.replace('http://localhost:3000', '')}`);
        }

        // Console messages
        if (consoleMessages.length > 0) {
            console.log(`\n📝 Console Messages (${consoleMessages.length} total):`);
            consoleMessages.slice(0, 10).forEach(msg => console.log(`  ${msg}`));
            if (consoleMessages.length > 10) {
                console.log(`  ... and ${consoleMessages.length - 10} more`);
            }
        } else {
            console.log('\n✓ No console messages');
        }

        // Console errors
        if (consoleErrors.length > 0) {
            console.log(`\n❌ Console Errors/Warnings (${consoleErrors.length} total):`);
            consoleErrors.forEach(error => console.log(`  ${error}`));
        } else {
            console.log('\n✓ No console errors');
        }

        // Page errors
        if (pageErrors.length > 0) {
            console.log(`\n❌ Page Errors (${pageErrors.length} total):`);
            pageErrors.forEach(error => console.log(`  ${error}`));
        } else {
            console.log('\n✓ No page errors');
        }

        return {
            route: routePath,
            name: routeName,
            success: true,
            finalUrl: finalUrl,
            redirected: finalUrl !== `http://localhost:3000${routePath}`,
            statusCode: statusCode,
            title: title,
            consoleErrors: consoleErrors,
            pageErrors: pageErrors,
            screenshot: screenshotPath
        };

    } catch (error) {
        console.log(`\n❌ ERROR testing ${routeName}: ${error.message}`);
        return {
            route: routePath,
            name: routeName,
            success: false,
            error: error.message
        };
    }
}

async function main() {
    console.log('Starting middleware test...');
    console.log('Target: http://localhost:3000');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    const results = [];

    // Test 1: Homepage (should be public/accessible)
    results.push(await testRoute(
        page,
        '/',
        'homepage',
        'Public page - should load without redirect'
    ));

    // Test 2: Dashboard (protected - should redirect to /login if not authenticated)
    results.push(await testRoute(
        page,
        '/dashboard',
        'dashboard',
        'Protected page - should redirect to /login if not authenticated'
    ));

    // Test 3: Login (public - should load the login page)
    results.push(await testRoute(
        page,
        '/login',
        'login',
        'Public page - should load without redirect'
    ));

    await browser.close();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    for (const result of results) {
        if (result.success) {
            const status = (!result.pageErrors || result.pageErrors.length === 0) && 
                          (!result.consoleErrors || result.consoleErrors.length === 0)
                ? '✓ PASS'
                : '⚠ PASS (with warnings)';
            console.log(`\n${result.name.toUpperCase()} (${result.route}): ${status}`);
            console.log(`  Final URL: ${result.finalUrl}`);
            if (result.redirected) {
                console.log(`  ⚠ Redirected: YES`);
            } else {
                console.log(`  ✓ Redirected: NO`);
            }
            if (result.consoleErrors && result.consoleErrors.length > 0) {
                console.log(`  ⚠ Console Errors: ${result.consoleErrors.length}`);
            }
            if (result.pageErrors && result.pageErrors.length > 0) {
                console.log(`  ❌ Page Errors: ${result.pageErrors.length}`);
            }
        } else {
            console.log(`\n${result.name.toUpperCase()} (${result.route}): ❌ FAIL`);
            console.log(`  Error: ${result.error}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('MIDDLEWARE VERIFICATION:');
    console.log('='.repeat(60));

    // Check specific middleware behaviors
    const dashboardResult = results.find(r => r.route === '/dashboard');
    if (dashboardResult && dashboardResult.success) {
        if (dashboardResult.finalUrl.includes('/login')) {
            console.log('✓ Dashboard redirect to /login: WORKING');
        } else {
            console.log('⚠ Dashboard redirect: NOT DETECTED (either already authenticated or middleware not working)');
        }
    }

    const homepageResult = results.find(r => r.route === '/');
    if (homepageResult && homepageResult.success) {
        if (!homepageResult.redirected) {
            console.log('✓ Homepage public access: WORKING');
        } else {
            console.log('⚠ Homepage unexpectedly redirected');
        }
    }

    const loginResult = results.find(r => r.route === '/login');
    if (loginResult && loginResult.success) {
        if (!loginResult.redirected) {
            console.log('✓ Login page public access: WORKING');
        } else {
            console.log('⚠ Login page unexpectedly redirected');
        }
    }
}

main().catch(console.error);
