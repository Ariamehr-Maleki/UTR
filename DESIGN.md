---
name: UTR
description: Persian Farabi research entrance led by the supplied institutional artwork, with readable public directories and role-specific workspaces
colors:
  blue: "#123f7b"
  medium: "#0876be"
  cyan: "#00bacb"
  ink: "#101b36"
  muted: "#455d74"
  pale: "#f3f9fb"
  line: "#d5e5ee"
  pale-cyan: "#eaf9fc"
  art-border: "#c9e7ee"
  action-border: "#9db5cc"
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
    fontFamily: "UTR Damavand, Vazirmatn, sans-serif"
    fontSize: "clamp(42px, 4.5vw, 68px)"
    fontWeight: 800
    lineHeight: 1.5
    letterSpacing: "0"
  headline:
    fontFamily: "UTR Damavand, Vazirmatn, sans-serif"
    fontSize: "clamp(32px, 3.3vw, 46px)"
    lineHeight: 1.65
    letterSpacing: "0"
  title:
    fontFamily: "UTR Damavand, Vazirmatn, sans-serif"
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

**Creative North Star: "Farabi institutional identity and research wayfinding"**

A Persian university research entrance: the white masthead carries the supplied transparent cyan emblem. The first viewport places the owner's full institutional image beside a concise explanation of UTR's Farabi scope. Role entrances and the current-week strip follow immediately. The finder sits below them as a secondary discovery tool. Upright source posters and journal covers carry the content below; private workspaces prioritize tasks.

The blue/cyan/white identity and user-supplied emblem remain binding. The older small emblem medallion and flat dark-blue club hero have been removed. Vazirmatn remains an explicit fallback for headings until a Damavand webfont license and file are available.

**Key Characteristics:**

- Persian-first RTL with isolated dates and mixed-direction content.
- Immediate public search and clear destinations.
- Upright authentic imagery, thin dividers and purposeful whitespace.
- A clear boundary between historical public records and private academic operations.

The implemented cascade is `src/app/globals.css`, `src/app/experience.css`, `src/app/workspace.css`, `src/app/refinement.css`, then `src/app/landing-refresh.css`. The user's supplied image and landing composition guide this revision. It was visually checked at 390, 768 and 1440 pixels across the public sections and authentication screen; browser route tests passed after a corrected assertion. These checks do not establish hosted authenticated-workflow acceptance.

## Colors

University blue anchors the entrance and primary actions. Medium blue marks links, active navigation and focus; cyan remains a restrained identity accent. White, pale blue, ink and muted text provide the reading hierarchy. The club section uses its specific cool surface; archive posters sit on a neutral tray. Journal rows are white with dividers, without separate colored cover trays. The footer is deep blue. Frontmatter records current values, including the final overrides of earlier CSS variables.

**The Source Color Rule.** Preserve original poster and cover colors; the institutional palette belongs to the interface around them. Error red accompanies explanatory text rather than acting as the only state signal.

## Typography

On 2026-11-09 the owner selected Damavand for headings. Heading CSS now requests locally installed Damavand through the `--heading-font` token, with Vazirmatn as the fallback. No licensed Damavand webfont file is currently present in the project or installed font directories. The [publisher's font listing](https://noonfont.com/fonts/damavand) distinguishes free desktop use from a paid website/app license; third-party free downloads do not establish permission to self-host it. The deployed experience therefore still renders the fallback until a licensed WOFF2/WOFF file and web-use terms are supplied. Body text, forms and supporting labels use self-hosted Vazirmatn. This is not yet full Damavand typography fidelity. Headings have zero letter spacing. Body text is 16px/1.9; supporting copy generally ranges from 12px to 18px.

The home display is `clamp(42px, 4.5vw, 68px)`/1.4 at weight 800; at 700px it becomes `clamp(34px, 9vw, 46px)`. Its introduction is 17px/2, then 15px/1.9 on mobile. Editorial and library titles retain `clamp(32px, 3.3vw, 46px)`/1.65. The club slogan uses `clamp(43px, 4.6vw, 64px)`/1.48. Workspace titles remain task-focused. These additional steps are intentional because the supplied artwork has different visual weight from the preceding hero.

Preserve Persian word separation across line breaks. Use `bdi` for dates and mixed-direction contact details and automatic direction for content titles where appropriate. The final mobile discovery heading intentionally retains its line break.

## Layout

The shared container is `min(1280px, calc(100% - 96px))`, changing to 24px side gutters at 950px and 18px at 600px. The sticky masthead is 88px on desktop, 82px at 950px and 76px at 600px. The hero uses a 52% artwork column on desktop and puts the full artwork above the copy at 980px and below. Search follows the week strip; its results expand in document flow.

Home proceeds through service links, a compact truthful current-week section, archive discovery, the club process, a five-cover publication strip, library feature, updates, group ribbon and FAQs. Discovery uses a 280px introduction and flexible content with a 70px gap, reduced to 220px/40px at 1150px. At 950px the introduction moves above two discovery columns; at 600px every discovery item becomes a compact image-and-text row. Discovery vertical padding is 90/60/40px at desktop/tablet/mobile. Other sections have their own observed spacing, not a universal section token. The mobile club manifest places its 55px emblem beside identity copy; the pledge spans the full grid width at 26px/1.8 with its intended line break restored.

At 950px the main navigation becomes a button-controlled two-column disclosure. On mobile the finder becomes a two-row grid: search input above, category and submit below. At 600px publications become a horizontally scrollable snap strip with 145px items; club, library, updates and footer stack.

The operational workspace keeps its role navigation visible in a desktop sidebar. At 700px and below, that navigation collapses to a labeled, keyboard-operable button so the current task and status appear in the first mobile viewport. Role switching and logout remain inside the expanded menu; this layout does not change authorization.

The archive grid has three desktop columns, two at the inherited 800px breakpoint, and one column of image-and-text rows at 600px. Its list mode uses two columns of 110px-image rows, then one column with 75px images on mobile. Journals use two columns of cover-and-text rows, then one at 600px; resources become one column at 950px. Preserve the inherited 1000px workspace and 1100/800px secondary-page rules where not overridden. Tables scroll inside their wrapper.

## Elevation & Depth

The main hierarchy comes from blue/white contrast, whitespace, pale fills and thin borders. Posters and covers stand upright. Archive posters use `0 7px 16px -9px #172c5040`, removed on mobile; journal covers and the club manifest have no shadow. Standard `.button` hover explicitly has no shadow. Some inherited native button selectors retain `0 5px 14px -8px #123f7b80`; do not describe every interactive element as shadow-free.

The hero uses the supplied institutional artwork directly rather than a decorative wing watermark. The club hero now uses a pale cyan-to-white field, dark navy text and a restrained cyan-edged identity panel. The group ribbon is static when all three groups fit on desktop and retains its automatic motion, pause and reduced-motion controls on narrower screens.

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

`public/assets/farabi-emblem.png` and `public/assets/farabi-identity.png` are the owner's supplied PNG assets. The former replaces the prior header and certificate emblem; the latter leads the landing viewport. `public/assets/official/provenance.json` records local WebP derivatives, original URLs, source pages and retrieval date (2026-11-08). Posters originate from Farabi news pages 43935 and 50799, covers from page 4231, and the library photograph from page 4230. Preserve complete posters and covers with contain fitting or natural height and keep visible institutional source links. Provenance records origin, not separate licensing certification.

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
