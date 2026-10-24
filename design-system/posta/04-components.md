# 04 · Components

Every component lists **every state**. A missing focus or disabled state is what makes a UI feel unfinished,
and it is the single most common gap in a screen-derived design.

All sizing uses tokens from `tokens.css`. No component invents a colour, size or radius.

---

## Button

The primary button is the pill in direction C. Gold fill with ink label is 8.63:1 and is the only gold on the
screen. There is **one** primary button per view.

| Variant | Surface | Fill | Label | Border |
| --- | --- | --- | --- | --- |
| primary | light | `--posta-gold` | `--posta-ink` | none |
| secondary | light | transparent | `--posta-ink` | 1px `--posta-clay` |
| quiet | light | transparent | `--posta-ink-soft` | none, underline on hover |
| destructive | light | `--posta-danger` | `--posta-cream` | none |
| primary-on-field | clay | `--posta-cream` | `--posta-clay` | none (gold stays for one element only) |

Sizes: `md` 48px tall / 16px 24px padding / `--text-body` · `sm` 40px / 12px 18px / `--text-small`.
Minimum touch target **44×44px** — a `sm` button inside a list row gets invisible padding to reach 44px.

States:

| State | Change |
| --- | --- |
| default | as the table |
| hover | primary → `--posta-gold-press`; secondary → fill `--posta-clay-tint`; transition `--dur-fast` |
| focus-visible | 2px ring in `--posta-focus-light`, 2px offset. **Never removed.** |
| active | translateY(1px) and fill one step darker |
| disabled | 40% opacity, `cursor: not-allowed`, `aria-disabled="true"`, no hover change |
| loading | label replaced by a spinner + the original label, width locked so the layout does not jump, `aria-busy="true"`, button not clickable |
| error (rare) | label stays, icon changes to `circle-alert`, ring `--posta-danger` |

Rules: verb-first labels ("Publish post", not "Submit"). Never a button whose only label is an icon unless it
also has `aria-label`. Never two primary buttons in one view.

---

## Text field

Height 48px, radius `--radius-sm`, background `--posta-white`, 1px `--posta-line`, padding 12px 16px,
`--text-body`. Label **above** the field in `--text-meta`, not a placeholder — a placeholder disappears the
moment someone types, which is a memory test the user did not sign up for.

| State | Change |
| --- | --- |
| default | hairline border, white surface |
| hover | border `--posta-ink-soft` |
| focus-visible | border `--posta-clay`, 2px ring `--posta-focus-light` at 2px offset |
| filled | unchanged, the label stays visible |
| disabled | `--posta-clay-tint` surface, 55% label opacity |
| error | border `--posta-danger`, message below in `--text-small` / `--posta-danger`, `aria-invalid="true"` and `aria-describedby` pointing at the message |
| success | border `--posta-success`, short confirmation, never a colour-only signal |
| loading (async validate) | small spinner inside the right edge, field stays editable |

Helper text sits below, `--text-small`, `--posta-ink-soft`, reserved space so the layout does not shift when
an error appears.

## Textarea

Same as the field, min-height 120px, `resize: vertical` only. A character counter in `--text-meta` when a
platform limit applies — and the limit must be the real platform limit, not a guess.

## Select

Native `<select>` on phones (it gives the OS picker, which is faster than anything custom). Custom listbox
only at 768px+ where the options need a description. Same states as the field.

## Checkbox and radio

20px box, radius 4px (checkbox), full round (radio), border 1px `--posta-ink-soft`, label 16px with 8px gap,
whole row is the target (44px min height). Checked: `--posta-clay` fill, cream tick. Focus: ring as per field.
Never a custom toggle that loses keyboard behaviour.

## Chip / filter

Height 32px, radius `--radius-pill`, `--text-meta`. Idle: `--posta-clay-tint` fill, `--posta-ink` label.
Selected: `--posta-clay` fill, `--posta-cream` label. Removable chips get a 20px × at the right with a 44px
touch area. Used for languages and platforms — **never** for status, which is a badge.

## Card

Background `--posta-white` on paper, radius `--radius-md`, `--shadow-card`, padding 24px (16px on phones).
Optional hairline instead of shadow when cards sit in a dense list. A card is never clickable as a whole
without a visible link inside it, and never has more than one action.

## Post card — the core component

This is the view the whole product exists for, so it gets its own spec:

- Header row: language chip + platform badge + scheduled time (tabular numbers).
- Body: the post copy at `--text-body`, `--leading-body`, max 4 lines with a "more" that expands in place.
- Footer: one primary action ("Approve") and one quiet action ("Edit"). Nothing else.
- State ribbon: `Scheduled` (clay-tint), `Publishing` (clay + spinner), `Published` (success + the checkmark),
  `Failed` (danger + **the reason in plain words**: "Instagram rejected the image: too large").
- A failed post always explains itself and offers the fix. "Something went wrong" is banned.

## Status badge

Height 24px, radius `--radius-pill`, `--text-meta`, 8px horizontal padding, tinted background at full text
contrast. **Always carries a word** — never a bare coloured dot. Colour is reinforcement, not information.

## Queue item

Row, 64px min height, 44px touch target, time in tabular figures, platform mark 16px (Lucide or the official
brand asset), title one line with ellipsis, status badge at the right. Drag handle only at 1024px+; on phones
reordering happens through a menu, not a drag, because drag targets of 24px are unusable with a thumb.

## Modal / sheet

- Phones: bottom sheet, radius `--radius-lg` top corners, slides up `--dur-base`, `--shadow-sheet`, max height
  90vh, drag-to-dismiss plus a visible close.
- Desktop: centred dialog, max 520px wide, radius `--radius-lg`.
- Scrim: `rgba(36,20,15,.45)` — warm, never pure black.
- Focus is trapped and returns to the trigger on close. Escape closes. The background is inert.

## Toast

Bottom on phones (above the navigation), top-right from 768px. Radius `--radius-md`, `--shadow-sheet`,
`--text-body`, 4-second default, always dismissible, `role="status"` for success and `role="alert"` for
failure. Never a toast for something the user must act on — that is a modal.

## Empty state

The one place the **Doodle Icons** belong at scale: a hand-drawn illustration at 96–120px, a `--text-h3` line
saying what would be here, one sentence of `--text-body` explaining how to make it happen, and one action.
Never a shrug emoji, never a "no data" table.

## Table

Header `--text-meta` uppercase on `--posta-clay-tint`, rows 56px, hairline dividers, tabular figures for
numbers, right-aligned numerics. Zebra striping is not used — a hairline is enough. At 375px a table becomes a
stacked list of key/value pairs; horizontal scrolling tables are banned.

## Sidebar navigation

248px, `--posta-paper` surface with a hairline on the right. Items 44px tall, 8px radius, icon 20px
(Lucide) + label `--text-small`. Active: `--posta-clay-tint` fill, `--posta-ink` label, 3px clay bar on the
left. Hover: tint at 50%. Focus ring per surface. On phones this becomes a bottom bar of at most 5 items with
20px icons and 11px labels.

## Skeleton

Only for content that genuinely arrives late, and only in the shape of the real content. `--posta-clay-tint`
blocks, subtle shimmer at `--dur-slow`, `aria-hidden="true"`, and the region carries `aria-busy`. A spinner
replaces nothing else; a skeleton is not a loading spinner with delusions.

## What does not exist

No carousels, no marquees, no progress rings for decoration, no floating action buttons (the primary action
lives in the layout), no icon-only toolbars with more than four items, no accordions inside modals.
