import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function verifyHomepage() {
    const consoleErrors = [];
    const consoleWarnings = [];
    const allConsole = [];
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set up console message listener
    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        allConsole.push(`[${type}] ${text}`);
        if (type === 'error') {
            consoleErrors.push(text);
        } else if (type === 'warning') {
            consoleWarnings.push(text);
        }
    });
    
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { timeout: 60000 });
    
    // Wait a bit for hot reload if needed
    console.log('Waiting 10 seconds for potential hot-reload...');
    await page.waitForTimeout(10000);
    
    // Reload to ensure we get latest version
    console.log('Reloading page...');
    await page.reload();
    
    // Wait for networkidle (up to 15 seconds)
    console.log('Waiting for networkidle...');
    try {
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        console.log('Page loaded (networkidle)');
    } catch (e) {
        console.log(`Networkidle timeout (continuing anyway): ${e.message}`);
    }
    
    // Take full-page screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'docs/audit-screenshots/home-after-fix.png', fullPage: true });
    console.log('Screenshot saved to docs/audit-screenshots/home-after-fix.png');
    
    // Check for elements
    console.log('\nChecking page elements...');
    
    // Check for navigation/header
    let navFound = false;
    const navDetails = [];
    
    // Try multiple selectors for navigation
    const navCount = await page.locator('nav').count();
    if (navCount > 0) {
        navFound = true;
        navDetails.push(`Found <nav> element(s): ${navCount}`);
    }
    
    const headerCount = await page.locator('header').count();
    if (headerCount > 0) {
        navFound = true;
        navDetails.push(`Found <header> element(s): ${headerCount}`);
    }
    
    // Look for common nav text
    const navKeywords = ['Features', 'Pricing', 'Login', 'Sign Up', 'About', 'Home'];
    for (const keyword of navKeywords) {
        const count = await page.getByText(keyword).count();
        if (count > 0) {
            navFound = true;
            navDetails.push(`Found nav text: '${keyword}'`);
        }
    }
    
    // Check for pricing section
    let pricingFound = false;
    const pricingDetails = [];
    
    // Look for ZAR pricing (R followed by numbers/space)
    const zarCount = await page.getByText('R ', { exact: false }).count();
    if (zarCount > 0) {
        pricingFound = true;
        pricingDetails.push(`Found ZAR pricing indicators: ${zarCount}`);
    }
    
    // Look for plan names
    const planKeywords = ['Pro', 'Business', 'Free', 'Starter', 'Premium', 'Enterprise'];
    for (const keyword of planKeywords) {
        const count = await page.getByText(keyword).count();
        if (count > 0) {
            pricingFound = true;
            pricingDetails.push(`Found pricing plan: '${keyword}'`);
        }
    }
    
    // Check for footer
    let footerFound = false;
    const footerDetails = [];
    
    const footerCount = await page.locator('footer').count();
    if (footerCount > 0) {
        footerFound = true;
        footerDetails.push(`Found <footer> element(s): ${footerCount}`);
    }
    
    // Look for copyright text
    const copyrightCount1 = await page.getByText('©').count();
    const copyrightCount2 = await page.getByText('Copyright').count();
    if (copyrightCount1 > 0 || copyrightCount2 > 0) {
        footerFound = true;
        footerDetails.push('Found copyright text');
    }
    
    // Check for cookie consent (just informational)
    const cookieModal = await page.getByText('cookie', { exact: false }).count() > 0;
    
    // Print results
    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n📊 CONSOLE MESSAGES (${allConsole.length} total):`);
    if (allConsole.length > 0) {
        allConsole.forEach(msg => console.log(`  ${msg}`));
    } else {
        console.log('  None');
    }
    
    console.log(`\n❌ CONSOLE ERRORS (${consoleErrors.length} total):`);
    if (consoleErrors.length > 0) {
        consoleErrors.forEach(error => console.log(`  ${error}`));
    } else {
        console.log('  None');
    }
    
    console.log(`\n⚠️  CONSOLE WARNINGS (${consoleWarnings.length} total):`);
    if (consoleWarnings.length > 0) {
        consoleWarnings.forEach(warning => console.log(`  ${warning}`));
    } else {
        console.log('  None');
    }
    
    console.log(`\n🧭 NAVIGATION: ${navFound ? '✅ RENDERED' : '❌ NOT RENDERED'}`);
    navDetails.forEach(detail => console.log(`  - ${detail}`));
    
    console.log(`\n💰 PRICING SECTION: ${pricingFound ? '✅ RENDERED' : '❌ NOT RENDERED'}`);
    pricingDetails.forEach(detail => console.log(`  - ${detail}`));
    
    console.log(`\n📄 FOOTER: ${footerFound ? '✅ RENDERED' : '❌ NOT RENDERED'}`);
    footerDetails.forEach(detail => console.log(`  - ${detail}`));
    
    console.log(`\n🍪 COOKIE CONSENT MODAL: ${cookieModal ? 'Present' : 'Not detected'}`);
    
    // Determine if fixed
    const rscErrors = consoleErrors.filter(e => 
        e.includes('RSC') || 
        e.includes('Server Component') || 
        e.toLowerCase().includes('serialization') || 
        e.toLowerCase().includes('serialize')
    );
    const isFixed = rscErrors.length === 0 && navFound && pricingFound && footerFound;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`STATUS: ${isFixed ? '✅ FIXED' : '❌ STILL BROKEN'}`);
    console.log(`${'='.repeat(60)}\n`);
    
    await browser.close();
    
    // Return data for markdown generation
    return {
        consoleErrors,
        consoleWarnings,
        allConsole,
        navFound,
        navDetails,
        pricingFound,
        pricingDetails,
        footerFound,
        footerDetails,
        cookieModal,
        rscErrors,
        isFixed
    };
}

// Run verification
const results = await verifyHomepage();

// Create verification markdown
console.log('Creating verification markdown...');

let errorList = 'None';
if (results.consoleErrors.length > 0) {
    errorList = '\n' + results.consoleErrors.map(e => `  - ${e}`).join('\n');
}

let warningList = '';
if (results.consoleWarnings.length > 0) {
    warningList = `\n\n### Console Warnings (${results.consoleWarnings.length})\n`;
    warningList += results.consoleWarnings.map(w => `  - ${w}`).join('\n');
}

let navStatus = results.navFound ? '✅ RENDERED' : '❌ NOT RENDERED';
if (results.navDetails.length > 0) {
    navStatus += '\n' + results.navDetails.map(d => `  - ${d}`).join('\n');
}

let pricingStatus = results.pricingFound ? '✅ RENDERED' : '❌ NOT RENDERED';
if (results.pricingDetails.length > 0) {
    pricingStatus += '\n' + results.pricingDetails.map(d => `  - ${d}`).join('\n');
}

let footerStatus = results.footerFound ? '✅ RENDERED' : '❌ NOT RENDERED';
if (results.footerDetails.length > 0) {
    footerStatus += '\n' + results.footerDetails.map(d => `  - ${d}`).join('\n');
}

const status = results.isFixed ? '✅ FIXED' : '❌ STILL BROKEN';

const markdownContent = `# Verification: I-001 Homepage RSC Fix

## Before
- Console errors: 3 (RSC serialization error)
- Navigation: ❌ NOT RENDERED
- Pricing section: ❌ NOT RENDERED  
- Footer: ❌ NOT RENDERED

## After

### Console Errors (${results.consoleErrors.length})
${errorList}${warningList}

### Navigation
${navStatus}

### Pricing Section
${pricingStatus}

### Footer
${footerStatus}

### Cookie Consent Modal
${results.cookieModal ? '✅ Present (expected)' : 'Not detected'}

## Status: ${status}

## Notes
- Screenshot saved: \`docs/audit-screenshots/home-after-fix.png\`
- Verification performed: Automated Playwright test
- RSC-specific errors found: ${results.rscErrors.length}
`;

writeFileSync('docs/audit-screenshots/verification-I001.md', markdownContent, 'utf-8');
console.log('✅ Verification markdown saved to docs/audit-screenshots/verification-I001.md');
