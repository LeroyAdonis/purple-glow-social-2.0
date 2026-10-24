"""Rebrand the app interior by remapping the OLD token names to the Posta palette.

Why remap instead of rewriting 876 Tailwind classes across 46 files: the class names are load-bearing
throughout the interior. Redefining what `bg-neon-grape` and `text-white` RESOLVE TO converts the whole app in
one pass, and the brand checker then measures every rendered page for contrast — so any mapping that makes text
invisible shows up as a number rather than as a customer complaint.
"""
import pathlib
import re

GLOBALS = pathlib.Path("/root/posta-revive/app/globals.css")

# name -> (new value, comment)
MAP = {
    # surfaces: the app becomes the light paper system, not dark charcoal
    "deep-charcoal": ("#FBF6EF", "posta paper"),
    "void": ("#FBF6EF", "posta paper"),
    "cosmic-void": ("#FBF6EF", "posta paper"),
    "charcoal-elevated": ("#FFFFFF", "posta white card"),
    "void-elevated": ("#FFFFFF", "posta white card"),
    "pretoria-blue": ("#FFFFFF", "posta white card"),
    "charcoal-surface": ("#F7EDE2", "posta cream"),
    "void-surface": ("#F7EDE2", "posta cream"),
    "charcoal-hover": ("#F2E2DA", "posta clay tint"),
    "void-hover": ("#F2E2DA", "posta clay tint"),
    # primary action -> clay
    "posta-orange": ("#8E3B2E", "posta clay"),
    "neon-grape": ("#8E3B2E", "posta clay"),
    "neon-glow": ("#8E3B2E", "posta clay"),
    "purple-core": ("#8E3B2E", "posta clay"),
    "electric-indigo": ("#742F25", "posta clay deep"),
    "ember": ("#742F25", "posta clay deep"),
    "orange-light": ("#742F25", "posta clay deep"),
    "grape-light": ("#742F25", "posta clay deep"),
    "orange-dim": ("#5F2419", "pressed clay"),
    "grape-dim": ("#5F2419", "pressed clay"),
    "orange-subtle": ("rgba(142, 59, 46, 0.12)", "clay wash"),
    "grape-subtle": ("rgba(142, 59, 46, 0.12)", "clay wash"),
    "orange-glow": ("rgba(142, 59, 46, 0.20)", "clay shadow tint"),
    "grape-glow": ("rgba(142, 59, 46, 0.20)", "clay shadow tint"),
    # secondary -> deep clay (one accent only: gold)
    "surge-teal": ("#742F25", "posta clay deep"),
    "joburg-teal": ("#742F25", "posta clay deep"),
    "teal-dim": ("#5F2419", "pressed clay"),
    "teal-subtle": ("rgba(116, 47, 37, 0.12)", "clay wash"),
    # accents
    "mzansi-gold": ("#E9A93C", "posta gold"),
    "sa-gold": ("#E9A93C", "posta gold"),
    "sa-green": ("#2F6B4F", "posta success"),
    "mzansi-green": ("#2F6B4F", "posta success"),
    "sa-red": ("#A32B22", "posta danger"),
    "hyper-crimson": ("#A32B22", "posta danger"),
}

css = GLOBALS.read_text()
changed = 0
for name, (value, note) in MAP.items():
    # match the declaration line for exactly this token name
    pattern = re.compile(rf"(--color-{re.escape(name)}:\s*)([^;]+)(;)", re.M)
    def repl(m):
        return f"{m.group(1)}{value}{m.group(3)}"
    css, n = pattern.subn(repl, css)
    if n:
        changed += n
    else:
        print(f"  NOT FOUND: --color-{name}")

print(f"remapped {changed} token declarations")

# Canonical tokens for new work, appended so the legacy names keep working beside them.
canonical = """
  /* ─── POSTA BRAND TOKENS (canonical — use these in new code) ───────── */
  /* The legacy names above are kept working by remapping, not by deletion: deleting them would break 46
     files at once. New code must use these. See design-system/posta/tokens.css. */
  --color-paper: #FBF6EF;
  --color-clay: #8E3B2E;
  --color-clay-deep: #742F25;
  --color-clay-tint: #F2E2DA;
  --color-cream: #F7EDE2;
  --color-ink: #24140F;
  --color-ink-soft: #6E5B4E;
  --color-line: #EADCCB;
  --color-gold: #E9A93C;
  --color-success: #2F6B4F;
  --color-danger: #A32B22;
  --color-warning: #8A5A12;
"""
if "--color-paper:" not in css:
    # insert just before the first closing brace of the @theme block
    idx = css.index("}")
    css = css[:idx] + canonical + css[idx:]
    print("added canonical Posta tokens")

GLOBALS.write_text(css)
print("globals.css written")
