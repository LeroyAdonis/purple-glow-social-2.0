# 07 · Logo

## The mark

The wordmark is `posta` in **Space Grotesk 700, lowercase, tracking -0.045em**, with the full stop replaced by
a **speech bubble**. The bubble is a pronounced shape — roughly 40% of the type size, with a real tail — hung
on the baseline exactly where a full stop belongs, sitting tight to the last letter.

Direction chosen 24 October 2026 from three characters of the same idea:

| Variant | Character | Verdict |
| --- | --- | --- |
| **1 · Solid** | Filled bubble, thick tail, gold dot | Chosen for small sizes |
| **2 · Drawn** | Heavy outline, hand-cut tail | **Chosen as the primary** — it speaks the same hand-made language as the doodle illustrations |
| 3 · Stamp | Perforated postage edge | Rejected: it stops reading as a speech bubble, losing the "it talks" meaning |

**The responsive rule:** variant 2 at 32px and above, variant 1 below 32px. This is standard practice for a
mark whose detail cannot survive a favicon — one identity, two weights, a stated switchover point.

## Clear space

Clear space on all sides = **the height of the bubble** (0.4 × the type size). Nothing enters that space:
no text, no icon, no edge of a container.

## Minimum sizes

| Context | Minimum |
| --- | --- |
| Wordmark + bubble, horizontal | 96px wide |
| Bubble alone, app icon | 16px (variant 1 only) |
| Print | 20mm wide |

## Approved lockups

1. **Horizontal:** bubble + wordmark, bubble hanging on the baseline. Default everywhere.
2. **Wordmark only:** where the bubble would be smaller than 16px.
3. **Icon tile:** the bubble alone on clay, 24% corner radius — app icon, favicon, social avatar.
4. **Stacked:** wordmark centred above a 3-word descriptor. Marketing only, never in the app.

## Colour

| Ground | Wordmark | Bubble | Dot |
| --- | --- | --- | --- |
| paper / cream | `--posta-ink` | `--posta-clay` fill, gold dot | `--posta-gold` |
| clay | `--posta-cream` | cream outline/fill, gold dot | `--posta-gold` |
| single ink | one colour, dot knocked out or same ink | — | — |

The gold dot survives reversal because it is the one element that never changes meaning. In a single-colour
reproduction (embossing, one-colour print, favicon at 16px) the dot drops out entirely and the bubble carries the
mark.

## Misuse — every one of these has been seen on a real project

- ❌ Re-typing the wordmark in a different font or weight. Use the asset.
- ❌ Stretching, squashing, rotating, or adding a drop shadow, outline or glow.
- ❌ Recolouring outside the table above, including "just a slightly darker gold".
- ❌ Replacing the bubble with a stock speech-bubble icon from any pack. The mark must be ours; a stock icon is
  a mark anyone can use, and it dilutes ownership.
- ❌ Setting the wordmark in capitals (`POSTA`) — the lowercase is the identity.
- ❌ Placing the mark on a busy photo, a gradient, or a colour not in the palette.
- ❌ Adding a tagline inside the clear space.
- ❌ Rebuilding the lockup with the bubble at mid-height. It sits on the baseline, always.

## Asset deliverables (required before launch)

- `logo-primary.svg` — bubble + wordmark, variant 2 (drawn).
- `logo-small.svg` — variant 1 (solid), for anything under 32px.
- `logo-mono.svg` — single ink.
- `app-icon-1024.png`, `512`, `192`, `180`, `167`, `152`, `120`, `96`, `64`, `32`, `16` — full-bleed, no
  transparency, no pre-rounded corners (the OS applies its own mask; a pre-rounded icon gets double-rounded and
  clipped, which is a mistake already made once on a different product).
- `favicon.ico` — 16/32/48 multi-size.
- Social avatars 400×400 (the mark only, on clay).

Every icon export must be checked for ink clearance: the artwork must not touch the edge, and at 16px the
silhouette must still be legible. **Measure it; do not eyeball it.**

## Where the logo appears in the product

Header (horizontal, 24px tall), sidebar collapsed state (bubble only), auth pages (stacked, marketing treatment),
emails and invoices (mono variant for print), the favicon, and the app icon. Nowhere else.
