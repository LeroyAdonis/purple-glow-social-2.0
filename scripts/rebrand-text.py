"""Flip the interior's text and glassy fills from dark-theme to the light paper system.

Line-aware on purpose: `text-white` on a clay button must become cream (white on clay is a real colour, and
cream is the brand pair), while `text-white` on what is now a paper surface must become ink. A blanket replace
would make half the app invisible, which is precisely the failure the brand checker is there to catch.
"""
import pathlib
import re

ROOTS = [pathlib.Path("/root/posta-revive/components"), pathlib.Path("/root/posta-revive/app")]
SKIP = ("globals.css", "design-system")

CLAY_BG = re.compile(r"bg-(posta-orange|neon-grape|clay|\[var\(--posta-clay\)\])")
stats = {"ink": 0, "cream": 0, "glass": 0, "files": 0}

for root in ROOTS:
    for path in root.rglob("*.tsx"):
        if any(s in str(path) for s in SKIP):
            continue
        text = path.read_text()
        original = text
        out_lines = []
        for line in text.splitlines(keepends=True):
            if "text-white" in line:
                if CLAY_BG.search(line):
                    line = line.replace("text-white", "text-[var(--posta-cream)]")
                    stats["cream"] += 1
                else:
                    line = line.replace("text-white", "text-[var(--posta-ink)]")
                    stats["ink"] += 1
            # translucent white fills were glass panels on a dark field; on paper they need real tints
            for old, new in (
                ("bg-white/10", "bg-[var(--posta-cream)]"),
                ("bg-white/5", "bg-[var(--posta-paper)]"),
                ("bg-white/20", "bg-[var(--posta-clay-tint)]"),
                ("border-white/10", "border-[var(--posta-line)]"),
                ("border-white/20", "border-[var(--posta-line)]"),
                ("hover:bg-white/5", "hover:bg-[var(--posta-cream)]"),
                ("hover:bg-white/10", "hover:bg-[var(--posta-cream)]"),
                ("hover:border-white/30", "hover:border-[var(--posta-clay)]"),
                ("text-gray-300", "text-[var(--posta-ink-soft)]"),
                ("text-gray-400", "text-[var(--posta-ink-soft)]"),
                ("text-gray-500", "text-[var(--posta-ink-soft)]"),
                ("placeholder:text-gray-500", "placeholder:text-[var(--posta-ink-soft)]"),
            ):
                if old in line:
                    line = line.replace(old, new)
                    stats["glass"] += 1
            out_lines.append(line)
        new_text = "".join(out_lines)
        if new_text != original:
            path.write_text(new_text)
            stats["files"] += 1

print(f"text-white on clay surfaces -> cream : {stats['cream']}")
print(f"text-white on light surfaces -> ink  : {stats['ink']}")
print(f"glassy white/grey fills retinted    : {stats['glass']}")
print(f"files changed                        : {stats['files']}")
