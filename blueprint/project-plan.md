# Project plan — Posta

*User-owned input. `overview` reads this file to generate `context/project-overview.md`.*

## What it is

Posta is a social-media posting tool for South African small businesses. An owner types what they want to say,
Posta writes it in one of the **11 official South African languages**, the owner approves it on their phone, and
Posta schedules and publishes it to Instagram, Facebook, X and LinkedIn.

A product of **Digital Wave Tech (Pty) Ltd** (CIPC 2026/809312/07, not VAT registered).
Live at `https://posta.digitalwavetech.dev`.

## Who it is for

**One owner-operator with one phone.** A spaza shop, a salon, a shebeen, a food seller, an events promoter.
They are not a marketing team and they do not have a laptop. They do not want a content calendar, a workspace,
seats, roles or an approval chain — the absence of those is a deliberate product decision, not unfinished work.

## The wedge

Every competitor surveyed (Buffer, Hootsuite, Later, Metricool, Publer, SocialBee, Vista Social, FeedHive,
Postiz) sells in USD or EUR, charges per seat, and **none supports an African language for generation**. The
defensible product is: South African languages, honest pricing in rands, prepaid credit instead of a
subscription, and delivery through the channel this market actually uses.

## Stack — and why each part is intentional

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 App Router, React 19 | Server components keep the client bundle small on cheap phones |
| Styling | Tailwind v4 + design tokens in `design-system/posta/tokens.css` | One source of truth for colour, type, spacing |
| Database | PostgreSQL + Drizzle ORM | Typed schema; the Neon driver lock-in that broke earlier launches is already removed |
| Auth | Better Auth (email + password, OAuth for the 4 platforms) | Ships with the app, no third-party identity cost |
| Jobs | Inngest | Scheduled publishing, retries, credit expiry — without a cron box |
| Payments | Paystack (ZAR) | Local cards and EFT at ~2–2.9%; a USD subscription would carry forex and cross-border fees |
| AI | `lib/ai/provider.ts`, env-switchable (`AI_PROVIDER`, `AI_BASE_URL`) | Free router proven live; a paid provider can be swapped in without a code change |

## Constraints that are not negotiable

1. **No fabricated claims.** No invented user counts, testimonials, ratings or capabilities. The front page once
   carried "5,000+ SA businesses" with zero customers and three invented testimonials; both were removed and
   must never return.
2. **No unverified claims in copy.** WhatsApp Channels publishing and Instagram's posting cap are unverified and
   are fenced off — feature copy must not imply them.
3. **The design system is binding.** `design-system/posta/` governs all UI. A screen that fails
   `scripts/check-brand.py` is not done.
4. **Honest failure states.** Every error names the cause and the fix. "Something went wrong" is banned.
5. **Rands are rands.** DWT is not VAT registered: R299 is R299, and no price may be shown with VAT added.

## Environment

- Repo: `/root/posta-revive`, served on port 3008 behind Caddy at `posta.digitalwavetech.dev`.
- Run: `/root/posta-serve.sh build|start|db|seed`. Postgres in Docker `posta-db` on `127.0.0.1:5434`.
- Demo login: `demo@posta.co.za`.
