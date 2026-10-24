"""Prove the speech-bubble tail points at the wordmark (left), by measuring ink distribution."""
import pathlib

from PIL import Image
from playwright.sync_api import sync_playwright

OUT = pathlib.Path("/root/posta-revive/design-system/posta/preview")
OUT.mkdir(parents=True, exist_ok=True)

PATH = ("M48 9C25 9 9 24 9 44c0 21 17 35 39 35 4 0 8-.5 11.5-1.4l17 10-4.5-18"
        "C80 63 88 54 88 44 88 24 71 9 48 9z")

HTML = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{{margin:0;background:#FBF6EF;display:flex;gap:40px;padding:40px;font-family:sans-serif}}
.cell{{text-align:center}}
.bubble svg{{display:block}}
b{{font-size:13px;color:#24140F;display:block;margin-top:10px}}
i{{font-size:11px;color:#6E5B4E;font-style:normal}}
</style></head><body>
<div class="cell"><div class="bubble">
<svg viewBox="0 0 100 100" width="200" height="200">
<path d="{PATH}" fill="none" stroke="#8E3B2E" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="48" cy="43" r="9" fill="#E9A93C"/></svg></div>
<b>BEFORE — tail right</b><i>tip faces away from the word</i></div>

<div class="cell"><div class="bubble">
<svg viewBox="0 0 100 100" width="200" height="200">
<g transform="translate(100,0) scale(-1,1)">
<path d="{PATH}" fill="none" stroke="#8E3B2E" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="48" cy="43" r="9" fill="#E9A93C"/></g></svg></div>
<b>AFTER — tail left</b><i>tip points at the “a”</i></div>
</body></html>"""

page_file = OUT / "bubble-flip.html"
page_file.write_text(HTML)

with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 700, "height": 320})
    pg.goto(f"file://{page_file}", wait_until="networkidle")
    pg.wait_for_timeout(600)
    shot = OUT / "bubble-flip.png"
    pg.screenshot(path=str(shot))
    b.close()

# Measure: in the bottom third of each bubble, which half holds more ink?
image = Image.open(shot).convert("L")
w, h = image.size
cells = [(40, 240), (280, 480)]  # x ranges of the two bubbles at 200px wide, 40px padding
labels = ["before (tail right)", "after (tail left)"]
for (x0, x1), label in zip(cells, labels):
    top, bottom = 40, 240
    mid_y = top + int((bottom - top) * 0.66)
    left_ink = right_ink = 0
    for x in range(x0, x1):
        for y in range(mid_y, bottom):
            if image.getpixel((x, y)) < 120:  # dark ink
                if x < (x0 + x1) // 2:
                    left_ink += 1
                else:
                    right_ink += 1
    side = "LEFT" if left_ink > right_ink else "RIGHT"
    print(f"  {label}: bottom-third ink -> left {left_ink}px, right {right_ink}px  => tail on the {side}")
print(f"  comparison image: {shot}")
