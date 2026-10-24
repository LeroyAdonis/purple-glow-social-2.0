"""Delete the dead decorative CSS and redefine the one class that is still used.

21 of the 22 gradient-bearing utility classes in globals.css are referenced by zero components — they are the
archaeology of three design generations. .aerogel-card is the exception: 27 files use it, and it is the glass
card. It gets redefined flat and opaque rather than deleted, so those 27 files keep working and stop looking
like frosted glass.
"""
import pathlib
import re

CSS = pathlib.Path("/root/posta-revive/app/globals.css")
DEAD = [
    "pattern-lines", "pattern-lines-teal", "pattern-lines-gold", "divider-slant",
    "premium-card", "inset-card", "glass-card", "border-sa-flag",
    "glow-orb-purple", "glow-orb-orange", "glow-orb-posta-orange", "glow-orb-teal", "glow-orb-gold",
    "text-gradient-purple", "text-gradient-orange", "text-gradient-gold", "text-gradient-sa",
    "text-gradient-teal", "bg-gradient-sa", "bg-gradient-purple-teal", "bg-gradient-orange-teal",
]


def remove_rule(css: str, selector: str) -> tuple[str, bool]:
    """Remove a top-level `.selector { ... }` block, brace-matched."""
    idx = 0
    while True:
        m = re.search(rf"(?m)^(\s*)\.{re.escape(selector)}\s*\{{", css[idx:])
        if not m:
            return css, False
        start = idx + m.start()
        open_brace = idx + m.end() - 1
        depth, i = 0, open_brace
        while i < len(css):
            if css[i] == "{":
                depth += 1
            elif css[i] == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
            i += 1
        else:
            return css, False
        # swallow a trailing newline
        while end < len(css) and css[end] in "\r\n":
            end += 1
        css = css[:start] + css[end:]
        idx = start


css = CSS.read_text()
before = len(css.splitlines())
removed = 0
for name in DEAD:
    css, ok = remove_rule(css, name)
    if ok:
        removed += 1
    else:
        print(f"  not found: .{name}")
print(f"removed {removed}/{len(DEAD)} dead decorative rules")

# redefine the one class that is used, in place of the glass version
flat = """
  /* ─── .aerogel-card — REDEFINED ───────────────────────────────────────
     27 files reference this name. It used to be a translucent glass card with a backdrop blur; the brand
     allows flat, opaque colour only. Same class, same layout behaviour, no glass. */
  .aerogel-card {
    background: var(--posta-white, #FFFFFF);
    border: 1px solid var(--posta-line, #EADCCB);
    border-radius: 16px;
    box-shadow: var(--shadow-card, 0 2px 8px -2px rgba(36, 20, 15, 0.10));
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
"""
if ".aerogel-card {" in css:
    css, _ = remove_rule(css, "aerogel-card")
    css = css.rstrip() + "\n" + flat
else:
    css = css.rstrip() + "\n" + flat

CSS.write_text(css)
print(f"globals.css: {before} -> {len(css.splitlines())} lines")
print("gradient declarations left:", css.count("gradient"))
print("backdrop-filter left:", css.count("backdrop-filter:"))
