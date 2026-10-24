# 09 · Accessibility

Non-negotiable, and stated with measured numbers rather than intentions. The target is **WCAG 2.2 AA**, with
touch targets raised to 44px as a comfort choice for a phone-first product (the AA floor is 24px — calling a
40px control a violation is wrong, and the distinction is written down here so nobody "fixes" it the wrong way).

## Contrast — measured, per pairing

Full table in `02-color.md`. The rules that matter:

- Body text ≥ **4.5:1**. Large text (24px+, or 19px bold) ≥ **3:1**. Graphics and UI boundaries ≥ **3:1**.
- **Gold is never text on light** (1.91:1) and **never a focus ring on light**.
- **Gold on clay is large-text-only** (3.63:1).
- A colour never carries meaning alone — failure is red *and* the word "Failed".

**Verification is a script, not an opinion.** A contrast claim without a computed sRGB ratio is not a claim.
Watch for the trap: `getComputedStyle().backgroundColor` is `transparent` behind a gradient or image, so a
DOM-walking checker silently passes text whose contrast a wash destroyed. If any gradient exists over text, the
check must read composited pixels instead.

## Focus

- Every interactive element has a visible `:focus-visible` ring: 2px, 2px offset, clay on light surfaces, cream
  on clay surfaces.
- `outline: none` is only permitted when a custom ring replaces it in the same rule.
- Focus order follows visual order. No positive `tabindex`.
- Modals trap focus, return focus to the trigger on close, and close on Escape.

## Keyboard

- Everything reachable and operable by keyboard: navigation, chips, modals, the calendar grid, the queue.
- Drag-and-drop (queue reordering at desktop) has a keyboard alternative — move up/down in a menu.
- Skip link to main content as the first focusable element.
- Visible shortcut for the one thing done most: pressing `n` focuses "new post" (documented in the UI, not a
  secret).

## Touch

- Minimum **44×44px** target, with 8px between adjacent targets.
- A 16px icon inside a 44px target gets invisible padding, not a 16px hit area.
- Bottom navigation items are 56px tall on phones because thumbs are imprecise and phones are held one-handed.

## Semantics and screen readers

- Real elements: `<button>` for actions, `<a>` for navigation. A `div` with `onClick` is a defect.
- One `<h1>` per page, headings in order, no heading chosen for its size.
- Form fields: `<label for>`, `aria-describedby` for help and error text, `aria-invalid` on error.
- Status changes announced: `role="status"` for confirmations, `role="alert"` for failures.
- Loading regions carry `aria-busy="true"`.
- Images: `alt` describing the purpose; decorative images `alt=""`. An icon that duplicates a visible label is
  `aria-hidden="true"`.
- Language of parts: `lang="zu"` on isiZulu content so a screen reader switches voice instead of mangling it.

## Motion and vestibular safety

- `prefers-reduced-motion: reduce` sets every duration token to 0ms in `tokens.css`.
- Nothing is only visible after an animation completes.
- No autoplaying video, no parallax, no flashing above 3Hz.

## Forms

- Label above the field, always visible. A placeholder is never the label.
- Errors inline, specific, and announced. The message names the field and what to do.
- Required fields marked in text, not only with an asterisk.
- Autofill-friendly `name`/`autocomplete` attributes: `email`, `current-password`, `new-password`.

## Content

- Reading level: plain language. Short sentences. SA English.
- Links describe their destination — "read the refunds policy", never "click here".
- No text inside images.
- Content reflows to 320px without horizontal scrolling; text can be zoomed to 200% without loss.

## How this gets verified before shipping

1. **Contrast**: computed sRGB ratios for every text/background pair actually used (script, not eyeball).
2. **Focus**: tab through the page with a screenshot at each stop; confirm the ring is visible on both surfaces.
3. **Targets**: measure `getBoundingClientRect()` of every interactive element; assert ≥44px on phones.
4. **Reduced motion**: emulate the media query and confirm nothing disappears.
5. **Zoom 200% and 320px width**: assert no horizontal scroll (`scrollWidth <= innerWidth` on the document,
   and every element's right edge within the viewport — a full-bleed `overflow:hidden` section makes the naive
   scrollbar test lie).
6. **Keyboard-only pass** of the primary flow: sign in, write a post, schedule it, cancel.
