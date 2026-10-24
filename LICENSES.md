# Third-party assets and licences

Posta ships other people's work. This file exists because one of those things was being used **without the
attribution its licence requires**: Font Awesome Free is CC BY 4.0 for its icons, and we were using it in 513
places across 59 files with no credit anywhere in the product or the repo. That is a licence breach, and it
is the kind that gets found during due diligence rather than by a compiler.

Keep this file current. If an asset is added, its licence goes here in the same commit.

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
