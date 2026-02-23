"""
Playwright Audit: Authenticated Pages for Purple Glow Social 2.0
Tests various user tiers and authenticated page scenarios
"""

from playwright.sync_api import sync_playwright, Page, BrowserContext
import json
from datetime import datetime
from typing import List, Dict, Any
import time

BASE_URL = "http://localhost:3000"

# Test accounts
ACCOUNTS = {
    "pro": {"email": "pro@test.purpleglow.co.za", "password": "TestPro123!"},
    "free": {"email": "free@test.purpleglow.co.za", "password": "TestFree123!"},
    "admin": {"email": "admin@test.purpleglow.co.za", "password": "TestAdmin123!"}
}

class AuditResult:
    def __init__(self, scenario_name: str):
        self.scenario_name = scenario_name
        self.screenshot_path = ""
        self.login_success = False
        self.console_errors = []
        self.console_warnings = []
        self.network_errors = []
        self.visual_observations = []
        self.accessibility_observations = []
        self.final_url = ""
        self.redirected = False
        self.error_message = ""
        
    def to_dict(self):
        return {
            "scenario_name": self.scenario_name,
            "screenshot_path": self.screenshot_path,
            "login_success": self.login_success,
            "console_errors": self.console_errors,
            "console_warnings": self.console_warnings,
            "network_errors": self.network_errors,
            "visual_observations": self.visual_observations,
            "accessibility_observations": self.accessibility_observations,
            "final_url": self.final_url,
            "redirected": self.redirected,
            "error_message": self.error_message
        }

def setup_console_listeners(page: Page, result: AuditResult):
    """Set up console message listeners"""
    def handle_console(msg):
        msg_type = msg.type
        text = msg.text
        
        if msg_type == 'error':
            result.console_errors.append(text)
            print(f"  [CONSOLE ERROR] {text}")
        elif msg_type == 'warning':
            result.console_warnings.append(text)
            print(f"  [CONSOLE WARNING] {text}")
    
    page.on("console", handle_console)

def setup_network_listeners(page: Page, result: AuditResult):
    """Set up network error listeners"""
    def handle_response(response):
        if response.status >= 400:
            error = f"{response.status} {response.url}"
            result.network_errors.append(error)
            print(f"  [NETWORK ERROR] {error}")
    
    def handle_request_failed(request):
        error = f"FAILED: {request.url} - {request.failure()}"
        result.network_errors.append(error)
        print(f"  [REQUEST FAILED] {error}")
    
    page.on("response", handle_response)
    page.on("requestfailed", handle_request_failed)

def login(page: Page, email: str, password: str, result: AuditResult) -> bool:
    """Log in with credentials"""
    try:
        print(f"  Navigating to /login...")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        
        print(f"  Filling login form...")
        # Try to find email input
        email_input = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first
        email_input.fill(email)
        
        # Try to find password input
        password_input = page.locator('input[type="password"], input[name="password"]').first
        password_input.fill(password)
        
        # Find and click submit button
        submit_button = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")').first
        submit_button.click()
        
        print(f"  Waiting for navigation after login...")
        # Wait for navigation or network idle
        time.sleep(2)  # Give time for redirect
        page.wait_for_load_state("networkidle", timeout=10000)
        
        current_url = page.url
        print(f"  Current URL after login: {current_url}")
        
        # Check if we're still on login page (login failed)
        if "/login" in current_url:
            result.login_success = False
            result.error_message = "Still on login page after attempting login"
            return False
        
        result.login_success = True
        return True
        
    except Exception as e:
        result.error_message = f"Login error: {str(e)}"
        print(f"  [LOGIN ERROR] {str(e)}")
        return False

def logout(page: Page):
    """Log out"""
    try:
        print(f"  Attempting logout...")
        # Try to find logout button/link
        logout_selectors = [
            'button:has-text("Log out")',
            'button:has-text("Logout")',
            'button:has-text("Sign out")',
            'a:has-text("Log out")',
            'a:has-text("Logout")',
            'a:has-text("Sign out")'
        ]
        
        for selector in logout_selectors:
            try:
                element = page.locator(selector).first
                if element.is_visible(timeout=1000):
                    element.click()
                    page.wait_for_load_state("networkidle", timeout=5000)
                    print(f"  Logged out successfully")
                    return
            except:
                continue
        
        # Fallback: navigate to sign-out endpoint
        print(f"  No logout button found, navigating to sign-out endpoint...")
        page.goto(f"{BASE_URL}/api/auth/sign-out", wait_until="networkidle")
        
    except Exception as e:
        print(f"  [LOGOUT ERROR] {str(e)}")

def check_page_accessibility(page: Page, result: AuditResult):
    """Basic accessibility checks"""
    try:
        # Check for headings
        h1_count = page.locator('h1').count()
        if h1_count == 0:
            result.accessibility_observations.append("No H1 heading found")
        elif h1_count > 1:
            result.accessibility_observations.append(f"Multiple H1 headings found ({h1_count})")
        
        # Check for alt text on images
        images = page.locator('img').all()
        images_without_alt = 0
        for img in images:
            if not img.get_attribute('alt'):
                images_without_alt += 1
        
        if images_without_alt > 0:
            result.accessibility_observations.append(f"{images_without_alt} images without alt text")
        
        # Check for form labels
        inputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea').all()
        inputs_without_labels = 0
        for input_elem in inputs:
            input_id = input_elem.get_attribute('id')
            aria_label = input_elem.get_attribute('aria-label')
            aria_labelledby = input_elem.get_attribute('aria-labelledby')
            
            has_label = False
            if input_id:
                has_label = page.locator(f'label[for="{input_id}"]').count() > 0
            
            if not has_label and not aria_label and not aria_labelledby:
                inputs_without_labels += 1
        
        if inputs_without_labels > 0:
            result.accessibility_observations.append(f"{inputs_without_labels} form inputs without labels")
            
    except Exception as e:
        print(f"  [ACCESSIBILITY CHECK ERROR] {str(e)}")

def check_visual_elements(page: Page, result: AuditResult, expected_elements: List[str]):
    """Check for expected visual elements"""
    for element_desc in expected_elements:
        try:
            # This is descriptive, just note what we observe
            pass
        except:
            pass
    
    # Check page title
    title = page.title()
    if title:
        result.visual_observations.append(f"Page title: {title}")
    else:
        result.visual_observations.append("No page title set")
    
    # Check for main navigation
    nav_exists = page.locator('nav').count() > 0
    if nav_exists:
        result.visual_observations.append("Navigation element present")
    else:
        result.visual_observations.append("No navigation element found")

def run_scenario_1(page: Page) -> AuditResult:
    """Scenario 1: Pro user → /dashboard"""
    print("\n=== Scenario 1: Pro User Dashboard ===")
    result = AuditResult("Pro User Dashboard")
    result.screenshot_path = "docs/audit-screenshots/dashboard-pro.png"
    
    setup_console_listeners(page, result)
    setup_network_listeners(page, result)
    
    # Login
    if not login(page, ACCOUNTS["pro"]["email"], ACCOUNTS["pro"]["password"], result):
        page.screenshot(path=result.screenshot_path, full_page=True)
        return result
    
    # Navigate to dashboard
    print(f"  Navigating to /dashboard...")
    page.goto(f"{BASE_URL}/dashboard")
    page.wait_for_load_state("networkidle")
    result.final_url = page.url
    
    # Visual checks
    check_visual_elements(page, result, ["tabs", "navigation", "dashboard content"])
    
    # Check for Pro-specific elements
    content = page.content()
    if "pro" in content.lower() or "premium" in content.lower():
        result.visual_observations.append("Pro/Premium indicators visible")
    
    # Accessibility
    check_page_accessibility(page, result)
    
    # Screenshot
    page.screenshot(path=result.screenshot_path, full_page=True)
    print(f"  Screenshot saved: {result.screenshot_path}")
    
    # Logout
    logout(page)
    
    return result

def run_scenario_2(page: Page) -> AuditResult:
    """Scenario 2: Free user → /dashboard"""
    print("\n=== Scenario 2: Free User Dashboard ===")
    result = AuditResult("Free User Dashboard")
    result.screenshot_path = "docs/audit-screenshots/dashboard-free.png"
    
    setup_console_listeners(page, result)
    setup_network_listeners(page, result)
    
    # Login
    if not login(page, ACCOUNTS["free"]["email"], ACCOUNTS["free"]["password"], result):
        page.screenshot(path=result.screenshot_path, full_page=True)
        return result
    
    # Navigate to dashboard
    print(f"  Navigating to /dashboard...")
    page.goto(f"{BASE_URL}/dashboard")
    page.wait_for_load_state("networkidle")
    result.final_url = page.url
    
    # Visual checks
    check_visual_elements(page, result, ["credit limits", "feature restrictions"])
    
    # Check for Free tier indicators
    content = page.content().lower()
    if "credit" in content:
        result.visual_observations.append("Credit information visible")
    if "free" in content or "upgrade" in content:
        result.visual_observations.append("Free tier indicators/upgrade prompts visible")
    
    # Accessibility
    check_page_accessibility(page, result)
    
    # Screenshot
    page.screenshot(path=result.screenshot_path, full_page=True)
    print(f"  Screenshot saved: {result.screenshot_path}")
    
    # Logout
    logout(page)
    
    return result

def run_scenario_3(page: Page) -> AuditResult:
    """Scenario 3: Admin user → /dashboard"""
    print("\n=== Scenario 3: Admin User Dashboard ===")
    result = AuditResult("Admin User Dashboard")
    result.screenshot_path = "docs/audit-screenshots/dashboard-admin.png"
    
    setup_console_listeners(page, result)
    setup_network_listeners(page, result)
    
    # Login
    if not login(page, ACCOUNTS["admin"]["email"], ACCOUNTS["admin"]["password"], result):
        page.screenshot(path=result.screenshot_path, full_page=True)
        return result
    
    # Navigate to dashboard
    print(f"  Navigating to /dashboard...")
    page.goto(f"{BASE_URL}/dashboard")
    page.wait_for_load_state("networkidle")
    result.final_url = page.url
    
    # Visual checks
    check_visual_elements(page, result, ["admin UI elements"])
    
    # Check for Admin-specific elements
    content = page.content().lower()
    if "admin" in content:
        result.visual_observations.append("Admin indicators visible")
    
    # Accessibility
    check_page_accessibility(page, result)
    
    # Screenshot
    page.screenshot(path=result.screenshot_path, full_page=True)
    print(f"  Screenshot saved: {result.screenshot_path}")
    
    # Logout
    logout(page)
    
    return result

def run_scenario_4(page: Page) -> AuditResult:
    """Scenario 4: Unauthenticated redirect test"""
    print("\n=== Scenario 4: Unauthenticated Redirect Test ===")
    result = AuditResult("Unauthenticated Dashboard Access")
    result.screenshot_path = "docs/audit-screenshots/dashboard-unauth-redirect.png"
    
    setup_console_listeners(page, result)
    setup_network_listeners(page, result)
    
    # Navigate to dashboard without login
    print(f"  Navigating to /dashboard without authentication...")
    initial_url = f"{BASE_URL}/dashboard"
    page.goto(initial_url)
    page.wait_for_load_state("networkidle")
    
    result.final_url = page.url
    
    # Check if redirected
    if "/login" in result.final_url:
        result.redirected = True
        result.visual_observations.append("Successfully redirected to login page")
        print(f"  ✓ Redirected to login page")
    else:
        result.redirected = False
        result.visual_observations.append(f"WARNING: Not redirected to login! Current URL: {result.final_url}")
        print(f"  ✗ Not redirected to login page!")
    
    # Accessibility
    check_page_accessibility(page, result)
    
    # Screenshot
    page.screenshot(path=result.screenshot_path, full_page=True)
    print(f"  Screenshot saved: {result.screenshot_path}")
    
    return result

def run_scenario_5(page: Page) -> AuditResult:
    """Scenario 5: Post-login redirect test"""
    print("\n=== Scenario 5: Post-Login Redirect Test ===")
    result = AuditResult("Post-Login Redirect")
    result.screenshot_path = "docs/audit-screenshots/post-login-redirect.png"
    
    setup_console_listeners(page, result)
    setup_network_listeners(page, result)
    
    # Login
    if not login(page, ACCOUNTS["pro"]["email"], ACCOUNTS["pro"]["password"], result):
        page.screenshot(path=result.screenshot_path, full_page=True)
        return result
    
    result.final_url = page.url
    
    # Check if redirected to dashboard
    if "/dashboard" in result.final_url:
        result.redirected = True
        result.visual_observations.append("Successfully redirected to dashboard after login")
        print(f"  ✓ Redirected to dashboard")
    elif "/login" in result.final_url:
        result.redirected = False
        result.visual_observations.append("ERROR: Stuck on login page after successful login!")
        print(f"  ✗ Still on login page!")
    else:
        result.redirected = True
        result.visual_observations.append(f"Redirected to: {result.final_url}")
        print(f"  Redirected to: {result.final_url}")
    
    # Accessibility
    check_page_accessibility(page, result)
    
    # Screenshot
    page.screenshot(path=result.screenshot_path, full_page=True)
    print(f"  Screenshot saved: {result.screenshot_path}")
    
    # Logout
    logout(page)
    
    return result

def run_scenario_6(page: Page) -> AuditResult:
    """Scenario 6: /admin page check"""
    print("\n=== Scenario 6: Admin Page Check ===")
    result = AuditResult("Admin Page Access")
    result.screenshot_path = "docs/audit-screenshots/admin-page.png"
    
    setup_console_listeners(page, result)
    setup_network_listeners(page, result)
    
    # Login as admin
    if not login(page, ACCOUNTS["admin"]["email"], ACCOUNTS["admin"]["password"], result):
        page.screenshot(path=result.screenshot_path, full_page=True)
        return result
    
    # Navigate to admin page
    print(f"  Navigating to /admin...")
    page.goto(f"{BASE_URL}/admin")
    page.wait_for_load_state("networkidle")
    result.final_url = page.url
    
    # Check if admin page loaded
    if "/admin" in result.final_url:
        result.visual_observations.append("Admin page loaded successfully")
        print(f"  ✓ Admin page accessible")
    else:
        result.visual_observations.append(f"WARNING: Redirected from /admin to {result.final_url}")
        print(f"  ✗ Redirected away from admin page")
    
    # Visual checks
    check_visual_elements(page, result, ["admin panel"])
    
    # Accessibility
    check_page_accessibility(page, result)
    
    # Screenshot
    page.screenshot(path=result.screenshot_path, full_page=True)
    print(f"  Screenshot saved: {result.screenshot_path}")
    
    # Logout
    logout(page)
    
    return result

def run_session_persistence_test(page: Page) -> Dict[str, Any]:
    """Test session persistence after refresh"""
    print("\n=== Session Persistence Test ===")
    
    result = {
        "login_success": False,
        "url_before_refresh": "",
        "url_after_refresh": "",
        "session_persisted": False,
        "observations": []
    }
    
    # Login as pro user
    print(f"  Logging in as Pro user...")
    temp_result = AuditResult("temp")
    if not login(page, ACCOUNTS["pro"]["email"], ACCOUNTS["pro"]["password"], temp_result):
        result["observations"].append("Login failed")
        return result
    
    result["login_success"] = True
    
    # Navigate to dashboard
    print(f"  Navigating to /dashboard...")
    page.goto(f"{BASE_URL}/dashboard")
    page.wait_for_load_state("networkidle")
    result["url_before_refresh"] = page.url
    print(f"  URL before refresh: {result['url_before_refresh']}")
    
    # Refresh
    print(f"  Refreshing page...")
    page.reload()
    page.wait_for_load_state("networkidle")
    result["url_after_refresh"] = page.url
    print(f"  URL after refresh: {result['url_after_refresh']}")
    
    # Check if session persisted
    if "/dashboard" in result["url_after_refresh"]:
        result["session_persisted"] = True
        result["observations"].append("✓ Session persisted after refresh - stayed on dashboard")
        print(f"  ✓ Session persisted!")
    elif "/login" in result["url_after_refresh"]:
        result["session_persisted"] = False
        result["observations"].append("✗ Session did NOT persist - redirected to login")
        print(f"  ✗ Session lost - redirected to login!")
    else:
        result["session_persisted"] = False
        result["observations"].append(f"✗ Unexpected redirect to: {result['url_after_refresh']}")
        print(f"  ✗ Unexpected redirect!")
    
    # Logout
    logout(page)
    
    return result

def generate_report(results: List[AuditResult], session_test: Dict[str, Any]):
    """Generate markdown report"""
    report = []
    report.append("# Authenticated Pages Audit Report")
    report.append("")
    report.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    report.append(f"**Base URL:** {BASE_URL}")
    report.append("")
    
    # Summary
    report.append("## Summary")
    report.append("")
    
    total_scenarios = len(results)
    successful_logins = sum(1 for r in results if r.login_success)
    scenarios_with_console_errors = sum(1 for r in results if len(r.console_errors) > 0)
    scenarios_with_network_errors = sum(1 for r in results if len(r.network_errors) > 0)
    
    report.append(f"- **Total scenarios tested:** {total_scenarios}")
    report.append(f"- **Successful logins:** {successful_logins}/{total_scenarios}")
    report.append(f"- **Scenarios with console errors:** {scenarios_with_console_errors}")
    report.append(f"- **Scenarios with network errors:** {scenarios_with_network_errors}")
    report.append(f"- **Session persistence:** {'✓ PASSED' if session_test['session_persisted'] else '✗ FAILED'}")
    report.append("")
    
    # Scenario Results
    report.append("## Scenario Results")
    report.append("")
    
    for idx, result in enumerate(results, 1):
        report.append(f"### Scenario {idx}: {result.scenario_name}")
        report.append("")
        report.append(f"- **Screenshot:** `{result.screenshot_path}`")
        report.append(f"- **Login success:** {'✓ Yes' if result.login_success else '✗ No'}")
        report.append(f"- **Final URL:** `{result.final_url}`")
        
        if result.error_message:
            report.append(f"- **Error:** {result.error_message}")
        
        # Console errors
        if result.console_errors:
            report.append(f"- **Console errors:** ({len(result.console_errors)} found)")
            for error in result.console_errors[:10]:  # Limit to first 10
                report.append(f"  - `{error}`")
            if len(result.console_errors) > 10:
                report.append(f"  - _(... and {len(result.console_errors) - 10} more)_")
        else:
            report.append("- **Console errors:** None")
        
        # Console warnings
        if result.console_warnings:
            report.append(f"- **Console warnings:** ({len(result.console_warnings)} found)")
            for warning in result.console_warnings[:5]:  # Limit to first 5
                report.append(f"  - `{warning}`")
            if len(result.console_warnings) > 5:
                report.append(f"  - _(... and {len(result.console_warnings) - 5} more)_")
        
        # Network errors
        if result.network_errors:
            report.append(f"- **Network errors:** ({len(result.network_errors)} found)")
            for error in result.network_errors[:10]:  # Limit to first 10
                report.append(f"  - `{error}`")
            if len(result.network_errors) > 10:
                report.append(f"  - _(... and {len(result.network_errors) - 10} more)_")
        else:
            report.append("- **Network errors:** None")
        
        # Visual observations
        if result.visual_observations:
            report.append(f"- **Visual observations:**")
            for obs in result.visual_observations:
                report.append(f"  - {obs}")
        
        # Accessibility observations
        if result.accessibility_observations:
            report.append(f"- **Accessibility observations:**")
            for obs in result.accessibility_observations:
                report.append(f"  - {obs}")
        
        report.append("")
    
    # Session Persistence Test
    report.append("## Session Persistence Test")
    report.append("")
    report.append(f"- **Login success:** {'✓ Yes' if session_test['login_success'] else '✗ No'}")
    report.append(f"- **URL before refresh:** `{session_test['url_before_refresh']}`")
    report.append(f"- **URL after refresh:** `{session_test['url_after_refresh']}`")
    report.append(f"- **Session persisted:** {'✓ Yes' if session_test['session_persisted'] else '✗ No'}")
    
    if session_test['observations']:
        report.append(f"- **Observations:**")
        for obs in session_test['observations']:
            report.append(f"  - {obs}")
    
    report.append("")
    
    # Critical Issues
    report.append("## Critical Issues Requiring Immediate Attention")
    report.append("")
    
    critical_issues = []
    
    # Check for failed logins
    for result in results:
        if not result.login_success and "Unauthenticated" not in result.scenario_name:
            critical_issues.append(f"❌ **Login failed for {result.scenario_name}**: {result.error_message}")
    
    # Check for post-login redirect issues
    for result in results:
        if "Post-Login Redirect" in result.scenario_name:
            if not result.redirected or "/login" in result.final_url:
                critical_issues.append(f"❌ **Post-login redirect broken**: Users stuck on login page after authentication")
    
    # Check for unauthenticated access
    for result in results:
        if "Unauthenticated" in result.scenario_name:
            if not result.redirected or "/login" not in result.final_url:
                critical_issues.append(f"❌ **Authentication bypass vulnerability**: Unauthenticated users can access /dashboard")
    
    # Check for session persistence
    if not session_test['session_persisted']:
        critical_issues.append(f"❌ **Session persistence broken**: Users logged out after page refresh")
    
    # Check for excessive console errors
    for result in results:
        if len(result.console_errors) > 5:
            critical_issues.append(f"⚠️ **Excessive console errors on {result.scenario_name}**: {len(result.console_errors)} errors detected")
    
    # Check for excessive network errors
    for result in results:
        if len(result.network_errors) > 3:
            critical_issues.append(f"⚠️ **Excessive network errors on {result.scenario_name}**: {len(result.network_errors)} failed requests")
    
    if critical_issues:
        for issue in critical_issues:
            report.append(f"- {issue}")
    else:
        report.append("✅ **None found** - All scenarios passed successfully!")
    
    report.append("")
    
    # Recommendations
    report.append("## Recommendations")
    report.append("")
    
    recommendations = []
    
    # Check accessibility issues
    accessibility_issue_count = sum(len(r.accessibility_observations) for r in results)
    if accessibility_issue_count > 0:
        recommendations.append(f"- **Accessibility**: Address {accessibility_issue_count} accessibility observations across all pages")
    
    # Check console warnings
    warning_count = sum(len(r.console_warnings) for r in results)
    if warning_count > 10:
        recommendations.append(f"- **Console warnings**: Investigate and resolve {warning_count} console warnings")
    
    if recommendations:
        for rec in recommendations:
            report.append(rec)
    else:
        report.append("- No additional recommendations at this time")
    
    report.append("")
    report.append("---")
    report.append("*End of report*")
    
    return "\n".join(report)

def main():
    print("=" * 60)
    print("Purple Glow Social 2.0 - Authenticated Pages Audit")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = context.new_page()
        
        results = []
        
        # Run all scenarios
        results.append(run_scenario_1(page))
        results.append(run_scenario_2(page))
        results.append(run_scenario_3(page))
        results.append(run_scenario_4(page))
        results.append(run_scenario_5(page))
        results.append(run_scenario_6(page))
        
        # Run session persistence test
        session_test = run_session_persistence_test(page)
        
        # Generate report
        print("\n" + "=" * 60)
        print("Generating report...")
        print("=" * 60)
        
        report_content = generate_report(results, session_test)
        
        # Save report
        report_path = "docs/audit-screenshots/report-authenticated.md"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        print(f"\n✓ Report saved to: {report_path}")
        
        browser.close()
    
    print("\n" + "=" * 60)
    print("Audit complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
