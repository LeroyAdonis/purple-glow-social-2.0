# 10 · Implementation

How the system lands in a Next.js 16 + React 19 + Tailwind v4 codebase, and how the old tokens are removed.

## Where things live

| Thing | Path |
| --- | --- |
| Tokens (source of truth) | `design-system/posta/tokens.css` |
| This documentation | `design-system/posta/` |
| Doodle illustration pack | `design/icons/doodle/` (451 SVGs) |
| Logo assets | `design/logo/` *(to be produced: see `07-logo.md`)* |
| Brand skill for agents | `~/.hermes/skills/creative/posta-brand/` |
| Third-party licences | `LICENSES.md` |

## Token wiring

`tokens.css` is imported once, before Tailwind, in the root stylesheet:

```css
@import "../../design-system/posta/tokens.css";
@import "tailwindcss";
```

Tailwind v4 reads CSS custom properties directly, so no `tailwind.config` colour map is needed:

```html
<div class="bg-[var(--posta-paper)] text-[var(--posta-ink)]">
```

For the handful of values used constantly, short utility classes are declared in the same stylesheet:

```css
@layer components {
  .surface-paper { background: var(--posta-paper); color: var(--posta-ink); }
  .surface-field { background: var(--posta-clay); color: var(--posta-cream); }
  .text-meta { font-size: var(--text-meta); letter-spacing: var(--tracking-meta);
               text-transform: uppercase; font-weight: var(--weight-strong); }
  .btn-primary { background: var(--posta-gold); color: var(--posta-ink);
                 border-radius: var(--radius-pill); min-height: var(--touch-min);
                 font-weight: var(--weight-strong); }
  .btn-primary:hover { background: var(--posta-gold-press); }
  .btn-primary:focus-visible { outline: 2px solid var(--posta-focus-light); outline-offset: 2px; }
}
```

## Migrating off the old palette

The previous interface uses these tokens. Every one is being removed, and a **grep must return zero** before the
redesign is considered done:

| Old token | Old hex | Replace with |
| --- | --- | --- |
| `--neon-grape` | `#9D4EDD` | `--posta-clay` (for action) or `--posta-gold` (for the single accent) |
| `--joburg-teal` | `#00E0FF` | `--posta-clay-deep` for links; **nothing** becomes teal — it is a second accent |
| `--pretoria-blue` | `#1A1F3A` | `--posta-clay` or `--posta-clay-deep` |
| `--mzansi-gold` | `#FFCC00` | `--posta-gold` |
| `--void` | `#0D0F1C` | `--posta-paper` (light) or `--posta-clay` (field) |
| `--glass-border` | `rgba(255,255,255,.1)` | `--posta-line` |
| `mzansi-gold`, `sa-green`, `sa-gold`, `sa-red`, `sa-blue` | flag colours | **Deleted.** Flag-colour stripes were part of the busy. |

Tailwind class names built from those tokens (`bg-neon-grape`, `text-joburg-teal`, `border-glass-border`,
`from-sa-green`) must be renamed in the same pass — a token rename that leaves classes behind changes nothing.

**Order of work:** tokens first, then the shell (paper ground, ink type, sidebar, bottom nav), then the post
card (the core component), then forms and modals, then marketing. Never restyle a screen before its tokens
exist, and never restyle two screen families at once — that is how a "redesign" leaves the app half in two
palettes.

## Icons

```tsx
import { MessageCircle, CalendarClock, ListChecks, Sparkles } from 'lucide-react';
```

- `lucide-react` for React components; `lucide-static` for raw SVG.
- 20px default, 16px inline, 24px in a page header. `strokeWidth={2}` (2.4 at 16px).
- Doodles: import the SVG once into a `components/illustrations/` module rather than inlining path data at call
  sites.

## Fonts

Self-host Space Grotesk and Inter as `woff2` in `public/fonts/`, declared with `@font-face` and
`font-display: swap`. **Do not load from Google Fonts at runtime** — third-party requests leak visitor IPs,
which is a POPIA question, not just a performance one. Preload only the two weights actually used above the
fold.

## Component build order

1. `Button` (all five variants, every state)
2. `TextField`, `Textarea`, `Select` (all states, error and helper text)
3. `Chip`, `Badge`
4. `Card`, `PostCard`
5. `Sheet`/`Modal`, `Toast`
6. `Sidebar` / bottom navigation
7. `EmptyState` (with a doodle)
8. `Table` / list
9. `Skeleton`

Each one lands with a **story or a page where it can be seen in all states** — a component whose disabled and
error states have never been rendered does not count as done.

## Definition of done for any UI work

- [ ] No hard-coded colours, sizes, radii or shadows — every value from a token.
- [ ] Contrast measured for every text/background pair actually used.
- [ ] Focus ring visible on both light and field surfaces.
- [ ] Touch targets measured ≥44px at 375px.
- [ ] Reduced-motion pass: nothing disappears at 0ms.
- [ ] 320px and 200% zoom: no horizontal scroll.
- [ ] Three type sizes maximum in the view.
- [ ] One gold element in the view.
- [ ] No gradient, glow, blur or glass anywhere.
- [ ] Every icon is Lucide at UI size or a doodle at illustration size — never the wrong one for the size.
- [ ] No claim on the screen that cannot be backed by something real.
