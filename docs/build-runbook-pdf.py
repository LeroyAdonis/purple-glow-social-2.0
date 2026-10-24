#!/usr/bin/env python3
"""build-runbook-pdf.py — render the credentials runbook to a phone-readable PDF.

Same rules as the DWT Meta guide, because they were learned the hard way there: no ligatures and no
hyphenation (a long URL that wraps at a hyphen is broken when pasted), and fixed table layout so nothing
is clipped at the right margin.
"""
import sys
from pathlib import Path

from weasyprint import HTML

SRC = Path("/root/posta-revive/docs/CREDENTIALS-RUNBOOK.md")
OUT = Path("/root/posta-revive/docs/CREDENTIALS-RUNBOOK.pdf")

CSS = """
@page { size: A4; margin: 18mm 16mm 18mm 16mm; }
body { font-family: "Liberation Sans", "DejaVu Sans", sans-serif; font-size: 10.5pt; line-height: 1.5;
       color: #14161f; hyphens: none; -webkit-hyphens: none; }
h1 { font-size: 21pt; color: #0D0F1C; margin: 0 0 4mm 0; padding-bottom: 3mm;
     border-bottom: 3px solid #9D4EDD; page-break-before: avoid; }
h2 { font-size: 14pt; color: #5B21B6; margin: 9mm 0 3mm 0; page-break-before: auto;
     page-break-after: avoid; }
h3 { font-size: 11.5pt; color: #14161f; margin: 6mm 0 2mm 0; page-break-after: avoid; }
p, li { margin: 0 0 2.6mm 0; }
li { margin-left: 2mm; }
strong { color: #0D0F1C; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 9pt; background: #F4F2FA;
       padding: 0.4mm 1.2mm; border-radius: 2px; }
hr { border: none; border-top: 1px solid #D9D5E8; margin: 7mm 0; }
ol, ul { margin: 0 0 3mm 0; padding-left: 6mm; }
/* long identifiers and URLs must never break mid-token */
p, li, code { overflow-wrap: normal; word-break: normal; }
a { color: #5B21B6; text-decoration: none; }
"""


def md_to_html(md: str) -> str:
    """Minimal, predictable markdown -> HTML. Only the constructs this document uses."""
    import html as html_mod
    import re

    out: list[str] = []
    in_list: str | None = None
    in_code = False

    def close_list() -> None:
        nonlocal in_list
        if in_list:
            out.append(f"</{in_list}>")
            in_list = None

    for raw in md.splitlines():
        line = raw.rstrip()

        if line.startswith("```"):
            close_list()
            if in_code:
                out.append("</code></pre>")
                in_code = False
            else:
                out.append('<pre style="background:#F4F2FA;padding:3mm;border-radius:3px;'
                           'white-space:pre-wrap;"><code>')
                in_code = True
            continue
        if in_code:
            out.append(html_mod.escape(line))
            continue

        if not line.strip():
            close_list()
            continue

        escaped = html_mod.escape(line)
        # inline code first so its contents are not bold-processed
        escaped = re.sub(r"`([^`]+)`", lambda m: f"<code>{m.group(1)}</code>", escaped)
        escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
        escaped = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', escaped)

        if escaped.startswith("# "):
            close_list()
            out.append(f"<h1>{escaped[2:]}</h1>")
        elif escaped.startswith("## "):
            close_list()
            out.append(f"<h2>{escaped[3:]}</h2>")
        elif escaped.startswith("### "):
            close_list()
            out.append(f"<h3>{escaped[4:]}</h3>")
        elif escaped.strip() == "---":
            close_list()
            out.append("<hr/>")
        elif re.match(r"^\s*[-*]\s+", escaped):
            if in_list != "ul":
                close_list()
                out.append("<ul>")
                in_list = "ul"
            bullet_body = re.sub(r"^\s*[-*]\s+", "", escaped)
            out.append(f"<li>{bullet_body}</li>")
        elif re.match(r"^\s*\d+\.\s+", escaped):
            if in_list != "ol":
                close_list()
                out.append("<ol>")
                in_list = "ol"
            numbered_body = re.sub(r"^\s*\d+\.\s+", "", escaped)
            out.append(f"<li>{numbered_body}</li>")
        else:
            close_list()
            out.append(f"<p>{escaped}</p>")

    close_list()
    if in_code:
        out.append("</code></pre>")
    return "\n".join(out)


def main() -> int:
    if not SRC.exists():
        print(f"FAIL: source not found: {SRC}")
        return 1
    md = SRC.read_text(encoding="utf-8")
    html = f"<html><head><meta charset='utf-8'><style>{CSS}</style></head><body>{md_to_html(md)}</body></html>"
    HTML(string=html).write_pdf(OUT)

    import fitz  # pymupdf

    doc = fitz.open(OUT)
    text = "".join(page.get_text() for page in doc)
    print(f"PDF: {OUT}  pages={doc.page_count}  bytes={OUT.stat().st_size}")

    # copy-critical checks: these exact tokens must survive as whole strings
    critical = [
        "instagram_business_content_publish",
        "pages_manage_posts",
        "POLAR_WEBHOOK_SECRET",
        "TWITTER_CLIENT_SECRET",
        "LINKEDIN_CLIENT_SECRET",
        "2026/809312/07",
        "w_member_social",
    ]
    missing = [c for c in critical if c not in text]
    print(f"copy-critical strings: {len(critical) - len(missing)}/{len(critical)} intact")
    for m in missing:
        print(f"  BROKEN OR MISSING: {m}")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
