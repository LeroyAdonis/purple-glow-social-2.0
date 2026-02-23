"""
Playwright audit script for Purple Glow Social 2.0 public pages
"""
from playwright.sync_api import sync_playwright
import json
from pathlib import Path
from typing import List, Dict, Any

# Project root
PROJECT_ROOT = Path(r"C:\scratchpad\purple-glow-social-2.0")
SCREENSHOTS_DIR = PROJECT_ROOT / "docs" / "audit-screenshots"
BASE_URL = "http://localhost:3000"

# Pages to audit
PAGES = [
    {"url": "/", "slug": "home"},
    {"url": "/login", "slug": "login"},
    {"url": "/signup", "slug": "signup"},
    {"url": "/privacy", "slug": "privacy"},
    {"url": "/terms", "slug": "terms"},
]

class PageAudit:
    def __init__(self):
        self.results = []
        
    def audit_page(self, page, url: str, slug: str) -> Dict[str, Any]:
        """Audit a single page"""
        print(f"\n{'='*60}")
        print(f"Auditing: {url}")
        print(f"{'='*60}")
        
        # Storage for issues
        console_errors = []
        console_warnings = []
        network_errors = []
        visual_observations = []
        accessibility_observations = []
        
        # Set up console listener
        def handle_console(msg):
            msg_type = msg.type
            msg_text = msg.text
            if msg_type == 'error':
                console_errors.append(msg_text)
                print(f"  [CONSOLE ERROR] {msg_text}")
            elif msg_type == 'warning':
                console_warnings.append(msg_text)
                print(f"  [CONSOLE WARNING] {msg_text}")
        
        page.on('console', handle_console)
        
        # Set up network listener
        def handle_response(response):
            status = response.status
            if status >= 400:
                error_msg = f"{response.request.method} {response.url} - {status}"
                network_errors.append(error_msg)
                print(f"  [NETWORK ERROR] {error_msg}")
        
        page.on('response', handle_response)
        
        # Navigate to page
        print(f"  Navigating to {BASE_URL}{url}...")
        try:
            page.goto(f"{BASE_URL}{url}", wait_until='networkidle', timeout=30000)
            print(f"  ✓ Page loaded successfully")
        except Exception as e:
            print(f"  ✗ Failed to load page: {e}")
            return {
                'url': url,
                'slug': slug,
                'error': str(e),
                'console_errors': console_errors,
                'console_warnings': console_warnings,
                'network_errors': network_errors,
                'visual_observations': [f"Failed to load: {e}"],
                'accessibility_observations': []
            }
        
        # Wait a bit for any async operations
        page.wait_for_timeout(1000)
        
        # Take screenshot
        screenshot_path = SCREENSHOTS_DIR / f"{slug}-public.png"
        print(f"  Taking screenshot: {screenshot_path}")
        page.screenshot(path=str(screenshot_path), full_page=True)
        print(f"  ✓ Screenshot saved")
        
        # Visual observations
        print(f"  Analyzing visual layout...")
        
        # Check for broken images
        broken_images = page.evaluate("""
            () => {
                const images = Array.from(document.querySelectorAll('img'));
                return images
                    .filter(img => !img.complete || img.naturalHeight === 0)
                    .map(img => img.src || img.alt || 'unnamed image');
            }
        """)
        if broken_images:
            for img in broken_images:
                visual_observations.append(f"Broken image: {img}")
                print(f"  ⚠ Broken image: {img}")
        
        # Check for horizontal overflow
        has_overflow = page.evaluate("""
            () => {
                return document.body.scrollWidth > document.body.clientWidth;
            }
        """)
        if has_overflow:
            visual_observations.append("Horizontal overflow detected")
            print(f"  ⚠ Horizontal overflow detected")
        
        # Check for elements outside viewport
        overflowing_elements = page.evaluate("""
            () => {
                const elements = Array.from(document.querySelectorAll('*'));
                const bodyWidth = document.body.clientWidth;
                return elements
                    .filter(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.right > bodyWidth + 10; // 10px tolerance
                    })
                    .slice(0, 5) // Limit to 5
                    .map(el => {
                        const tag = el.tagName.toLowerCase();
                        const id = el.id ? `#${el.id}` : '';
                        const cls = el.className ? `.${el.className.split(' ')[0]}` : '';
                        return `${tag}${id}${cls}`;
                    });
            }
        """)
        if overflowing_elements:
            for el in overflowing_elements:
                visual_observations.append(f"Element overflows viewport: {el}")
                print(f"  ⚠ Element overflows: {el}")
        
        # Accessibility observations
        print(f"  Analyzing accessibility...")
        
        # Check for images without alt text
        images_no_alt = page.evaluate("""
            () => {
                const images = Array.from(document.querySelectorAll('img'));
                return images
                    .filter(img => !img.alt || img.alt.trim() === '')
                    .map(img => img.src || img.outerHTML.substring(0, 50))
                    .slice(0, 5);
            }
        """)
        if images_no_alt:
            for img in images_no_alt:
                accessibility_observations.append(f"Image missing alt text: {img}")
                print(f"  ⚠ Image missing alt: {img}")
        
        # Check for buttons without accessible text
        unlabeled_buttons = page.evaluate("""
            () => {
                const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
                return buttons
                    .filter(btn => {
                        const text = btn.textContent.trim();
                        const label = btn.getAttribute('aria-label');
                        const labelledby = btn.getAttribute('aria-labelledby');
                        return !text && !label && !labelledby;
                    })
                    .map(btn => btn.outerHTML.substring(0, 100))
                    .slice(0, 5);
            }
        """)
        if unlabeled_buttons:
            for btn in unlabeled_buttons:
                accessibility_observations.append(f"Unlabeled button: {btn}")
                print(f"  ⚠ Unlabeled button: {btn}")
        
        # Check for inputs without labels
        unlabeled_inputs = page.evaluate("""
            () => {
                const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"])'));
                return inputs
                    .filter(input => {
                        const id = input.id;
                        const label = input.getAttribute('aria-label');
                        const labelledby = input.getAttribute('aria-labelledby');
                        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
                        const placeholder = input.placeholder;
                        return !label && !labelledby && !hasLabel && !placeholder;
                    })
                    .map(input => {
                        const type = input.type;
                        const name = input.name;
                        return `${type} input (name: ${name})`;
                    })
                    .slice(0, 5);
            }
        """)
        if unlabeled_inputs:
            for inp in unlabeled_inputs:
                accessibility_observations.append(f"Unlabeled input: {inp}")
                print(f"  ⚠ Unlabeled input: {inp}")
        
        # Page-specific checks
        if url == "/":
            print(f"  Running homepage-specific checks...")
            
            # Check navigation links
            nav_links = page.evaluate("""
                () => {
                    const nav = document.querySelector('nav');
                    if (!nav) return [];
                    const links = Array.from(nav.querySelectorAll('a'));
                    return links.map(a => ({
                        text: a.textContent.trim(),
                        href: a.href,
                        hasHref: !!a.href
                    }));
                }
            """)
            if nav_links:
                print(f"  ✓ Found {len(nav_links)} navigation links")
                for link in nav_links:
                    if not link['hasHref']:
                        visual_observations.append(f"Navigation link '{link['text']}' missing href")
            else:
                visual_observations.append("No navigation links found")
            
            # Check pricing section
            pricing_info = page.evaluate("""
                () => {
                    const pricingSection = document.body.textContent;
                    const hasZAR = pricingSection.includes('R') || pricingSection.includes('ZAR');
                    const hasPricing = pricingSection.toLowerCase().includes('price') || 
                                      pricingSection.toLowerCase().includes('plan');
                    return { hasZAR, hasPricing };
                }
            """)
            if pricing_info['hasPricing']:
                if pricing_info['hasZAR']:
                    print(f"  ✓ Pricing section found with ZAR currency")
                else:
                    visual_observations.append("Pricing section missing ZAR currency (R)")
            else:
                visual_observations.append("Pricing section not found")
            
            # Check footer
            footer_check = page.evaluate("""
                () => {
                    const footer = document.querySelector('footer');
                    if (!footer) return { exists: false };
                    const rect = footer.getBoundingClientRect();
                    const bodyWidth = document.body.clientWidth;
                    return {
                        exists: true,
                        overflows: rect.right > bodyWidth + 10
                    };
                }
            """)
            if footer_check['exists']:
                if footer_check['overflows']:
                    visual_observations.append("Footer has horizontal overflow")
                    print(f"  ⚠ Footer overflows")
                else:
                    print(f"  ✓ Footer renders without overflow")
            else:
                visual_observations.append("Footer not found")
        
        # Summary
        print(f"  Console errors: {len(console_errors)}")
        print(f"  Console warnings: {len(console_warnings)}")
        print(f"  Network errors: {len(network_errors)}")
        print(f"  Visual issues: {len(visual_observations)}")
        print(f"  Accessibility issues: {len(accessibility_observations)}")
        
        return {
            'url': url,
            'slug': slug,
            'console_errors': console_errors,
            'console_warnings': console_warnings,
            'network_errors': network_errors,
            'visual_observations': visual_observations,
            'accessibility_observations': accessibility_observations
        }
    
    def generate_report(self, results: List[Dict[str, Any]]) -> str:
        """Generate markdown report"""
        
        # Count critical issues
        total_console_errors = sum(len(r.get('console_errors', [])) for r in results)
        total_network_errors = sum(len(r.get('network_errors', [])) for r in results)
        total_visual = sum(len(r.get('visual_observations', [])) for r in results)
        total_a11y = sum(len(r.get('accessibility_observations', [])) for r in results)
        
        # Determine overall status
        if total_console_errors > 0 or total_network_errors > 0:
            status = "⚠️ Issues found requiring attention"
        elif total_visual > 5 or total_a11y > 5:
            status = "⚠️ Minor issues found"
        else:
            status = "✅ All pages audited successfully"
        
        # Build report
        report = f"""# Public Pages Audit Report

**Audit Date:** {Path(__file__).stat().st_mtime}
**Base URL:** {BASE_URL}
**Pages Audited:** {len(results)}

## Summary

{status}

**Totals:**
- Console errors: {total_console_errors}
- Network errors: {total_network_errors}
- Visual observations: {total_visual}
- Accessibility observations: {total_a11y}

## Page Results

"""
        
        # Add each page
        for result in results:
            url = result['url']
            slug = result['slug']
            
            # Handle errors
            if 'error' in result:
                report += f"""### {url} ({slug.title()})
- **Screenshot:** docs/audit-screenshots/{slug}-public.png
- **Status:** ❌ Failed to load
- **Error:** {result['error']}

"""
                continue
            
            console_errors = result.get('console_errors', [])
            console_warnings = result.get('console_warnings', [])
            network_errors = result.get('network_errors', [])
            visual_obs = result.get('visual_observations', [])
            a11y_obs = result.get('accessibility_observations', [])
            
            report += f"""### {url} ({slug.title()})
- **Screenshot:** docs/audit-screenshots/{slug}-public.png
- **Console errors:** {len(console_errors) if console_errors else "none"}
"""
            if console_errors:
                for err in console_errors[:5]:  # Limit to 5
                    report += f"  - {err}\n"
                if len(console_errors) > 5:
                    report += f"  - ... and {len(console_errors) - 5} more\n"
            
            report += f"- **Console warnings:** {len(console_warnings) if console_warnings else "none"}\n"
            if console_warnings:
                for warn in console_warnings[:3]:  # Limit to 3
                    report += f"  - {warn}\n"
                if len(console_warnings) > 3:
                    report += f"  - ... and {len(console_warnings) - 3} more\n"
            
            report += f"- **Network errors:** {len(network_errors) if network_errors else "none"}\n"
            if network_errors:
                for err in network_errors:
                    report += f"  - {err}\n"
            
            report += f"- **Visual observations:** {len(visual_obs) if visual_obs else "none"}\n"
            if visual_obs:
                for obs in visual_obs:
                    report += f"  - {obs}\n"
            
            report += f"- **Accessibility observations:** {len(a11y_obs) if a11y_obs else "none"}\n"
            if a11y_obs:
                for obs in a11y_obs:
                    report += f"  - {obs}\n"
            
            report += "\n"
        
        # Critical issues section
        report += "## Critical Issues Requiring Immediate Attention\n\n"
        
        critical_issues = []
        for result in results:
            url = result['url']
            if 'error' in result:
                critical_issues.append(f"**{url}**: Failed to load - {result['error']}")
            
            # Console errors are critical
            for err in result.get('console_errors', []):
                if 'Failed to fetch' in err or 'TypeError' in err or 'ReferenceError' in err:
                    critical_issues.append(f"**{url}**: {err}")
            
            # Network 500 errors are critical
            for err in result.get('network_errors', []):
                if '500' in err or '503' in err:
                    critical_issues.append(f"**{url}**: {err}")
        
        if critical_issues:
            for issue in critical_issues[:10]:  # Limit to 10
                report += f"- {issue}\n"
            if len(critical_issues) > 10:
                report += f"- ... and {len(critical_issues) - 10} more\n"
        else:
            report += "No critical issues found.\n"
        
        report += "\n---\n\n*This report was generated automatically by Playwright audit script.*\n"
        
        return report
    
    def run(self):
        """Run the full audit"""
        print("="*60)
        print("Purple Glow Social 2.0 - Public Pages Audit")
        print("="*60)
        print(f"Base URL: {BASE_URL}")
        print(f"Screenshots: {SCREENSHOTS_DIR}")
        print(f"Pages to audit: {len(PAGES)}")
        print()
        
        with sync_playwright() as p:
            print("Launching browser...")
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={'width': 1920, 'height': 1080})
            page = context.new_page()
            
            results = []
            for page_info in PAGES:
                result = self.audit_page(page, page_info['url'], page_info['slug'])
                results.append(result)
            
            browser.close()
            print("\n" + "="*60)
            print("Audit complete!")
            print("="*60)
        
        # Generate report
        print("\nGenerating report...")
        report_content = self.generate_report(results)
        report_path = SCREENSHOTS_DIR / "report-public.md"
        report_path.write_text(report_content, encoding='utf-8')
        print(f"✓ Report saved to: {report_path}")
        
        return report_path

if __name__ == "__main__":
    auditor = PageAudit()
    report_path = auditor.run()
    print(f"\n✅ Audit complete! Report: {report_path}")
