---
name: UTR
description: Persian university research portal with an institutional blue and cyan identity
colors:
  blue: "#153f7d"
  medium: "#086dc1"
  cyan: "#00b8cc"
  ink: "#080f2c"
  muted: "#4b6078"
  pale: "#edf8fc"
  line: "#d7e5ef"
  error: "#a22336"
  white: "#ffffff"
  blue-hover: "#0c3064"
  field-border: "#8da8bd"
  error-surface: "#fff2f4"
typography:
  display:
    fontFamily: "Vazirmatn, sans-serif"
    fontSize: "clamp(34px, 4vw, 57px)"
    fontWeight: 800
    lineHeight: 1.65
  headline:
    fontFamily: "Vazirmatn, sans-serif"
    fontSize: "30px"
    lineHeight: 1.7
  title:
    fontFamily: "Vazirmatn, sans-serif"
    fontSize: "21px"
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
  control: "8px"
  panel: "14px"
  badge: "20px"
spacing:
  compact: "8px"
  small: "12px"
  mobile-gutter: "16px"
  gutter: "24px"
  spacious: "32px"
  section-gap: "48px"
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
    rounded: "{rounded.control}"
    padding: "11px 14px"
  panel:
    rounded: "{rounded.panel}"
    padding: "28px"
  badge:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.blue}"
    rounded: "{rounded.badge}"
    padding: "3px 12px"
---

# Design System: UTR

## Overview

**Creative North Star: "An institutional research portal"**

An institutional research portal with a spacious typographic introduction, the supplied university emblem and a restrained turquoise wing watermark. Public pages persuade through clarity and real services; workspaces prioritize the next task. No fabricated activity.

The blue/cyan/white reference controls the identity. The supplied emblem and wing artwork remain authentic assets. Vazirmatn is a temporary, self-hosted Persian typeface; the exact reference font remains unidentified.

**Key Characteristics:**

- Persian-first RTL with isolated mixed-direction content.
- University blue actions, pale surfaces and restrained cyan decoration.
- Spacious public sections and denser task-focused workspaces.

This document merges this task's implementation draft with the actual values in src/app/globals.css. It records the implemented direction, not a newly selected visual world. No formal seed or quality-bar artifact was available. Independent review disposition was ship for the public/preview visual scope across 18 screenshots at 390, 768 and 1440 pixels; live authenticated flows and exact font fidelity are outside that disposition. CLI design context was unavailable.

## Colors

### Primary

University blue anchors actions, links, the club panel and institutional identity. Medium blue supports icons, caret color and keyboard focus. The deeper blue-hover value is the primary control hover state.

### Secondary

Cyan is a decorative accent in the wing watermark and small markers. It is not the default readable link or button-label color.

### Neutral

Ink carries headings and body text; muted supports explanatory text. White is the page and form ground, pale blue marks empty states and notices, and line separates rows and panels. Field-border provides a stronger input boundary.

### Status

Error text uses error against error-surface with explicit explanatory words. Status is never communicated through color alone.

## Typography

Vazirmatn, with sans-serif fallback, is self-hosted at weights 400, 500, 700 and 800. It remains temporary until the user identifies the reference font. The frontmatter captures the current desktop hierarchy. Hero text uses the fluid display size, section headings use headline, resource headings use title, and navigation uses label. Page headings are 38px, auth headings 28px, panel headings 22px, and badges 13px. Body line-height is generous for Persian; prose uses 2.15.

At the mobile breakpoint the hero is 34px, section headings 25px and page headings 30px. Preserve bdi or dir=ltr isolation around English content. Readable prose ranges from 65ch in empty-state descriptions to 75ch in expanded details.

## Layout

Primary direction is RTL. The main container is at most 1200px with 24px side gutters, reduced to 16px at 600px and below. Spacing often follows an 8px rhythm, with contextual values preserved in the implementation. Public sections use 72px block padding, reduced to 44px on mobile.

The current home hero uses a 1.4:1 text/emblem grid with a 48px gap. At 600px it becomes a single column with the emblem first. Service navigation changes from four to two columns. Split content, club and footer become single-column; editorial resource rows keep the content varied rather than forcing everything into cards.

At 1000px the header wraps and the workspace sidebar narrows from 230px to 180px. At 600px the sidebar becomes wrapping navigation; public navigation scrolls horizontally. Tables scroll inside their own wrapper and long text wraps. These are implemented responsive behaviors, not proof that every authenticated state has been exercised.

## Elevation & Depth

The interface has no shadow vocabulary. Pale tonal surfaces, thin borders and spacing establish depth. The home hero has a very pale blue-to-white gradient; the wing watermark uses cyan at 0.07 opacity behind the authentic emblem. The emblem uses multiply blending. No automatic decorative animation is present. Smooth scrolling yields to auto when reduced motion is requested.

## Shapes

Controls have modest corners, panels use the shared panel radius, and compact status badges are pill-like. The normative radii are in the frontmatter. The implemented panel radius is 14px, superseding the provisional draft's 12px. Borders are generally 1px; the certificate uses a 2px university-blue border.

## Components

### Buttons

Primary controls are university blue with white labels, outlined secondary controls are white with blue labels. Both use the control radius and 48px minimum height; smaller button variants adjust padding and text, retaining that height. Primary hover darkens; secondary hover retains white. Disabled buttons use 0.55 opacity and a not-allowed cursor. All keyboard-focusable controls use a 3px medium-blue outline with a 5px offset. This records the implemented focus treatment rather than the draft's proposed white offset.

### Cards / Containers

Task panels are bordered, unshadowed and padded 28px (20px mobile). Empty states use pale blue and 32px padding. The club panel is university blue with white headings and pale supporting text; its inverted action is white with blue text.

### Inputs / Fields

White fields use the stronger field border, ink text, 48px minimum height and the shared focus outline. Textareas start at 130px and resize vertically. Labels remain visible and associated; error recovery uses explanatory text. Native form semantics remain the baseline.

### Navigation

Public navigation uses 14px medium-weight blue links with underline on hover; mobile links are 12px and stay on one line in a scrolling row. Workspace links use rounded hover backgrounds and wrap on mobile. Public information architecture covers platform, club, events, opportunities, resources, about and account; workspace navigation presents the next task in its role scope. Visual role switching never grants permissions.

### Badges and document surfaces

Badges use pale blue with university-blue text and explicit status words. Table cells have horizontal separators and wrapping content. The document viewer occupies the available width with a bordered 480px minimum-height surface; upload and viewer behavior still require applicable live-flow checks.

## Do's and Don'ts

### Do:

- Do retain the supplied authentic emblem and wing artwork.
- Do give controls associated labels, visible keyboard focus and explicit status text.
- Do verify long Persian text, English email addresses and responsive layouts at 390, 768 and 1440 pixels.
- Do keep empty content honest and use real institutional information.

### Don't:

- Don't claim the temporary Vazirmatn font matches the reference.
- Don't use decorative cyan for primary text or action labels.
- Don't invent activity counts, endorsements, achievements or testimonials.
- Don't infer permissions from visual role switching.
