# Third-party assets and licences

Posta ships other people's work. This file exists because one of those things was being used **without the
attribution its licence requires**: Font Awesome Free is CC BY 4.0 for its icons, and we were using it in 513
places across 59 files with no credit anywhere in the product or the repo. That is a licence breach, and it
is the kind that gets found during due diligence rather than by a compiler.

Keep this file current. If an asset is added, its licence goes here in the same commit.

## Doodle Icons — Khushmeen (illustration language)

- Used for: **illustration, not interface** — empty states, onboarding, 404s, marketing accents, section
  headers, and anywhere the icon is 32px or larger.
- Licence: **CC0 1.0** (public domain dedication). Commercial use allowed, attribution not required,
  credited here anyway.
- Source: https://khushmeen.com/icons.html — downloaded by Leroy on 24 Oct 2026 as a zip.
- Installed at `design/icons/doodle/` — **451 SVGs only**. The 2MB of PNGs that came in the same zip are not
  committed: an SVG renders sharper at every size and the PNGs would bloat the repo for no gain.
- Categories: interface (177), hand gestures (46), logos (27), e-commerce (27), arrows, files, health, food,
  finance, weather, currency, emojis, objects, misc, gender symbols.

**Why they are not used as UI icons.** Measured, not guessed: the files are **filled paths, not strokes**, so
the line weight is baked into each shape and cannot be tuned. At 34px they are charming and clearly
hand-drawn; at 24px they start to go chunky; **at 16px the calendar becomes a square, the gear becomes a lump
and the graph becomes noise**. A sidebar needs 16–20px icons that stay even, so the interface uses Lucide and
the doodles do what they are genuinely good at.

**A note on the platform marks in the pack.** It includes instagram, facebook, linkedin, whatsapp, twitter and
tiktok. Handy for sourcing, but these are somebody's trademarks redrawn: prefer the owner's official asset,
never alter or recolour outside their guidelines, and never use a mark in a way that implies endorsement.

## Font Awesome Free

- Used for: the icon font currently loaded by the interface (`fa-solid`, `fa-brands` classes).
- Version: Font Awesome Free 6.x
- Licence: **Icons — CC BY 4.0**; Fonts — SIL OFL 1.1; Code — MIT.
- Attribution: "Font Awesome Free by Fonticons, Inc. — https://fontawesome.com — licensed under CC BY 4.0."
- Requirement: the CC BY 4.0 attribution must be visible to users. It is shown on the contact page, and in
  this file.
- Exit plan: new interface work uses Lucide instead. Font Awesome is legacy and should be migrated out of the
  59 files that use it rather than carried into the redesign.

## Lucide

- Used for: interface icons in the redesign.
- Licence: **ISC** (permissive, commercial use allowed, no attribution required — credited here anyway).
- Install: `npm i lucide-static` (or `lucide-react` for React components), so icons live in the codebase
  rather than being fetched from a CDN.
- https://lucide.dev

## Simple Icons (platform brand marks)

- Used for: Instagram, Facebook and X marks.
- Licence: **CC0 1.0** for the SVG files.
- Important: the trademarks belong to Meta, X Corp and LinkedIn respectively. The CC0 licence covers only the
  drawing, not the right to use the brand. Marks are used to indicate which platforms the product publishes
  to, must not be altered or recoloured outside the owner's guidelines, and must not imply endorsement.
- **LinkedIn is not in this pack.** Use LinkedIn's own brand assets from their brand guidelines.
- https://simpleicons.org

## Fonts

- **Space Grotesk** — SIL Open Font License 1.1.
- **Inter** — SIL Open Font License 1.1.
- Both are self-hosted, not fetched from Google Fonts at runtime, so the product does not leak visitor IPs to
  a third party (a POPIA consideration, not just a performance one).

## Photography and illustration

- None currently shipped. If added, record the source, the licence, and whether the licence permits
  commercial use and modification.
