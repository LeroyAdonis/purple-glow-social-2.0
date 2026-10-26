#!/usr/bin/env bash
# The Posta site gate — one command, every mechanical check we own, non-zero on any failure.
#
# WHY THIS EXISTS (retro 2026-10-25, after a 3-day session):
# the checks were individually correct and collectively blind. In one session we shipped, and then found:
#   - two auth pages with NO <h1>            (brand checker: PASS — it never looked)
#   - a page that was not server-rendered    (brand checker: PASS — it never looked at the served HTML)
#   - a decoration that never painted        (parity: "0 differences" — it compared computed styles, not pixels)
#   - a hero under the nav and a tablet layout broken at exactly iPad Pro width  (parity: 1600 only)
# Every one of those was invisible to the gate that existed. So the gate now runs the whole set, in one pass,
# and exits non-zero. A gate nobody can accidentally skip is worth more than four gates nobody runs together.
#
# Usage:  ./scripts/site-gate.sh [base-url]
# Exit:   0 = everything passed   1 = at least one check failed (the failing line says which)
set -uo pipefail

BASE="${1:-https://posta.digitalwavetech.dev}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 1

PAGES=(/ /login /signup /dashboard /privacy /terms /refund /contact /cookies)
CRO_PAGES=(/ /login /signup)
FAILED=0
declare -a FAILURES=()

fail() { FAILED=1; FAILURES+=("$1"); printf '  FAIL  %s\n' "$1"; }
pass() { printf '  ok    %s\n' "$1"; }

echo "== 1/6 brand checker (rendered) =="
for p in "${PAGES[@]}"; do
  out=$(timeout 120 python3 design-system/posta/scripts/check-brand.py --url "${BASE}${p}" 2>&1)
  if printf '%s' "$out" | head -2 | grep -q PASS; then pass "$p"; else
    fail "$p — $(printf '%s' "$out" | head -2 | tr '\n' ' ')"
  fi
done

echo "== 2/6 served HTML: an <h1> must exist, and the route must not bail out of SSR =="
# Both of these shipped broken for months. `curl` sees what a crawler and a screen reader get on first paint;
# the browser-based checkers above only ever saw the hydrated DOM, which is why they missed it.
#
# NOT pipefail + grep -q: on a large body `grep -q` exits at the first match, the writer gets SIGPIPE, pipefail
# makes the PIPELINE non-zero, and the check reports "no <h1>" on a page that has one. That happened here — it
# failed /terms (80KB) and /dashboard (23KB) while /refund (30KB) passed. Bash pattern matching has no pipe.
#
# /dashboard is auth-gated: unauthenticated its served HTML is a shell by design, so the h1 rule does not apply.
# It is graded by the brand and responsive stages, which load it in a browser.
PUBLIC_PAGES=(/ /login /signup /privacy /terms /refund /contact /cookies)
for p in "${PUBLIC_PAGES[@]}"; do
  html=$(curl -s --max-time 25 "${BASE}${p}") || { fail "$p — could not fetch"; continue; }
  problems=()
  case "$html" in
    *"<h1"*) ;;
    *) problems+=("no <h1> in served HTML") ;;
  esac
  # BAILOUT_TO_CLIENT_SIDE_RENDERING means the route ships an empty shell and only renders after JS.
  # Usual cause: useSearchParams()/usePathname() in a client page with no Suspense boundary.
  case "$html" in
    *BAILOUT_TO_CLIENT_SIDE_RENDERING*) problems+=("route bails out of SSR (BAILOUT_TO_CLIENT_SIDE_RENDERING)") ;;
  esac
  if [ ${#problems[@]} -eq 0 ]; then pass "$p"; else fail "$p — $(IFS='; '; echo "${problems[*]}")"; fi
done

echo "== 3/6 CRO audit: no CRITICAL conversion or honesty finding =="
CRO="$HOME/.hermes/skills/creative/landing-page-cro-audit/scripts/cro-audit.py"
if [ -f "$CRO" ]; then
  for p in "${CRO_PAGES[@]}"; do
    out=$(timeout 200 python3 "$CRO" "${BASE}${p}" 2>&1)
    if printf '%s' "$out" | grep -qE '^\[[0-9]+\] CRITICAL'; then
      fail "$p — $(printf '%s' "$out" | grep -A2 CRITICAL | head -3 | tr '\n' ' ')"
    else pass "$p"; fi
  done
else
  fail "cro-audit.py not found at $CRO (skill missing — cannot verify conversion checks)"
fi

echo "== 4/6 styleframe parity: 0 computed AND 0 painted differences =="
if [ -f scripts/parity-landing.py ]; then
  out=$(timeout 420 python3 scripts/parity-landing.py --pixels 2>&1)
  measured=$(printf '%s' "$out" | grep -oE '^[0-9]+ measured differences' | head -1)
  if [ "$measured" = "0 measured differences" ]; then
    if printf '%s' "$out" | grep -q "paints identically"; then pass "parity $(printf '%s' "$out" | grep -c . ) lines, 0 diffs + identical pixels"
    else fail "parity: computed values match but some role PAINTS differently — $(printf '%s' "$out" | grep -A6 'PIXEL DIFF' | tail -3 | tr '\n' ' ')"; fi
  else
    fail "parity: ${measured:-could not measure} — run scripts/parity-landing.py --pixels"
  fi
else
  fail "scripts/parity-landing.py missing"
fi

echo "== 5/6 responsive: no content under the fixed nav, no sideways scroll, no overlap =="
# The gate has to look at the devices Leroy actually holds. 1024 is iPad Pro portrait — the breakpoint that
# was wrong was exactly the width of his tablet.
if [ -f scripts/responsive-check.py ]; then
  out=$(timeout 500 python3 scripts/responsive-check.py "$BASE" 2>&1)
  printf '%s\n' "$out" | grep -E '^  ' || true
  if printf '%s' "$out" | grep -q "FAIL"; then fail "responsive: $(printf '%s' "$out" | grep FAIL | head -2 | tr '\n' ' ')"
  else pass "responsive at every graded viewport"; fi
else
  fail "scripts/responsive-check.py missing"
fi

echo "== 6/6 authenticated contract: a real login, and the limits payload every screen reads =="
# Why this stage exists, in one line: `/dashboard` said "Something Went Wrong" for every signed-in user
# because /api/limits/check returned bare numbers where six components expected objects. Every earlier
# stage here is either a public page or unauthenticated, so none of them could ever have seen it —
# `/dashboard` is auth-gated and its served HTML is a shell by design. This is the first stage that logs in.
if [ -f scripts/auth-smoke.py ]; then
  out=$(timeout 180 python3 scripts/auth-smoke.py "$BASE" 2>&1)
  printf '%s\n' "$out" | grep -E '^  ' || true
  # Judge on the script's own FAIL lines, never on $? through a pipeline: `| grep -q` exits at the first
  # match, the writer takes SIGPIPE, and pipefail turns a passing run into a failure. That exact mistake
  # already cost this gate one false failure on /terms.
  if printf '%s' "$out" | grep -q "FAIL"; then
    fail "authenticated contract: $(printf '%s' "$out" | grep FAIL | head -3 | tr '\n' ' ')"
  else
    pass "authenticated contract holds (demo login + /api/limits/check shape)"
  fi
else
  fail "scripts/auth-smoke.py missing — the signed-in screens are unverified"
fi

echo
if [ "$FAILED" -eq 0 ]; then
  echo "SITE GATE: PASS (all 6 stages)"
  exit 0
fi
echo "SITE GATE: FAIL (${#FAILURES[@]} problem(s))"
for f in "${FAILURES[@]}"; do echo "  - $f"; done
exit 1
