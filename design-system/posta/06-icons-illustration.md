# 06 · Icons and illustration

Two sets on purpose. They must never be swapped, and the rule that separates them is **size**, not taste.

## Lucide — the interface

- Source: `lucide` (npm), **ISC licence**, 2,171 icons, free for commercial use.
- Size: **16px, 20px, 24px only.** Stroke width **2px** at 20–24px, **2.4px** at 16px so it does not go faint.
- Colour: inherits `currentColor`. Never multi-colour, never a filled brand colour unless it is the accent on
  the single primary action.
- Where: sidebar, toolbar, buttons, table cells, inline with text, status.
- Alignment: optically centred to the cap height of the label beside it, with an 8px gap.

Choices already made, so nobody re-litigates them per screen:

| Meaning | Icon |
| --- | --- |
| Posts / chat | `message-circle` |
| Schedule | `calendar-clock` |
| Queue | `list-checks` |
| AI write | `sparkles` |
| Media | `image` |
| Publish | `send` |
| Analytics | `chart-no-axes-column` |
| Languages | `languages` |
| Credits | `plus` inside the wallet concept, not a coin |
| Settings | `settings` |
| Failure | `circle-alert` |

## Doodle Icons — the illustration language

- Source: Khushmeen, **CC0**, installed at `design/icons/doodle/` (451 SVGs, 15 categories).
- Size: **32px minimum, 48–120px typical.** At 16px the calendar becomes a square and the gear a lump — that
  was measured on the real files, not guessed.
- Colour: single colour, `currentColor`. They are filled paths, so they cannot be weight-tuned to match Lucide;
  do not try.
- Where: empty states, onboarding, the 404, marketing margins, section headers, the "what Posta does" moments.
- Never: in a toolbar, a button, a table, or beside a 14px label.

**Why the split exists:** the doodles are hand-drawn and warm, which is the brand's voice, and they are
delightful at illustration size. They are also 451 different hands with a baked-in line weight, so at UI size
they lose their detail and stop being recognisable. The interface therefore uses a set drawn on one grid, and
the doodles do the job they are genuinely best at.

## Platform marks

Instagram, Facebook, X, LinkedIn, WhatsApp.

- Use the **owner's official asset**. The brand guidelines of Meta, X Corp and LinkedIn govern the mark's
  colour, clear space and permitted contexts.
- Never redraw, recolour, stretch, rotate, or place a platform mark inside another shape.
- Never imply endorsement or partnership. Positions: "publishes to Instagram", never "Instagram partner".
- Size 16–20px in the UI, always paired with the platform name in text on small screens. A bare mark at 16px
  is not reliably identifiable.
- The doodle pack contains copies of several marks. They are a fallback for internal mockups only.

## Rules that apply to both sets

1. **No emoji as an icon.** Ever. An emoji renders differently on every device and looks like a placeholder.
2. **No icon without a label** unless it has an `aria-label` and a conventional meaning (close, search).
3. **Icons carry meaning, never decoration.** A row of coloured icons under a heading is decoration.
4. **One stroke weight per screen.** Mixing 1.5px and 2px Lucide icons is the most common subtle tell that a
   UI was assembled rather than designed.
5. **Do not put an icon on every list item.** If six rows all start with an icon, the icons are wallpaper.

## Naming and file discipline

- Lucide: import by name from the package, never inline SVG copied from the website, so updates stay possible.
- Doodles: reference from `design/icons/doodle/<category>/<name>.svg`. If an icon is used repeatedly in the
  app, import it once into a component rather than duplicating the path data.
- Never ship a 2MB sprite for eight icons.
