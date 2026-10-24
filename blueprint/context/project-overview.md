# Project overview — Posta

*Generated from `../project-plan.md` and `../build-plan.md`. This is the file the AI reads each session; it is
the source of truth for what Posta is and what actually works.*

## One paragraph

Posta is a social-media posting tool for South African small businesses, a product of Digital Wave Tech (Pty)
Ltd (CIPC 2026/809312/07, not VAT registered), live at `https://posta.digitalwavetech.dev`. An owner says what
they want to say, Posta writes it in one of the 11 official SA languages, the owner approves it on their phone,
and Posta schedules and publishes to Instagram, Facebook, X and LinkedIn. The user is **one owner-operator with
one phone** — no seats, no workspaces, no approval chains, deliberately.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · PostgreSQL + **Drizzle ORM** · Better Auth ·
Inngest (scheduled jobs) · Paystack (ZAR) · env-switchable AI provider at `lib/ai/provider.ts`.

## Layout that matters

| Path | What lives there |
|---|---|
| `app/` | App Router pages and API routes; legal pages at `app/{privacy,terms,cookies,refund,contact}` |
| `components/` | UI. `components/landing/**` is the marketing surface, `components/landing/logo.tsx` is the mark |
| `lib/` | `company.ts` (single source of legal identity), `auth.ts`, `db/`, `ai/provider.ts`, `paystack/` |
| `drizzle/` | Schema; money is stored in **cents** |
| `design-system/posta/` | **The design authority.** `tokens.css`, `00-INDEX.md`, `04-components.md`, `scripts/check-brand.py` |
| `design/icons/doodle/` | 451 CC0 illustration SVGs (32px and up only) |
| `blueprint/` | This workflow's state |

## Design rules that are enforced, not advisory

- Palette: clay `#8E3B2E`, cream `#F7EDE2`, paper `#FBF6EF`, ink `#24140F`, **one gold `#E9A93C` per screen**.
- Gold is **never** text, a hairline or a focus ring on a light surface (1.91:1). Ink on gold is the button.
- No gradients, no glass/backdrop blur, no glow shadows. Flat colour only.
- Three type sizes per view, 11px floor. Space Grotesk display, Inter body, self-hosted via `next/font`.
- Icons: Lucide below 32px, Doodle illustrations at 32px and above. Never swap them.
- Touch targets ≥44px.
- Verify with `python3 design-system/posta/scripts/check-brand.py --src . --allow-legacy-names` and
  `--url <page>` for anything rendered.

## Non-negotiables

1. **No fabricated data, claims, testimonials or capabilities.** Empty states are honest; "coming soon" is
   allowed; an invented number is not.
2. **Do not imply unverified things** — WhatsApp Channels publishing and Instagram's posting cap are unverified
   and are excluded from copy.
3. **Every failure names its cause and its fix.**
4. **Rands are rands** — no VAT is added, ever.

## Commands

```bash
/root/posta-serve.sh build   # production build
/root/posta-serve.sh start   # serve on :3008
npx tsc --noEmit -p tsconfig.json
python3 design-system/posta/scripts/check-brand.py --src . --allow-legacy-names
```

## Current state

Auth, generation wiring, scheduling UI, four OAuth providers, auto-posting, credit basics, the legal surface,
the full brand rebuild and the Paystack webhook **work**. The six slices in `../build-plan.md` (DIG-46 … DIG-51)
are **not built**; their design is written at `docs/specs/2026-10-25-cherry-pick-features-design.md`.

Known gaps: Paystack keys unwired and no test purchase run · Meta app still in Development mode ·
`GEMINI_API_KEY` absent so AI reports itself unavailable rather than faking · WhatsApp Channels unverified ·
45 files using legacy Tailwind class names that now resolve to brand colours (cosmetic debt).
