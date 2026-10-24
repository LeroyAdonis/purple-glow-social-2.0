"""Measure the style guide cover lockup, then bake the correction into the generator."""
import pathlib
import re

from playwright.sync_api import sync_playwright

HTML = pathlib.Path("/root/posta-revive/design-system/posta/styleguide.html")
PROBE = """() => {
  const out = [];
  const pairs = [['.cover .word', '.cover .bub']];
  for (const [wSel, bSel] of pairs) {
    const w = document.querySelector(wSel), b = document.querySelector(bSel);
    if (!w || !b) { out.push(null); continue; }
    const wr = w.getBoundingClientRect(), br = b.getBoundingClientRect();
    const fs = parseFloat(getComputedStyle(w).fontSize);
    const baseline = wr.bottom - fs * 0.21;
    out.push({residual: Math.round(br.bottom - baseline),
              gap: Math.round(br.left - wr.right), size: Math.round(br.height), font: fs});
  }
  return out;
}"""

with sync_playwright() as p:
    browser = p.chromium.launch(args=["--no-sandbox"])
    page = browser.new_page()
    page.goto(f"file://{HTML}", wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(1800)
    before = page.evaluate(PROBE)
    browser.close()

print("cover lockup before:", before)
need = before[0]["residual"] if before and before[0] else 0

gen = pathlib.Path("/root/posta-revive/design-system/posta/build-styleguide.py")
src = gen.read_text()
m = re.search(r"\.cover \.bub \{\{ margin-left: 6px; margin-bottom: (\d+)px; \}\}", src)
current = int(m.group(1)) if m else 19
if need:
    src = src.replace(f"margin-bottom: {current}px;", f"margin-bottom: {current - need}px;")
    gen.write_text(src)
    print(f"baked: cover bubble margin-bottom {current} -> {current - need}px (it was {need}px too low)")
else:
    print("no correction needed")
