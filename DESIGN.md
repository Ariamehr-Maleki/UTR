---
name: UTR
description: Persian institutional research portal built around authentic posters and scholarly covers
colors:
  blue: "#123f7b"
  medium: "#0675c9"
  cyan: "#00b8cc"
  ink: "#091735"
  muted: "#50637b"
  pale: "#eff7fb"
  line: "#dce7ee"
  error: "#a22336"
  white: "#ffffff"
  blue-hover: "#0c3064"
  field-border: "#8da8bd"
  error-surface: "#fff2f4"
  hero-surface: "#f4f9fc"
  poster-board: "#dceef6"
  poster-surface: "#eef4f8"
  journal-surface: "#f5f8fb"
  cover-surface: "#eaf1f6"
  footer: "#0c274c"
  form-surface: "#fbfdff"
typography:
  display:
    fontFamily: "Vazirmatn, sans-serif"
    fontSize: "clamp(44px, 4.7vw, 68px)"
    fontWeight: 800
    lineHeight: 1.42
  headline:
    fontFamily: "Vazirmatn, sans-serif"
    fontSize: "32px"
    lineHeight: 1.6
  title:
    fontFamily: "Vazirmatn, sans-serif"
    fontSize: "19px"
    lineHeight: 1.8
  body:
    fontFamily: "Vazirmatn, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.9
  label:
    fontFamily: "Vazirmatn, sans-serif"
    fontSize: "14px"
    fontWeight: 500
rounded:
  control: "10px"
  field: "8px"
  form-field: "9px"
  panel: "14px"
  feature: "16px"
  badge: "20px"
  filter: "30px"
spacing:
  compact: "8px"
  small: "12px"
  mobile-gutter: "16px"
  tablet-gutter: "20px"
  gutter: "32px"
  section-desktop: "76px"
  section-tablet: "50px"
  section-mobile: "40px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "10px 22px"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.blue}"
    rounded: "{rounded.control}"
    padding: "10px 22px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 14px"
  panel:
    rounded: "{rounded.panel}"
    padding: "28px"
  badge:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.blue}"
    rounded: "{rounded.badge}"
    padding: "3px 12px"
  journal-card:
    backgroundColor: "{colors.journal-surface}"
    rounded: "{rounded.panel}"
  topic-filter-selected:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.filter}"
    padding: "6px 18px"
---

# Design System: UTR

## Overview

**Creative North Star: "A public programme poster display"**

An institutional research portal whose public identity comes from authentic event posters, scholarly covers and a clear Persian editorial hierarchy. White and pale blue frame real content; university blue anchors navigation and participation. Private workspaces remain denser, task-focused surfaces.

The original blue/cyan/white identity remains binding. The supplied university emblem remains prominent; the authentic wing artwork remains an available identity asset, not the redesigned homepage's main illustration. Vazirmatn is temporary: the exact reference font is unidentified. The rejected plain static group list is superseded by a controlled moving ribbon.

**Key Characteristics:**

- Persian-first RTL with isolated mixed-direction content.
- Real posters and journal covers with institutional provenance.
- White and blue editorial hierarchy with restrained depth around physical media.
- Distinct public exploration and private academic operation.

This merges the earlier implementation document with the 2026-11-08 redesign, using the final cascade in `src/app/globals.css`, public pages and shared components. The reported capture run contains 39 screenshots at 390, 768 and 1440 pixels with no detected page overflow or broken images. Independent visual review identified corrections; all were fixed and affected screens recaptured. Final disposition is SHIP for the reviewed visual scope only. These checks do not certify production readiness, live authenticated flows or exact font fidelity; the former 18-screenshot review does not approve this redesign.

## Colors

### Primary

University blue owns primary actions, selected academic years, active topics and club surfaces. Medium blue carries editorial metadata, icons and focus. The deeper hover blue remains the primary control hover state. Frontmatter records the final CSS overrides, not the earlier declarations retained above them.

### Secondary

Cyan provides restrained identity accents, including the club manifest rule. Source artwork retains its authentic colors without making them interface tokens.

### Neutral

Ink and muted text sit on white and pale blue. Hero, poster board, poster trays and journal-cover trays use differentiated cool surfaces. The dark footer uses light headings and links. Error red accompanies explanatory text on a pale error surface.

**The Source Color Rule.** Preserve original poster and cover colors; use the institutional palette for surrounding controls and layout.

## Typography

Display, body and controls use self-hosted `Vazirmatn, sans-serif`; the root layout imports weights 400, 500, 700 and 800. This temporary substitute is not a claim of reference-font fidelity.

Home display uses the frontmatter clamp, with responsive overrides of 54px at 1100px, 43px at 800px and 46px/1.4 at 600px. Editorial heads use `clamp(38px, 4vw, 56px)`/1.55. Section headings drop to 25px on mobile. Poster titles use 19px/1.8, journal titles 20px/1.7, body 16px/1.9, and small metadata 10–14px according to context. The club slogan is its semantic h1, using clamp(42px, 5vw, 64px), weight 800 and white text; institutional identity is supporting copy. Main headings have -0.025em letter spacing, balanced text; paragraphs use pretty wrapping.

Preserve Persian word separation across explicit line breaks. Isolate dates, email addresses and telephone numbers with `bdi`; journal titles use automatic direction.

## Layout

Desktop container: `min(1240px, calc(100% - 64px))`. At 800px and below it has 20px side gutters; at 600px and below, 16px. Public sections use 76px vertical padding, then 50px and 40px. Existing workspace rules also retain a 1000px breakpoint; public header wrapping begins at 1100px.

At 1440px, home pairs a right-hand invitation with three layered posters; archive and journal directories use three columns and the service rail four. At 768px, hero remains two-column, directories become two-column and navigation wraps onto its own row. At 390px, hero copy precedes the poster board, club and library narratives stack, public navigation wraps and centers, and workspace links wrap. Archive and journal grids remain two-column at this width. The home preview also retains two columns, with its third item hidden at 800px and below. This is not a universal single-column mobile card system.

The body is a minimum-viewport-height flex column with expanding main content, keeping the footer at the page end. Archive search has shrinkable label/select sizing. Archive detail pairs facts with a complete poster. Posters and covers use contain fitting or natural height. The library photograph is an exception: mobile uses cover fitting with a 270px maximum height. Tables scroll within their wrapper as needed.

## Elevation & Depth

White space, pale fills and thin lines remain primary separators. Media now uses subtle drop shadows and overlapping rotations. Board posters rise and straighten on hover/focus; archive posters and journal covers lift slightly on hover. The club manifest straightens on mobile. Task panels remain unshadowed.

Shared shadow: `0 18px 45px -24px #133d7150`. Button hover: `0 5px 14px -8px #123f7b80`. These support specific media and control states, not every content block.

## Shapes

Buttons use 10px corners; native fields 8px and form fields 9px. Panels and most media trays use 14px, feature surfaces 16px, badges 20px and topic pills 30px. The poster board has 16px corners with a 70px lower-left corner, becoming 14px/45px on mobile. Board images use 5px corners. These distinct roles supersede the earlier single-radius description.

## Components

### Buttons and fields

Primary controls are blue/white and secondary controls white/blue. Standard buttons retain 48px minimum height and 10px 22px padding. Compact exceptions are the mobile header action and topic filters (42px), and ribbon control (36px). Disabled controls use 0.55 opacity. Focus is a 3px medium-blue outline with 5px offset. Search wrappers use a separate border and 10px corners; fields retain native labels or explicit accessible names.

### Archive and editorial directories

Academic-year buttons expose pressed state. Initial archive year is 1404–1405; 1403–1404 is available and 1405–1406 explicitly shows coming soon. Archive title/presenter search normalizes Persian letter variants; topic filters narrow records. Empty results include reset. Journal/resource directories offer search, topic filters and official external destinations; journal contact details expand in native disclosure elements.

**The Academic Boundary Rule.** Historical editorial records are readable archives, never live attendance, registration, summary-submission or credit opportunities. Current events and private academic operations remain separate.

### Authentic media and provenance

`public/assets/official/provenance.json` records each local WebP derivative, original image URL, source page and retrieval date (2026-11-08). Poster sources are Farabi news pages `https://farabi.ut.ac.ir/fa/news/43935` and `https://farabi.ut.ac.ir/fa/news/50799`; journal covers come from `https://farabi.ut.ac.ir/fa/page/4231`; the library photograph comes from `https://farabi.ut.ac.ir/fa/page/4230`. Visible source links let visitors consult the institution. Provenance records origin, not separate licensing certification.

Production public content is database-managed; isolated preview uses a versioned snapshot of real public records. Empty/unpublished production results must not be repopulated from that snapshot. No invented activity belongs in these surfaces.

### Group ribbon

Three participating groups repeat in a 36-second linear loop. The duplicate copy is hidden from assistive technology. Explicit pause/resume exposes pressed state; hovering the ribbon or focusing within its section pauses motion. Reduced-motion preference removes animation and the duplicate, hides the toggle and makes the static row horizontally scrollable. Media transitions are disabled; board hover/focus transforms are removed. Do not claim every hover transform is eliminated.

### Navigation and workspaces

Header: authentic emblem, blue top rule, five public destinations and account access. Footer: institutional scope, policy and verification links. A skip link serves keyboard users. Private workspaces use pale sidebar navigation, bordered white task panels, explicit status badges and labeled native forms. Visual role switching grants no academic permission.

## Do's and Don'ts

### Do:

- Do retain the authentic emblem and wing artwork and preserve the blue/cyan/white identity.
- Do show source posters and journal covers completely with their real colors and provenance.
- Do preserve keyboard focus, named controls, explicit status text and reduced-motion access.
- Do verify long Persian text, mixed-direction content and layouts at 390, 768 and 1440 pixels.
- Do distinguish historical editorial content from current academic records and keep empty states honest.

### Don't:

- Don't claim the temporary Vazirmatn font matches the reference.
- Don't use decorative cyan for primary text or action labels.
- Don't invent activity counts, endorsements, achievements or testimonials.
- Don't infer permissions from visual role switching or historical archive membership.
- Don't treat screenshot checks or this document as production-readiness approval.
