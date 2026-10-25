#!/usr/bin/env python3
"""Responsive gate: the faults that only appear at a device width.

Born from a real report — "image in hero is touching the nav and it's broken on tablet - iPad Pro to be exact".
Two faults were live and no check could see them:
  1. every breakpoint's top padding (40-60px) was smaller than the 65px fixed nav, so the hero content slid under
     the bar at every width below 1400;
  2. the single-column switch was at 1024px, which IS iPad Pro portrait, so a tablet with room for two columns
     got a 392x800 phone left-aligned underneath the copy.

So this grades the widths people actually hold, not just the styleframe's 1600 canvas, and it FAILS on:
  - any hero/content element starting above the fixed nav's bottom edge
  - real sideways scrolling (scrollWidth > clientWidth AND the document actually moves)
  - the phone mockup overlapping the copy column
  - a missing <h1>

Usage:  python3 scripts/responsive-check.py [base-url] [--json out.json]
Exit:   0 all viewports clean, 1 at least one FAIL
"""
from __future__ import annotations

import argparse
import json
import sys

from playwright.sync_api import sync_playwright

# The devices we care about, named, so a failure says "iPad Pro portrait" instead of "1024".
VIEWPORTS = [
    (390, 844, "iPhone 14"),
    (430, 932, "iPhone Pro Max"),
    (768, 1024, "iPad portrait"),
    (834, 1194, "iPad Air landscape"),
    (1024, 1366, "iPad Pro portrait"),
    (1194, 834, "iPad Pro 11 landscape"),
    (1366, 1024, "iPad Pro 12.9 landscape"),
    (1440, 900, "laptop"),
    (1600, 1000, "styleframe canvas"),
]

PROBE = """() => {
  const box = (sel) => { const el = document.querySelector(sel); if (!el) return null;
    const b = el.getBoundingClientRect();
    return {t: Math.round(b.top), l: Math.round(b.left), w: Math.round(b.width),
            h: Math.round(b.height), b: Math.round(b.bottom), r: Math.round(b.right)}; };
  const nav = document.querySelector('nav, header');
  const nb = nav ? nav.getBoundingClientRect() : null;
  const overlaps = (a, b) => !!a && !!b &&
    !(a.r <= b.left || a.l >= b.right || a.b <= b.top || a.t >= b.bottom);
  const copy = box('[data-pf=copy], [data-sf=copy]');
  const phone = box('[data-pf=phone], [data-sf=phone]');
  const h1 = box('h1');
  const doc = document.documentElement;
  const navBottom = nb ? Math.round(nb.bottom) : 0;
  return {
    vw: window.innerWidth,
    scrollW: doc.scrollWidth, clientW: doc.clientWidth,
    navBottom: navBottom, navFixed: nb ? getComputedStyle(nav).position : null,
    copy: copy, phone: phone, h1: h1,
    copyUnderNav: !!copy && copy.t < navBottom - 1,
    phoneUnderNav: !!phone && phone.t < navBottom - 1,
    phoneOverCopy: overlaps(phone, copy ? {left: copy.l, right: copy.r, top: copy.t, bottom: copy.b} : null),
    noH1: !h1,
  };
}"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("url", nargs="?", default="https://posta.digitalwavetech.dev")
    ap.add_argument("--json", help="write results as JSON")
    args = ap.parse_args()

    results = []
    failures = 0
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox"])
        for w, h, name in VIEWPORTS:
            page = browser.new_page(viewport={"width": w, "height": h})
            try:
                page.goto(args.url, wait_until="networkidle", timeout=60000)
                page.wait_for_timeout(1100)
                # drop the consent banner: it is fixed over the top on phones and would be graded as an overlap
                page.evaluate("""() => {
                  for (const el of document.querySelectorAll('[class*=cookie i], [class*=consent i], [role=dialog]'))
                    el.remove();
                  document.body.style.paddingTop = '';
                  document.body.style.paddingBottom = '';
                }""")
                page.wait_for_timeout(150)
                d = page.evaluate(PROBE)
                # a real horizontal scroll, not just scrollWidth: overflow-x:hidden makes scrollWidth a liar
                page.evaluate("() => window.scrollTo(500, 0)")
                d["scrollX"] = page.evaluate("() => window.scrollX")
            except Exception as exc:  # a viewport that cannot even load is a failure, not a skip
                results.append({"viewport": name, "size": f"{w}x{h}", "problems": [f"load error: {exc}"]})
                failures += 1
                page.close()
                continue

            problems = []
            if d["copyUnderNav"]:
                problems.append(f"copy starts at y{d['copy']['t']}, nav ends at y{d['navBottom']}")
            if d["phoneUnderNav"]:
                problems.append(f"phone starts at y{d['phone']['t']}, nav ends at y{d['navBottom']}")
            if d["phoneOverCopy"]:
                problems.append("phone overlaps the copy column")
            if d["scrollW"] > d["clientW"] and d["scrollX"] > 0:
                problems.append(f"sideways scroll ({d['scrollW']} > {d['clientW']})")
            if d["noH1"]:
                problems.append("no <h1>")

            state = "FAIL" if problems else "ok  "
            if problems:
                failures += 1
            print(f"  {state}  {name:24} {w}x{h}")
            for pr in problems:
                print(f"          · {pr}")
            results.append({"viewport": name, "size": f"{w}x{h}", "problems": problems,
                            "navBottom": d["navBottom"],
                            "copyTop": (d["copy"] or {}).get("t"),
                            "phone": d["phone"]})
            page.close()
        browser.close()

    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(results, fh, indent=2)

    print(f"\n{len(VIEWPORTS) - failures}/{len(VIEWPORTS)} viewports clean")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
