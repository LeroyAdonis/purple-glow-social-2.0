# Posta design system

**Status: direction locked 24 October 2026.** Styleframe C — "Phone First" — won. Everything below is
binding on any UI work from here, including agent work.

## The decision, and why

| Direction | Stance | Verdict |
| --- | --- | --- |
| A — Quiet Paper | Editorial. Paper ground, one serif, one accent. | Best-looking. Its typographic restraint is borrowed. Rejected as the base because it flatters a desktop buyer we do not have yet. |
| B — Signal | Instrument. Near-black, two colours, strict grid, queue as the product. | Sharpest. Rejected because it reads cold to a small shop owner. |
| **C — Phone First** | Warm colour field, cream type, the app shown as a phone, copy that talks like a person. | **Chosen.** The customer is one person on one phone. |

The whole point of the change was that the old interface was too busy. C wins partly on looks and mostly on
that: it has one idea per screen.

## What "simpler" means concretely

The old UI stacked gradients, glass panels, glow, flag-coloured stripes, icon soup and stat badges. That is
what is banned:

1. **No gradients, glow, blur or glass.** Flat colour only.
2. **One accent per screen.** Gold means "this is the one thing to do here".
3. **Three type sizes maximum per view.** The old screens used eight.
4. **One call to action per screen.** If there are two, one is a plain text link.
5. **Icons are optional, labels are not.** If a label needs an icon to be understood, the label is wrong.
6. **44px minimum touch target.**

## Colour

One field, one ink, one accent:

- Clay `#8E3B2E` — the brand field
- Cream `#F7EDE2` — type on the field
- Paper `#FBF6EF` — app background
- Ink `#24140F` — body type
- Gold `#E9A93C` — the single accent

Plus three state colours (success, danger, warning) that exist only because a publishing tool has to report
failure honestly.

## Type

Space Grotesk for display, Inter for body. Scale from `--text-display` (96px, marketing only) down to
`--text-micro` (11px, labels). Numbers in the UI are tabular so times and credit counts do not jump.

## Tokens

All values live in `design/tokens.css`. **No component may invent a colour, size, radius or shadow.** If a
value is needed and missing, add it to the token file first, then use it. This is the mechanism that stops the
design drifting back to busy.

## Applying it

- Marketing pages: clay field, cream type, one gold accent, the phone as the hero object.
- The app itself: paper ground, ink type, clay for primary actions, gold spent sparingly on the single
  next action.
- Anything that looks busy is wrong by definition, even if it looks good.
