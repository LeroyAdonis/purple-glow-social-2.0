# 02 · Colour

Five colours and three state colours. That is the whole palette, and the constraint is the point: the old
interface used gradients, glass panels and six accent hues, which is why it read as busy.

**Every value here was measured with real sRGB maths, not eyeballed.** The ratios below are computed, and any
pair not listed is not an approved pairing.

## The five brand colours

| Token | Hex | Job |
| --- | --- | --- |
| `--posta-clay` | `#8E3B2E` | The brand field. Marketing ground, primary fills, the logo on light. |
| `--posta-clay-deep` | `#742F25` | Pressed state of the field. The only clay that safely carries gold text. |
| `--posta-clay-tint` | `#F2E2DA` | Selected chip, quiet fill on light surfaces. Never a large background. |
| `--posta-cream` | `#F7EDE2` | Type on the field. Also a light surface when paper is too pale for a card. |
| `--posta-ink` | `#24140F` | All body type on light. |
| `--posta-paper` | `#FBF6EF` | The app background. Slightly lighter than cream so a cream card still reads. |
| `--posta-gold` | `#E9A93C` | **The single accent.** One per screen. |

Plus `--posta-ink-soft` `#6E5B4E` for secondary text and `--posta-line` `#EADCCB` for hairlines only.

## Measured contrast — the approved pairings

Normal text needs **4.5:1**. Large text (24px+, or 19px bold) needs **3:1**. Non-text graphics need **3:1**.

| Foreground | Background | Ratio | Verdict |
| --- | --- | --- | --- |
| ink | paper | **16.52:1** | ✅ body text |
| ink | cream | **15.37:1** | ✅ body text |
| ink | clay-tint | **14.10:1** | ✅ body text on a selected chip |
| ink on gold | `--posta-gold` | **8.63:1** | ✅ the primary button: gold fill, ink label |
| cream | clay-deep | **8.35:1** | ✅ body text on a pressed field |
| clay (as text/icon) | paper | **6.94:1** | ✅ body text, icons, focus ring |
| danger | paper | **6.67:1** | ✅ error text |
| ink-soft | paper | **5.97:1** | ✅ secondary text |
| success | paper | **5.85:1** | ✅ success text |
| ink-soft | cream | **5.56:1** | ✅ secondary text |
| warning `#8A5A12` | paper | **5.50:1** | ✅ warning text (corrected in v2) |
| success | cream | **5.44:1** | ✅ |
| cream | clay | **6.45:1** | ✅ body text on the brand field |
| clay | cream | **6.45:1** | ✅ |
| danger | cream | **6.21:1** | ✅ |
| warning | cream | **5.11:1** | ✅ |
| ink-soft | clay-tint | **5.10:1** | ✅ meta text on a chip |
| gold | clay-deep | **4.69:1** | ⚠️ passes, but spend it carefully |
| **gold** | **clay** | **3.63:1** | ⚠️ **large text (24px+ bold) or graphics only** |
| **warning `#B5761A`** | **paper** | **3.51:1** | ❌ **banned — this was the old token** |
| **gold** | **paper** | **1.91:1** | ❌ **never text, never a hairline, never a focus ring** |
| **gold** | **cream** | **1.78:1** | ❌ same |

## The gold rules

Gold is the most abused colour in a palette like this, so it has hard rules:

1. **One gold element per screen.** If two things are gold, the user has been told to do two things and will
   do neither.
2. **Gold as a fill with ink text is the primary action** (8.63:1). This is its main job.
3. **Gold as text on light surfaces is banned** — 1.91:1. It is a decoration pretending to be information.
4. **Gold on clay is large-text-only** — 3.63:1. Fine for a 32px number, not for a 14px label.
5. **Gold is never a focus ring on light** — 1.91:1 makes the ring invisible to exactly the people who need it.
6. **Gold is never used to mean "warning".** Warning is `#8A5A12`. A gold warning is unreadable and dishonest.

## Focus rings — per surface, because one colour cannot work on both

This is the detail most design systems skip and then fail an audit on:

- On `paper` and `cream`: ring `--posta-focus-light` (`#8E3B2E`, 6.94:1), 2px, offset 2px.
- On `clay` and `clay-deep`: ring `--posta-focus-field` (cream, cream on clay is 6.45:1), 2px, offset 2px.
- Never `outline: none` without a replacement ring, and never rely on a colour change alone.

## State colours

| Token | Hex | Use | Note |
| --- | --- | --- | --- |
| success | `#2F6B4F` | Post published, save confirmed | Always paired with a word, never colour alone |
| danger | `#A32B22` | Post failed, destructive action | Never used for a decorative highlight |
| warning | `#8A5A12` | Credits low, connection expiring | Corrected in v2 |

A publishing tool has to report failure honestly, so these are functional colours, not decoration. **Colour is
never the only signal** — a failed post says "Failed" as well as being red.

## Banned

- Gradients, meshes, glows, blur, glass, backdrop-filter.
- More than one accent hue on a screen.
- Pure black `#000` and pure white `#FFF` as text colours (ink and cream exist for that).
- Opacity as a way to make a colour "lighter" for text; use a real tinted token so it stays measurable.
- A colour that carries meaning without a label.

## Where the tokens live

`design-system/posta/tokens.css` is the source of truth, mirrored into the app's global stylesheet. Nothing
downstream may hard-code a hex value; a component that needs a new colour adds a token here first.
