#!/usr/bin/env python3
"""test-signup.py — prove the revived app can register and authenticate a real user.

The stack swap (Neon HTTP -> node-postgres) only counts as working if a user can be created in the local
database and then see an authenticated page. Anything less is a rendered login form.
"""
import re
import sys

from playwright.sync_api import sync_playwright

BASE = "https://zahra.digitalwavetech.dev/posta"
EMAIL = "leroy+demo3@digitalwavetech.dev"
PASSWORD = "PostaDemo2026!"

with sync_playwright() as p:
    browser = p.chromium.launch(args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 390, "height": 844})
    page = ctx.new_page()
    errors: list[str] = []
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

    page.goto(BASE + "/signup", wait_until="networkidle", timeout=45000)
    page.wait_for_timeout(1500)
    # The cookie banner is fixed to the bottom at z-9999 and covers the submit button on a 390px screen.
    # That is a real defect worth reporting; here it is dismissed so the flow can be tested at all.
    dismissed = page.evaluate("""() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return 'no banner';
        for (const btn of dialog.querySelectorAll('button')) {
            if (/accept|agree|ok|save|essential|got it/i.test(btn.innerText || '')) { btn.click(); return btn.innerText.trim(); }
        }
        return 'no matching button: ' + Array.from(dialog.querySelectorAll('button')).map(b => b.innerText).join('|');
    }""")
    print(f"cookie banner: {dismissed}")
    page.wait_for_timeout(1200)
    # The form identifies its fields by id, not by name attribute.
    page.fill('#name', "Leroy Demo")
    page.fill('#email', EMAIL)
    page.fill('#password', PASSWORD)
    if page.locator('#confirmPassword').count():
        page.fill('#confirmPassword', PASSWORD)
    page.screenshot(path="/root/posta-revive/shots/signup-filled.png")
    page.click('button[type="submit"]')
    page.wait_for_timeout(6000)

    print("after signup:")
    print(f"  url: {page.url.replace(BASE, '') or '/'}")
    body = " ".join(page.inner_text("body").split())
    print(f"  text: {body[:300]}")
    page.screenshot(path="/root/posta-revive/shots/after-signup.png")

    if "login" in page.url or "signup" in page.url:
        print("\nsignup did not get through; trying a direct login with the same credentials")
        page.goto(BASE + "/login", wait_until="networkidle", timeout=45000)
        page.wait_for_timeout(1200)
        page.fill('#email', EMAIL)
        page.fill('#password', PASSWORD)
        page.click('button[type="submit"]')
        page.wait_for_timeout(6000)
        print(f"  after login url: {page.url.replace(BASE, '') or '/'}")
        print(f"  text: {' '.join(page.inner_text('body').split())[:300]}")
        page.screenshot(path="/root/posta-revive/shots/after-login.png")

    print(f"\nconsole/page errors: {len(errors)}")
    for e in errors[:5]:
        print(f"  - {e[:200]}")
    browser.close()
