---
name: UTR
description: Persian university research entrance with a working public finder and readable scholarly directories
colors:
  blue: "#123f7b"
  medium: "#0876be"
  cyan: "#00bacb"
  ink: "#101b36"
  muted: "#455d74"
  pale: "#f3f9fb"
  line: "#d5e5ee"
  white: "#ffffff"
  blue-hover: "#0b3061"
  entry-copy: "#d6e9f6"
  club-surface: "#ecf7fa"
  poster-surface: "#f3f5f7"
  footer: "#103260"
  sidebar: "#f2f6fa"
  field-border: "#8da8bd"
  error: "#a22336"
  error-surface: "#fff2f4"
typography:
  display:
    fontFamily: "Vazirmatn, sans-serif"
    fontSize: "clamp(46px, 5.1vw, 74px)"
    fontWeight: 800
    lineHeight: 1.5
    letterSpacing: "0"
  headline:
    fontFamily: "Vazirmatn, sans-serif"
    fontSize: "clamp(32px, 3.3vw, 46px)"
    lineHeight: 1.65
    letterSpacing: "0"
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
  square: "0"
  filter: "6px"
  control: "8px"
  form-field: "9px"
  surface: "12px"
  panel: "14px"
  feature: "16px"
  suggestion: "18px"
  badge: "20px"
spacing:
  compact: "8px"
  small: "12px"
  mobile-gutter: "18px"
  tablet-gutter: "24px"
  desktop-gutter: "48px"
  discovery-desktop: "90px"
  discovery-tablet: "60px"
  discovery-mobile: "40px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "10px 22px"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
    textColor: "{colors.white}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
  finder:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "10px 18px 10px 10px"
  workspace-panel:
    rounded: "{rounded.surface}"
    padding: "26px"
  badge:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.blue}"
    rounded: "{rounded.badge}"
    padding: "3px 12px"
  journal-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.square}"
    padding: "28px 0"
  topic-filter-selected:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.filter}"
    padding: "7px 14px"
---

# Design System: UTR

## Overview

**Creative North Star: "Campus wayfinding and research index"**

A Persian university research entrance: a white institutional masthead, one full-width university-blue opening, a direct title and a working public finder. The authentic wing artwork sits quietly behind the opening. White reading surfaces, upright source posters and journal covers carry the content below. The homepage helps visitors find research; directories prioritize reading, and private workspaces prioritize tasks.

The blue/cyan/white identity and authentic university emblem remain binding. The user's rejected split hero and tilted poster collage are superseded by this implementation. Vazirmatn remains explicitly temporary because the reference font is unidentified.

**Key Characteristics:**

- Persian-first RTL with isolated dates and mixed-direction content.
- Immediate public search and clear destinations.
- Upright authentic imagery, thin dividers and purposeful whitespace.
- A clear boundary between historical public records and private academic operations.

This refresh merges durable product constraints with the implemented final cascade: `src/app/globals.css`, then `src/app/experience.css`, as imported by `src/app/layout.tsx`. The UX rebuild brief supplies the direction; this document records implementation, not user approval of a generated comp. Independent finish review inspected 50 captures and requested three corrections: complete finder result access, toggle hover/focus contrast, and mobile club pledge layout. All three corrections were scored resolved in a SHIP verdict after valid recaptures; this verdict covers the fix list. All 13 public browser tests passed. The complete evidence set contains 56 unique captures. No old visual verdict certifies this replacement.

## Colors

University blue anchors the entrance and primary actions. Medium blue marks links, active navigation and focus; cyan remains a restrained identity accent. White, pale blue, ink and muted text provide the reading hierarchy. The club section uses its specific cool surface; archive posters sit on a neutral tray. Journal rows are white with dividers, without separate colored cover trays. The footer is deep blue. Frontmatter records current values, including the final overrides of earlier CSS variables.

**The Source Color Rule.** Preserve original poster and cover colors; the institutional palette belongs to the interface around them. Error red accompanies explanatory text rather than acting as the only state signal.

## Typography

All interface roles use self-hosted `Vazirmatn, sans-serif`; weights 400, 500, 700 and 800 are imported. This is a temporary substitute, not reference-font fidelity. Headings have zero letter spacing. Body text is 16px/1.9; supporting copy generally ranges from 12px to 18px.

The home display is `clamp(46px, 5.1vw, 74px)`/1.5 at weight 800, overridden to 54px at 950px and to 39px/1.6 at 600px. Its introduction is 18px/1.9, then 14px on mobile. Editorial and library titles are `clamp(32px, 3.3vw, 46px)`/1.65, then 31px on mobile. Discovery headings are 39px/1.65, 32px at 950px and 29px at 600px. Archive titles are 19px/1.8, then 15px on mobile. Journal titles are 20px, then 18px at 950px. The club slogan uses `clamp(40px, 4.5vw, 60px)` and 40px on mobile. Workspace titles are 32px, then 27px on mobile.

Preserve Persian word separation across line breaks. Use `bdi` for dates and mixed-direction contact details and automatic direction for content titles where appropriate. The final mobile discovery heading intentionally retains its line break.

## Layout

The shared container is `min(1280px, calc(100% - 96px))`, changing to 24px side gutters at 950px and 18px at 600px. The sticky masthead is at least 94px high, 82px at 950px and 76px at 600px. Scroll padding is 100px, then 80px on mobile. The finder is at most 940px wide inside the blue entrance; its results expand in document flow.

Home proceeds through service links, a compact truthful current-week section, archive discovery, the club process, a five-cover publication strip, library feature, updates, group ribbon and FAQs. Discovery uses a 280px introduction and flexible content with a 70px gap, reduced to 220px/40px at 1150px. At 950px the introduction moves above two discovery columns; at 600px every discovery item becomes a compact image-and-text row. Discovery vertical padding is 90/60/40px at desktop/tablet/mobile. Other sections have their own observed spacing, not a universal section token. The mobile club manifest places its 55px emblem beside identity copy; the pledge spans the full grid width at 26px/1.8 with its intended line break restored.

At 950px the main navigation becomes a button-controlled two-column disclosure. On mobile the finder becomes a two-row grid: search input above, category and submit below. At 600px publications become a horizontally scrollable snap strip with 145px items; club, library, updates and footer stack.

The archive grid has three desktop columns, two at the inherited 800px breakpoint, and one column of image-and-text rows at 600px. Its list mode uses two columns of 110px-image rows, then one column with 75px images on mobile. Journals use two columns of cover-and-text rows, then one at 600px; resources become one column at 950px. Preserve the inherited 1000px workspace and 1100/800px secondary-page rules where not overridden. Tables scroll inside their wrapper.

## Elevation & Depth

The main hierarchy comes from blue/white contrast, whitespace, pale fills and thin borders. Posters and covers stand upright. Archive posters use `0 7px 16px -9px #172c5040`, removed on mobile; journal covers and the club manifest have no shadow. Standard `.button` hover explicitly has no shadow. Some inherited native button selectors retain `0 5px 14px -8px #123f7b80`; do not describe every interactive element as shadow-free.

The decorative wing watermark uses screen blending and opacity 0.11, reduced to 0.08 at 950px. It is not an interactive or moving layer. The group ribbon is the existing automatic animation; preserve its pause and reduced-motion controls.

## Shapes

Standard action links/buttons use 8px corners; native form fields may retain their inherited 9px radius. Finder, result tray, discovery images and workspace panels use 12px; the library feature uses 16px. Topic filters use 6px and suggestion buttons 18px. Status badges retain 20px. Generic panels outside workspace retain their 14px token.

Academic year selectors are square, transparent tabs with a 3px selected underline, not pills. Journal and resource rows are square with bottom dividers. Mobile poster/discovery images use 8px corners. Do not restore tilted images or the obsolete oversized asymmetric poster board.

## Components

### Research finder

A white 12px search surface combines a named input, native content selector and blue submit action. Typing shows live matching public records; submitting or changing category also opens results. Persian letter variants, whitespace and Latin case are normalized. Results show a count and initially eight links; the load-more button reveals eight additional matches at a time until all are available, with an explicit empty message. Clear and Escape clear query/results; the close-results action also resets category. Suggestions populate the query. Journal/resource results open official external destinations. Home finder state is local; URL persistence belongs to archive filters.

### Navigation

The emblem and UTR wordmark lead the white sticky masthead. Five public destinations precede account access. Current routes and descendants expose `aria-current="page"`, medium-blue text and a 2px desktop underline. At 950px and below, the named disclosure exposes expanded state; Escape closes it and restores toggle focus, and choosing a destination closes it. Mobile links use pale rectangular backgrounds. The disclosure toggle keeps blue foreground on a pale hover/focus background without a shadow. The skip link remains available.

### Archive and directories

Academic years expose pressed state; 1404–1405 is the default, 1403–1404 is available, and 1405–1406 displays coming soon. Search, topic, year and grid/list preference are reflected in URL parameters and restored on navigation events. The archive resets search/topic when changing year and offers reset for empty results. The two view buttons have accessible names, pressed state and a visible result count. Journal/resource directories provide search, topic filtering and official destinations; journal contact information expands in native disclosures.

**The Academic Boundary Rule.** Historical records are readable archives, never live registration, attendance, summary submission or credit opportunities. Public discovery does not grant academic authority. Membership approval is distinct from email verification; superadmin does not inherit academic permissions, and unresolved policy disables affected actions.

### Controls and workspaces

Standard buttons retain 48px minimum height and 10px 22px padding. Finder submit and certain mobile actions use 42px; topic filters use 42px desktop and 38px mobile. Focus remains a 3px medium-blue outline with 5px offset. Disabled buttons use 0.55 opacity. Private workspaces retain pale sidebars, bordered task panels, named native forms and textual statuses. Workspace panels use 26px padding, then 20px on mobile. Authentication and real server authorization remain required; visual role switching is not permission.

### Motion

Control color/background transitions are 0.18s. No automatic hero or poster motion is introduced. The group ribbon repeats in a 36-second linear loop with pause/resume, hover/focus pause and a duplicate hidden from assistive technology. Reduced-motion preference removes ribbon animation and its duplicate, hides the toggle, leaves a static scrollable row, changes smooth scrolling to auto and reduces transition duration to 0.01ms. Archive and journal hover transforms are explicitly absent.

### Authentic media and data

`public/assets/official/provenance.json` records local WebP derivatives, original URLs, source pages and retrieval date (2026-11-08). Posters originate from Farabi news pages 43935 and 50799, covers from page 4231, and the library photograph from page 4230. Preserve complete posters and covers with contain fitting or natural height and keep visible institutional source links. Provenance records origin, not separate licensing certification.

Production content is database-managed. Isolated preview uses a versioned snapshot of real public records; empty or unpublished production results must not be filled from it. Do not invent activity, endorsement, achievements, counts or testimonials.

## Do's and Don'ts

### Do:

- Do preserve the university emblem, authentic wing artwork and blue/cyan/white identity.
- Do give public search and direct destinations clear priority.
- Do keep source images upright, readable and attributable.
- Do preserve keyboard focus, explicit state, responsive controls and reduced-motion access.
- Do verify long Persian text and mixed-direction content at 390, 768 and 1440px.
- Do keep historical archives, current activity and private academic authority distinct.

### Don't:

- Don't restore the rejected split hero, tilted poster collage or repetitive colored trays.
- Don't claim Vazirmatn matches the reference font.
- Don't use decorative cyan for primary text or action labels.
- Don't fabricate public activity or infer permissions from visual roles.
- Don't treat this documentation or screenshot checks as authenticated-flow or production-readiness approval.
