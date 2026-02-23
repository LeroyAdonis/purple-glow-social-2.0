"""
Playwright audit script for Purple Glow Social 2.0 - AUTHENTICATED pages
Tests authentication flows, redirects, and authenticated page access
"""

from playwright.sync_api import sync_playwright
import json
from pathlib import Path
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3000"
SCREENSHOT_DIR = Path("docs/audit-screenshots")
REPORT_FILE = SCREENSHOT_DIR / "report-authenticated.md"

# Test accounts
ACCOUNTS = {
    "pro": {
        "email": "pro@test.purpleglow.co.za",
        "password": "TestPro123!"
    },
    "free": {
        "email": "free@test.purpleglow.co.za",
        "password": "TestFree123!"
    },
    "admin": {
        "email": "admin@test.purpleglow.co.za",
        "password": "TestAdmin123!"
    }
}

class AuditResults:
    def __init__(self):
        self.scenarios = []
        
    def add_scenario(self, name, result):
        self.scenarios.append({
            "name": name,
            "timestamp": datetime.now().isoformat(),
            **result
        })
    
    def generate_report(self):
        """Generate markdown report"""
        lines = [
            "# Purple Glow Social 2.0 - Authenticated Pages Audit Report",
            f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"\n**Base URL:** {BASE_URL}",
            "\n---\n"
        ]
        
        for idx, scenario in enumerate(self.scenarios, 1):
            lines.append(f"\n## Scenario {idx}: {scenario['name']}\n")
            lines.append(f"**Timestamp:** {scenario['timestamp']}\n")
            lines.append(f"**Final URL:** `{scenario.get('final_url', 'N/A')}`\n")
            lines.append(f"**Screenshot:** `{scenario.get('screenshot', 'N/A')}`\n")
            
            if scenario.get('status'):
                lines.append(f"\n**Status:** {scenario['status']}\n")
            
            if scenario.get('expected'):
                lines.append(f"\n**Expected:** {scenario['expected']}\n")
            
            if scenario.get('page_content'):
                lines.append(f"\n**Page Content:**\n{scenario['page_content']}\n")
            
            console_errors = scenario.get('console_errors', [])
            if console_errors:
                lines.append(f"\n**Console Errors ({len(console_errors)}):**\n")
                for error in console_errors[:10]:  # Limit to first 10
                    lines.append(f"- {error}\n")
                if len(console_errors) > 10:
                    lines.append(f"- ... and {len(console_errors) - 10} more\n")
            else:
                lines.append("\n**Console Errors:** None\n")
            
            network_errors = scenario.get('network_errors', [])
            if network_errors:
                lines.append(f"\n**Network Errors ({len(network_errors)}):**\n")
                for error in network_errors[:10]:
                    lines.append(f"- {error}\n")
                if len(network_errors) > 10:
                    lines.append(f"- ... and {len(network_errors) - 10} more\n")
            else:
                lines.append("\n**Network Errors:** None\n")
            
            if scenario.get('notes'):
                lines.append(f"\n**Notes:** {scenario['notes']}\n")
            
            lines.append("\n---\n")
        
        # Summary
        lines.append("\n## Summary\n")
        lines.append(f"\n- **Total Scenarios:** {len(self.scenarios)}\n")
        lines.append(f"- **Timestamp:** {datetime.now().isoformat()}\n")
        
        return "".join(lines)


def collect_page_info(page, scenario_name):
    """Collect comprehensive information about the current page state"""
    result = {
        "final_url": page.url,
        "console_errors": [],
        "network_errors": [],
        "page_content": "",
        "status": "Unknown"
    }
    
    # Get page title
    try:
        title = page.title()
        result["page_content"] = f"**Title:** {title}\n"
    except Exception as e:
        result["page_content"] = f"**Title:** Error getting title: {e}\n"
    
    # Try to get visible headings
    try:
        headings = page.locator("h1, h2, h3").all_text_contents()
        if headings:
            result["page_content"] += f"\n**Headings:**\n"
            for h in headings[:5]:  # First 5 headings
                result["page_content"] += f"- {h}\n"
    except Exception:
        pass
    
    # Check for common elements
    try:
        buttons = page.locator("button").count()
        links = page.locator("a").count()
        forms = page.locator("form").count()
        result["page_content"] += f"\n**Elements:** {buttons} buttons, {links} links, {forms} forms\n"
    except Exception:
        pass
    
    return result


def run_audit():
    """Run the complete audit suite"""
    print("🚀 Starting Purple Glow Social 2.0 Authenticated Pages Audit\n")
    
    # Ensure screenshot directory exists
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    
    audit = AuditResults()
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)
        
        # Setup console and network error tracking
        def make_error_tracker():
            errors = {"console": [], "network": []}
            
            def on_console(msg):
                if msg.type in ['error', 'warning']:
                    errors["console"].append(f"[{msg.type.upper()}] {msg.text}")
            
            def on_response(response):
                if response.status >= 400:
                    errors["network"].append(
                        f"{response.status} {response.status_text} - {response.url}"
                    )
            
            return errors, on_console, on_response
        
        # ============================================================
        # SCENARIO 1: Unauthenticated redirect to /dashboard
        # ============================================================
        print("📋 Scenario 1: Unauthenticated redirect to /dashboard")
        context1 = browser.new_context()
        page1 = context1.new_page()
        
        errors1, on_console1, on_response1 = make_error_tracker()
        page1.on("console", on_console1)
        page1.on("response", on_response1)
        
        try:
            page1.goto(f"{BASE_URL}/dashboard", wait_until="networkidle", timeout=30000)
            page1.wait_for_timeout(2000)  # Extra wait for any redirects
            
            screenshot_path = SCREENSHOT_DIR / "dashboard-unauth.png"
            page1.screenshot(path=str(screenshot_path), full_page=True)
            
            result = collect_page_info(page1, "Scenario 1")
            result["screenshot"] = str(screenshot_path.relative_to(Path.cwd()))
            result["expected"] = "Should redirect to /login"
            result["console_errors"] = errors1["console"]
            result["network_errors"] = errors1["network"]
            
            if "/login" in page1.url:
                result["status"] = "✅ PASS - Redirected to login"
            else:
                result["status"] = "❌ FAIL - Did not redirect to login"
            
            audit.add_scenario("Unauthenticated redirect to /dashboard", result)
            print(f"   {result['status']}")
            print(f"   Final URL: {result['final_url']}")
            
        except Exception as e:
            audit.add_scenario("Unauthenticated redirect to /dashboard", {
                "status": f"❌ ERROR: {str(e)}",
                "final_url": page1.url if page1 else "Unknown",
                "console_errors": errors1["console"],
                "network_errors": errors1["network"],
                "screenshot": "N/A"
            })
            print(f"   ❌ ERROR: {e}")
        finally:
            context1.close()
        
        # ============================================================
        # SCENARIO 2: Login flow (Pro user)
        # ============================================================
        print("\n📋 Scenario 2: Login flow (Pro user)")
        context2 = browser.new_context()
        page2 = context2.new_page()
        
        errors2, on_console2, on_response2 = make_error_tracker()
        page2.on("console", on_console2)
        page2.on("response", on_response2)
        
        try:
            # Navigate to login
            page2.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=30000)
            page2.wait_for_timeout(1000)
            
            # Screenshot of login form
            login_form_screenshot = SCREENSHOT_DIR / "login-form.png"
            page2.screenshot(path=str(login_form_screenshot), full_page=True)
            print(f"   📸 Login form screenshot: {login_form_screenshot}")
            
            # Find and fill email input
            email_input = page2.locator('input[name="email"], input[type="email"], input[placeholder*="email" i]').first
            email_input.fill(ACCOUNTS["pro"]["email"])
            print(f"   ✓ Filled email: {ACCOUNTS['pro']['email']}")
            
            # Find and fill password input
            password_input = page2.locator('input[name="password"], input[type="password"]').first
            password_input.fill(ACCOUNTS["pro"]["password"])
            print(f"   ✓ Filled password")
            
            # Find and click sign-in button
            sign_in_button = page2.locator('button:has-text("Sign in"), button:has-text("Log in"), button[type="submit"]').first
            
            # Click and wait for navigation
            with page2.expect_navigation(timeout=10000, wait_until="networkidle"):
                sign_in_button.click()
            
            page2.wait_for_timeout(2000)
            
            # Screenshot after login
            post_login_screenshot = SCREENSHOT_DIR / "post-login-pro.png"
            page2.screenshot(path=str(post_login_screenshot), full_page=True)
            
            result = collect_page_info(page2, "Scenario 2")
            result["screenshot"] = str(post_login_screenshot.relative_to(Path.cwd()))
            result["expected"] = "Should redirect to /dashboard or home page after successful login"
            result["console_errors"] = errors2["console"]
            result["network_errors"] = errors2["network"]
            
            if "/login" not in page2.url:
                result["status"] = "✅ PASS - Login successful, redirected away from /login"
            else:
                result["status"] = "❌ FAIL - Still on login page"
            
            audit.add_scenario("Login flow (Pro user)", result)
            print(f"   {result['status']}")
            print(f"   Final URL: {result['final_url']}")
            
            # Keep context2 open for next scenario
            
        except Exception as e:
            audit.add_scenario("Login flow (Pro user)", {
                "status": f"❌ ERROR: {str(e)}",
                "final_url": page2.url if page2 else "Unknown",
                "console_errors": errors2["console"],
                "network_errors": errors2["network"],
                "screenshot": "N/A"
            })
            print(f"   ❌ ERROR: {e}")
            context2.close()
            context2 = None
        
        # ============================================================
        # SCENARIO 3: Dashboard (if login worked)
        # ============================================================
        if context2:
            print("\n📋 Scenario 3: Dashboard (authenticated Pro user)")
            
            errors3, on_console3, on_response3 = make_error_tracker()
            page2.on("console", on_console3)
            page2.on("response", on_response3)
            
            try:
                page2.goto(f"{BASE_URL}/dashboard", wait_until="networkidle", timeout=30000)
                page2.wait_for_timeout(2000)
                
                dashboard_screenshot = SCREENSHOT_DIR / "dashboard-pro.png"
                page2.screenshot(path=str(dashboard_screenshot), full_page=True)
                
                result = collect_page_info(page2, "Scenario 3")
                result["screenshot"] = str(dashboard_screenshot.relative_to(Path.cwd()))
                result["expected"] = "Should show dashboard content for authenticated user"
                result["console_errors"] = errors3["console"]
                result["network_errors"] = errors3["network"]
                
                if "/dashboard" in page2.url:
                    result["status"] = "✅ PASS - On dashboard page"
                else:
                    result["status"] = "❌ FAIL - Redirected away from dashboard"
                
                audit.add_scenario("Dashboard (authenticated Pro user)", result)
                print(f"   {result['status']}")
                print(f"   Final URL: {result['final_url']}")
                
            except Exception as e:
                audit.add_scenario("Dashboard (authenticated Pro user)", {
                    "status": f"❌ ERROR: {str(e)}",
                    "final_url": page2.url if page2 else "Unknown",
                    "console_errors": errors3["console"],
                    "network_errors": errors3["network"],
                    "screenshot": "N/A"
                })
                print(f"   ❌ ERROR: {e}")
            
            # ============================================================
            # SCENARIO 4: Session persistence
            # ============================================================
            print("\n📋 Scenario 4: Session persistence (reload dashboard)")
            
            errors4, on_console4, on_response4 = make_error_tracker()
            page2.on("console", on_console4)
            page2.on("response", on_response4)
            
            try:
                page2.reload(wait_until="networkidle", timeout=30000)
                page2.wait_for_timeout(2000)
                
                result = collect_page_info(page2, "Scenario 4")
                result["expected"] = "Should remain on /dashboard after reload"
                result["console_errors"] = errors4["console"]
                result["network_errors"] = errors4["network"]
                
                if "/dashboard" in page2.url:
                    result["status"] = "✅ PASS - Session persisted, still on dashboard"
                else:
                    result["status"] = "❌ FAIL - Session lost, redirected to login"
                
                audit.add_scenario("Session persistence (reload dashboard)", result)
                print(f"   {result['status']}")
                print(f"   Final URL: {result['final_url']}")
                
            except Exception as e:
                audit.add_scenario("Session persistence (reload dashboard)", {
                    "status": f"❌ ERROR: {str(e)}",
                    "final_url": page2.url if page2 else "Unknown",
                    "console_errors": errors4["console"],
                    "network_errors": errors4["network"]
                })
                print(f"   ❌ ERROR: {e}")
            
            context2.close()
        
        # ============================================================
        # SCENARIO 5: Admin page (Admin user)
        # ============================================================
        print("\n📋 Scenario 5: Admin page (Admin user)")
        context5 = browser.new_context()
        page5 = context5.new_page()
        
        errors5, on_console5, on_response5 = make_error_tracker()
        page5.on("console", on_console5)
        page5.on("response", on_response5)
        
        try:
            # Login as admin
            page5.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=30000)
            page5.wait_for_timeout(1000)
            
            # Fill credentials
            email_input = page5.locator('input[name="email"], input[type="email"], input[placeholder*="email" i]').first
            email_input.fill(ACCOUNTS["admin"]["email"])
            
            password_input = page5.locator('input[name="password"], input[type="password"]').first
            password_input.fill(ACCOUNTS["admin"]["password"])
            
            # Click sign-in
            sign_in_button = page5.locator('button:has-text("Sign in"), button:has-text("Log in"), button[type="submit"]').first
            
            with page5.expect_navigation(timeout=10000, wait_until="networkidle"):
                sign_in_button.click()
            
            page5.wait_for_timeout(2000)
            print(f"   ✓ Logged in as admin")
            
            # Navigate to admin page
            page5.goto(f"{BASE_URL}/admin", wait_until="networkidle", timeout=30000)
            page5.wait_for_timeout(2000)
            
            admin_screenshot = SCREENSHOT_DIR / "admin-page.png"
            page5.screenshot(path=str(admin_screenshot), full_page=True)
            
            result = collect_page_info(page5, "Scenario 5")
            result["screenshot"] = str(admin_screenshot.relative_to(Path.cwd()))
            result["expected"] = "Should show admin page content for admin user"
            result["console_errors"] = errors5["console"]
            result["network_errors"] = errors5["network"]
            
            if "/admin" in page5.url:
                result["status"] = "✅ PASS - On admin page"
            else:
                result["status"] = "❌ FAIL - Redirected away from admin page"
            
            audit.add_scenario("Admin page (Admin user)", result)
            print(f"   {result['status']}")
            print(f"   Final URL: {result['final_url']}")
            
        except Exception as e:
            audit.add_scenario("Admin page (Admin user)", {
                "status": f"❌ ERROR: {str(e)}",
                "final_url": page5.url if page5 else "Unknown",
                "console_errors": errors5["console"],
                "network_errors": errors5["network"],
                "screenshot": "N/A"
            })
            print(f"   ❌ ERROR: {e}")
        finally:
            context5.close()
        
        # Close browser
        browser.close()
    
    # Generate report
    print(f"\n📝 Generating report: {REPORT_FILE}")
    report_content = audit.generate_report()
    REPORT_FILE.write_text(report_content, encoding='utf-8')
    
    print(f"\n✅ Audit complete!")
    print(f"   Report: {REPORT_FILE}")
    print(f"   Screenshots: {SCREENSHOT_DIR}")
    
    return audit


if __name__ == "__main__":
    audit = run_audit()
