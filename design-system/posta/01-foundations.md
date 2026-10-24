# 01 · Foundations

## The direction, and why this one

Direction **C — "Phone First"** won the styleframe round on 24 October 2026. Three were built:

| Direction | Stance | Outcome |
| --- | --- | --- |
| A · Quiet Paper | Editorial. Paper ground, one serif, one accent. | Best-looking. Its typographic restraint was borrowed. Rejected as the base. |
| B · Signal | Instrument. Near-black, two colours, strict grid. | Sharpest. Rejected: reads cold to a small shop owner. |
| **C · Phone First** | Warm colour field, cream type, the product shown as a phone, copy that talks like a person. | **Chosen.** |

**Audience:** one person running a small South African business, holding one phone, often with expensive data
and no laptop. Not a marketing team, not an agency with five seats.

**Philosophy, in one sentence:** *the app should feel like a capable assistant who has already done the work,
and is waiting for a yes.*

**The metaphor:** a note handed to you, already written — not a blank page, and not a dashboard full of
instruments. Everything in the interface is either **what Posta has prepared** or **the one decision you have
to make**. Anything that is neither is decoration and gets cut.

## Six principles, and what each one forbids

1. **One idea per screen.** The old interface stacked features, badges and stats. Forbidden: two competing
   hero elements, a screen with no obvious primary action.
2. **Flat colour.** No gradients, glows, blur, glass or drop shadows beyond the two tokens. Depth comes from
   a hairline and a warm shadow, nothing else.
3. **Type does the work.** Hierarchy comes from size and space, not from colour, weight tricks or boxes.
   Three type sizes maximum per view.
4. **Gold is the single accent, spent once.** It means "this is the one thing to do here". See `02-color.md`
   for the hard rules, including the measured reason it can never be text on light.
5. **The phone is the canvas.** Every layout is designed at 375px first and widened. Tap targets ≥44px. The
   desktop view is the phone view given more room, never a different information architecture.
6. **Say what happened.** No fake stats, no invented testimonials, no "AI-powered" as a substitute for saying
   what it does. Failure is stated plainly. This is a product people pay for; it has to be honest.

## Space — a 4px grid

`--space-1` 4px, `--space-2` 8px, `--space-3` 12px, `--space-4` 16px, `--space-5` 24px, `--space-6` 32px,
`--space-7` 48px, `--space-8` 64px, `--space-9` 96px.

Rules:
- Component inner padding: 16px on phones, 24px from 768px up.
- Space between unrelated blocks: 32px. Between related items: 8–12px. Never 20px or 28px — off-grid spacing
  is what makes a layout feel subtly wrong without anyone being able to say why.
- Section rhythm on marketing pages: 96px desktop, 64px phone.

## Shape

- `--radius-sm` 8px — inputs, small buttons, chips.
- `--radius-md` 16px — cards.
- `--radius-lg` 24px — sheets, modals, the phone frame in marketing.
- `--radius-pill` 999px — the primary button only.

One radius family per component. A card is never half-rounded, and a button is never a squircle.

## Elevation

Two shadows, both warm-tinted so they sit on a warm ground:

- `--shadow-card` `0 2px 8px -2px rgba(36,20,15,.10)` — raised cards, dropdowns.
- `--shadow-sheet` `0 40px 80px -40px rgba(36,20,15,.45)` — modals, the marketing phone.

**There is no elevation level 3.** If a surface needs a bigger shadow to be noticed, it is in the wrong place.
Prefer a hairline border plus whitespace.

## Borders

`--posta-line` `#EADCCB` is a hairline, 1px. It divides, it never encloses without other affordance, and it is
never the only thing distinguishing an input from its background — inputs have a surface change too.

## Layout and breakpoints

| Breakpoint | What changes |
| --- | --- |
| 375px | Single column. Bottom navigation. Display type at 44px. Padding 16px. |
| 768px | Two-column settings and forms. Sidebar appears. Display type 64px. Padding 24px. |
| 1024px | Persistent 248px sidebar. Content max 1200px. |
| 1440px | Same as 1024 with more margin. **Content does not stretch** — a 1600px-wide form is unreadable. |

- Page max width `--page-max` 1200px.
- Reading measure `--prose-max` 68ch. Never a full-width paragraph.
- The app shell: sidebar 248px fixed from 1024px, content flexible.

## What this system exists to prevent

Every rule above is a reaction to a measured problem in the previous interface:

| Previous state | Now |
| --- | --- |
| Gradients, glass, glow, flag-colour stripes | Flat colour, two shadows, one hairline |
| Eight type sizes on one screen, several under 12px | Ten-step bounded ladder, three sizes per view |
| Accent colour used for six unrelated things | One accent, once per screen, with hard measured rules |
| Fake testimonials and a "5,000+ businesses" stat | No claim that cannot be backed |
| Desktop-designed, mobile-squeezed | 375px first, tap targets 44px |
| Font Awesome icons at every size | Lucide for UI, doodles for illustration, at their real sizes |
