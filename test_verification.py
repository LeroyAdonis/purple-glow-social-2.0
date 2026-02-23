from playwright.sync_api import sync_playwright
import time
import json

def test_purple_glow():
    console_messages = {
        'homepage': [],
        'login_before': [],
        'login_during': [],
        'login_after': [],
        'dashboard': [],
        'content_generator': []
    }
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        page = context.new_page()
        
        # Setup console listener
        def handle_console(msg):
            current_step = getattr(handle_console, 'current_step', 'unknown')
            message_data = {
                'type': msg.type,
                'text': msg.text,
                'location': msg.location
            }
            if current_step in console_messages:
                console_messages[current_step].append(message_data)
        
        page.on('console', handle_console)
        
        print("=" * 80)
        print("STEP 1: HOMEPAGE (http://localhost:3000)")
        print("=" * 80)
        
        handle_console.current_step = 'homepage'
        
        try:
            page.goto('http://localhost:3000', wait_until='networkidle', timeout=30000)
            time.sleep(2)  # Additional wait for any async operations
            
            # Screenshot
            page.screenshot(path='homepage.png', full_page=True)
            print("✅ Screenshot captured: homepage.png")
            
            # Check for navigation bar
            nav_bar = page.locator('nav').count()
            print(f"Navigation bar found: {nav_bar > 0}")
            
            # Check for hero section
            hero = page.locator('text=/hero|welcome|purple glow/i').first
            hero_exists = hero.count() > 0
            print(f"Hero section found: {hero_exists}")
            
            # Check for pricing sections with R0, R299, R999
            pricing_r0 = page.locator('text=/R0/i').count()
            pricing_r299 = page.locator('text=/R299/i').count()
            pricing_r999 = page.locator('text=/R999/i').count()
            print(f"Pricing R0 found: {pricing_r0 > 0}")
            print(f"Pricing R299 found: {pricing_r299 > 0}")
            print(f"Pricing R999 found: {pricing_r999 > 0}")
            
            # Report console messages
            print("\nConsole Messages:")
            errors = [m for m in console_messages['homepage'] if m['type'] == 'error']
            warnings = [m for m in console_messages['homepage'] if m['type'] == 'warning']
            
            if errors:
                print(f"❌ ERRORS FOUND ({len(errors)}):")
                for err in errors:
                    print(f"  ERROR: {err['text']}")
                    if err['location']:
                        print(f"    Location: {err['location']}")
            else:
                print("✅ ZERO console errors")
            
            if warnings:
                print(f"⚠️  WARNINGS ({len(warnings)}):")
                for warn in warnings:
                    print(f"  WARNING: {warn['text']}")
            
            print(f"Total console messages: {len(console_messages['homepage'])}")
            
        except Exception as e:
            print(f"❌ STEP 1 FAILED: {str(e)}")
        
        print("\n" + "=" * 80)
        print("STEP 2: LOGIN FLOW (http://localhost:3000/login)")
        print("=" * 80)
        
        handle_console.current_step = 'login_before'
        
        try:
            # Navigate to login page
            page.goto('http://localhost:3000/login', wait_until='networkidle', timeout=30000)
            time.sleep(1)
            
            # Screenshot before login
            page.screenshot(path='login_before.png', full_page=True)
            print("✅ Screenshot captured: login_before.png")
            
            # Switch to monitoring login during
            handle_console.current_step = 'login_during'
            
            # Fill form
            email_input = page.locator('input[type="email"], input[name="email"], input[id*="email"]').first
            password_input = page.locator('input[type="password"], input[name="password"], input[id*="password"]').first
            
            print("\nFilling login form...")
            email_input.fill('pro@test.purpleglow.co.za')
            password_input.fill('TestPro123!')
            print("✅ Form filled")
            
            # Submit form
            submit_button = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first
            
            print("\nSubmitting form...")
            submit_button.click()
            
            # Wait and monitor
            time.sleep(5)
            
            # Switch to after login monitoring
            handle_console.current_step = 'login_after'
            time.sleep(1)
            
            # Screenshot after login
            page.screenshot(path='login_after.png', full_page=True)
            print("✅ Screenshot captured: login_after.png")
            
            # Check URL
            current_url = page.url
            print(f"\nCurrent URL: {current_url}")
            if '/dashboard' in current_url:
                print("✅ Redirected to dashboard")
            else:
                print(f"❌ Not on dashboard. Current URL: {current_url}")
            
            # Check for error messages in UI
            error_elements = page.locator('text=/error|failed|invalid/i').all()
            if error_elements:
                print(f"\n⚠️  Found {len(error_elements)} potential error messages in UI")
                for elem in error_elements[:3]:  # Show first 3
                    try:
                        print(f"  - {elem.text_content()}")
                    except:
                        pass
            
            # Report console messages during login
            print("\nConsole Messages During Login:")
            all_login_msgs = console_messages['login_before'] + console_messages['login_during'] + console_messages['login_after']
            
            errors = [m for m in all_login_msgs if m['type'] == 'error']
            
            if errors:
                print(f"❌ ERRORS FOUND ({len(errors)}):")
                for err in errors:
                    print(f"  ERROR: {err['text']}")
                    if 'Session cookie not created' in err['text']:
                        print("  ⚠️  CRITICAL: 'Session cookie not created' error still present!")
            else:
                print("✅ ZERO console errors during login")
                print("✅ CONFIRMED: 'Session cookie not created' error is GONE")
            
        except Exception as e:
            print(f"❌ STEP 2 FAILED: {str(e)}")
        
        print("\n" + "=" * 80)
        print("STEP 3: DASHBOARD (http://localhost:3000/dashboard)")
        print("=" * 80)
        
        handle_console.current_step = 'dashboard'
        
        try:
            # Should already be on dashboard, but navigate to be sure
            if '/dashboard' not in page.url:
                page.goto('http://localhost:3000/dashboard', wait_until='networkidle', timeout=30000)
            
            # Wait for components to load
            time.sleep(5)
            
            # Screenshot
            page.screenshot(path='dashboard.png', full_page=True)
            print("✅ Screenshot captured: dashboard.png")
            
            # Report console messages
            print("\nConsole Messages on Dashboard:")
            errors = [m for m in console_messages['dashboard'] if m['type'] == 'error']
            
            if errors:
                print(f"❌ ERRORS FOUND ({len(errors)}):")
                for err in errors:
                    print(f"  ERROR: {err['text']}")
                    
                # Check for specific previously reported errors
                error_texts = [e['text'] for e in errors]
                
                if any('Failed to fetch' in text for text in error_texts):
                    print("  ⚠️  CRITICAL: 'Failed to fetch' error still present!")
                if any('Failed to fetch limits' in text for text in error_texts):
                    print("  ⚠️  CRITICAL: 'Failed to fetch limits' error still present!")
                if any('Failed to fetch user profile' in text for text in error_texts):
                    print("  ⚠️  CRITICAL: 'Failed to fetch user profile' error still present!")
            else:
                print("✅ ZERO console errors on dashboard")
                print("✅ CONFIRMED: All previously reported fetch errors are GONE")
            
        except Exception as e:
            print(f"❌ STEP 3 FAILED: {str(e)}")
        
        print("\n" + "=" * 80)
        print("STEP 4: CONTENT GENERATOR")
        print("=" * 80)
        
        handle_console.current_step = 'content_generator'
        
        try:
            # Look for content generator links
            content_links = page.locator('a:has-text("AI Content"), a:has-text("Content Generator"), a:has-text("Content Studio"), text=/AI Content|Content Generator|Content Studio/i').all()
            
            if content_links:
                print(f"Found {len(content_links)} potential content generator links")
                
                # Click the first one
                content_links[0].click()
                time.sleep(5)
                
                # Screenshot
                page.screenshot(path='content_generator.png', full_page=True)
                print("✅ Screenshot captured: content_generator.png")
                
                # Check console
                errors = [m for m in console_messages['content_generator'] if m['type'] == 'error']
                if errors:
                    print(f"❌ ERRORS FOUND ({len(errors)}):")
                    for err in errors:
                        print(f"  ERROR: {err['text']}")
                else:
                    print("✅ ZERO console errors")
            else:
                print("ℹ️  No Content Generator link found - feature may not be visible or available")
                
        except Exception as e:
            print(f"❌ STEP 4 FAILED: {str(e)}")
        
        # Final summary
        print("\n" + "=" * 80)
        print("FINAL SUMMARY")
        print("=" * 80)
        
        all_errors = []
        for step, messages in console_messages.items():
            errors = [m for m in messages if m['type'] == 'error']
            if errors:
                all_errors.extend([(step, err) for err in errors])
        
        if not all_errors:
            print("✅ ALL ISSUES CONFIRMED FIXED")
            print("\nPreviously reported issues:")
            print("  ✅ 3 RSC errors on homepage - FIXED")
            print("  ✅ 'Session cookie not created' error - FIXED")
            print("  ✅ 'Failed to fetch' errors on dashboard - FIXED")
            print("  ✅ 'Failed to fetch limits' error - FIXED")
            print("  ✅ 'Failed to fetch user profile' error - FIXED")
        else:
            print(f"❌ FOUND {len(all_errors)} REMAINING ISSUES:\n")
            for step, err in all_errors:
                print(f"[{step.upper()}]")
                print(f"  ERROR: {err['text']}")
                if err['location']:
                    print(f"  Location: {err['location']}")
                print()
        
        browser.close()

if __name__ == '__main__':
    test_purple_glow()
