from playwright.sync_api import sync_playwright
import time

def verify_homepage():
    console_errors = []
    console_warnings = []
    all_console = []
    
    with sync_playwright() as p:
        # Launch headless chromium
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Set up console message listener
        def handle_console(msg):
            all_console.append(f"[{msg.type}] {msg.text}")
            if msg.type == 'error':
                console_errors.append(msg.text)
            elif msg.type == 'warning':
                console_warnings.append(msg.text)
        
        page.on('console', handle_console)
        
        print("Navigating to http://localhost:3000...")
        page.goto('http://localhost:3000')
        
        # Wait a bit for hot reload if needed
        print("Waiting 10 seconds for potential hot-reload...")
        time.sleep(10)
        
        # Reload to ensure we get latest version
        print("Reloading page...")
        page.reload()
        
        # Wait for networkidle (up to 15 seconds)
        print("Waiting for networkidle...")
        try:
            page.wait_for_load_state('networkidle', timeout=15000)
            print("Page loaded (networkidle)")
        except Exception as e:
            print(f"Networkidle timeout (continuing anyway): {e}")
        
        # Take full-page screenshot
        print("Taking screenshot...")
        page.screenshot(path='docs/audit-screenshots/home-after-fix.png', full_page=True)
        print("Screenshot saved to docs/audit-screenshots/home-after-fix.png")
        
        # Check for elements
        print("\nChecking page elements...")
        
        # Check for navigation/header
        nav_found = False
        nav_details = []
        
        # Try multiple selectors for navigation
        if page.locator('nav').count() > 0:
            nav_found = True
            nav_details.append(f"Found <nav> element(s): {page.locator('nav').count()}")
        
        if page.locator('header').count() > 0:
            nav_found = True
            nav_details.append(f"Found <header> element(s): {page.locator('header').count()}")
        
        # Look for common nav text
        nav_keywords = ['Features', 'Pricing', 'Login', 'Sign Up', 'About', 'Home']
        for keyword in nav_keywords:
            if page.get_by_text(keyword, exact=False).count() > 0:
                nav_found = True
                nav_details.append(f"Found nav text: '{keyword}'")
        
        # Check for pricing section
        pricing_found = False
        pricing_details = []
        
        # Look for ZAR pricing (R followed by numbers)
        if page.get_by_text('R ', exact=False).count() > 0:
            pricing_found = True
            pricing_details.append(f"Found ZAR pricing indicators: {page.get_by_text('R ', exact=False).count()}")
        
        # Look for plan names
        plan_keywords = ['Pro', 'Business', 'Free', 'Starter', 'Premium', 'Enterprise']
        for keyword in plan_keywords:
            if page.get_by_text(keyword, exact=False).count() > 0:
                pricing_found = True
                pricing_details.append(f"Found pricing plan: '{keyword}'")
        
        # Check for footer
        footer_found = False
        footer_details = []
        
        if page.locator('footer').count() > 0:
            footer_found = True
            footer_details.append(f"Found <footer> element(s): {page.locator('footer').count()}")
        
        # Look for copyright text
        if page.get_by_text('©', exact=False).count() > 0 or page.get_by_text('Copyright', exact=False).count() > 0:
            footer_found = True
            footer_details.append("Found copyright text")
        
        # Check for cookie consent (just informational)
        cookie_modal = page.get_by_text('cookie', exact=False).count() > 0
        
        # Print results
        print("\n" + "="*60)
        print("VERIFICATION RESULTS")
        print("="*60)
        
        print(f"\n📊 CONSOLE MESSAGES ({len(all_console)} total):")
        if all_console:
            for msg in all_console:
                print(f"  {msg}")
        else:
            print("  None")
        
        print(f"\n❌ CONSOLE ERRORS ({len(console_errors)} total):")
        if console_errors:
            for error in console_errors:
                print(f"  {error}")
        else:
            print("  None")
        
        print(f"\n⚠️  CONSOLE WARNINGS ({len(console_warnings)} total):")
        if console_warnings:
            for warning in console_warnings:
                print(f"  {warning}")
        else:
            print("  None")
        
        print(f"\n🧭 NAVIGATION: {'✅ RENDERED' if nav_found else '❌ NOT RENDERED'}")
        for detail in nav_details:
            print(f"  - {detail}")
        
        print(f"\n💰 PRICING SECTION: {'✅ RENDERED' if pricing_found else '❌ NOT RENDERED'}")
        for detail in pricing_details:
            print(f"  - {detail}")
        
        print(f"\n📄 FOOTER: {'✅ RENDERED' if footer_found else '❌ NOT RENDERED'}")
        for detail in footer_details:
            print(f"  - {detail}")
        
        print(f"\n🍪 COOKIE CONSENT MODAL: {'Present' if cookie_modal else 'Not detected'}")
        
        # Determine if fixed
        rsc_errors = [e for e in console_errors if 'RSC' in e or 'Server Component' in e or 'serialization' in e.lower() or 'serialize' in e.lower()]
        is_fixed = len(rsc_errors) == 0 and nav_found and pricing_found and footer_found
        
        print(f"\n{'='*60}")
        print(f"STATUS: {'✅ FIXED' if is_fixed else '❌ STILL BROKEN'}")
        print(f"{'='*60}\n")
        
        browser.close()
        
        # Return data for markdown generation
        return {
            'console_errors': console_errors,
            'console_warnings': console_warnings,
            'all_console': all_console,
            'nav_found': nav_found,
            'nav_details': nav_details,
            'pricing_found': pricing_found,
            'pricing_details': pricing_details,
            'footer_found': footer_found,
            'footer_details': footer_details,
            'cookie_modal': cookie_modal,
            'rsc_errors': rsc_errors,
            'is_fixed': is_fixed
        }

if __name__ == '__main__':
    results = verify_homepage()
    
    # Create verification markdown
    print("Creating verification markdown...")
    
    error_list = "None"
    if results['console_errors']:
        error_list = "\n".join([f"  - {e}" for e in results['console_errors']])
    
    warning_list = ""
    if results['console_warnings']:
        warning_list = f"\n\n### Console Warnings ({len(results['console_warnings'])})\n"
        warning_list += "\n".join([f"  - {w}" for w in results['console_warnings']])
    
    nav_status = "✅ RENDERED" if results['nav_found'] else "❌ NOT RENDERED"
    if results['nav_details']:
        nav_status += "\n" + "\n".join([f"  - {d}" for d in results['nav_details']])
    
    pricing_status = "✅ RENDERED" if results['pricing_found'] else "❌ NOT RENDERED"
    if results['pricing_details']:
        pricing_status += "\n" + "\n".join([f"  - {d}" for d in results['pricing_details']])
    
    footer_status = "✅ RENDERED" if results['footer_found'] else "❌ NOT RENDERED"
    if results['footer_details']:
        footer_status += "\n" + "\n".join([f"  - {d}" for d in results['footer_details']])
    
    status = "✅ FIXED" if results['is_fixed'] else "❌ STILL BROKEN"
    
    markdown_content = f"""# Verification: I-001 Homepage RSC Fix

## Before
- Console errors: 3 (RSC serialization error)
- Navigation: ❌ NOT RENDERED
- Pricing section: ❌ NOT RENDERED  
- Footer: ❌ NOT RENDERED

## After

### Console Errors ({len(results['console_errors'])})
{error_list}{warning_list}

### Navigation
{nav_status}

### Pricing Section
{pricing_status}

### Footer
{footer_status}

### Cookie Consent Modal
{"✅ Present (expected)" if results['cookie_modal'] else "Not detected"}

## Status: {status}

## Notes
- Screenshot saved: `docs/audit-screenshots/home-after-fix.png`
- Verification performed: Automated Playwright test
- RSC-specific errors found: {len(results['rsc_errors'])}
"""
    
    with open('docs/audit-screenshots/verification-I001.md', 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print("✅ Verification markdown saved to docs/audit-screenshots/verification-I001.md")
