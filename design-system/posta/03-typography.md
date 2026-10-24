# 03 · Typography

Two families, ten sizes, four weights of meaning. The discipline is in what is *not* available.

## Families

| Role | Family | Fallback stack | Licence |
| --- | --- | --- | --- |
| Display | **Space Grotesk** 700 / 500 | `ui-sans-serif, system-ui, sans-serif` | SIL OFL 1.1 |
| Body | **Inter** 400 / 500 | `ui-sans-serif, system-ui, sans-serif` | SIL OFL 1.1 |

- Both **self-hosted**, not fetched from Google Fonts at runtime — a POPIA consideration (no visitor IPs leak
  to a third party) as much as a performance one.
- Space Grotesk carries the wordmark and headings. It has a slightly quirky, engineered feel which is why the
  logo works in it.
- Inter carries body copy because it is legible at 14–16px on a phone in daylight.
- **No third family.** No serif, no mono except for tabular numbers where Inter's tabular figures are used.

## The bounded scale

| Token | Size | Weight | Line height | Tracking | Where it is allowed |
| --- | --- | --- | --- | --- | --- |
| `--text-display` | 96px / 44px phone | 700 display | 0.95 | -0.03em | Marketing hero **only**. Never in the app. |
| `--text-h1` | 48px / 32px | 700 display | 1.15 | -0.02em | Page title. One per page. |
| `--text-h2` | 32px / 26px | 700 display | 1.15 | -0.01em | Section title. |
| `--text-h3` | 22px | 500 strong | 1.25 | 0 | Card title, modal title. |
| `--text-body-lg` | 18px | 400 body | 1.55 | 0 | Marketing body, onboarding copy. |
| `--text-body` | 16px | 400 body | 1.55 | 0 | **Default for everything.** |
| `--text-small` | 14px | 400 / 500 | 1.5 | 0 | Secondary text, form help, table cells. |
| `--text-meta` | 12px | 500 strong | 1.4 | 0.16em, uppercase | Labels above a field, status chips, table headers. |
| `--text-micro` | 11px | 500 strong | 1.4 | 0.10em | The smallest allowed. Timestamps, legal footnote. |

**11px is the floor.** The previous interface had nine sizes below 12px; this is the rule that stops that
returning. If something does not fit at 11px, the copy is too long, not the type too big.

## Rules

1. **Three sizes per view, maximum.** A dashboard with a page title, card titles and body is three. If a
   fourth is wanted, one of the existing three is wrong.
2. **Uppercase only for `--text-meta` and `--text-micro`, always with tracking.** Never uppercase a sentence,
   never uppercase body copy, and never letterspace lowercase text.
3. **`--text-display` does not appear inside the app.** It exists so the marketing page has one loud voice; a
   scheduled-post list does not need to shout.
4. **Numbers are tabular.** Times, credit counts, prices and dates use `font-variant-numeric: tabular-nums`, so
   a countdown does not make the layout jitter and a column of prices lines up.
5. **Never use font weight below 400.** No 300, no "light" versions. On a phone in daylight, thin type
   disappears.
6. **Line length 68ch maximum** (`--prose-max`). A paragraph wider than that is a reading failure, not a
   layout choice.
7. **Links are underlined, not just coloured.** Colour-only differentiation of a link fails WCAG 1.4.1 and is
   invisible to a colour-blind user.
8. **No italics for emphasis in UI copy.** Use weight 500 or a line break. Italics at 14px on a phone are hard
   work. (Marketing hero may use italic sparingly, direction A's one borrowed trait.)

## Language and script considerations

Posta writes in 11 official South African languages, so the type has to survive all of them:

- **Space Grotesk and Inter are Latin-only.** They render the Latin alphabet plus the diacritics Afrikaans
  needs (ê, ë, ô, û, á). They do **not** cover the click consonants of Xhosa and Zulu written with Latin
  letters plus digraphs — those are fine, they use standard Latin letters — but any content in another script
  would fall back.
- **Never set a heading in a language and assume it fits.** IsiZulu and Sesotho words are often longer than
  their English equivalents: "scheduled posts" can become a much longer phrase. Every button and tab label
  must be tested with the longest-language string, not the English one. If a label cannot shrink, the layout
  is wrong.
- **Do not use `text-transform: uppercase` on localised strings.** Case transformation rules are not universal
  and uppercasing can break a word in some languages. Uppercase is for our own English meta labels only.

## Type do-not list

- ❌ Letter-spacing tighter than -0.03em (the hero uses -0.03 and no further).
- ❌ Centred paragraphs longer than two lines.
- ❌ Justified text, ever (creates rivers at phone widths).
- ❌ Text over an image without a measured scrim; if a scrim is needed, the image is the wrong image.
- ❌ Any size between the ten steps above. If 17px is wanted, 16 or 18 exists.
- ❌ A heading smaller than the body copy it introduces.
