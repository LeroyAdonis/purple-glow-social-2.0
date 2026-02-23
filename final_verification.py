"""
Final verification sweep for Purple Glow Social 2.0
Tests all previously identified issues to confirm they are resolved.
"""
from playwright.sync_api import sync_playwright
import time

def test_purple_glow_social():
    console_messages = {
        'homepage': [],
        'login': [],
        'dashboard': [],
        'content_generator': []
    }
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            ignore_https_errors=True
        )
        page = context.new_page()
        
        # Set up console message capture
        def capture_console(msg, section):
            msg_type = msg.type
            msg_text = msg.text
            console_messages[section].append({
                'type': msg_type,
                'text': msg_text
            })
            print(f"[{section.upper()}] [{msg_type.upper()}] {msg_text}")
        
        print("\n" + "="*80)
        print("STEP 1: TESTING HOMEPAGE (http://localhost:3000)")
        print("="*80)
        
        # Clear homepage console messages
        console_messages['homepage'] = []
        page.on('console', lambda msg: capture_console(msg, 'homepage'))
        
        try:
            page.goto('http://localhost:3000', wait_until='networkidle', timeout=30000)
            time.sleep(3)  # Wait for any delayed renders
            
            # Take screenshot
            page.screenshot(path='homepage.png', full_page=True)
            print("\n✓ Screenshot saved: homepage.png")
            
            # Check for key elements
            print("\nChecking homepage elements:")
            
            # Navigation
            nav_visible = page.locator('nav').is_visible()
            print(f"  - Navigation bar: {'✓ Visible' if nav_visible else '✗ NOT VISIBLE'}")
            
            # Hero section
            hero_visible = len(page.locator('text=/Purple Glow Social/i').all()) > 0
            print(f"  - Hero section: {'✓ Visible' if hero_visible else '✗ NOT VISIBLE'}")
            
            # Pricing section - check for all three price points
            pricing_r0 = page.locator('text=/R0/i').count() > 0
            pricing_r299 = page.locator('text=/R299/i').count() > 0
            pricing_r999 = page.locator('text=/R999/i').count() > 0
            print(f"  - Pricing R0: {'✓ Found' if pricing_r0 else '✗ NOT FOUND'}")
            print(f"  - Pricing R299: {'✓ Found' if pricing_r299 else '✗ NOT FOUND'}")
            print(f"  - Pricing R999: {'✓ Found' if pricing_r999 else '✗ NOT FOUND'}")
            
        except Exception as e:
            print(f"\n✗ Error loading homepage: {e}")
        
        # Analyze homepage console messages
        print("\n--- Homepage Console Messages ---")
        homepage_errors = [m for m in console_messages['homepage'] if m['type'] == 'error']
        homepage_warnings = [m for m in console_messages['homepage'] if m['type'] == 'warning']
        
        if homepage_errors:
            print(f"\n❌ FOUND {len(homepage_errors)} CONSOLE ERROR(S):")
            for i, err in enumerate(homepage_errors, 1):
                print(f"  {i}. {err['text']}")
        else:
            print("\n✅ ZERO console errors on homepage")
        
        if homepage_warnings:
            print(f"\nFound {len(homepage_warnings)} warning(s):")
            for i, warn in enumerate(homepage_warnings, 1):
                print(f"  {i}. {warn['text']}")
        
        print("\n" + "="*80)
        print("STEP 2: TESTING LOGIN FLOW")
        print("="*80)
        
        # Clear login console messages
        console_messages['login'] = []
        page.remove_all_listeners('console')
        page.on('console', lambda msg: capture_console(msg, 'login'))
        
        try:
            page.goto('http://localhost:3000/login', wait_until='networkidle', timeout=30000)
            time.sleep(2)
            
            # Take screenshot before login
            page.screenshot(path='login_before.png', full_page=True)
            print("\n✓ Screenshot saved: login_before.png")
            
            # Fill in login form
            print("\nFilling login form:")
            print("  - Email: pro@test.purpleglow.co.za")
            print("  - Password: TestPro123!")
            
            email_input = page.locator('input[type="email"], input[name="email"]').first
            password_input = page.locator('input[type="password"], input[name="password"]').first
            
            email_input.fill('pro@test.purpleglow.co.za')
            password_input.fill('TestPro123!')
            
            time.sleep(1)
            
            # Submit form
            print("\nSubmitting login form...")
            submit_button = page.locator('button[type="submit"]').first
            submit_button.click()
            
            # Wait for navigation or error
            time.sleep(5)  # Give time for redirect or error to appear
            
            # Take screenshot after login attempt
            current_url = page.url
            page.screenshot(path='login_after.png', full_page=True)
            print(f"\n✓ Screenshot saved: login_after.png")
            print(f"  Current URL: {current_url}")
            
            # Check for error messages in UI
            error_elements = page.locator('text=/error/i, text=/failed/i, [class*="error"], [role="alert"]').all()
            if error_elements:
                print(f"\n⚠ Found {len(error_elements)} potential error element(s) in UI:")
                for elem in error_elements[:5]:  # Limit to first 5
                    try:
                        text = elem.text_content()
                        if text and len(text.strip()) > 0:
                            print(f"  - {text.strip()[:100]}")
                    except:
                        pass
            
        except Exception as e:
            print(f"\n✗ Error during login flow: {e}")
        
        # Analyze login console messages
        print("\n--- Login Console Messages ---")
        login_errors = [m for m in console_messages['login'] if m['type'] == 'error']
        login_warnings = [m for m in console_messages['login'] if m['type'] == 'warning']
        
        # Check specifically for "Session cookie not created" error
        session_cookie_error = [m for m in login_errors if 'session cookie not created' in m['text'].lower()]
        
        if session_cookie_error:
            print(f"\n❌ FOUND 'Session cookie not created' ERROR:")
            for err in session_cookie_error:
                print(f"  {err['text']}")
        else:
            print("\n✅ NO 'Session cookie not created' error found")
        
        if login_errors:
            print(f"\nAll console errors during login ({len(login_errors)}):")
            for i, err in enumerate(login_errors, 1):
                print(f"  {i}. {err['text']}")
        else:
            print("\n✅ ZERO console errors during login")
        
        print("\n" + "="*80)
        print("STEP 3: TESTING DASHBOARD")
        print("="*80)
        
        # Clear dashboard console messages
        console_messages['dashboard'] = []
        page.remove_all_listeners('console')
        page.on('console', lambda msg: capture_console(msg, 'dashboard'))
        
        try:
            # Navigate to dashboard (should already be there if login succeeded)
            if '/dashboard' not in page.url:
                print("\nNavigating to dashboard...")
                page.goto('http://localhost:3000/dashboard', wait_until='networkidle', timeout=30000)
            else:
                print("\nAlready on dashboard page")
            
            # Wait for components to load
            print("\nWaiting 5 seconds for all dashboard components to load...")
            time.sleep(5)
            
            # Take screenshot
            page.screenshot(path='dashboard.png', full_page=True)
            print("\n✓ Screenshot saved: dashboard.png")
            
            # Check for visible elements
            print("\nChecking dashboard elements:")
            dashboard_heading = page.locator('text=/dashboard/i, text=/welcome/i').count() > 0
            print(f"  - Dashboard heading: {'✓ Found' if dashboard_heading else '✗ NOT FOUND'}")
            
        except Exception as e:
            print(f"\n✗ Error loading dashboard: {e}")
        
        # Analyze dashboard console messages
        print("\n--- Dashboard Console Messages ---")
        dashboard_errors = [m for m in console_messages['dashboard'] if m['type'] == 'error']
        dashboard_warnings = [m for m in console_messages['dashboard'] if m['type'] == 'warning']
        
        # Check for specific errors
        failed_to_fetch = [m for m in dashboard_errors if 'failed to fetch' in m['text'].lower()]
        failed_fetch_limits = [m for m in dashboard_errors if 'failed to fetch limits' in m['text'].lower()]
        failed_fetch_profile = [m for m in dashboard_errors if 'failed to fetch user profile' in m['text'].lower()]
        typeerror_fetch = [m for m in dashboard_errors if 'typeerror' in m['text'].lower() and 'fetch' in m['text'].lower()]
        
        print("\nSpecific error checks:")
        if typeerror_fetch:
            print(f"  ❌ FOUND 'TypeError: Failed to fetch' ({len(typeerror_fetch)}):")
            for err in typeerror_fetch:
                print(f"     {err['text']}")
        else:
            print("  ✅ NO 'TypeError: Failed to fetch' errors")
        
        if failed_fetch_limits:
            print(f"  ❌ FOUND 'Failed to fetch limits' ({len(failed_fetch_limits)}):")
            for err in failed_fetch_limits:
                print(f"     {err['text']}")
        else:
            print("  ✅ NO 'Failed to fetch limits' errors")
        
        if failed_fetch_profile:
            print(f"  ❌ FOUND 'Failed to fetch user profile' ({len(failed_fetch_profile)}):")
            for err in failed_fetch_profile:
                print(f"     {err['text']}")
        else:
            print("  ✅ NO 'Failed to fetch user profile' errors")
        
        if dashboard_errors:
            print(f"\nAll console errors on dashboard ({len(dashboard_errors)}):")
            for i, err in enumerate(dashboard_errors, 1):
                print(f"  {i}. {err['text']}")
        else:
            print("\n✅ ZERO console errors on dashboard")
        
        print("\n" + "="*80)
        print("STEP 4: TESTING CONTENT GENERATOR (if visible)")
        print("="*80)
        
        # Clear content generator console messages
        console_messages['content_generator'] = []
        page.remove_all_listeners('console')
        page.on('console', lambda msg: capture_console(msg, 'content_generator'))
        
        try:
            # Look for content generator links/tabs
            content_gen_links = page.locator('text=/AI Content/i, text=/Content Generator/i, text=/Content Studio/i').all()
            
            if content_gen_links:
                print(f"\nFound {len(content_gen_links)} content generator link(s)")
                print("Clicking first content generator link...")
                content_gen_links[0].click()
                time.sleep(5)  # Wait for content to load
                
                page.screenshot(path='content_generator.png', full_page=True)
                print("\n✓ Screenshot saved: content_generator.png")
                
                # Check for errors
                cg_errors = [m for m in console_messages['content_generator'] if m['type'] == 'error']
                if cg_errors:
                    print(f"\n❌ FOUND {len(cg_errors)} console error(s) in content generator:")
                    for i, err in enumerate(cg_errors, 1):
                        print(f"  {i}. {err['text']}")
                else:
                    print("\n✅ ZERO console errors in content generator")
            else:
                print("\n⚠ No content generator links found on dashboard")
                print("  (This may be normal depending on the dashboard layout)")
                
        except Exception as e:
            print(f"\n✗ Error testing content generator: {e}")
        
        browser.close()
    
    # Final Summary
    print("\n" + "="*80)
    print("FINAL SUMMARY")
    print("="*80)
    
    total_issues = 0
    
    # Homepage
    homepage_errors = [m for m in console_messages['homepage'] if m['type'] == 'error']
    if homepage_errors:
        print(f"\n❌ HOMEPAGE: {len(homepage_errors)} console error(s) found")
        total_issues += len(homepage_errors)
        for err in homepage_errors:
            print(f"     {err['text']}")
    else:
        print("\n✅ HOMEPAGE: All issues confirmed fixed (zero console errors)")
    
    # Login
    login_errors = [m for m in console_messages['login'] if m['type'] == 'error']
    session_cookie_error = [m for m in login_errors if 'session cookie not created' in m['text'].lower()]
    if session_cookie_error:
        print(f"\n❌ LOGIN: 'Session cookie not created' error still present")
        total_issues += 1
        for err in session_cookie_error:
            print(f"     {err['text']}")
    else:
        print("\n✅ LOGIN: 'Session cookie not created' issue confirmed fixed")
    
    # Dashboard
    dashboard_errors = [m for m in console_messages['dashboard'] if m['type'] == 'error']
    failed_to_fetch = [m for m in dashboard_errors if 'failed to fetch' in m['text'].lower()]
    if failed_to_fetch:
        print(f"\n❌ DASHBOARD: {len(failed_to_fetch)} 'Failed to fetch' error(s) found")
        total_issues += len(failed_to_fetch)
        for err in failed_to_fetch:
            print(f"     {err['text']}")
    else:
        print("\n✅ DASHBOARD: All fetch errors confirmed fixed")
    
    if total_issues == 0:
        print("\n" + "="*80)
        print("🎉 ALL ISSUES CONFIRMED FIXED! 🎉")
        print("="*80)
    else:
        print(f"\n⚠ {total_issues} issue(s) still present - see details above")
    
    print("\nScreenshots saved:")
    print("  - homepage.png")
    print("  - login_before.png")
    print("  - login_after.png")
    print("  - dashboard.png")
    if console_messages['content_generator']:
        print("  - content_generator.png")

if __name__ == '__main__':
    test_purple_glow_social()
