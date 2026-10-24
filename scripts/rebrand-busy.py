"""Kill the last three "busy" tells: gradients, glass, and glow.

These are the exact things the brand bans, and they are what made the old UI feel like every other generated
SaaS dashboard. Each is handled line-aware, because the naive replace has a famous trap:

  `bg-gradient-to-r from-x to-y bg-clip-text text-transparent`  ->  if you strip the gradient but leave
  `text-transparent`, the heading becomes INVISIBLE. That class combination is how people make gradient text,
  and it fails silently. Any line matching it is converted to solid ink instead.
"""
import pathlib
import re

ROOTS = [pathlib.Path("/root/posta-revive/components"), pathlib.Path("/root/posta-revive/app")]
SKIP = ("globals.css",)

GRADIENT_TOKEN = re.compile(r"\b(bg-gradient-to-[a-z]+|from-[a-z0-9\-\[\]\(\)/._]+|via-[a-z0-9\-\[\]\(\)/._]+|to-[a-z0-9\-\[\]\(\)/._]+)\b")
BLUR = re.compile(r"\b(backdrop-blur[a-z0-9\-\[\]]*|blur-\[[^\]]+\]|blur-[a-z0-9]+)\b")
GLOW = re.compile(r"\bshadow-\[0_0_[^\]]+\]")
SECONDARY = ("joburg-teal", "surge-teal", "teal")

stats = {"gradient_lines": 0, "clip_text_fixed": 0, "blur": 0, "glow": 0, "files": 0}

for root in ROOTS:
    for path in root.rglob("*.tsx"):
        if any(s in str(path) for s in SKIP):
            continue
        text = path.read_text()
        original = text
        out = []
        for line in text.splitlines(keepends=True):
            work = line

            if "bg-clip-text" in work and "text-transparent" in work:
                # gradient text: go solid, never leave transparent text behind
                work = GRADIENT_TOKEN.sub("", work)
                work = work.replace("bg-clip-text", "").replace("text-transparent", "text-[var(--posta-clay)]")
                work = re.sub(r"  +", " ", work)
                stats["clip_text_fixed"] += 1

            if GRADIENT_TOKEN.search(work) and "bg-gradient" in work:
                flat = "bg-[var(--posta-clay-deep)]" if any(t in work for t in SECONDARY) else "bg-[var(--posta-clay)]"
                work = GRADIENT_TOKEN.sub("", work)
                work = re.sub(r"\s{2,}", " ", work)
                # put the flat fill where the gradient was, inside the class string
                work = re.sub(r'className="', f'className="{flat} ', work, count=1)
                stats["gradient_lines"] += 1

            if BLUR.search(work):
                work = BLUR.sub("", work)
                work = re.sub(r"\s{2,}", " ", work)
                stats["blur"] += 1

            if GLOW.search(work):
                work = GLOW.sub("shadow-[var(--shadow-card)]", work)
                stats["glow"] += 1

            out.append(work)

        new = "".join(out)
        if new != original:
            path.write_text(new)
            stats["files"] += 1

print(f"gradient surfaces flattened : {stats['gradient_lines']}")
print(f"gradient TEXT made solid    : {stats['clip_text_fixed']}  (this is the invisible-text trap)")
print(f"glass/blur removed          : {stats['blur']}")
print(f"glow shadows replaced       : {stats['glow']}")
print(f"files changed               : {stats['files']}")
