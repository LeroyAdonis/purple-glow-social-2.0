#!/usr/bin/env python3
"""build-styleguide.py — render the Posta style guide to PDF.

Reads the real icon files (Lucide from node_modules, doodles from design/icons/doodle) so the guide can never
drift from what ships. Colour ratios are computed here rather than typed from memory.
"""
from __future__ import annotations

import pathlib
import re
import subprocess

ROOT = pathlib.Path("/root/posta-revive")
LUCI = pathlib.Path("/tmp/icontest/node_modules/lucide-static/icons")
DOODLE = ROOT / "design/icons/doodle"
OUT_HTML = ROOT / "design-system/posta/styleguide.html"
OUT_PDF = ROOT / "design-system/posta/POSTA-STYLE-GUIDE.pdf"


def lin(c: float) -> float:
    c /= 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def lum(h: str) -> float:
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def ratio(a: str, b: str) -> float:
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return round((hi + 0.05) / (lo + 0.05), 2)


def lucide(name: str, size: int = 22, stroke: float = 2) -> str:
    f = LUCI / f"{name}.svg"
    if not f.exists():
        return f'<span class="miss">?</span>'
    body = re.sub(r"^\s*<svg[^>]*>", "", f.read_text()).replace("</svg>", "")
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round">{body}</svg>')


def doodle(name: str, size: int = 40) -> str:
    cands = list(DOODLE.rglob(f"{name}.svg"))
    if not cands:
        return '<span class="miss">?</span>'
    s = cands[0].read_text().replace('fill="black"', 'fill="currentColor"').replace('fill="#000"', 'fill="currentColor"')
    s = re.sub(r'<svg[^>]*?width="[^"]*"', f'<svg width="{size}"', s, count=1)
    s = re.sub(r'height="[^"]*"', f'height="{size}"', s, count=1)
    return s


# The tail points BACK toward the wordmark, i.e. it sits on the left of the bubble and the tip faces the
# final "a". The shape is drawn with the tail on the right and mirrored with an SVG transform, because a
# hand-edited mirror of a bezier path is a place mistakes hide. translate(100,0) scale(-1,1) flips it exactly
# about the vertical centre of the 100x100 viewBox.
BUBBLE = ('<svg viewBox="0 0 100 100" width="{s}" height="{s}" aria-hidden="true">'
          '<g transform="translate(100,0) scale(-1,1)">'
          '<path d="M48 9C25 9 9 24 9 44c0 21 17 35 39 35 4 0 8-.5 11.5-1.4l17 10-4.5-18C80 63 88 54 88 44 88 24 71 9 48 9z" '
          'fill="none" stroke="{c}" stroke-width="11" stroke-linejoin="round" stroke-linecap="round"/>'
          '<circle cx="48" cy="43" r="9" fill="#E9A93C"/>'
          '</g></svg>')

SWATCHES = [
    ("clay", "#8E3B2E", "Brand field. Marketing ground, primary fills."),
    ("clay-deep", "#742F25", "Pressed field. The only clay safe for gold text."),
    ("clay-tint", "#F2E2DA", "Selected chip, quiet fill."),
    ("cream", "#F7EDE2", "Type on the field."),
    ("paper", "#FBF6EF", "The app background."),
    ("ink", "#24140F", "All body type on light."),
    ("ink-soft", "#6E5B4E", "Secondary text, meta."),
    ("gold", "#E9A93C", "The single accent. Once per screen."),
    ("line", "#EADCCB", "Hairlines only."),
]
STATES = [("success", "#2F6B4F"), ("danger", "#A32B22"), ("warning", "#8A5A12")]

swatch_cards = "".join(
    f'<div class="sw"><div class="chip" style="background:{hexv}"></div>'
    f'<div class="meta"><b>--posta-{name}</b><code>{hexv}</code>'
    f'<span>{desc}</span>'
    f'<em>on paper {ratio(hexv, "#FBF6EF")}:1 · on clay {ratio(hexv, "#8E3B2E")}:1</em></div></div>'
    for name, hexv, desc in SWATCHES)
state_cards = "".join(
    f'<div class="sw"><div class="chip" style="background:{h}"></div>'
    f'<div class="meta"><b>--posta-{n}</b><code>{h}</code>'
    f'<em>on paper {ratio(h, "#FBF6EF")}:1</em></div></div>' for n, h in STATES)

SCALE = [("display", 96, 700, 0.95, -0.03, "Write it once."), ("h1", 48, 700, 1.15, -0.02, "Tuesday’s posts"),
         ("h2", 32, 700, 1.15, -0.01, "Ready to approve"), ("h3", 22, 500, 1.25, 0, "IsiZulu draft"),
         ("body-lg", 18, 400, 1.55, 0, "Posta writes it in the language your customer thinks in."),
         ("body", 16, 400, 1.55, 0, "The default size for everything in the app."),
         ("small", 14, 400, 1.5, 0, "Secondary text and table cells."),
         ("meta", 12, 500, 1.4, 0.16, "SCHEDULED · 17:30 SAST"),
         ("micro", 11, 500, 1.4, 0.10, "11px is the floor. Nothing smaller.")]
specimen = "".join(
    f'<div class="spec"><div class="spec-meta"><b>{n}</b><span>{s}px · {w} · lh {lh}'
    f'{"" if not tr else f" · tracking {tr}em"}</span></div>'
    f'<div class="spec-line" style="font-family:{"var(--display)" if w==700 or n=="h3" else "var(--body)"};'
    f'font-size:{min(s,60)}px;font-weight:{w};line-height:{lh};letter-spacing:{tr}em;'
    f'{"text-transform:uppercase;" if n=="meta" else ""}">{t}</div></div>'
    for n, s, w, lh, tr, t in SCALE)

ui_icons = ["message-circle", "calendar-clock", "list-checks", "sparkles", "image", "send",
            "chart-no-axes-column", "languages", "settings", "circle-alert"]
icons_row = "".join(
    f'<div class="ic"><div class="icbox">{lucide(n, 24)}</div>'
    f'<div class="icbox sm">{lucide(n, 16, 2.4)}</div><b>{n}</b></div>' for n in ui_icons)
doodles = ["message", "calendar", "photo", "megaphone", "magic-wand", "trophy"]
doodle_row = "".join(f'<div class="ic"><div class="icbox lg">{doodle(d, 44)}</div><b>{d}</b></div>' for d in doodles)

html = f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Posta style guide</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  @page {{ size: A4 landscape; margin: 0; }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  :root {{ --clay:#8E3B2E; --clay-deep:#742F25; --clay-tint:#F2E2DA; --cream:#F7EDE2; --paper:#FBF6EF;
           --ink:#24140F; --ink-soft:#6E5B4E; --gold:#E9A93C; --line:#EADCCB; --success:#2F6B4F;
           --danger:#A32B22; --warning:#8A5A12;
           --display:"Space Grotesk",sans-serif; --body:"Inter",sans-serif; }}
  body {{ font-family: var(--body); color: var(--ink); background: var(--paper); }}
  .page {{ width: 297mm; height: 210mm; padding: 14mm 16mm; page-break-after: always; position: relative;
           display: flex; flex-direction: column; overflow: hidden; }}
  .page:last-child {{ page-break-after: auto; }}
  .pnum {{ position: absolute; bottom: 8mm; right: 16mm; font-size: 9px; color: var(--ink-soft);
           letter-spacing: .12em; text-transform: uppercase; }}
  .kicker {{ font-size: 9px; letter-spacing: .18em; text-transform: uppercase; color: var(--ink-soft); }}
  h1 {{ font-family: var(--display); font-weight: 700; letter-spacing: -.03em; }}
  h2 {{ font-family: var(--display); font-weight: 700; font-size: 22px; letter-spacing: -.02em;
        margin-bottom: 4mm; }}
  h3 {{ font-family: var(--display); font-weight: 500; font-size: 13px; margin-bottom: 2mm; }}
  .row {{ display: flex; gap: 5mm; }}
  .rule {{ border-top: 1px solid var(--line); margin: 4mm 0; }}
  /* cover */
  .cover {{ background: var(--clay); color: var(--cream); justify-content: space-between; }}
  .cover .mark {{ display: flex; align-items: flex-end; }}
  .cover .word {{ font-family: var(--display); font-weight: 700; font-size: 92px; letter-spacing: -.045em;
                  line-height: 1; }}
  .cover .bub {{ margin-left: 6px; margin-bottom: 19px; }}
  .cover h1 {{ font-size: 40px; line-height: 1.02; max-width: 780px; }}
  .cover .sub {{ font-size: 13px; max-width: 620px; color: rgba(247,237,226,.82); line-height: 1.6; }}
  .cover .foot {{ display: flex; gap: 14mm; font-size: 11px; color: rgba(247,237,226,.72); }}
  .cover .foot b {{ display: block; font-family: var(--display); font-size: 20px; color: var(--cream); }}
  /* swatches */
  .grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }}
  .sw {{ display: flex; gap: 3mm; align-items: flex-start; }}
  .chip {{ width: 16mm; height: 16mm; border-radius: 3mm; border: 1px solid rgba(36,20,15,.10); flex: none; }}
  .sw .meta {{ font-size: 9px; line-height: 1.5; }}
  .sw .meta b {{ display: block; font-size: 10px; }}
  .sw code {{ display: block; color: var(--ink-soft); }}
  .sw .meta span {{ display: block; color: var(--ink-soft); max-width: 42mm; }}
  .sw .meta em {{ display: block; font-style: normal; font-size: 8px; margin-top: 1mm; color: var(--clay); }}
  /* type */
  .spec {{ display: flex; gap: 6mm; align-items: baseline; border-bottom: 1px solid var(--line);
           padding: 2.6mm 0; }}
  .spec-meta {{ width: 34mm; flex: none; font-size: 8.5px; color: var(--ink-soft); }}
  .spec-meta b {{ display: block; font-size: 10px; color: var(--ink); }}
  .spec-line {{ white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
  /* components */
  .btn {{ border-radius: 999px; padding: 0 7mm; height: 12mm; display: inline-flex; align-items: center;
          font-size: 12px; font-weight: 500; }}
  .btn.primary {{ background: var(--gold); color: var(--ink); }}
  .btn.primary.hover {{ background: #D2962B; }}
  .btn.secondary {{ border: 1px solid var(--clay); color: var(--ink); }}
  .btn.quiet {{ color: var(--ink-soft); text-decoration: underline; }}
  .btn.disabled {{ background: var(--gold); color: var(--ink); opacity: .4; }}
  .btn.focus {{ background: var(--gold); color: var(--ink); outline: 2px solid var(--clay); outline-offset: 2px; }}
  .field {{ border: 1px solid var(--line); border-radius: 2mm; background: #fff; height: 12mm;
            display: flex; align-items: center; padding: 0 4mm; font-size: 12px; width: 70mm; color: var(--ink-soft); }}
  .field.err {{ border-color: var(--danger); }}
  .label {{ font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: var(--ink-soft);
            margin-bottom: 1.5mm; }}
  .card {{ border: 1px solid var(--line); border-radius: 4mm; background: #fff; padding: 4mm; width: 96mm;
           box-shadow: 0 2px 8px -2px rgba(36,20,15,.10); }}
  .badge {{ font-size: 8px; letter-spacing: .14em; text-transform: uppercase; padding: 1mm 2.4mm;
            border-radius: 999px; }}
  /* icons */
  .ic {{ text-align: center; }}
  .icbox {{ width: 11mm; height: 11mm; border: 1px solid var(--line); border-radius: 2mm; display: flex;
            align-items: center; justify-content: center; background: #fff; margin: 0 auto 1mm; }}
  .icbox.sm {{ width: 8mm; height: 8mm; }}
  .icbox.lg {{ width: 15mm; height: 15mm; }}
  .ic b {{ font-size: 7.5px; color: var(--ink-soft); font-weight: 400; display: block; max-width: 18mm; }}
  ul {{ font-size: 11px; line-height: 1.65; padding-left: 4mm; }}
  li {{ margin-bottom: 1mm; }}
  .no li {{ color: var(--danger); }}
  .yes li {{ color: var(--success); }}
</style></head><body>

<!-- 1 · COVER -->
<section class="page cover">
  <div>
    <div class="mark"><div class="word">posta</div><div class="bub">{BUBBLE.format(s=38, c="#F7EDE2")}</div></div>
  </div>
  <div>
    <div class="kicker" style="color:rgba(247,237,226,.6);margin-bottom:6mm">Brand and design system · v1 · 25 October 2026</div>
    <h1>Warm, flat, and quiet<br>enough to be trusted.</h1>
    <p class="sub" style="margin-top:6mm">Direction C &ldquo;Phone First&rdquo;. One colour field, one accent, three type
    sizes per screen. The whole point of this system is that it is smaller than the one it replaces — the old interface
    stacked gradients, glass, glow and six accents, which is why it read as busy.</p>
  </div>
  <div class="foot">
    <div><b>11</b>official languages</div>
    <div><b>4</b>platforms</div>
    <div><b>3</b>type sizes per view</div>
    <div><b>1</b>accent, once per screen</div>
    <div><b>0</b>gradients</div>
  </div>
  <div class="pnum" style="color:rgba(247,237,226,.5)">01</div>
</section>

<!-- 2 · COLOUR -->
<section class="page">
  <div class="kicker">Colour</div>
  <h2>Five colours, and every ratio measured</h2>
  <div class="grid">{swatch_cards}</div>
  <div class="rule"></div>
  <h3>State colours — functional, never decorative</h3>
  <div class="grid" style="grid-template-columns:repeat(3,1fr)">{state_cards}</div>
  <div class="rule"></div>
  <div class="row" style="gap:8mm">
    <div>
      <h3>The gold rules</h3>
      <ul class="no">
        <li>Ink on gold 8.63:1 — the primary button, that is the job</li>
        <li>Gold on clay 3.63:1 — large text or graphics only</li>
        <li>Gold on paper 1.91:1 — <b>never</b> text, hairline or focus ring</li>
        <li>One gold element per screen. Two means do neither</li>
      </ul>
    </div>
    <div>
      <h3>Corrected in this version</h3>
      <ul>
        <li>Warning was <code>#B5761A</code> at 3.51:1 on paper — failed AA, now <code>#8A5A12</code> at 5.50:1</li>
        <li>Focus rings are per surface: clay on light (6.94:1), cream on clay (6.45:1)</li>
        <li>Gold as a focus ring was invisible on paper, which is why it is banned</li>
      </ul>
    </div>
  </div>
  <div class="pnum">02 · colour</div>
</section>

<!-- 3 · TYPE -->
<section class="page">
  <div class="kicker">Typography</div>
  <h2>Space Grotesk for display, Inter for reading — ten sizes, 11px floor</h2>
  {specimen}
  <div class="pnum">03 · typography</div>
</section>

<!-- 4 · COMPONENTS -->
<section class="page">
  <div class="kicker">Components</div>
  <h2>Every state, because the missing ones are what feel unfinished</h2>
  <div class="row">
    <div>
      <h3>Button</h3>
      <div style="display:flex;flex-wrap:wrap;gap:3mm;align-items:center;max-width:120mm">
        <span class="btn primary">Approve and schedule</span>
        <span class="btn primary hover">Hover</span>
        <span class="btn primary focus">Focus</span>
        <span class="btn primary disabled">Disabled</span>
        <span class="btn secondary">Secondary</span>
        <span class="btn quiet">Quiet action</span>
      </div>
      <div class="rule"></div>
      <h3>Field</h3>
      <div class="label">Email address</div>
      <div class="field">you@yourbusiness.co.za</div>
      <div class="label" style="margin-top:3mm">Email address</div>
      <div class="field err">thabo@</div>
      <div style="font-size:9px;color:var(--danger);margin-top:1.5mm">That address is missing an @domain.</div>
    </div>
    <div>
      <h3>The post card — the component the product exists for</h3>
      <div class="card">
        <div style="display:flex;gap:2mm;align-items:center;margin-bottom:3mm">
          <span class="badge" style="background:var(--clay-tint);color:var(--ink)">isiZulu</span>
          <span class="badge" style="background:var(--clay-tint);color:var(--ink)">Instagram</span>
          <span style="font-size:10px;color:var(--ink-soft);margin-left:auto;font-variant-numeric:tabular-nums">07:00 SAST</span>
        </div>
        <div style="font-size:13px;line-height:1.55">&ldquo;Isinkwa esisha siphuma ngo-7. Woza masinyane — amavetkoek aphela ngokushesha.&rdquo;</div>
        <div style="display:flex;gap:3mm;align-items:center;margin-top:4mm">
          <span class="btn primary" style="height:9mm;font-size:11px;padding:0 5mm">Approve</span>
          <span style="font-size:11px;color:var(--ink-soft);text-decoration:underline">Edit</span>
          <span class="badge" style="background:var(--clay-tint);margin-left:auto">Scheduled</span>
        </div>
      </div>
      <div style="font-size:9px;color:var(--ink-soft);margin-top:2mm;max-width:96mm">A failed post always says
      why and what to do: &ldquo;Instagram rejected the image: 9MB, the limit is 8MB.&rdquo; Never &ldquo;something went wrong&rdquo;.</div>
    </div>
  </div>
  <div class="pnum">04 · components</div>
</section>

<!-- 5 · ICONS -->
<section class="page">
  <div class="kicker">Icons and illustration</div>
  <h2>The rule is size, not taste</h2>
  <div class="row" style="gap:10mm">
    <div style="flex:1">
      <h3>Lucide — the interface. 16–24px, stroke 2</h3>
      <div class="row" style="gap:3mm;flex-wrap:wrap">{icons_row}</div>
      <div style="font-size:9.5px;color:var(--ink-soft);margin-top:3mm;max-width:120mm">ISC licence, 2,171 icons,
      installs from npm. One stroke weight so the set stays even as it shrinks. This is what lives in a sidebar,
      a toolbar and a table.</div>
    </div>
    <div style="flex:1">
      <h3>Doodle Icons — illustration. 32px and up</h3>
      <div class="row" style="gap:4mm">{doodle_row}</div>
      <div style="font-size:9.5px;color:var(--ink-soft);margin-top:3mm;max-width:120mm">CC0, 451 SVGs. Charming and
      hand-drawn, which is the brand voice. They are <b>filled paths, not strokes</b>: measured at 24px they go chunky, and at
      16px the calendar becomes a square and the gear becomes a lump. So they illustrate, they never operate the UI.</div>
    </div>
  </div>
  <div class="rule"></div>
  <div class="row" style="gap:10mm">
    <div style="flex:1"><h3>Never</h3>
      <ul class="no"><li>An emoji used as an icon</li><li>A doodle in a toolbar or a table</li>
      <li>A stock speech bubble as the logo</li><li>Two stroke weights on one screen</li></ul></div>
    <div style="flex:1"><h3>Always</h3>
      <ul class="yes"><li>Lucide under 32px, doodles at 32px and above</li><li>An icon with a label, or an aria-label</li>
      <li>Official brand marks for Instagram, Facebook, X and LinkedIn</li><li>One icon weight per view</li></ul></div>
  </div>
  <div class="pnum">05 · icons</div>
</section>

<!-- 6 · VOICE -->
<section class="page">
  <div class="kicker">Voice, and the rules that override it</div>
  <h2>Warm, direct, competent. Never performing.</h2>
  <div class="row" style="gap:8mm">
    <div style="flex:1">
      <h3>How it sounds</h3>
      <ul><li>Speaks to <b>you</b>, not &ldquo;users&rdquo;</li>
      <li>SA English: organise, colour, centre</li>
      <li>Rands as <b>R299</b>. Times as <b>17:30 SAST</b>, 24-hour</li>
      <li>Language names in their own language: isiZulu, Sesotho, Afrikaans</li>
      <li>&ldquo;No posts scheduled yet. Pick a day and Posta will draft three.&rdquo;</li></ul>
      <div class="rule"></div>
      <h3>Banned words</h3>
      <ul class="no"><li>oops, whoops, simply, just, easily</li><li>revolutionary, game-changing, seamless, effortless, unlock</li></ul>
    </div>
    <div style="flex:1">
      <h3>Honesty rules — these override tone</h3>
      <ul>
        <li><b>Never claim a number we cannot show.</b> The old front page said &ldquo;5,000+ SA businesses&rdquo; with zero customers. It is gone.</li>
        <li><b>Never invent a testimonial.</b> Three were live from demo personas. Gone.</li>
        <li><b>Never claim a capability that is not built.</b> &ldquo;Coming soon&rdquo; is honest.</li>
        <li><b>Name the limit:</b> &ldquo;Free plan: 10 credits, 5 scheduled posts.&rdquo;</li>
        <li><b>Errors state the cause and the fix.</b> Never &ldquo;something went wrong&rdquo;.</li>
        <li><b>Do not claim load-shedding resilience.</b> Eskom reported 500+ days without load-shedding on 2 Oct 2026.</li>
      </ul>
    </div>
  </div>
  <div class="pnum">06 · voice</div>
</section>

</body></html>"""

OUT_HTML.parent.mkdir(parents=True, exist_ok=True)
OUT_HTML.write_text(html, encoding="utf-8")

from playwright.sync_api import sync_playwright  # noqa: E402

with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox"])
    pg = b.new_page()
    pg.goto(f"file://{OUT_HTML}", wait_until="networkidle", timeout=60000)
    pg.wait_for_timeout(2200)  # webfonts
    pg.pdf(path=str(OUT_PDF), format="A4", landscape=True, print_background=True,
           margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
    b.close()

print(f"html: {OUT_HTML} ({OUT_HTML.stat().st_size} bytes)")
print(f"pdf : {OUT_PDF} ({OUT_PDF.stat().st_size} bytes)")
out = subprocess.run(["python3", "-c", f"import pymupdf;d=pymupdf.open('{OUT_PDF}');print('pages:',d.page_count)"],
                     capture_output=True, text=True)
print(out.stdout.strip() or out.stderr.strip())
