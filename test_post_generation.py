"""
Comprehensive test of Purple Glow Social 2.0 post generation flow.
Captures ALL errors: console, network, UI, and stack traces.
"""
from playwright.sync_api import sync_playwright
import json
import time

def test_post_generation():
    console_logs = []
    network_errors = []
    all_requests = []
    
    with sync_playwright() as p:
        # Launch browser with detailed logging
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir='./test-videos'
        )
        page = context.new_page()
        
        # Capture console messages
        def handle_console(msg):
            log_entry = {
                'type': msg.type,
                'text': msg.text,
                'location': msg.location
            }
            console_logs.append(log_entry)
            print(f"[CONSOLE {msg.type.upper()}] {msg.text}")
            if msg.location:
                print(f"  Location: {msg.location}")
        
        page.on('console', handle_console)
        
        # Capture page errors
        def handle_page_error(error):
            error_info = {
                'type': 'page_error',
                'message': str(error),
                'stack': error.stack if hasattr(error, 'stack') else None
            }
            console_logs.append(error_info)
            print(f"[PAGE ERROR] {error}")
            if hasattr(error, 'stack'):
                print(f"  Stack: {error.stack}")
        
        page.on('pageerror', handle_page_error)
        
        # Capture network failures
        def handle_request_failed(request):
            error_info = {
                'url': request.url,
                'method': request.method,
                'failure': request.failure
            }
            network_errors.append(error_info)
            print(f"[NETWORK FAILURE] {request.method} {request.url}")
            print(f"  Failure: {request.failure}")
        
        page.on('requestfailed', handle_request_failed)
        
        # Capture all network requests/responses
        def handle_response(response):
            request_info = {
                'url': response.url,
                'status': response.status,
                'method': response.request.method,
                'headers': dict(response.headers)
            }
            all_requests.append(request_info)
            
            # Log failed requests (4xx, 5xx)
            if response.status >= 400:
                print(f"[HTTP ERROR {response.status}] {response.request.method} {response.url}")
                try:
                    body = response.text()
                    print(f"  Response body: {body}")
                    request_info['response_body'] = body
                except:
                    print(f"  Could not read response body")
        
        page.on('response', handle_response)
        
        print("\n" + "="*80)
        print("STARTING TEST: Purple Glow Social 2.0 Post Generation Flow")
        print("="*80 + "\n")
        
        try:
            # STEP 1: Navigate to dashboard
            print("\n[STEP 1] Navigating to http://localhost:3000/dashboard")
            page.goto('http://localhost:3000/dashboard', wait_until='networkidle', timeout=30000)
            page.screenshot(path='./step1-dashboard.png', full_page=True)
            print(f"  Current URL: {page.url}")
            print(f"  Page title: {page.title()}")
            time.sleep(2)
            
            # STEP 2: Login
            print("\n[STEP 2] Attempting login with pro@test.purpleglow.co.za")
            
            # Check if we're on a login page
            page_content = page.content()
            if 'login' in page.url.lower() or 'sign' in page.url.lower():
                print("  Login page detected, filling credentials...")
                
                # Try to find and fill email field
                email_selectors = [
                    'input[type="email"]',
                    'input[name="email"]',
                    'input[id="email"]',
                    'input[placeholder*="email" i]',
                    'input[placeholder*="Email" i]'
                ]
                
                email_filled = False
                for selector in email_selectors:
                    try:
                        if page.locator(selector).count() > 0:
                            page.fill(selector, 'pro@test.purpleglow.co.za')
                            print(f"  ✓ Filled email using selector: {selector}")
                            email_filled = True
                            break
                    except:
                        continue
                
                if not email_filled:
                    print("  ✗ Could not find email input field!")
                    page.screenshot(path='./error-no-email-field.png', full_page=True)
                
                # Try to find and fill password field
                password_selectors = [
                    'input[type="password"]',
                    'input[name="password"]',
                    'input[id="password"]'
                ]
                
                password_filled = False
                for selector in password_selectors:
                    try:
                        if page.locator(selector).count() > 0:
                            page.fill(selector, 'TestPro123!')
                            print(f"  ✓ Filled password using selector: {selector}")
                            password_filled = True
                            break
                    except:
                        continue
                
                if not password_filled:
                    print("  ✗ Could not find password input field!")
                    page.screenshot(path='./error-no-password-field.png', full_page=True)
                
                page.screenshot(path='./step2-before-login-click.png', full_page=True)
                
                # Try to find and click login button
                login_button_selectors = [
                    'button[type="submit"]',
                    'button:has-text("Sign In")',
                    'button:has-text("Login")',
                    'button:has-text("Log In")',
                    'input[type="submit"]'
                ]
                
                login_clicked = False
                for selector in login_button_selectors:
                    try:
                        if page.locator(selector).count() > 0:
                            page.click(selector)
                            print(f"  ✓ Clicked login button using selector: {selector}")
                            login_clicked = True
                            break
                    except:
                        continue
                
                if not login_clicked:
                    print("  ✗ Could not find login button!")
                    page.screenshot(path='./error-no-login-button.png', full_page=True)
                
                # Wait for navigation after login
                page.wait_for_load_state('networkidle', timeout=15000)
                time.sleep(2)
                page.screenshot(path='./step2-after-login.png', full_page=True)
                print(f"  Current URL after login: {page.url}")
            else:
                print("  Already logged in or not on login page")
                print(f"  Current URL: {page.url}")
            
            # STEP 3: Navigate to AI Content Studio / Content Generator
            print("\n[STEP 3] Navigating to AI Content Studio / Content Generator")
            
            # Try different possible URLs
            content_urls = [
                'http://localhost:3000/dashboard/content-generator',
                'http://localhost:3000/dashboard/ai-content-studio',
                'http://localhost:3000/content-generator',
                'http://localhost:3000/ai-content-studio',
                'http://localhost:3000/dashboard/generate',
                'http://localhost:3000/generate'
            ]
            
            # First, check if there's a navigation link
            print("  Looking for navigation links...")
            nav_found = False
            nav_selectors = [
                'a:has-text("AI Content Studio")',
                'a:has-text("Content Generator")',
                'a:has-text("Generate")',
                'a:has-text("Content")',
                '[href*="content-generator"]',
                '[href*="ai-content-studio"]'
            ]
            
            for selector in nav_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        print(f"  Found navigation link: {selector}")
                        href = page.locator(selector).first.get_attribute('href')
                        print(f"  Link href: {href}")
                        page.click(selector)
                        print(f"  ✓ Clicked navigation link")
                        nav_found = True
                        page.wait_for_load_state('networkidle', timeout=15000)
                        time.sleep(2)
                        break
                except Exception as e:
                    print(f"  Could not click {selector}: {e}")
                    continue
            
            if not nav_found:
                print("  No navigation link found, trying direct URLs...")
                for url in content_urls:
                    try:
                        print(f"  Trying: {url}")
                        page.goto(url, wait_until='networkidle', timeout=15000)
                        time.sleep(2)
                        if page.url == url or 'content' in page.url.lower() or 'generate' in page.url.lower():
                            print(f"  ✓ Successfully navigated to: {page.url}")
                            break
                    except Exception as e:
                        print(f"  Failed to navigate to {url}: {e}")
                        continue
            
            page.screenshot(path='./step3-content-generator.png', full_page=True)
            print(f"  Current URL: {page.url}")
            print(f"  Page title: {page.title()}")
            
            # STEP 4: Fill in a topic
            print("\n[STEP 4] Filling in topic: 'social media marketing tips'")
            
            topic_selectors = [
                'input[name="topic"]',
                'input[id="topic"]',
                'input[placeholder*="topic" i]',
                'input[placeholder*="subject" i]',
                'textarea[name="topic"]',
                'textarea[id="topic"]',
                'textarea[placeholder*="topic" i]'
            ]
            
            topic_filled = False
            for selector in topic_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        page.fill(selector, 'social media marketing tips')
                        print(f"  ✓ Filled topic using selector: {selector}")
                        topic_filled = True
                        break
                except Exception as e:
                    print(f"  Failed with {selector}: {e}")
                    continue
            
            if not topic_filled:
                print("  ✗ Could not find topic input field!")
                print("  Available input fields:")
                inputs = page.locator('input, textarea').all()
                for i, inp in enumerate(inputs):
                    try:
                        tag = inp.evaluate('el => el.tagName')
                        name = inp.get_attribute('name') or 'N/A'
                        id_attr = inp.get_attribute('id') or 'N/A'
                        placeholder = inp.get_attribute('placeholder') or 'N/A'
                        print(f"    [{i}] {tag} - name={name}, id={id_attr}, placeholder={placeholder}")
                    except:
                        pass
                page.screenshot(path='./error-no-topic-field.png', full_page=True)
            
            time.sleep(1)
            page.screenshot(path='./step4-topic-filled.png', full_page=True)
            
            # STEP 5: Select a platform
            print("\n[STEP 5] Selecting platform: LinkedIn")
            
            # Try to find platform selector (could be dropdown, radio buttons, or checkboxes)
            platform_selected = False
            
            # Try dropdown/select
            select_selectors = [
                'select[name="platform"]',
                'select[id="platform"]',
                'select:has(option:has-text("LinkedIn"))'
            ]
            
            for selector in select_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        page.select_option(selector, label='LinkedIn')
                        print(f"  ✓ Selected LinkedIn from dropdown: {selector}")
                        platform_selected = True
                        break
                except Exception as e:
                    try:
                        # Try by value
                        page.select_option(selector, value='linkedin')
                        print(f"  ✓ Selected LinkedIn by value from: {selector}")
                        platform_selected = True
                        break
                    except:
                        print(f"  Failed with {selector}: {e}")
                        continue
            
            # Try radio buttons or clickable elements
            if not platform_selected:
                click_selectors = [
                    'input[type="radio"][value="linkedin"]',
                    'input[type="radio"][value="LinkedIn"]',
                    'label:has-text("LinkedIn")',
                    'button:has-text("LinkedIn")',
                    '[data-platform="linkedin"]',
                    '[data-value="linkedin"]'
                ]
                
                for selector in click_selectors:
                    try:
                        if page.locator(selector).count() > 0:
                            page.click(selector)
                            print(f"  ✓ Clicked LinkedIn option: {selector}")
                            platform_selected = True
                            break
                    except Exception as e:
                        print(f"  Failed with {selector}: {e}")
                        continue
            
            if not platform_selected:
                print("  ✗ Could not find platform selector!")
                print("  Available select/radio elements:")
                selects = page.locator('select, input[type="radio"], input[type="checkbox"]').all()
                for i, sel in enumerate(selects):
                    try:
                        tag = sel.evaluate('el => el.tagName')
                        name = sel.get_attribute('name') or 'N/A'
                        value = sel.get_attribute('value') or 'N/A'
                        print(f"    [{i}] {tag} - name={name}, value={value}")
                    except:
                        pass
                page.screenshot(path='./error-no-platform-selector.png', full_page=True)
            
            time.sleep(1)
            page.screenshot(path='./step5-platform-selected.png', full_page=True)
            
            # STEP 6: Click the Generate button
            print("\n[STEP 6] Clicking Generate button")
            
            generate_selectors = [
                'button:has-text("Generate")',
                'button[type="submit"]',
                'input[type="submit"][value*="Generate"]',
                'button:has-text("Create")',
                'button:has-text("Create Post")',
                '[data-action="generate"]'
            ]
            
            generate_clicked = False
            for selector in generate_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        print(f"  Found generate button: {selector}")
                        page.click(selector)
                        print(f"  ✓ Clicked generate button")
                        generate_clicked = True
                        break
                except Exception as e:
                    print(f"  Failed with {selector}: {e}")
                    continue
            
            if not generate_clicked:
                print("  ✗ Could not find Generate button!")
                print("  Available buttons:")
                buttons = page.locator('button, input[type="submit"]').all()
                for i, btn in enumerate(buttons):
                    try:
                        text = btn.inner_text() or btn.get_attribute('value') or 'N/A'
                        print(f"    [{i}] {text}")
                    except:
                        pass
                page.screenshot(path='./error-no-generate-button.png', full_page=True)
            
            # STEP 7: Wait and observe what happens
            print("\n[STEP 7] Observing post-generation behavior...")
            print("  Waiting for response (15 seconds)...")
            time.sleep(15)
            
            page.screenshot(path='./step7-after-generation.png', full_page=True)
            print(f"  Current URL: {page.url}")
            
            # Check for error messages in the UI
            print("\n  Checking for UI error messages...")
            error_selectors = [
                '.error',
                '.alert-error',
                '.alert-danger',
                '[role="alert"]',
                '.text-red-500',
                '.text-danger',
                '[class*="error"]',
                '[class*="Error"]'
            ]
            
            ui_errors_found = []
            for selector in error_selectors:
                try:
                    elements = page.locator(selector).all()
                    for elem in elements:
                        if elem.is_visible():
                            text = elem.inner_text()
                            if text.strip():
                                ui_errors_found.append({
                                    'selector': selector,
                                    'text': text
                                })
                                print(f"  [UI ERROR] {selector}: {text}")
                except:
                    continue
            
            # Check for success messages
            print("\n  Checking for success messages...")
            success_selectors = [
                '.success',
                '.alert-success',
                '.text-green-500',
                '[class*="success"]'
            ]
            
            for selector in success_selectors:
                try:
                    elements = page.locator(selector).all()
                    for elem in elements:
                        if elem.is_visible():
                            text = elem.inner_text()
                            if text.strip():
                                print(f"  [SUCCESS MESSAGE] {selector}: {text}")
                except:
                    continue
            
            # Check if generated content is visible
            print("\n  Checking for generated content...")
            content_selectors = [
                '[data-generated-content]',
                '.generated-content',
                '.post-content',
                'textarea[readonly]',
                '[class*="preview"]'
            ]
            
            generated_content_found = False
            for selector in content_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        elem = page.locator(selector).first
                        if elem.is_visible():
                            text = elem.inner_text() or elem.input_value()
                            if text and len(text) > 10:
                                print(f"  ✓ Generated content found ({len(text)} chars)")
                                print(f"    Preview: {text[:200]}...")
                                generated_content_found = True
                                break
                except:
                    continue
            
            if not generated_content_found:
                print("  ✗ No generated content found in UI")
            
            # STEP 8: Try to schedule or publish
            print("\n[STEP 8] Looking for schedule/publish options...")
            
            action_selectors = [
                'button:has-text("Schedule")',
                'button:has-text("Publish")',
                'button:has-text("Post")',
                'button:has-text("Save")',
                '[data-action="schedule"]',
                '[data-action="publish"]'
            ]
            
            actions_found = []
            for selector in action_selectors:
                try:
                    if page.locator(selector).count() > 0:
                        elem = page.locator(selector).first
                        if elem.is_visible():
                            text = elem.inner_text()
                            actions_found.append({
                                'selector': selector,
                                'text': text
                            })
                            print(f"  Found action button: {text} ({selector})")
                except:
                    continue
            
            if actions_found:
                print(f"  Attempting to click first action button...")
                try:
                    page.click(actions_found[0]['selector'])
                    print(f"  ✓ Clicked: {actions_found[0]['text']}")
                    time.sleep(5)
                    page.screenshot(path='./step8-after-action.png', full_page=True)
                    
                    # Check for errors after action
                    for selector in error_selectors:
                        try:
                            elements = page.locator(selector).all()
                            for elem in elements:
                                if elem.is_visible():
                                    text = elem.inner_text()
                                    if text.strip():
                                        print(f"  [UI ERROR AFTER ACTION] {selector}: {text}")
                        except:
                            continue
                except Exception as e:
                    print(f"  ✗ Failed to click action button: {e}")
            else:
                print("  No schedule/publish buttons found")
            
            page.screenshot(path='./step8-final-state.png', full_page=True)
            
        except Exception as e:
            print(f"\n[CRITICAL ERROR] Test failed with exception:")
            print(f"  {type(e).__name__}: {str(e)}")
            import traceback
            print(f"  Stack trace:")
            print(traceback.format_exc())
            page.screenshot(path='./critical-error.png', full_page=True)
        
        finally:
            # Final screenshot
            try:
                page.screenshot(path='./final-screenshot.png', full_page=True)
            except:
                pass
            
            browser.close()
    
    # Print comprehensive error report
    print("\n" + "="*80)
    print("ERROR REPORT SUMMARY")
    print("="*80)
    
    print(f"\n📊 CONSOLE LOGS ({len(console_logs)} total):")
    if console_logs:
        for i, log in enumerate(console_logs, 1):
            print(f"\n  [{i}] Type: {log.get('type', 'unknown')}")
            print(f"      Text: {log.get('text', '')}")
            if log.get('location'):
                print(f"      Location: {log.get('location')}")
            if log.get('stack'):
                print(f"      Stack: {log.get('stack')}")
    else:
        print("  ✓ No console errors detected")
    
    print(f"\n🌐 NETWORK ERRORS ({len(network_errors)} total):")
    if network_errors:
        for i, error in enumerate(network_errors, 1):
            print(f"\n  [{i}] {error['method']} {error['url']}")
            print(f"      Failure: {error.get('failure', 'Unknown')}")
    else:
        print("  ✓ No network failures detected")
    
    print(f"\n🔴 HTTP ERROR RESPONSES:")
    error_responses = [r for r in all_requests if r['status'] >= 400]
    if error_responses:
        for i, resp in enumerate(error_responses, 1):
            print(f"\n  [{i}] {resp['method']} {resp['url']}")
            print(f"      Status: {resp['status']}")
            if resp.get('response_body'):
                print(f"      Response Body: {resp['response_body']}")
    else:
        print("  ✓ No HTTP error responses (4xx/5xx)")
    
    print("\n" + "="*80)
    print("TEST COMPLETE")
    print("="*80)
    print("\nScreenshots saved:")
    print("  - step1-dashboard.png")
    print("  - step2-before-login-click.png")
    print("  - step2-after-login.png")
    print("  - step3-content-generator.png")
    print("  - step4-topic-filled.png")
    print("  - step5-platform-selected.png")
    print("  - step7-after-generation.png")
    print("  - step8-final-state.png")
    print("  - final-screenshot.png")
    print("\nCheck for error-*.png files for any issues encountered")

if __name__ == '__main__':
    test_post_generation()
