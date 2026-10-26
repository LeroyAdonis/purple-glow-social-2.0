#!/usr/bin/env python3
"""
Authenticated-contract smoke test for Posta.

WHY THIS EXISTS (2026-10-26). `/dashboard` returned "Something Went Wrong" for every signed-in user,
including the demo account, and had done since the route at /api/limits/check was written. The cause was a
shape disagreement, not a crash in the usual sense: the route returned `credits` and `dailyGenerations` as
bare NUMBERS while all six calling components read them as OBJECTS (`data.dailyGenerations.current`,
`limitsData.scheduling.queueSize`, `tierLimits.connectedAccounts.total.limit`). Three of those reads threw,
and the route's error boundary replaced the whole page.

The site gate did not catch it, and could not have: every stage it ran was either a public page or an
unauthenticated request. `/dashboard` is auth-gated, so its served HTML is a shell by design and stage 2
deliberately skips it. Nobody had ever logged in as part of a check.

So this stage logs in for real, then asserts the CONTRACT every component depends on: the blocks must be
objects, and every allowance must carry a numeric `current` and `limit`. It fails on the shape, which is
what broke, not on the page text, which was merely the symptom.

Usage:  python3 scripts/auth-smoke.py [base-url]
Exit:   0 = the contract holds   1 = it does not (the message names the block and what it found)
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://posta.digitalwavetech.dev").rstrip("/")

# The public demo account. Not a secret: it is printed in HANDOFF.md and exists to be logged into.
DEMO_EMAIL = "demo@posta.co.za"
DEMO_PASSWORD = "Posta2026!"

# Every block a component dereferences. Missing any one of these was a blank error page.
REQUIRED_OBJECT_BLOCKS = ["credits", "dailyGenerations", "scheduling", "automation", "connectedAccounts"]
# Every allowance a component reads `.current` and `.limit` from.
REQUIRED_ALLOWANCES = [
    ("dailyGenerations",),
    ("dailyPosts", "total"),
    ("scheduling", "queueSize"),
    ("connectedAccounts", "total"),
]


def fail(message: str) -> None:
    print(f"  FAIL  {message}")


def ok(message: str) -> None:
    print(f"  ok    {message}")


def request(path: str, *, data: dict | None = None, cookie: str = "") -> tuple[int, str, list[str]]:
    url = f"{BASE}{path}"
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(url, data=body, method="POST" if body else "GET")
    req.add_header("Accept", "application/json")
    if body:
        req.add_header("Content-Type", "application/json")
        req.add_header("Origin", BASE)
    if cookie:
        req.add_header("Cookie", cookie)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read().decode("utf-8", "replace"), resp.headers.get_all("Set-Cookie") or []
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", "replace"), exc.headers.get_all("Set-Cookie") or []
    except Exception as exc:  # noqa: BLE001 - a network failure must be reported, not raised
        return 0, f"request failed: {exc}", []


def main() -> int:
    failures = 0

    # 1. Log in for real. A 401 here means the demo account or the auth path is broken, which is its own outage.
    status, text, set_cookies = request(
        "/api/auth/sign-in/email", data={"email": DEMO_EMAIL, "password": DEMO_PASSWORD}
    )
    if status != 200:
        fail(f"sign-in returned {status}: {text[:200]}")
        return 1
    cookie = "; ".join(c.split(";", 1)[0] for c in set_cookies)
    if "session" not in cookie:
        fail(f"sign-in returned 200 but no session cookie (got: {cookie or 'none'})")
        return 1
    ok("demo account signs in")

    # 2. The authenticated contract. This is the check that was missing.
    status, text, _ = request("/api/limits/check", cookie=cookie)
    if status != 200:
        fail(f"/api/limits/check returned {status} when called with a real session: {text[:200]}")
        return 1
    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        fail(f"/api/limits/check did not return JSON: {text[:200]}")
        return 1

    for block in REQUIRED_OBJECT_BLOCKS:
        value = payload.get(block)
        if not isinstance(value, dict):
            fail(
                f"'{block}' is {type(value).__name__} ({value!r}), not an object — "
                f"components read '{block}.<field>' and will throw"
            )
            failures += 1
        else:
            ok(f"'{block}' is an object")

    for path in REQUIRED_ALLOWANCES:
        node = payload
        for key in path:
            node = node.get(key) if isinstance(node, dict) else None
        label = ".".join(path)
        if not isinstance(node, dict):
            fail(f"'{label}' is missing or not an object")
            failures += 1
            continue
        for field in ("current", "limit"):
            if not isinstance(node.get(field), (int, float)):
                fail(f"'{label}.{field}' is {node.get(field)!r}, not a number")
                failures += 1
        if isinstance(node.get("current"), (int, float)) and isinstance(node.get("limit"), (int, float)):
            ok(f"'{label}' = {node['current']}/{node['limit']}")

    # 3. The other endpoints the authenticated screens call on mount. A 404 here is the silence that let the
    #    limits route go missing in the first place.
    for path in ("/api/user/posts?status=scheduled", "/api/user/credits"):
        status, text, _ = request(path, cookie=cookie)
        if status == 200:
            ok(f"{path} -> 200")
        else:
            fail(f"{path} -> {status} (the UI catches this and silently shows nothing): {text[:120]}")
            failures += 1

    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
