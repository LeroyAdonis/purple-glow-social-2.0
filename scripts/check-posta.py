#!/usr/bin/env python3
"""check-posta.py — is the revived app actually usable, or just returning 200?

An HTTP 200 proves a server answered. This opens the pages in a real browser, captures console errors and
the visible text, and screenshots each one, so "it works" is a claim backed by what a user would see.
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "https://zahra.digitalwavetech.dev/posta"
PAGES = [("/", "landing"), ("/login", "login"), ("/signup", "signup"), ("/dashboard", "dashboard")]
OUT = Path("/root/posta-revive/shots")
OUT.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(args=["--no-sandbox"])
    for path, name in PAGES:
        context = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1)
        page = context.new_page()
        errors: list[str] = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        try:
            resp = page.goto(BASE + path, wait_until="networkidle", timeout=45000)
            status = resp.status if resp else "?"
        except Exception as exc:  # noqa: BLE001
            print(f"{name:10} FAILED to load: {type(exc).__name__}: {exc}")
            context.close()
            continue
        page.wait_for_timeout(2500)
        text = " ".join(page.inner_text("body").split())
        shot = OUT / f"{name}.png"
        page.screenshot(path=str(shot), full_page=False)
        print(f"\n{name:10} HTTP {status}  final={page.url.replace(BASE, '') or '/'}")
        print(f"           text: {text[:220]}")
        if errors:
            print(f"           console errors ({len(errors)}):")
            for e in errors[:4]:
                print(f"             - {e[:160]}")
        else:
            print("           console errors: none")
        print(f"           screenshot: {shot}")
        context.close()
    browser.close()
