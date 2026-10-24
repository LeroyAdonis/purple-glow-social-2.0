# Posta design system — index

**Status: locked 25 October 2026. Direction C "Phone First".** This documentation is binding on any UI work,
including delegated agent work. The brand is also packaged as a skill so agents apply it without being told:
`~/.hermes/skills/creative/posta-brand/`.

## The fifteen-second version

| | |
| --- | --- |
| **Direction** | Warm colour field, cream type, flat colour, phone-first |
| **Field** | clay `#8E3B2E` · type on it: cream `#F7EDE2` |
| **App ground** | paper `#FBF6EF` · type: ink `#24140F` |
| **The one accent** | gold `#E9A93C` — once per screen, never as text on light (1.91:1) |
| **Type** | Space Grotesk 700 display · Inter 400 body · 10 sizes, 11px floor |
| **Icons** | Lucide under 32px · Doodle illustrations at 32px and up |
| **Logo** | `posta` + speech-bubble full stop on the baseline, **tail pointing left at the word** · variant 2 large, 1 small |
| **Motion** | 80 / 140 / 220 / 340ms · reduced-motion zeroes all of them |

## Read in this order

| File | What it decides |
| --- | --- |
| `01-foundations.md` | Direction, audience, six principles, space, shape, elevation, breakpoints |
| `02-color.md` | The five colours, **measured contrast for every approved pairing**, the gold rules |
| `03-typography.md` | Families, the bounded ten-step scale, language and script constraints |
| `04-components.md` | Every component with **every state**, including the post card |
| `05-motion.md` | Durations in ms, what never animates, reduced motion |
| `06-icons-illustration.md` | Lucide vs Doodles and the size rule that separates them |
| `07-logo.md` | The mark, clear space, minimum sizes, misuse, asset list |
| `08-content-voice.md` | Voice, **honesty rules**, microcopy patterns, the 11 language names |
| `09-accessibility.md` | Measured targets, focus, touch, semantics, how each is verified |
| `10-implementation.md` | Token wiring, migration off the old palette, build order, definition of done |
| `tokens.css` | The single source of truth for every value |

## The rules that are hardest to follow and matter most

1. **One accent per screen.** Gold means "do this one thing". Two golds means the user does neither.
2. **Three type sizes per view.** The old interface used eight, several below 12px.
3. **No gradients, glow, blur or glass.** This is the specific thing that made the old interface busy.
4. **Contrast measured, never asserted.** Gold on paper is 1.91:1 — measured, and now banned.
5. **Under 32px is Lucide, 32px and up may be a doodle.** Measured on the real files.
6. **No claim that cannot be backed.** No invented counts, testimonials or capabilities — ever.
7. **Honest errors.** The cause and the fix, in plain words, every time.

## Decision record

| Date | Decision | Why |
| --- | --- | --- |
| 24 Oct 2026 | Direction C chosen over A (editorial) and B (dark signal) | The customer is one person on one phone; C is the only direction that shows the product at that size |
| 24 Oct 2026 | Borrowed A's typographic restraint | Best-looking of the three; its discipline suits a writing tool |
| 24 Oct 2026 | Logo variant 2 primary, variant 1 under 32px | The drawn bubble matches the hand-made illustration language; the solid one survives a favicon |
| 24 Oct 2026 | Doodles for illustration, Lucide for UI | Measured: doodles lose detail at 16px (calendar → square, gear → lump) |
| 25 Oct 2026 | Warning darkened to `#8A5A12` | The old `#B5761A` was 3.51:1 on paper, below AA |
| 25 Oct 2026 | Per-surface focus rings | Gold as a ring is 1.91:1 on paper — invisible to the people who need it |
| 25 Oct 2026 | Dropped "load-shedding tolerant" copy | Eskom's own 2 Oct 2026 statement: 500+ days without load-shedding |
| 25 Oct 2026 | Removed the old "5,000+ SA businesses" and fake testimonials | Not true. Zero customers at the time. |
| 25 Oct 2026 | **Speech-bubble tail flipped to the left** | The tail must point back at the wordmark; on the right it read as talking away from the brand |

## Changing this system

Add the value to `tokens.css` first, then use it, then document it here in the same commit. If a rule is being
broken because it does not fit a real case, **change the rule and record why** — do not quietly break it. A
design system that is ignored is worse than none, because it teaches everyone that the documentation lies.
