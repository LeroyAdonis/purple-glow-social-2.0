#!/usr/bin/env python3
"""verify-fixes.py — my own measurement of all three bug fixes, independent of what the agents claimed.

An agent's report says what it believes; this says what the running server actually does. Every check
prints PASS or FAIL with the measured value, and the exit code is the number of failures.
"""
import sys

from playwright.sync_api import sync_playwright

BASE = "https://zahra.digitalwavetech.dev"
fails = 0


def check(label: str, ok: bool, detail: str = "") -> None:
    global fails
    print(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f" — {detail}" if detail else ""))
    if not ok:
        fails += 1


def main() -> int:
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox"])

        # ---------- 1. cookie banner must not cover the signup button at 390px ----------
        ctx = browser.new_context(viewport={"width": 390, "height": 844})
        page = ctx.new_page()
        page.goto(f"{BASE}/posta/signup", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(2000)

        box = page.locator('button[type="submit"]').first.bounding_box()
        if not box:
            check("signup submit button found", False, "no bounding box")
        else:
            # Scroll the button into view first. The bar is fixed and the form is long, so on a phone the
            # button legitimately starts below the fold; the question is whether a click on it REACHES it
            # once the user has scrolled to it, which is the thing that was broken.
            page.locator('button[type="submit"]').first.scroll_into_view_if_needed()
            page.wait_for_timeout(600)
            box = page.locator('button[type="submit"]').first.bounding_box()
            cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
            hit = page.evaluate(
                """([x, y]) => {
                    const el = document.elementFromPoint(x, y);
                    if (!el) return 'NONE';
                    const banner = el.closest('[role="dialog"], [data-cookie-banner], .cookie-consent-banner');
                    return (banner ? 'BANNER:' : 'OK:') + el.tagName + '#' + (el.id || '');
                }""",
                [cx, cy],
            )
            check("banner does not cover the submit button when it is in view", hit.startswith("OK:"), hit)

            # and prove a human click actually lands on the form, not the bar
            page.locator('button[type="submit"]').first.click(timeout=5000)
            page.wait_for_timeout(1200)
            reached_form = page.evaluate(
                "() => document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)")
            check("a real click reaches the form", reached_form,
                  page.evaluate("() => document.activeElement ? document.activeElement.id || document.activeElement.tagName : 'none'"))

        # ---------- 2. signing in lands on the app, not the host root ----------
        page.goto(f"{BASE}/posta/login", wait_until="networkidle", timeout=60000)
        page.wait_for_timeout(1500)
        # dismiss consent if it is in the way of a human click
        page.evaluate(
            """() => { const d = document.querySelector('[role="dialog"]');
                 if (d) for (const b of d.querySelectorAll('button'))
                   if (/accept/i.test(b.innerText)) { b.click(); break; } }"""
        )
        page.wait_for_timeout(500)
        page.fill("#email", "demo@posta.co.za")
        page.fill("#password", "Posta2026!")
        page.click('button[type="submit"]')
        page.wait_for_timeout(7000)

        url = page.url
        body = page.inner_text("body")[:400]
        landed_in_app = "/posta/dashboard" in url
        not_placeholder = "zahra is live" not in body
        check("after login the URL is the app path", landed_in_app, url.replace(BASE, ""))
        check("after login the page is not the placeholder", not_placeholder,
              body[:60].replace("\n", " "))

        # ---------- 3. the two previously-missing endpoints answer with real data ----------
        for path in ("/api/user/credits", "/api/user/connected-accounts"):
            res = page.evaluate(
                """async (p) => { const r = await fetch(p);
                     const t = await r.text();
                     return [r.status, t.slice(0, 120)]; }""",
                path,
            )
            check(f"{path} returns 200 JSON when signed in", res[0] == 200, f"{res[0]} {res[1][:80]}")

        page.screenshot(path="/root/posta-revive/shots/verified-dashboard.png")
        ctx.close()

        # ---------- 4. unauthenticated calls are guarded, not 404 ----------
        anon = browser.new_context(viewport={"width": 390, "height": 844})
        ap = anon.new_page()
        ap.goto(f"{BASE}/posta", wait_until="networkidle", timeout=60000)
        for path in ("/api/user/credits", "/api/user/connected-accounts"):
            code = ap.evaluate(
                """async (p) => (await fetch(p)).status""", path)
            check(f"{path} is auth-guarded for anonymous users", code == 401, str(code))
        anon.close()
        browser.close()

    print(f"\n{'ALL CHECKS PASSED' if fails == 0 else str(fails) + ' CHECK(S) FAILED'}")
    return fails


if __name__ == "__main__":
    sys.exit(main())
