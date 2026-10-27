# RETIRED 2026-10-27
# The approved styleframe contract ended when Leroy approved the rebrand on 2026-10-27.
# This parity check measured the old "phone-first" styleframe and is superseded by the taste-skill rebrand.
# Kept for history; do not run as a gate.

#!/usr/bin/env python3
"""Side-by-side + measured diff: the approved styleframe (003-phone-first) vs the live page.

The styleframe is a 1600x1000 canvas, so both are shot at exactly that viewport: parity at the size the
approver saw, not at whatever width happens to be convenient.

Prints a section-by-section table of computed values. Anything in the DIFF column is a real, measured
difference — not an impression from looking at a screenshot.
"""
import json
import pathlib
import subprocess
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path("/root/posta-revive")
MOCK = f"file://{ROOT}/sketches/003-phone-first/index.html"
LIVE = "https://posta.digitalwavetech.dev/"
OUT = ROOT / "sketches" / "parity-phone-first"
W, H = 1600, 1000

# (label, mockup selector, live selector). Live side uses its own selectors because the React markup differs —
# that is the point: we compare the ROLE, not the class name.
PAIRS = [
    ("page container", ".page", "[data-pf=page]"),
    ("eyebrow", ".eyebrow", "[data-pf=eyebrow], .pf-eyebrow"),
    ("h1", "h1", "h1"),
    ("sub copy", ".sub", "[data-pf=sub], .pf-sub"),
    ("primary cta", ".primary", "[data-pf=primary]"),
    ("phone frame", ".phone", "[data-pf=phone], .pf-phone"),
    ("phone screen", ".screen", "[data-pf=screen], .pf-screen"),
    ("draft card", ".draft", "[data-pf=draft], .pf-draft"),
    ("slot row", ".slot", "[data-pf=slot], .pf-slot"),
]

JS = """(sel) => {
  const el = sel.split(',').map(s => { try { return document.querySelector(s.trim()); } catch(e) { return null; } })
                 .find(Boolean);
  if (!el) return null;
  const c = getComputedStyle(el), r = el.getBoundingClientRect();
  return {
    bg: c.backgroundColor, color: c.color, radius: c.borderRadius, border: c.borderWidth + ' ' + c.borderColor,
    padding: c.padding, gap: c.gap, shadow: c.boxShadow === 'none' ? 'none' : 'yes',
    fs: c.fontSize, fw: c.fontWeight, ls: c.letterSpacing, lh: c.lineHeight,
    font: c.fontFamily.split(',')[0].replace(/"/g, ''),
    w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top),
  };
}"""


def shoot(page, url, path):
    page.goto(url, wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(900)
    # A cookie banner sits over the lower half of the live page and hides exactly the part being compared.
    # It is a state of the page, not part of its design, so it is dismissed for the comparison shot.
    page.evaluate("""() => {
      for (const el of document.querySelectorAll('[role=dialog], [aria-label*=cookie i], [class*=cookie i]'))
        el.remove();
    }""")
    page.wait_for_timeout(150)
    page.screenshot(path=str(path))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    shots, data = {}, {}
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--no-sandbox"])
        page = b.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        for name, url in (("mock", MOCK), ("live", LIVE)):
            shoot(page, url, OUT / f"{name}.png")
            data[name] = {}
            for label, msel, lsel in PAIRS:
                data[name][label] = page.evaluate(JS, msel if name == "mock" else lsel)
        b.close()

    # measured diff
    print(f"{'section':16} {'property':11} {'styleframe':28} {'live':28}")
    print("-" * 88)
    diffs = 0
    for label, _, _ in PAIRS:
        m, l = data["mock"].get(label), data["live"].get(label)
        if m is None:
            print(f"{label:16} {'MISSING':11} {'(not in styleframe)':28} {'-':28}")
            continue
        if l is None:
            print(f"{label:16} {'ABSENT':11} {str(m['w'])+'x'+str(m['h']):28} {'NOT FOUND ON LIVE PAGE':28}")
            diffs += 1
            continue
        for k in ("w", "h", "x", "y", "bg", "color", "radius", "padding", "gap", "fs", "fw", "ls", "lh", "font", "shadow"):
            mv, lv = m.get(k), l.get(k)
            if str(mv) == str(lv):
                continue
            # `normal` in the styleframe means "unspecified", not a target: comparing it to the
            # browser's resolved px value produces noise, not a defect.
            if k == "lh" and str(mv) == "normal":
                continue
            diffs += 1
            print(f"{label:16} {k:11} {str(mv)[:28]:28} {str(lv)[:28]:28}")

    print("-" * 88)
    print(f"{diffs} measured differences")
    (OUT / "diff.json").write_text(json.dumps(data, indent=2))

    # labelled side-by-side composite
    try:
        from PIL import Image, ImageDraw
        a, bb = Image.open(OUT / "mock.png"), Image.open(OUT / "live.png")
        pad, bar = 28, 60
        canvas = Image.new("RGB", (a.width + bb.width + pad * 3, max(a.height, bb.height) + bar + pad * 2), "#141414")
        canvas.paste(a, (pad, bar + pad))
        canvas.paste(bb, (pad * 2 + a.width, bar + pad))
        d = ImageDraw.Draw(canvas)
        d.text((pad + 8, 20), "APPROVED STYLEFRAME  003-phone-first", fill="#ffffff")
        d.text((pad * 2 + a.width + 8, 20), "LIVE  posta.digitalwavetech.dev", fill="#e9a93c")
        out = OUT / "compare.png"
        canvas.save(out)
        print(f"composite: {out}")
    except Exception as e:  # noqa: BLE001
        print("composite failed:", e, file=sys.stderr)


if __name__ == "__main__":
    main()
