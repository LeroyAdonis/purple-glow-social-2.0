# RETIRED 2026-10-27
# The approved styleframe contract ended when Leroy approved the rebrand on 2026-10-27.
# This parity check measured the old styleframe and is superseded by the taste-skill rebrand.
# Kept for history; do not run as a gate.

#!/usr/bin/env python3
"""Section-by-section parity: the landing styleframe vs the shipped landing page.

Why this exists: a styleframe that is only looked at produces a build that is "close", and close is a rejection.
This measures the shipped page against the styleframe file, section by section, on the properties that actually
carry the design — ground colour, padding, type size, weight, tracking, radius, border, fill — and prints what
differs. 0 differences is the bar.

The trick that makes it reliable: BOTH files carry the same `data-sf="..."` attributes. The styleframe is
written with them so the live markup can be written with them too, which means one selector works on both sides
and there is no hand-maintained mapping table to drift.

Usage:
    python3 scripts/parity-landing.py                 # default: local file vs live site
    python3 scripts/parity-landing.py --live http://127.0.0.1:3008/
    python3 scripts/parity-landing.py --json out.json --shots   # also write PNGs + composite

Exit codes: 0 all equal · 1 differences · 2 could not measure (never read 2 as a pass).
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
STYLEFRAME = ROOT / "design-system/posta/styleframe/landing.html"
OUTDIR = ROOT / "design-system/posta/styleframe/parity"
W, H = 1600, 1000

# Every compared element, by the shared data-sf role. order does not matter.
ROLES = [
    "hero", "page", "copy", "mark", "eyebrow", "h1", "sub", "cta", "primary", "link", "phone", "screen", "draft",
    "slot", "slot-go",
    "features", "features-head", "features-grid", "feature-card",
    "how", "how-head", "steps", "step",
    "pricing", "pricing-head", "pricing-grid", "price-card",
    "contact", "contact-head", "contact-email", "contact-hours",
    "footer", "footer-nav",
]

# Roles whose own text is a design decision. Container roles are excluded: their text is the concatenation of
# their children, so comparing it duplicates every child comparison and reports the logo as a copy change.
TEXT_ROLES = {"h1", "sub", "primary", "link", "contact-email", "contact-hours", "footer",
              "feature-card", "price-card", "step", "slot", "slot-go"}

PROPS = [
    "backgroundColor", "color", "borderRadius", "borderColor", "borderWidth", "boxShadow",
    "padding", "margin", "gap", "fontSize", "fontWeight", "letterSpacing", "lineHeight",
    "fontFamily", "textTransform", "opacity", "display", "gridTemplateColumns",
    # underline geometry: a 44px tap target with a border-bottom put the line 13px below the words and
    # a 0-difference run did not notice, because nothing compared these.
    "textDecorationLine", "textDecorationThickness", "textUnderlineOffset", "textDecorationColor",
]

# Values that mean "not specified", so comparing them produces noise rather than a defect.
MEANS_UNSET = {"normal", "none", "auto", "0px", "rgba(0, 0, 0, 0)", "transparent"}

JS = """
([role, props]) => {
  // Sections repeat (cards, steps, slots). Measure the FIRST of each role: geometry of the first instance is
  // what the eye compares, and comparing every instance against one makes the table unreadable.
  const el = document.querySelector(`[data-sf="${role}"]`);
  if (!el) return null;
  const c = getComputedStyle(el), r = el.getBoundingClientRect();
  const style = {};
  for (const p of props) style[p] = c[p];
  const text = (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 80);
  return {
    box: {w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top)},
    style, text,
  };
}
"""


def launch_args() -> dict:
    cache = os.path.expanduser("~/.cache/ms-playwright")
    for pat in ("chromium-*/chrome-linux*/chrome", "chromium_headless_shell-*/chrome-linux*/chrome-headless-shell"):
        hits = sorted(glob.glob(os.path.join(cache, pat)))
        if hits:
            return {"executable_path": hits[-1], "args": ["--no-sandbox"]}
    return {"args": ["--no-sandbox"]}


def clean(v: str) -> str:
    v = str(v)
    if v.startswith("rgba(") and v.endswith(", 0)"):
        return "rgba(0, 0, 0, 0)"
    return v.replace('"', "").split(",")[0].strip() if "px" in v or v.startswith("rgb") else v


def measure(page, url: str) -> dict:
    page.goto(url, wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(1200)  # webfonts, otherwise every size is measured against a fallback
    page.evaluate("""() => {
      for (const el of document.querySelectorAll('[role=dialog], [aria-label*=cookie i], [class*=cookie i]'))
        el.remove();
    }""")
    page.wait_for_timeout(150)
    return {role: page.evaluate(JS, [role, PROPS]) for role in ROLES}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--live", default="https://posta.digitalwavetech.dev/")
    ap.add_argument("--mockup", default=str(STYLEFRAME))
    ap.add_argument("--json", default="")
    ap.add_argument("--shots", action="store_true", help="also write mockup.png, live.png and compare.png")
    ap.add_argument("--pixels", action="store_true",
                    help="also screenshot every role on both sides and report differing pixels. "
                         "Computed styles cannot see a decoration that failed to paint.")
    args = ap.parse_args()

    mock_url = pathlib.Path(args.mockup).resolve().as_uri()

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("playwright missing: pip install playwright && playwright install chromium", file=sys.stderr)
        return 2

    with sync_playwright() as p:
        browser = p.chromium.launch(**launch_args())
        page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        mock, live = measure(page, mock_url), measure(page, args.live)
        if args.shots:
            OUTDIR.mkdir(parents=True, exist_ok=True)
            for name, url in (("mockup", mock_url), ("live", args.live)):
                page.goto(url, wait_until="networkidle", timeout=60000)
                page.wait_for_timeout(1200)
                page.evaluate("""() => {
                  for (const el of document.querySelectorAll('[role=dialog], [aria-label*=cookie i], [class*=cookie i]'))
                    el.remove();
                }""")
                page.screenshot(path=str(OUTDIR / f"{name}.png"), full_page=True)
        browser.close()

    if not any(mock.values()):
        print("the styleframe measured nothing — wrong path? refusing to call that a pass", file=sys.stderr)
        return 2

    rows, diffs, missing = [], 0, 0
    for role in ROLES:
        m, l = mock.get(role), live.get(role)
        if m is None:
            continue
        if l is None:
            rows.append((role, "present", "yes", "ABSENT"))
            diffs += 1
            missing += 1
            continue
        for k in ("w", "h", "x", "y"):
            if m["box"][k] != l["box"][k]:
                rows.append((role, k, str(m["box"][k]), str(l["box"][k])))
                diffs += 1
        # the mark is a drawn logo, not a string — its geometry is compared, its glyphs are not
        if role in TEXT_ROLES and m["text"] != l["text"]:
            rows.append((role, "text", m["text"][:26], l["text"][:26]))
            diffs += 1
        for prop in PROPS:
            mv, lv = clean(m["style"][prop]), clean(l["style"][prop])
            if mv == lv:
                continue
            if mv in MEANS_UNSET:  # "unspecified" is not a target
                continue
            rows.append((role, prop, mv[:26], lv[:26]))
            diffs += 1

    print(f"{'section':14} {'property':18} {'styleframe':26} {'live':26}")
    print("-" * 88)
    for r in rows:
        print(f"{r[0]:14} {r[1]:18} {r[2]:26} {r[3]:26}")
    print("-" * 88)
    print(f"{diffs} measured differences across {len([r for r in ROLES if mock.get(r)])} roles"
          + (f" ({missing} role(s) missing from the live page)" if missing else ""))

    pixel_rows = []
    if args.pixels:
        try:
            from PIL import Image, ImageChops
        except ImportError:
            print("Pillow missing: pip install pillow", file=sys.stderr)
            return 2
        outdir = ROOT / "design-system/posta/styleframe/parity/pixels"
        outdir.mkdir(parents=True, exist_ok=True)
        with sync_playwright() as p2:
            browser = p2.chromium.launch(**launch_args())
            page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
            shots: dict[str, dict[str, str]] = {}
            for side, url in (("mock", mock_url), ("live", args.live)):
                page.goto(url, wait_until="networkidle", timeout=60000)
                page.wait_for_timeout(1200)
                page.evaluate("""() => {
                  for (const el of document.querySelectorAll('[role=dialog], [aria-label*=cookie i], [class*=cookie i]'))
                    el.remove();
                }""")
                page.wait_for_timeout(150)
                for role in ROLES:
                    loc = page.locator(f'[data-sf="{role}"]')
                    if not loc.count():
                        continue
                    f = outdir / f"{role}-{side}.png"
                    try:
                        loc.first.screenshot(path=str(f))
                        shots.setdefault(role, {})[side] = str(f)
                    except Exception:
                        pass
            browser.close()
        print("\nPIXEL DIFF (a role whose pixels differ is drawing something the computed styles did not reveal)")
        print("-" * 88)
        for role, both in shots.items():
            if "mock" not in both or "live" not in both:
                continue
            a, b = Image.open(both["mock"]).convert("RGB"), Image.open(both["live"]).convert("RGB")
            if a.size != b.size:
                pixel_rows.append((role, f"size {a.size[0]}x{a.size[1]}", f"{b.size[0]}x{b.size[1]}"))
                continue
            diff = ImageChops.difference(a, b)
            changed = sum(1 for px in list(diff.getdata()) if sum(px) > 30)
            total = a.size[0] * a.size[1]
            pct = changed / total * 100 if total else 0
            if pct > 0.5:
                pixel_rows.append((role, f"{pct:.1f}% of {total}", f"{changed} px"))
        if pixel_rows:
            for r in pixel_rows:
                print(f"{r[0]:14} {'differs':18} {r[1]:26} {r[2]:26}")
            diffs += len(pixel_rows)
        else:
            print("every compared role paints identically")
        print("-" * 88)

    if args.json:
        pathlib.Path(args.json).write_text(json.dumps({"mockup": mock, "live": live, "diffs": rows}, indent=2))

    if args.shots:
        try:
            from PIL import Image, ImageDraw
            a = Image.open(OUTDIR / "mockup.png")
            b = Image.open(OUTDIR / "live.png")
            pad, bar = 28, 60
            canvas = Image.new("RGB", (a.width + b.width + pad * 3, max(a.height, b.height) + bar + pad * 2), "#141414")
            canvas.paste(a, (pad, bar + pad))
            canvas.paste(b, (pad * 2 + a.width, bar + pad))
            d = ImageDraw.Draw(canvas)
            d.text((pad + 8, 20), "STYLEFRAME  design-system/posta/styleframe/landing.html", fill="#ffffff")
            d.text((pad * 2 + a.width + 8, 20), "LIVE  posta.digitalwavetech.dev", fill="#e9a93c")
            canvas.save(OUTDIR / "compare.png")
            print(f"composite: {OUTDIR / 'compare.png'}")
        except Exception as e:  # noqa: BLE001
            print("composite failed:", e, file=sys.stderr)

    return 1 if diffs else 0


if __name__ == "__main__":
    sys.exit(main())
