# How nike.com/za is actually built — measured, not guessed

Recon method: fetched the shell (786,479 bytes, sha256 3ff8a2f4…), read its 238 inline style blocks, then
measured the **rendered** page in a real browser at 1280px. Every number below is a computed value, not an
impression.

## The stack

- **React 18.3.1 + Emotion 10.3.0** (`@emotion/core`, `styled-base`, `styled`), served as vendored UMD files
  from `www.nike.com/assets/vendor/`. No external CSS bundle at all — the entire design system is
  **CSS-in-JS**, so the rules only exist once the page renders. That is why scraping the HTML finds almost no
  styling (2 custom properties, 2 font declarations) and why the measurement had to happen in a browser.
- Commerce/measurement scripts alongside: `mc.js` (measure data-capture).

## The type system (the part that matters)

| Role | Face | Weight | Size | Leading | Case |
|---|---|---|---|---|---|
| Hero statement | **Nike Futura ND** | 500 | **76px @1280 (≈5.9vw)** | **0.9** (68.4px) | **UPPERCASE** |
| Section head | Nike Futura ND | 500 | 48px | 0.9 | UPPERCASE |
| Section title | Helvetica Now Display Medium | 500 | 32px | 1.2 | sentence |
| Card / overlay title | Helvetica Now Display Medium | 500 | 24px | 1.2 | sentence |
| Body | Helvetica Now Text | 400 | 16px | 1.5 (24px) | sentence |
| Link / label | Helvetica Now Text Medium | 500 | 16px | 1.5 | sentence |
| Small / meta | Helvetica Now Text Medium | 500 | 12–14px | 1.5 | sentence |

**No letter-spacing anywhere** (`normal` on every sampled element). **No small uppercase labels.** Uppercase is
reserved for the display face only.

## The colour system

- Ground `#FFFFFF`, ink `#111111`, secondary grey `#707072`. That is the whole palette.
- **The photography is the only colour on the page.** Text sits directly on the image, white or `#111`,
  whichever the picture needs.

## Layout and controls

- 54 images, **4 of them full-bleed** (wider than 80% of the viewport), plus 2 videos.
- **55 pill-shaped controls** — `border-radius: 30px`, 16px medium text, transparent or solid black fill.
- Cards are photographs with text overlaid, never grey boxes with a border.
- No shadows, no gradients, no dividers, no rounded corner other than the pill.

## What this means for Posta (our version, our own assets)

1. **Display face:** Futura-like, geometric, heavy-ish, uppercase, tight. The free equivalent is **Jost**
   (a Futura homage) at 500–600 — not Anton, which is condensed rather than geometric. Bigger than we had:
   `clamp(2.75rem, 5.9vw, 4.75rem)`, `line-height: 0.9`, `text-transform: uppercase`.
2. **Body face:** Helvetica-like at 16px / 24px. **Inter** or our existing Hanken Grotesk both qualify; keep
   Hanken Grotesk so nothing else on the site changes.
3. **Palette:** white ground, `#111` ink, `#707072` secondary, one accent (`#1a4be0`) for actions only.
4. **Photography carries the colour:** full-bleed at least twice, text on the image with a scrim only as far
   as contrast needs.
5. **Buttons:** pills, 30px radius, 16px medium, one fill style.
6. **Delete:** the grey card grid, caption strips, kickers, dividers and tiny letter-spaced labels.

## Honest limits

- Nike's faces are licensed (Nike Futura ND, Helvetica Now). We can copy the **metrics and the behaviour**,
  never the font files. Jost + Hanken Grotesk are the legal stand-ins.
- Only the homepage at 1280px was measured. Mobile breakpoints, motion timings and the product templates were
  not captured.
