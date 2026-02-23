/**
 * Playwright audit script for Purple Glow Social 2.0 public pages
 */
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = process.cwd();
const SCREENSHOTS_DIR = join(PROJECT_ROOT, 'docs', 'audit-screenshots');
const BASE_URL = 'http://localhost:3000';

// Ensure screenshots directory exists
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const PAGES = [
    { url: '/', slug: 'home' },
    { url: '/login', slug: 'login' },
    { url: '/signup', slug: 'signup' },
    { url: '/privacy', slug: 'privacy' },
    { url: '/terms', slug: 'terms' },
];

async function auditPage(page, url, slug) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Auditing: ${url}`);
    console.log(`${'='.repeat(60)}`);

    const consoleErrors = [];
    const consoleWarnings = [];
    const networkErrors = [];
    const visualObservations = [];
    const accessibilityObservations = [];

    // Set up console listener
    page.on('console', (msg) => {
        const msgType = msg.type();
        const msgText = msg.text();
        if (msgType === 'error') {
            consoleErrors.push(msgText);
            console.log(`  [CONSOLE ERROR] ${msgText}`);
        } else if (msgType === 'warning') {
            consoleWarnings.push(msgText);
            console.log(`  [CONSOLE WARNING] ${msgText}`);
        }
    });

    // Set up network listener
    page.on('response', (response) => {
        const status = response.status();
        if (status >= 400) {
            const errorMsg = `${response.request().method()} ${response.url()} - ${status}`;
            networkErrors.push(errorMsg);
            console.log(`  [NETWORK ERROR] ${errorMsg}`);
        }
    });

    // Navigate to page
    console.log(`  Navigating to ${BASE_URL}${url}...`);
    try {
        await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle', timeout: 30000 });
        console.log(`  ✓ Page loaded successfully`);
    } catch (e) {
        console.log(`  ✗ Failed to load page: ${e.message}`);
        return {
            url,
            slug,
            error: e.message,
            consoleErrors,
            consoleWarnings,
            networkErrors,
            visualObservations: [`Failed to load: ${e.message}`],
            accessibilityObservations: []
        };
    }

    // Wait a bit for any async operations
    await page.waitForTimeout(1000);

    // Take screenshot
    const screenshotPath = join(SCREENSHOTS_DIR, `${slug}-public.png`);
    console.log(`  Taking screenshot: ${screenshotPath}`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`  ✓ Screenshot saved`);

    // Visual observations
    console.log(`  Analyzing visual layout...`);

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
            .filter((img) => !img.complete || img.naturalHeight === 0)
            .map((img) => img.src || img.alt || 'unnamed image');
    });
    if (brokenImages.length > 0) {
        brokenImages.forEach((img) => {
            visualObservations.push(`Broken image: ${img}`);
            console.log(`  ⚠ Broken image: ${img}`);
        });
    }

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
    });
    if (hasOverflow) {
        visualObservations.push('Horizontal overflow detected');
        console.log(`  ⚠ Horizontal overflow detected`);
    }

    // Check for elements outside viewport
    const overflowingElements = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const bodyWidth = document.body.clientWidth;
        return elements
            .filter((el) => {
                const rect = el.getBoundingClientRect();
                return rect.right > bodyWidth + 10;
            })
            .slice(0, 5)
            .map((el) => {
                const tag = el.tagName.toLowerCase();
                const id = el.id ? `#${el.id}` : '';
                const cls = el.className ? `.${el.className.split(' ')[0]}` : '';
                return `${tag}${id}${cls}`;
            });
    });
    if (overflowingElements.length > 0) {
        overflowingElements.forEach((el) => {
            visualObservations.push(`Element overflows viewport: ${el}`);
            console.log(`  ⚠ Element overflows: ${el}`);
        });
    }

    // Accessibility observations
    console.log(`  Analyzing accessibility...`);

    // Check for images without alt text
    const imagesNoAlt = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
            .filter((img) => !img.alt || img.alt.trim() === '')
            .map((img) => img.src || img.outerHTML.substring(0, 50))
            .slice(0, 5);
    });
    if (imagesNoAlt.length > 0) {
        imagesNoAlt.forEach((img) => {
            accessibilityObservations.push(`Image missing alt text: ${img}`);
            console.log(`  ⚠ Image missing alt: ${img}`);
        });
    }

    // Check for buttons without accessible text
    const unlabeledButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
        return buttons
            .filter((btn) => {
                const text = btn.textContent.trim();
                const label = btn.getAttribute('aria-label');
                const labelledby = btn.getAttribute('aria-labelledby');
                return !text && !label && !labelledby;
            })
            .map((btn) => btn.outerHTML.substring(0, 100))
            .slice(0, 5);
    });
    if (unlabeledButtons.length > 0) {
        unlabeledButtons.forEach((btn) => {
            accessibilityObservations.push(`Unlabeled button: ${btn}`);
            console.log(`  ⚠ Unlabeled button: ${btn}`);
        });
    }

    // Check for inputs without labels
    const unlabeledInputs = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"])'));
        return inputs
            .filter((input) => {
                const id = input.id;
                const label = input.getAttribute('aria-label');
                const labelledby = input.getAttribute('aria-labelledby');
                const hasLabel = id && document.querySelector(`label[for="${id}"]`);
                const placeholder = input.placeholder;
                return !label && !labelledby && !hasLabel && !placeholder;
            })
            .map((input) => {
                const type = input.type;
                const name = input.name;
                return `${type} input (name: ${name})`;
            })
            .slice(0, 5);
    });
    if (unlabeledInputs.length > 0) {
        unlabeledInputs.forEach((inp) => {
            accessibilityObservations.push(`Unlabeled input: ${inp}`);
            console.log(`  ⚠ Unlabeled input: ${inp}`);
        });
    }

    // Page-specific checks
    if (url === '/') {
        console.log(`  Running homepage-specific checks...`);

        // Check navigation links
        const navLinks = await page.evaluate(() => {
            const nav = document.querySelector('nav');
            if (!nav) return [];
            const links = Array.from(nav.querySelectorAll('a'));
            return links.map((a) => ({
                text: a.textContent.trim(),
                href: a.href,
                hasHref: !!a.href
            }));
        });
        if (navLinks.length > 0) {
            console.log(`  ✓ Found ${navLinks.length} navigation links`);
            navLinks.forEach((link) => {
                if (!link.hasHref) {
                    visualObservations.push(`Navigation link '${link.text}' missing href`);
                }
            });
        } else {
            visualObservations.push('No navigation links found');
        }

        // Check pricing section
        const pricingInfo = await page.evaluate(() => {
            const pricingSection = document.body.textContent || '';
            const hasZAR = pricingSection.includes('R') || pricingSection.includes('ZAR');
            const hasPricing = pricingSection.toLowerCase().includes('price') || 
                              pricingSection.toLowerCase().includes('plan');
            return { hasZAR, hasPricing };
        });
        if (pricingInfo.hasPricing) {
            if (pricingInfo.hasZAR) {
                console.log(`  ✓ Pricing section found with ZAR currency`);
            } else {
                visualObservations.push('Pricing section missing ZAR currency (R)');
            }
        } else {
            visualObservations.push('Pricing section not found');
        }

        // Check footer
        const footerCheck = await page.evaluate(() => {
            const footer = document.querySelector('footer');
            if (!footer) return { exists: false };
            const rect = footer.getBoundingClientRect();
            const bodyWidth = document.body.clientWidth;
            return {
                exists: true,
                overflows: rect.right > bodyWidth + 10
            };
        });
        if (footerCheck.exists) {
            if (footerCheck.overflows) {
                visualObservations.push('Footer has horizontal overflow');
                console.log(`  ⚠ Footer overflows`);
            } else {
                console.log(`  ✓ Footer renders without overflow`);
            }
        } else {
            visualObservations.push('Footer not found');
        }
    }

    // Summary
    console.log(`  Console errors: ${consoleErrors.length}`);
    console.log(`  Console warnings: ${consoleWarnings.length}`);
    console.log(`  Network errors: ${networkErrors.length}`);
    console.log(`  Visual issues: ${visualObservations.length}`);
    console.log(`  Accessibility issues: ${accessibilityObservations.length}`);

    return {
        url,
        slug,
        consoleErrors,
        consoleWarnings,
        networkErrors,
        visualObservations,
        accessibilityObservations
    };
}

function generateReport(results) {
    // Count critical issues
    const totalConsoleErrors = results.reduce((sum, r) => sum + r.consoleErrors.length, 0);
    const totalNetworkErrors = results.reduce((sum, r) => sum + r.networkErrors.length, 0);
    const totalVisual = results.reduce((sum, r) => sum + r.visualObservations.length, 0);
    const totalA11y = results.reduce((sum, r) => sum + r.accessibilityObservations.length, 0);

    // Determine overall status
    let status;
    if (totalConsoleErrors > 0 || totalNetworkErrors > 0) {
        status = '⚠️ Issues found requiring attention';
    } else if (totalVisual > 5 || totalA11y > 5) {
        status = '⚠️ Minor issues found';
    } else {
        status = '✅ All pages audited successfully';
    }

    // Build report
    let report = `# Public Pages Audit Report

**Audit Date:** ${new Date().toISOString()}
**Base URL:** ${BASE_URL}
**Pages Audited:** ${results.length}

## Summary

${status}

**Totals:**
- Console errors: ${totalConsoleErrors}
- Network errors: ${totalNetworkErrors}
- Visual observations: ${totalVisual}
- Accessibility observations: ${totalA11y}

## Page Results

`;

    // Add each page
    results.forEach(result => {
        const { url, slug, error, consoleErrors, consoleWarnings, networkErrors, 
                visualObservations, accessibilityObservations } = result;

        // Handle errors
        if (error) {
            report += `### ${url} (${slug.charAt(0).toUpperCase() + slug.slice(1)})
- **Screenshot:** docs/audit-screenshots/${slug}-public.png
- **Status:** ❌ Failed to load
- **Error:** ${error}

`;
            return;
        }

        report += `### ${url} (${slug.charAt(0).toUpperCase() + slug.slice(1)})
- **Screenshot:** docs/audit-screenshots/${slug}-public.png
- **Console errors:** ${consoleErrors.length > 0 ? consoleErrors.length : 'none'}
`;
        if (consoleErrors.length > 0) {
            consoleErrors.slice(0, 5).forEach(err => {
                report += `  - ${err}\n`;
            });
            if (consoleErrors.length > 5) {
                report += `  - ... and ${consoleErrors.length - 5} more\n`;
            }
        }

        report += `- **Console warnings:** ${consoleWarnings.length > 0 ? consoleWarnings.length : 'none'}\n`;
        if (consoleWarnings.length > 0) {
            consoleWarnings.slice(0, 3).forEach(warn => {
                report += `  - ${warn}\n`;
            });
            if (consoleWarnings.length > 3) {
                report += `  - ... and ${consoleWarnings.length - 3} more\n`;
            }
        }

        report += `- **Network errors:** ${networkErrors.length > 0 ? networkErrors.length : 'none'}\n`;
        if (networkErrors.length > 0) {
            networkErrors.forEach(err => {
                report += `  - ${err}\n`;
            });
        }

        report += `- **Visual observations:** ${visualObservations.length > 0 ? visualObservations.length : 'none'}\n`;
        if (visualObservations.length > 0) {
            visualObservations.forEach(obs => {
                report += `  - ${obs}\n`;
            });
        }

        report += `- **Accessibility observations:** ${accessibilityObservations.length > 0 ? accessibilityObservations.length : 'none'}\n`;
        if (accessibilityObservations.length > 0) {
            accessibilityObservations.forEach(obs => {
                report += `  - ${obs}\n`;
            });
        }

        report += '\n';
    });

    // Critical issues section
    report += '## Critical Issues Requiring Immediate Attention\n\n';

    const criticalIssues = [];
    results.forEach(result => {
        const { url, error, consoleErrors, networkErrors } = result;
        
        if (error) {
            criticalIssues.push(`**${url}**: Failed to load - ${error}`);
        }

        // Console errors are critical
        consoleErrors.forEach(err => {
            if (err.includes('Failed to fetch') || err.includes('TypeError') || err.includes('ReferenceError')) {
                criticalIssues.push(`**${url}**: ${err}`);
            }
        });

        // Network 500 errors are critical
        networkErrors.forEach(err => {
            if (err.includes('500') || err.includes('503')) {
                criticalIssues.push(`**${url}**: ${err}`);
            }
        });
    });

    if (criticalIssues.length > 0) {
        criticalIssues.slice(0, 10).forEach(issue => {
            report += `- ${issue}\n`;
        });
        if (criticalIssues.length > 10) {
            report += `- ... and ${criticalIssues.length - 10} more\n`;
        }
    } else {
        report += 'No critical issues found.\n';
    }

    report += '\n---\n\n*This report was generated automatically by Playwright audit script.*\n';

    return report;
}

async function run() {
    console.log('='.repeat(60));
    console.log('Purple Glow Social 2.0 - Public Pages Audit');
    console.log('='.repeat(60));
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Screenshots: ${SCREENSHOTS_DIR}`);
    console.log(`Pages to audit: ${PAGES.length}`);
    console.log();

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    const results = [];
    for (const pageInfo of PAGES) {
        const result = await auditPage(page, pageInfo.url, pageInfo.slug);
        results.push(result);
    }

    await browser.close();
    console.log('\n' + '='.repeat(60));
    console.log('Audit complete!');
    console.log('='.repeat(60));

    // Generate report
    console.log('\nGenerating report...');
    const reportContent = generateReport(results);
    const reportPath = join(SCREENSHOTS_DIR, 'report-public.md');
    writeFileSync(reportPath, reportContent, 'utf-8');
    console.log(`✓ Report saved to: ${reportPath}`);

    return reportPath;
}

run()
    .then(reportPath => {
        console.log(`\n✅ Audit complete! Report: ${reportPath}`);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Audit failed:', err);
        process.exit(1);
    });
