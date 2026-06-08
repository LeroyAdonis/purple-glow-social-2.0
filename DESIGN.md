# DESIGN.md — Purple Glow Social 2.0

> **Brand Identity & Design Token Spec**
> *For everyone on the team — designers, developers, founders, and stakeholders*

---

## What is Purple Glow Social?

**Purple Glow Social (PGS)** is a South African AI-powered social media management platform. Think of it as your AI marketing assistant that speaks all 11 official languages, understands SA culture (from Joburg to Cape Town), and helps you create, schedule, and automate social media content across Instagram, Twitter/X, Facebook, and LinkedIn.

This document defines how PGS *looks* and *feels* — our colours, fonts, spacing, components, and brand voice. It's designed to be clear for everyone, not just designers.

---

## The Big Picture — Our Design Personality

PGS lives at the intersection of three vibes:

| Influence | What It Gives Us |
|-----------|-----------------|
| **South African energy** | Warmth, colour, cultural pride. Subtle nods to the SA flag — green, gold, red, blue — used as thoughtful accents, not loud decorations |
| **Purple glow technology** | A dark, cosmic backdrop where purple light radiates. Think midnight sky with a neon-grape aurora. Premium, confident, futuristic |
| **Approachable AI** | We're powerful but friendly. Our AI helps real people run their businesses — we're not cold or intimidating |

**In one sentence:** PGS feels like a premium SA tech company — ambitious, warm, and built for Mzansi.

---

## 1. 🌈 Colour Palette

Our colour system has three layers: **Deep Space** (backgrounds), **Purple Glow** (brand core), and **Mzansi Accents** (SA flag colours used sparingly).

### Deep Space — Backgrounds & Surfaces

These are the dark canvases everything sits on. Inspired by Linear's near-black approach, but warmer — our void has a subtle purple undertone.

| Token | Hex | Used For |
|-------|-----|----------|
| `--void` | `#05040A` | Primary page background. Deep space with a hint of purple |
| `--void-elevated` | `#0A0815` | Card, panel, and sidebar backgrounds — one step lighter |
| `--void-surface` | `#120E24` | Elevated surfaces: dropdowns, modals, tooltips |
| `--void-hover` | `#1A1533` | Hover states on dark surfaces, button backgrounds |

### Purple Glow — Brand Core

Our signature purple system. Neon Grape is the hero — it glows, it pops, it's unmistakably PGS. The purple family works like a light spectrum: from deep indigo shadows to bright violet highlights.

| Token | Hex | Used For |
|-------|-----|----------|
| `--neon-grape` | `#9D4EDD` | **Primary brand colour.** CTAs, buttons, links, brand marks, glow effects |
| `--grape-light` | `#B572EB` | Hover states on primary elements, highlighted text |
| `--grape-dim` | `#7B3DB5` | Active/pressed states, secondary purple elements |
| `--grape-subtle` | `rgba(157, 78, 221, 0.15)` | Soft purple backgrounds, badges, selection highlights |
| `--grape-glow` | `rgba(157, 78, 221, 0.4)` | Glow effect — used in shadows and backdrop auras |
| `--electric-indigo` | `#5A189A` | Deep purple for dark gradients, secondary brand surfaces |
| `--hyper-crimson` | `#FF2A6D` | **Accent pop.** Used sparingly for notifications, alerts, and decorative energy — never on CTAs |

### Joburg Teal — Our Secondary Vibe

Teal is PGS's signature accent — it bridges the gap between purple warmth and digital cool. Represents the energy of Johannesburg's skyline at night.

| Token | Hex | Used For |
|-------|-----|----------|
| `--joburg-teal` | `#00E0FF` | Secondary CTAs, interactive accents, active states, link hover |
| `--teal-dim` | `#00B8D4` | Pressed/active states on teal elements |
| `--teal-subtle` | `rgba(0, 224, 255, 0.15)` | Teal-tinted backgrounds, info badges |

### Mzansi Accents — SA Flag Colours (Used Subtly)

These colours pay tribute to the South African flag. They are **never used for primary CTAs or UI chrome** — they appear in thoughtful, specific moments: status indicators, data visualisation, decorative flourishes, and cultural touchpoints.

| Token | Hex | SA Flag Meaning | Used For |
|-------|-----|-----------------|----------|
| `--mzansi-green` | `#007A4D` | The land and agriculture | Success states, completed status, growth indicators |
| `--mzansi-gold` | `#FFB612` | Natural wealth and sunshine | Warning states, premium features, achievement badges |
| `--mzansi-red` | `#DE3831` | The struggle and sacrifice | Error states, destructive actions, critical alerts |
| `--mzansi-blue` | `#002395` | The sky and oceans | Info states, help tooltips, onboarding highlights |

> **⚠️ Rule:** No more than one Mzansi accent per page section. These are spices, not main ingredients.

### Neutrals — Text & Borders

| Token | Hex | Used For |
|-------|-----|----------|
| `--text-primary` | `#F5F3FF` | Primary text (near-white with a whisper of purple warmth) |
| `--text-secondary` | `#C4B5D4` | Body text, descriptions, metadata |
| `--text-tertiary` | `#8B7DA8` | Placeholder text, disabled states, subtle labels |
| `--text-quaternary` | `#5C4F78` | The most de-emphasised text — footnotes, timestamps |
| `--border-default` | `rgba(255, 255, 255, 0.08)` | Standard borders — cards, inputs, dividers |
| `--border-subtle` | `rgba(255, 255, 255, 0.05)` | Ultra-thin borders for subtle separation |
| `--border-hover` | `rgba(157, 78, 221, 0.3)` | Hover borders on interactive elements |
| `--border-active` | `#9D4EDD` | Active/focus borders on inputs and selected elements |

### Complete Colour Reference Card

```
🟣 Neon Grape  ─── #9D4EDD  ─── Primary CTA, brand mark, links
🔮 Grape Light  ─── #B572EB  ─── Hover states
🌌 Void         ─── #05040A  ─── Page background
🌑 Void Elevated ── #0A0815  ─── Card backgrounds
🩵 Joburg Teal  ─── #00E0FF  ─── Secondary accent
💚 Mzansi Green ─── #007A4D  ─── Success states
🌟 Mzansi Gold  ─── #FFB612  ─── Premium / warnings
❤️ Mzansi Red   ─── #DE3831  ─── Errors
💙 Mzansi Blue  ─── #002395  ─── Info
💜 Electric Indigo ─ #5A189A  ─── Deep purple surfaces
🩷 Hyper Crimson ─── #FF2A6D  ─── Notifications / alerts
```

---

## 2. ✍️ Typography

Our font family is intentionally simple: one beautiful display font for headings, one clean sans-serif for everything else, and one technical mono for code.

| Role | Font | Fallback | Vibe |
|------|------|----------|------|
| **Display (Headings)** | `Syne` | `sans-serif` | Bold, geometric, joyful. Syne has a wide, confident stance — perfect for headlines and hero text |
| **Body (UI)** | `Outfit` | `sans-serif` | Clean, warm, highly readable at all sizes. The workhorse for all interface text |
| **Mono (Code)** | `Space Grotesk` | `monospace` | Technical but friendly. Used for code blocks, data displays, and technical labels |

### Heading Sizes

| Token | Font | Size | Weight | Line Height | Notes |
|-------|------|------|--------|-------------|-------|
| `--heading-hero` | Syne | 64px (4rem) | 700 | 1.0 | Landing page hero headlines — maximum impact |
| `--heading-1` | Syne | 40px (2.5rem) | 700 | 1.1 | Page titles, major section headings |
| `--heading-2` | Syne | 32px (2rem) | 600 | 1.15 | Section headings |
| `--heading-3` | Syne | 24px (1.5rem) | 600 | 1.2 | Card titles, feature names |
| `--heading-4` | Syne | 20px (1.25rem) | 600 | 1.25 | Sub-section titles, modal headers |

### Body Sizes

| Token | Font | Size | Weight | Line Height | Notes |
|-------|------|------|--------|-------------|-------|
| `--body-large` | Outfit | 18px (1.125rem) | 400 | 1.6 | Intro paragraphs, feature descriptions |
| `--body` | Outfit | 16px (1rem) | 400 | 1.5 | Standard reading text — this is the default |
| `--body-small` | Outfit | 14px (0.875rem) | 400 | 1.5 | Secondary text, captions |
| `--body-bold` | Outfit | 16px (1rem) | 600 | 1.5 | Emphasised body text, navigation |
| `--caption` | Outfit | 13px (0.8125rem) | 500 | 1.4 | Labels, timestamps, metadata |
| `--micro` | Outfit | 12px (0.75rem) | 500 | 1.3 | Tiny labels, badge text |
| `--button` | Outfit | 16px (1rem) | 600 | 1.0 | Button labels |
| `--button-small` | Outfit | 14px (0.875rem) | 600 | 1.0 | Small buttons |

### Mono Sizes

| Token | Font | Size | Weight | Notes |
|-------|------|------|--------|-------|
| `--code` | Space Grotesk | 14px | 400 | Inline code, code blocks |
| `--code-small` | Space Grotesk | 12px | 500 | Technical labels, data |

### Typography Rules of Thumb

- **Headings in Syne** are bold and confident — let them breathe with generous space above
- **Body in Outfit** is always easy to read — never go below 14px for body text
- **Never use pure white (#FFFFFF)** for text — always use `--text-primary` (#F5F3FF) which has a trace of purple warmth
- **Never use bold (700) weight** on Outfit body text — 600 (semibold) is our maximum emphasis
- **Syne headlines** can use negative letter-spacing at very large sizes (above 40px) for a tighter, more premium feel

---

## 3. 🧱 Component Styles

### Buttons

**Primary Button (Purple Glow)**
- Background: `--neon-grape` (#9D4EDD)
- Text: white (#FFFFFF)
- Border-radius: 8px
- Padding: 12px 24px
- Font: Outfit 16px, weight 600
- Hover: background shifts to `--grape-light` (#B572EB), subtle glow shadow
- Active: background shifts to `--grape-dim` (#7B3DB5)
- Use: Main CTAs ("Get Started", "Generate Post", "Upgrade")

**Secondary Button (Ghost)**
- Background: transparent
- Text: `--text-primary` (#F5F3FF)
- Border: 1px solid `--border-default` (rgba(255,255,255,0.08))
- Border-radius: 8px
- Padding: 12px 24px
- Hover: background becomes `--void-hover` (#1A1533), border becomes `--border-hover`
- Use: Secondary actions, "Learn More", "Cancel"

**Teal Accent Button**
- Background: `--joburg-teal` (#00E0FF)
- Text: `--void` (#05040A)
- Border-radius: 8px
- Padding: 10px 20px
- Font: Outfit 14px, weight 600
- Use: Special actions that need attention without being the main CTA

**Icon Button**
- Background: transparent
- Text: `--text-secondary`
- Border-radius: 8px
- Padding: 8px
- Hover: background `rgba(255,255,255,0.05)`
- Use: Toolbar actions, close buttons, settings triggers

**Danger Button**
- Background: `--mzansi-red` (#DE3831)
- Text: white
- Border-radius: 8px
- Use: Delete, destructive actions (rarely used)

### Cards & Containers

**Standard Card**
- Background: `--void-elevated` (#0A0815)
- Border: 1px solid `--border-default`
- Border-radius: 12px
- Padding: 24px
- Shadow: 0 4px 24px rgba(0, 0, 0, 0.3)
- Hover: border shifts to `--border-hover`, subtle upward transform (translateY(-2px))

**Aerogel Card** *(our signature glass card)*
- Background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)
- Backdrop-filter: blur(20px)
- Border: 1px solid rgba(255,255,255,0.08)
- Border-radius: 16px
- Shadow: 0 8px 32px rgba(0, 0, 0, 0.3)
- Use: Premium feature cards, pricing cards, hero section cards

**Modal / Dialog**
- Background: `--void-surface` (#120E24)
- Border: 1px solid `--border-default`
- Border-radius: 16px
- Overlay: `rgba(0, 0, 0, 0.7)` with backdrop-blur(8px)
- Max width: 560px (standard), 720px (large), 400px (small)
- Padding: 32px

### Inputs & Forms

**Text Input**
- Background: `rgba(255, 255, 255, 0.03)`
- Text: `--text-primary`
- Border: 1px solid `--border-default`
- Border-radius: 8px
- Padding: 12px 16px
- Font: Outfit 16px
- Focus: border becomes 1px solid `--neon-grape`, subtle purple glow ring
- Placeholder: `--text-tertiary`
- Error: border becomes 1px solid `--mzansi-red`
- Disabled: opacity 0.5

**Select / Dropdown**
- Same styling as text inputs
- Chevron icon in `--text-tertiary`
- Dropdown options: `--void-surface` background

**Text Area**
- Same as text input, but with 4-row minimum height
- Resize: vertical only

### Badges & Tags

**Purple Badge**
- Background: `--grape-subtle`
- Text: `--grape-light` (#B572EB)
- Border-radius: 6px
- Padding: 4px 10px
- Font: Outfit 12px, weight 500
- Use: Feature labels, status indicators

**Success Badge (Green)**
- Background: `rgba(0, 122, 77, 0.15)`
- Text: `--mzansi-green` (#007A4D)
- Border-radius: 6px
- Padding: 4px 10px
- Use: Active, completed, verified

**Warning Badge (Gold)**
- Background: `rgba(255, 182, 18, 0.15)`
- Text: `--mzansi-gold` (#FFB612)
- Border-radius: 6px
- Use: Pending, limited, warning states

**Error Badge (Red)**
- Background: `rgba(222, 56, 49, 0.15)`
- Text: `--mzansi-red` (#DE3831)
- Border-radius: 6px
- Use: Errors, failures, critical alerts

**Info Badge (Blue)**
- Background: `rgba(0, 35, 149, 0.15)`
- Text: `--mzansi-blue` (#002395)
- Border-radius: 6px
- Use: Tips, info, onboarding hints

### Navigation

**Top Navigation Bar**
- Background: `rgba(5, 4, 10, 0.8)` with backdrop-filter: blur(20px)
- Border-bottom: 1px solid `--border-subtle`
- Height: 64px
- Logo: left-aligned, Syne font, `--neon-grape` colour
- Links: Outfit 14px, weight 500, `--text-secondary`
- Active link: `--neon-grape` colour with subtle underline indicator
- Hover: `--text-primary`
- CTA: Primary purple button (right-aligned)

**Sidebar Navigation** *(Dashboard)*
- Background: `--void-elevated`
- Width: 260px (collapsed: 72px)
- Border-right: 1px solid `--border-subtle`
- Items: Outfit 14px, weight 500, `--text-secondary`
- Active item: `--neon-grape` with subtle left border indicator
- Icons: 20px, consistent style (Font Awesome 6)
- Section headers: Outfit 11px, uppercase, `--text-quaternary`

---

## 4. 📏 Spacing System

We use a **4px base grid**. All spacing values are multiples of 4.

| Token | Pixels | Rem | Used For |
|-------|--------|-----|----------|
| `--space-1` | 4px | 0.25rem | Micro spacing between icons and text |
| `--space-2` | 8px | 0.5rem | Tight spacing, badge padding, small gaps |
| `--space-3` | 12px | 0.75rem | Comfortable spacing, input padding |
| `--space-4` | 16px | 1rem | Standard spacing — most common |
| `--space-5` | 20px | 1.25rem | Generous spacing, card padding |
| `--space-6` | 24px | 1.5rem | Section spacing, large card padding |
| `--space-8` | 32px | 2rem | Section separation |
| `--space-10` | 40px | 2.5rem | Large section separation |
| `--space-12` | 48px | 3rem | Page section margins |
| `--space-16` | 64px | 4rem | Hero sections, major page divisions |
| `--space-20` | 80px | 5rem | Maximum section spacing |

### Layout Widths

| Token | Width | Used For |
|-------|-------|----------|
| `--content-sm` | 640px | Reading content, single-column forms |
| `--content-md` | 768px | Dashboard panels, moderate content |
| `--content-lg` | 1024px | Standard page content, feature sections |
| `--content-xl` | 1200px | Full page layouts, landing pages |
| `--content-full` | 100% | Edge-to-edge dashboard views |

### Border Radius

| Token | Value | Used For |
|-------|-------|----------|
| `--radius-sm` | 4px | Checkboxes, small indicators |
| `--radius-md` | 8px | Buttons, inputs, badges (most common) |
| `--radius-lg` | 12px | Cards, containers |
| `--radius-xl` | 16px | Modals, premium cards, aerogel cards |
| `--radius-full` | 9999px | Avatars, pill badges, progress bars |

---

## 5. 💡 Glow & Shadow System

Purple Glow's signature effect is — you guessed it — **the glow**. This is what makes PGS feel magical and premium.

### Glow Effects

**Purple Text Glow** (for headings, hero text)
```
text-shadow: 0 0 20px rgba(157, 78, 221, 0.5)
```

**Purple Box Glow** (for CTAs, featured cards)
```
box-shadow: 0 0 24px rgba(157, 78, 221, 0.3),
            0 0 60px rgba(157, 78, 221, 0.1)
```

**Subtle Glow** (for hover states)
```
box-shadow: 0 0 12px rgba(157, 78, 221, 0.2)
```

**Teal Glow** (for teal accent elements)
```
box-shadow: 0 0 20px rgba(0, 224, 255, 0.3)
```

### Shadow Elevations

| Level | Token | Shadow | Used For |
|-------|-------|--------|----------|
| 0 | `--shadow-none` | none | Flat surfaces, page background |
| 1 | `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.2)` | Subtle card lift |
| 2 | `--shadow-md` | `0 4px 16px rgba(0,0,0,0.25)` | Standard cards |
| 3 | `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.3)` | Elevated cards, dropdowns |
| 4 | `--shadow-xl` | `0 12px 48px rgba(0,0,0,0.35)` | Modals, popovers |
| 5 | `--shadow-glow` | `0 0 24px rgba(157,78,221,0.3), 0 4px 16px rgba(0,0,0,0.25)` | Premium glow elements |

---

## 6. 🌟 Tone of Voice

How PGS *talks* to its users is as important as how it looks. Our voice is:

### The PGS Personality

| Quality | What It Means |
|---------|---------------|
| **Warm and welcoming** | Like a friendly colleague who's great at their job. We say "hello" not "greetings" |
| **Confident but not arrogant** | We know AI, but we don't show off. We explain things simply |
| **Proudly South African** | We use local references naturally — "lekker", "sharp sharp", "howzit" — but never forced |
| **Helpful, not pushy** | We suggest, we don't demand. "Try generating a post" not "You MUST generate a post" |
| **Premium but approachable** | We look expensive but talk like a friend. No corporate jargon |

### Voice Guidelines

**Do say:**
- "Let's create something great for your followers"
- "Your post is scheduled for Thursday at 10 AM (SAST)"
- "Need a hand? Our AI can suggest some ideas"
- "That's lekker!" (when something goes well)

**Don't say:**
- "Utilise our state-of-the-art neural network architecture"
- "Your content generation request has been queued for processing"
- "Please authenticate your social media credentials"
- "Error: null pointer exception in middleware layer"

### Writing for Interface Labels

| Instead of This | Write This |
|-----------------|------------|
| "Content Generation Module" | "Create Post" |
| "Authentication Required" | "Sign In" |
| "Notification Preferences" | "Alert Settings" |
| "Execute" | "Run" |
| "Terminate Session" | "Sign Out" |

---

## 7. 🎨 Complete Design Token Reference

This is the master list of every design token. Use this as the source of truth.

### Colour Tokens

```
--void: #05040A
--void-elevated: #0A0815
--void-surface: #120E24
--void-hover: #1A1533

--neon-grape: #9D4EDD
--grape-light: #B572EB
--grape-dim: #7B3DB5
--grape-subtle: rgba(157, 78, 221, 0.15)
--grape-glow: rgba(157, 78, 221, 0.4)
--electric-indigo: #5A189A
--hyper-crimson: #FF2A6D

--joburg-teal: #00E0FF
--teal-dim: #00B8D4
--teal-subtle: rgba(0, 224, 255, 0.15)

--mzansi-green: #007A4D
--mzansi-gold: #FFB612
--mzansi-red: #DE3831
--mzansi-blue: #002395

--text-primary: #F5F3FF
--text-secondary: #C4B5D4
--text-tertiary: #8B7DA8
--text-quaternary: #5C4F78

--border-default: rgba(255, 255, 255, 0.08)
--border-subtle: rgba(255, 255, 255, 0.05)
--border-hover: rgba(157, 78, 221, 0.3)
--border-active: #9D4EDD
```

### Typography Tokens

```
--font-display: 'Syne', sans-serif
--font-body: 'Outfit', sans-serif
--font-mono: 'Space Grotesk', monospace

--heading-hero: 64px/1.0 Syne 700
--heading-1: 40px/1.1 Syne 700
--heading-2: 32px/1.15 Syne 600
--heading-3: 24px/1.2 Syne 600
--heading-4: 20px/1.25 Syne 600

--body-large: 18px/1.6 Outfit 400
--body: 16px/1.5 Outfit 400
--body-small: 14px/1.5 Outfit 400
--body-bold: 16px/1.5 Outfit 600
--caption: 13px/1.4 Outfit 500
--micro: 12px/1.3 Outfit 500
--button: 16px/1.0 Outfit 600
--button-small: 14px/1.0 Outfit 600

--code: 14px Space Grotesk 400
--code-small: 12px Space Grotesk 500
```

### Spacing Tokens

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
```

### Border Radius Tokens

```
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-full: 9999px
```

### Shadow Tokens

```
--shadow-sm: 0 2px 8px rgba(0,0,0,0.2)
--shadow-md: 0 4px 16px rgba(0,0,0,0.25)
--shadow-lg: 0 8px 32px rgba(0,0,0,0.3)
--shadow-xl: 0 12px 48px rgba(0,0,0,0.35)
--shadow-glow: 0 0 24px rgba(157,78,221,0.3), 0 4px 16px rgba(0,0,0,0.25)
```

### Layout Tokens

```
--content-sm: 640px
--content-md: 768px
--content-lg: 1024px
--content-xl: 1200px
--content-full: 100%

--nav-height: 64px
--sidebar-width: 260px
--sidebar-collapsed: 72px
```

---

## 8. 📱 Quick Reference — By Element

| Element | Background | Text | Border | Radius |
|---------|-----------|------|--------|--------|
| Page body | `--void` | `--text-primary` | — | — |
| Card | `--void-elevated` | `--text-primary` | `--border-default` | 12px |
| Aerogel card | Gradient + blur | `--text-primary` | `rgba(255,255,255,0.08)` | 16px |
| Primary button | `--neon-grape` | white | none | 8px |
| Ghost button | transparent | `--text-primary` | `--border-default` | 8px |
| Input | `rgba(255,255,255,0.03)` | `--text-primary` | `--border-default` | 8px |
| Modal | `--void-surface` | `--text-primary` | `--border-default` | 16px |
| Badge (purple) | `--grape-subtle` | `--grape-light` | none | 6px |
| Top nav | `rgba(5,4,10,0.8)` + blur | `--text-secondary` | `--border-subtle` | — |
| Sidebar | `--void-elevated` | `--text-secondary` | `--border-subtle` | — |

---

## 9. ✅ What Makes This Design "PGS"

You know you're looking at Purple Glow Social when:

1. **The background is deep space** — near-black with a purple tint (`#05040A`), not pure black
2. **The purple glows** — `#9D4EDD` is the star. It appears on CTAs, brand marks, and has a subtle aura
3. **Teal sparks** — `#00E0FF` appears as a bright, electric secondary accent
4. **SA flag colours whisper** — green for success, gold for premium, red for errors, blue for info — never loud
5. **Syne headlines are bold** — our display font commands attention
6. **Outfit body is clean** — easy reading at every size
7. **Glassmorphism cards** — the signature aerogel card with blur and subtle borders
8. **Generous spacing** — everything breathes. We don't crowd our UI
9. **Warm purple text** — `#F5F3FF` instead of pure white, keeping things soft on the eyes
10. **The tone is SA-warm** — friendly, helpful, proud but not pushy

---

## 10. 🙅 Do's and Don'ts

### ✅ Do
- Use `--neon-grape` for all primary CTAs
- Use `--void` (#05040A) as the main page background
- Use `--text-primary` (#F5F3FF) for headings — never pure white
- Use the aerogel card style for premium/featured content
- Use South African references naturally in copy
- Keep SA flag colours to their specific semantic roles (green=success, gold=premium, red=error, blue=info)
- Apply glow effects sparingly on hero sections and primary CTAs

### ❌ Don't
- Use pure black (#000000) for backgrounds
- Use pure white (#FFFFFF) for text
- Use SA flag colours as primary UI colours — they are accents only
- Use more than one Mzansi accent per section
- Use corporate jargon in copy ("leverage", "utilise", "synergise")
- Add decorative elements just because — every pixel has purpose
- Use bright backgrounds for cards — stay in the dark purple family
- Make buttons pill-shaped (9999px radius) — use 8px radius consistently
- Use drop shadows on dark surfaces — use glow and background elevation instead

---

## 11. 🔄 Migration Guide — From Old to New

If you're updating existing PGS pages to the new design system:

| Old Style | New Style |
|-----------|-----------|
| `#1A1F3A` (pretoria-blue) bg | `#0A0815` (--void-elevated) |
| `#0D0F1C` bg | `#05040A` (--void) |
| `#FFCC00` (mzansi-gold old) everywhere | Gold only for warnings/premium badges |
| Mixed border colours | Standardised `rgba(255,255,255,0.08)` borders |
| Various border radiuses | Standard 8px/12px/16px scale |
| Pure white text `#FFFFFF` | `#F5F3FF` (--text-primary) |
| `rgba(255,255,255,0.1)` borders | `rgba(255,255,255,0.08)` |

---

*This design system is a living document. As PGS grows, these tokens may evolve — but the soul stays the same: purple glow, South African pride, and AI that helps real people.*
