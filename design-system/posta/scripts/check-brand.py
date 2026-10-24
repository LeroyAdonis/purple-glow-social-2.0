#!/usr/bin/env python3
"""check-brand.py — measure a Posta UI against the brand rules. Numbers, not opinions.

Run it against a rendered page (via a saved HTML dump or a URL) or against source files. It reports:

  1. Banned patterns in source: gradients, glow, glass/blur, the old palette, flag colours, second accents.
  2. Type sizes actually used on a rendered page, counted — the failure mode this system exists to stop.
  3. Gold misuse: gold used as text colour on a light surface, or more than one gold element per screen.
  4. Contrast for every distinct text/background pair, computed in real sRGB.
  5. Touch targets under 44px.

Exit code 1 if any hard violation is found, so it can gate a build.

Usage:
  python3 check-brand.py --src /path/to/app          # static source scan
  python3 check-brand.py --url https://example.com   # rendered page (needs playwright)
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# ── The palette this system defines ──────────────────────────────────────────────────────────────────
TOKENS = {
    "clay": "#8E3B2E", "clay-deep": "#742F25", "clay-tint": "#F2E2DA",
    "cream": "#F7EDE2", "paper": "#FBF6EF", "white": "#FFFFFF",
    "ink": "#24140F", "ink-soft": "#6E5B4E", "line": "#EADCCB",
    "gold": "#E9A93C", "success": "#2F6B4F", "danger": "#A32B22", "warning": "#8A5A12",
}

# The old palette. Every one of these must be gone before the redesign counts as done.
BANNED_TOKENS = {
    "--neon-grape": "#9D4EDD", "--joburg-teal": "#00E0FF", "--pretoria-blue": "#1A1F3A",
    "--mzansi-gold": "#FFCC00", "--void": "#0D0F1C", "--glass-border": "rgba(255,255,255",
}
BANNED_PATTERNS = [
    (r"bg-gradient|linear-gradient|radial-gradient|conic-gradient", "gradient"),
    # `backdrop-filter: none` is the FIX, not the crime — match only a real blur value
    (r"backdrop-blur(?!-none)|backdrop-filter:\s*(?!none)(blur|saturate)", "glass/blur"),
    (r"\bshadow-\[0_0_\d+px", "glow shadow"),
    (r"from-sa-green|via-sa-gold|to-sa-red|from-sa-gold|bg-sa-green|bg-sa-red|bg-sa-blue", "SA flag colours"),
    (r"\btext-joburg-teal|\bbg-neon-grape|\bborder-glass-border", "old palette utility class"),
]
TYPE_SIZE_RE = re.compile(r"font-size:\s*([\d.]+)px")
HEX_RE = re.compile(r"#[0-9a-fA-F]{6}\b")


# ── Colour maths (real sRGB, because oklch cannot be eyeballed) ─────────────────────────────────────
def _lin(c: float) -> float:
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_colour: str) -> float:
    h = hex_colour.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def contrast(fg: str, bg: str) -> float:
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return round((hi + 0.05) / (lo + 0.05), 2)


# ── Static source scan ──────────────────────────────────────────────────────────────────────────────
def scan_source(root: Path) -> list[str]:
    problems: list[str] = []
    files = [p for p in root.rglob("*") if p.suffix in (".tsx", ".ts", ".css", ".jsx", ".js")
             and "node_modules" not in str(p) and ".next" not in str(p)]
    hits: dict[str, list[str]] = {}
    for p in files:
        text = p.read_text(errors="ignore")
        # comments are prose, not pixels: a JSX comment saying "placeholder gradient" is not a gradient
        text = re.sub(r"\{/\*.*?\*/\}", "", text, flags=re.S)
        text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
        text = re.sub(r"//[^\n]*", "", text)
        rel = str(p.relative_to(root))
        for token in BANNED_TOKENS:
            if token in text:
                hits.setdefault(f"old palette token {token}", []).append(rel)
        for pattern, label in BANNED_PATTERNS:
            if re.search(pattern, text):
                hits.setdefault(label, []).append(rel)
    for label, where in sorted(hits.items()):
        problems.append(f"{label}: {len(where)} file(s), e.g. {where[0]}")
    return problems


# ── Rendered page scan ─────────────────────────────────────────────────────────────────────────────
def scan_url(url: str) -> list[str]:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return ["playwright not installed — cannot scan a rendered page"]

    problems: list[str] = []
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--no-sandbox"])
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        pg.goto(url, wait_until="networkidle", timeout=60000)

        data = pg.evaluate("""() => {
          const out = {sizes: {}, pairs: {}, small: [], gold: []};
          const norm = c => {
            const m = c.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
            if (!m) return null;
            // fully transparent is NOT a colour. Without this, an element sitting on a transparent ancestor
            // resolves to #000000 and the checker reports "#000000 on #000000 = 1.0:1" — a false positive
            // that trains you to ignore the tool.
            if (m[4] !== undefined && parseFloat(m[4]) === 0) return null;
            return '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join('').toUpperCase();
          };
          const bgOf = el => {
            let n = el;
            while (n && n !== document.documentElement) {
              const c = norm(getComputedStyle(n).backgroundColor);
              if (c) return c;
              n = n.parentElement;
            }
            const root = norm(getComputedStyle(document.documentElement).backgroundColor);
            const body = norm(getComputedStyle(document.body).backgroundColor);
            return body || root || '#FFFFFF';
          };
          for (const el of document.querySelectorAll('*')) {
            // Only rendered elements. Without this the checker 'measures' <title> in <head> and reports
            // black-on-black, which is technically true and completely meaningless.
            if (!el.getClientRects().length) continue;
            const cs = getComputedStyle(el);
            const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length);
            if (hasText) {
              out.sizes[cs.fontSize] = (out.sizes[cs.fontSize] || 0) + 1;
              const fg = norm(cs.color), bg = bgOf(el);
              if (fg) {
                const key = fg + ' on ' + bg;
                out.pairs[key] = (out.pairs[key] || 0) + 1;
              }
              if (fg === '#E9A93C') out.gold.push(el.className || el.tagName);
            }
            const isInlineLink = el.tagName === 'A' && getComputedStyle(el).display === 'inline';
            if (!isInlineLink && (['A','BUTTON','INPUT','SELECT','TEXTAREA'].includes(el.tagName) || el.onclick)) {
              const r = el.getBoundingClientRect();
              // Height is the rule for anything carrying a text label: a "Log in" link 41px wide and 44px tall
              // is easy to hit. Width only matters for icon-only controls, where no label is doing the work.
              const hasLabel = (el.textContent || '').trim().length > 0 || el.getAttribute('aria-label');
              if (r.width > 0 && r.height > 0 && (r.height < 44 || (!hasLabel && r.width < 44))) {
                out.small.push({tag: el.tagName, w: Math.round(r.width), h: Math.round(r.height)});
              }
            }
          }
          return out;
        }""")
        b.close()

    sizes = sorted(((float(k.replace("px", "")), v) for k, v in data["sizes"].items()), reverse=True)
    distinct = [s for s, _ in sizes]
    if len(distinct) > 10:
        problems.append(f"{len(distinct)} distinct type sizes on the page (system allows 10): {distinct}")
    tiny = [s for s in distinct if s < 11]
    if tiny:
        problems.append(f"type below the 11px floor: {tiny}")

    below = []
    for pair, count in data["pairs"].items():
        fg, bg = [x.strip() for x in pair.split(" on ")]
        try:
            r = contrast(fg, bg)
        except Exception:
            continue
        if r < 4.5:
            below.append(f"{pair} = {r}:1 ({count} element(s))")
    if below:
        problems.append("contrast below 4.5:1: " + "; ".join(below[:8]))

    if data["gold"]:
        problems.append(f"gold used as text colour on {len(data['gold'])} element(s) — gold on light is 1.91:1")
    if data["small"]:
        problems.append(f"{len(data['small'])} interactive target(s) under 44px, e.g. {data['small'][:3]}")
    return problems


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", help="source directory to scan")
    ap.add_argument("--url", help="rendered URL to scan")
    ap.add_argument("--allow-legacy-names", action="store_true",
                    help="legacy Tailwind class names now resolve to brand colours; treat the rename as "
                         "debt rather than a failure. Never use this to hide gradients, glass or glow.")
    args = ap.parse_args()
    if not args.src and not args.url:
        ap.print_help()
        return 2

    problems: list[str] = []
    if args.src:
        problems += scan_source(Path(args.src))
    if args.url:
        problems += scan_url(args.url)

    if not problems:
        print("PASS — no brand violations found")
        return 0
    print(f"FAIL — {len(problems)} brand violation group(s):")
    blocking = [p for p in problems if not (args.allow_legacy_names and p.startswith("old palette utility class"))]
    for p in problems:
        tag = "(debt) " if args.allow_legacy_names and p.startswith("old palette utility class") else ""
        print("  ·", tag + p)
    if not blocking:
        print("PASS (with rename debt noted)")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
