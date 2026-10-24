#!/usr/bin/env python3
"""gap-scan.py — find every fabricated claim, placeholder and missing legal surface in Posta.

Written because "check for fake stuff" by eye misses things. Each pattern below is a claim we cannot back
or a marker someone left behind. Output is grouped so the fixes can be done in priority order.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path("/root/posta-revive")
SCAN_DIRS = ["app", "components", "lib"]
SKIP = ("node_modules", ".next", "drizzle", "lib/translations", ".agent-briefs", "scripts", "docs")

GROUPS = {
    "FABRICATED CLAIMS (must be true or removed)": [
        r"\b\d{1,3}(,\d{3})+\+?\s*(SA\b|businesses|users|customers|posts|brands|creators)",
        r"\btrusted by\b",
        r"\bas seen (in|on)\b",
        r"\bfeatured (in|on)\b",
        r"\b\d+(\.\d+)?\s*(out of 5|/5)\b",
        r"\bstar rating\b",
        r"\b(Thabo|Zanele|Pieter|Nkosi|Dlamini|van der Merwe)\b",
        r"\b(John|Jane) Doe\b",
        r"\b(4\.[5-9]|5\.0)\s*(stars|rating)",
        r"\b#1\b",
        r"\bbest[- ]selling\b",
    ],
    "PLACEHOLDERS (fill or delete)": [
        r"lorem ipsum",
        r"\bTODO\b", r"\bFIXME\b", r"\bTBD\b",
        r"coming soon",
        r"example\.com",
        r"yourdomain", r"your-domain",
        r"placeholder\.(com|co)",
        r"via\.placeholder",
        r"\b555[- ]?\d{3,4}\b",
        r"test@test",
        r"\bXXX+\b",
        r"insert .{0,20} here",
        r"\bLorem\b",
    ],
    "DEMO DATA ON A PUBLIC SURFACE": [
        r"from ['\"]@/lib/mock-data",
        r"mockUser|MOCK_USERS|mockPosts|MOCK_POSTS",
    ],
    "DEAD OR FAKE LINKS": [
        r'href="#"',
        r'href="javascript:',
        r"mailto:example",
        r"https?://localhost",
    ],
}

# Legal/compliance surfaces a payment processor and a real buyer both expect
REQUIRED_ROUTES = {
    "privacy policy": ["app/privacy/page.tsx"],
    "terms of service": ["app/terms/page.tsx"],
    "refund / cancellation policy": ["app/refund/page.tsx", "app/refunds/page.tsx",
                                     "app/refund-policy/page.tsx", "app/cancellation/page.tsx"],
    "contact page": ["app/contact/page.tsx"],
    "cookie policy": ["app/cookies/page.tsx", "app/cookie-policy/page.tsx"],
}


def main() -> int:
    files = []
    for d in SCAN_DIRS:
        for p in (ROOT / d).rglob("*"):
            if p.is_file() and p.suffix in (".tsx", ".ts"):
                rel = str(p.relative_to(ROOT))
                if any(s in rel for s in SKIP):
                    continue
                files.append(p)

    print(f"scanning {len(files)} source files\n")

    findings = {}
    for label, patterns in GROUPS.items():
        hits = []
        rx = re.compile("|".join(f"(?:{p})" for p in patterns), re.IGNORECASE)
        for p in files:
            try:
                for i, line in enumerate(p.read_text(encoding="utf-8", errors="ignore").splitlines(), 1):
                    m = rx.search(line)
                    if m:
                        hits.append((str(p.relative_to(ROOT)), i, m.group(0).strip()[:60], line.strip()[:100]))
            except Exception:
                pass
        findings[label] = hits
        print(f"=== {label}: {len(hits)} hits ===")
        for f, i, token, line in hits[:14]:
            print(f"  {f}:{i}  [{token}]")
            print(f"      {line}")
        if len(hits) > 14:
            print(f"  ... and {len(hits) - 14} more")
        print()

    print("=== REQUIRED LEGAL / COMPLIANCE SURFACES ===")
    missing = []
    for name, paths in REQUIRED_ROUTES.items():
        found = [p for p in paths if (ROOT / p).exists()]
        if found:
            size = (ROOT / found[0]).stat().st_size
            body = (ROOT / found[0]).read_text(encoding="utf-8", errors="ignore")
            words = len(re.findall(r"[A-Za-z]{3,}", body))
            print(f"  PRESENT  {name}: {found[0]} ({size} bytes, ~{words} words)")
            if words < 150:
                print(f"           ^ thin - a real policy is longer than this")
        else:
            print(f"  MISSING  {name}")
            missing.append(name)
    print()

    total = sum(len(v) for v in findings.values())
    print(f"TOTAL findings: {total}   missing surfaces: {len(missing)}")
    Path("/root/posta-revive/docs/gap-scan.json").write_text(
        json.dumps({"groups": {k: v for k, v in findings.items()}, "missing": missing}, indent=2))
    print("written: docs/gap-scan.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
