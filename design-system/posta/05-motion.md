# 05 · Motion

Durations are in **milliseconds** because "smooth animation" is not a specification. Motion here is feedback,
not entertainment: it tells a phone user that a tap registered and that something is on its way.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--dur-instant` | 80ms | Press feedback, checkbox tick |
| `--dur-fast` | 140ms | Hover, focus ring, chip select |
| `--dur-base` | 220ms | Modal, sheet, toast, accordion |
| `--dur-slow` | 340ms | Skeleton shimmer, page-level fade |
| `--ease-out` | `cubic-bezier(0.16,1,0.3,1)` | Anything entering the screen |
| `--ease-in-out` | `cubic-bezier(0.65,0,0.35,1)` | Anything moving within the screen |

## What animates, and how

| Interaction | Motion |
| --- | --- |
| Button press | fill one step darker + `translateY(1px)`, `--dur-instant` |
| Hover on a card or row | background to `--posta-clay-tint`, `--dur-fast` |
| Focus ring | appears instantly, no fade — a focus ring that fades is a focus ring that is missed |
| Bottom sheet in | `translateY(100%)→0`, `--dur-base`, `--ease-out` |
| Bottom sheet out | `translateY(0)→100%`, `--dur-base` × 0.8, `--ease-in-out` |
| Toast in | `translateY(8px)` + opacity 0→1, `--dur-base`, `--ease-out` |
| Skeleton | opacity 1→0.55→1 loop, 1400ms, `--ease-in-out` |
| Post published | the ribbon switches to Published with a checkmark that scales 0.8→1 in `--dur-fast` |
| List insert after publish | new row height 0→auto over `--dur-base`, no bounce |

## What never animates

- Layout that shifts content the user is reading.
- Anything longer than 400ms. A phone user on expensive data is not watching an animation.
- Parallax, scroll-jacking, cursor followers, marquees, autoplaying carousels.
- Number count-ups on credits or prices — the value is the value; a rolling digit is a delay dressed as delight.
- Page transitions longer than `--dur-slow`. Navigate immediately, then let content settle.

## Reduced motion

`prefers-reduced-motion: reduce` sets every duration token to `0ms` (it is in `tokens.css`, not left to each
component). Everything still *works*, it simply arrives. Nothing may depend on an animation completing in order
to become visible or usable — if it does, that is a bug that only shows up for the users who set the
preference.

## Focus and keyboard timing

A focus ring must be visible within one frame of the keystroke. No `transition` on `outline` or `box-shadow`
for focus states.

## How this gets verified

Motion is checked by reading the computed `transition-duration` and `animation-duration` values on a rendered
page, plus one pass with reduced motion emulated: if any element is invisible with `--dur-*` at 0ms, the
implementation is wrong.
