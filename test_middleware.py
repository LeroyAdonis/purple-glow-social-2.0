"""
Test script to verify proxy.ts middleware is working correctly.
Tests public and protected routes for proper authentication handling.
"""

from playwright.sync_api import sync_playwright
import json

def test_routes():
    results = []
    
    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        # Collect console messages
        console_messages = []
        
        def handle_console(msg):
            console_messages.append({
                'type': msg.type,
                'text': msg.text,
                'location': msg.location
            })
        
        page.on('console', handle_console)
        
        # Test 1: Homepage (/)
        print("\n" + "="*60)
        print("TEST 1: Homepage (/) - Should be public/accessible")
        print("="*60)
        console_messages.clear()
        
        try:
            response = page.goto('http://localhost:3000/', wait_until='networkidle', timeout=30000)
            page.wait_for_timeout(2000)  # Wait for any dynamic content
            
            final_url = page.url
            status = response.status if response else 'No response'
            
            # Take screenshot
            page.screenshot(path='C:/scratchpad/purple-glow-social-2.0/screenshot_homepage.png', full_page=True)
            
            # Get page title
            title = page.title()
            
            result = {
                'route': '/',
                'expected': 'Public - should load',
                'status_code': status,
                'final_url': final_url,
                'title': title,
                'redirected': final_url != 'http://localhost:3000/',
                'console_errors': [msg for msg in console_messages if msg['type'] == 'error'],
                'all_console': console_messages.copy(),
                'success': status == 200
            }
            
            print(f"Status: {status}")
            print(f"Final URL: {final_url}")
            print(f"Title: {title}")
            print(f"Redirected: {result['redirected']}")
            print(f"Console Errors: {len(result['console_errors'])}")
            
            results.append(result)
            
        except Exception as e:
            print(f"ERROR: {str(e)}")
            results.append({
                'route': '/',
                'error': str(e),
                'success': False
            })
        
        # Test 2: Dashboard (/dashboard) - Should redirect to /login
        print("\n" + "="*60)
        print("TEST 2: Dashboard (/dashboard) - Should redirect to /login")
        print("="*60)
        console_messages.clear()
        
        try:
            response = page.goto('http://localhost:3000/dashboard', wait_until='networkidle', timeout=30000)
            page.wait_for_timeout(2000)
            
            final_url = page.url
            status = response.status if response else 'No response'
            
            # Take screenshot
            page.screenshot(path='C:/scratchpad/purple-glow-social-2.0/screenshot_dashboard.png', full_page=True)
            
            title = page.title()
            
            result = {
                'route': '/dashboard',
                'expected': 'Protected - should redirect to /login',
                'status_code': status,
                'final_url': final_url,
                'title': title,
                'redirected': final_url != 'http://localhost:3000/dashboard',
                'redirected_to_login': '/login' in final_url,
                'console_errors': [msg for msg in console_messages if msg['type'] == 'error'],
                'all_console': console_messages.copy(),
                'success': '/login' in final_url
            }
            
            print(f"Status: {status}")
            print(f"Final URL: {final_url}")
            print(f"Title: {title}")
            print(f"Redirected: {result['redirected']}")
            print(f"Redirected to Login: {result['redirected_to_login']}")
            print(f"Console Errors: {len(result['console_errors'])}")
            
            results.append(result)
            
        except Exception as e:
            print(f"ERROR: {str(e)}")
            results.append({
                'route': '/dashboard',
                'error': str(e),
                'success': False
            })
        
        # Test 3: Login (/login) - Should be public
        print("\n" + "="*60)
        print("TEST 3: Login (/login) - Should be public/accessible")
        print("="*60)
        console_messages.clear()
        
        try:
            response = page.goto('http://localhost:3000/login', wait_until='networkidle', timeout=30000)
            page.wait_for_timeout(2000)
            
            final_url = page.url
            status = response.status if response else 'No response'
            
            # Take screenshot
            page.screenshot(path='C:/scratchpad/purple-glow-social-2.0/screenshot_login.png', full_page=True)
            
            title = page.title()
            
            result = {
                'route': '/login',
                'expected': 'Public - should load',
                'status_code': status,
                'final_url': final_url,
                'title': title,
                'redirected': final_url != 'http://localhost:3000/login',
                'console_errors': [msg for msg in console_messages if msg['type'] == 'error'],
                'all_console': console_messages.copy(),
                'success': status == 200 and not (final_url != 'http://localhost:3000/login')
            }
            
            print(f"Status: {status}")
            print(f"Final URL: {final_url}")
            print(f"Title: {title}")
            print(f"Redirected: {result['redirected']}")
            print(f"Console Errors: {len(result['console_errors'])}")
            
            results.append(result)
            
        except Exception as e:
            print(f"ERROR: {str(e)}")
            results.append({
                'route': '/login',
                'error': str(e),
                'success': False
            })
        
        # Close browser
        browser.close()
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for result in results:
        route = result.get('route', 'Unknown')
        success = result.get('success', False)
        status_icon = "✓" if success else "✗"
        print(f"\n{status_icon} {route}")
        
        if 'error' in result:
            print(f"  ERROR: {result['error']}")
        else:
            print(f"  Expected: {result.get('expected', 'N/A')}")
            print(f"  Status: {result.get('status_code', 'N/A')}")
            print(f"  Final URL: {result.get('final_url', 'N/A')}")
            print(f"  Title: {result.get('title', 'N/A')}")
            
            if result.get('console_errors'):
                print(f"  Console Errors ({len(result['console_errors'])}):")
                for err in result['console_errors'][:5]:  # Show first 5 errors
                    print(f"    - {err['text']}")
    
    # Save detailed results to JSON
    with open('C:/scratchpad/purple-glow-social-2.0/test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n\nDetailed results saved to: test_results.json")
    print("Screenshots saved:")
    print("  - screenshot_homepage.png")
    print("  - screenshot_dashboard.png")
    print("  - screenshot_login.png")
    
    return results

if __name__ == '__main__':
    test_routes()
