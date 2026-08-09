---
version: "superdesign-alpha"
name: "Signal Black Industrial"
description: "Near-black engineering-log aesthetic on a warm off-white shell, carried by oversized rounded-grotesk display type, mono data labels, and a single hot-orange signal color rationed to CTAs, panels, and full-bleed bands."
colors:
  background: "#171614"
  surface-panel: "#100C0B"
  surface-light-shell: "#F5F1EC"
  surface-eerie: "#1C1B17"
  text-primary: "#F5F1EC"
  text-primary-on-light: "#100C0B"
  text-secondary: "#A8A29A"
  accent: "#EB4604"
  accent-hover: "#F77E0D"
  accent-muted: "#99A57D"
typography:
  display-lg:
    fontFamily: "Sora"
    fontSize: "80px"
    fontWeight: 600
    lineHeight: "1.04"
    letterSpacing: "-2.4px"
  headline-md:
    fontFamily: "Sora"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "1.18"
    letterSpacing: "-1px"
  body-md:
    fontFamily: "Azeret Mono"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "1.2"
  label-md:
    fontFamily: "Sora"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "1.18"
    letterSpacing: "-1px"
  label-mono:
    fontFamily: "Azeret Mono"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "1.2"
spacing:
  base: "8px"
  gap: "20px"
  gap-lg: "28px"
  section-padding: "152px"
rounded:
  control: "16px"
  card: "24px"
  blob-panel: "32px"
  pill: "9999px"
components:
  button-primary:
    background: "#EB4604"
    text-color: "#100C0B"
    radius: "9999px"
    height: "48px"
    padding: "0px 28px"
    hover-background: "#F77E0D"
  button-nav-cta:
    background: "#EB4604"
    text-color: "#100C0B"
    radius: "9999px"
    height: "44px"
  button-secondary-dark:
    background: "#100C0B"
    text-color: "#F5F1EC"
    radius: "9999px"
    height: "44px"
    border: "1px solid #F6F1ED"
  button-outline-pill:
    background: "transparent"
    text-color: "#100C0B"
    radius: "9999px"
    height: "40px"
    border: "1px solid #EB4604"
  card-split-inverted:
    background: "#100C0B"
    radius: "0px"
    padding: "36px"
    border: "1px solid #1C1B17"
  card-fullwidth-panel:
    background: "#100C0B"
    radius: "0px"
    padding: "152px 0px"
  card-service-tile:
    background: "transparent"
    radius: "0px"
    padding: "36px 0px"
    border: "1px solid #1C1B17"
  card-hero-stat:
    background: "#EB4604"
    text-color: "#100C0B"
    radius: "32px"
    padding: "36px"
  card-hero-dark:
    background: "#100C0B"
    text-color: "#F5F1EC"
    radius: "32px"
    padding: "36px"
---
# Signal Black Industrial
Source: https://labs.winszn.xyz/

## Overview
This is a dark-mode-default engineering-brand system built from an unusual base pairing: a warm off-white shell (`#F5F1EC`) that hosts the hero and contact bands, and a near-black ink (`#100C0B`/`#171614`) that carries every mid-page section as full-bleed dark panels. It reads as Swiss/International in its discipline — hairline rules, mono eyebrow labels, strict left-aligned headline blocks — crossed with a neobrutalist confidence in its type: oversized, tight-tracked Sora at 80px with heavy 600-weight strokes and near-zero corner radii on cards and dividers. The one accent, a hot orange (`#EB4604`), is never diffuse; it is a rationed fill reserved for CTAs, one hero panel, and two full-bleed transition bands. Nothing else on the page is colored — supporting graphics are grayscale claymation-style 3D renders and line-art illustration, kept deliberately monochrome so the orange stays singular.

## Composition
The first screen is asymmetric two-column: a left text column (eyebrow pill, three-line display headline, body paragraph, dark pill CTA, grayscale 3D illustration) against a right-side organic blob-shaped light-gray panel (`#1C1B17`-adjacent tone) that itself hosts two stacked cards — a large solid-orange stat panel above a smaller solid-black stat panel. Below the fold the page snaps to a rhythm of alternating full-bleed bands: a hot-orange tag/skills strip, then a long near-black zone containing the work showcase (image-led split cards), a four-tile services grid, a five-step vertical process list with hairline row dividers, then a return to the orange shell for the contact form and closing utility strip, ending in a near-black footer. Section padding is a generous 152px, giving each band room to breathe despite the dense hairline-rule internals. The deliberate choice is alternating full-bleed color bands (orange/black/orange) rather than a single continuous dark page with inset color cards — this maximizes the impact of the rationed orange by giving it entire viewport-height turns, at the cost of a more page-length, less continuously-scrolling feel.

## Colors
`#171614` (night) and `#100C0B` (smoky black) are the two dark surfaces — the pixel field's ~36% dark-brown-black share confirms the page spends over a third of its area in this ink, used for the services, process, and footer bands. `#F5F1EC` (~7% of pixels) is the light shell used only for the hero and contact sections — never a pure white, always warm off-white. `#EB4604` (hot orange, ~10-12% of pixels) is the single accent: it fills the primary CTA, the hero's top stat panel, the skills-strip band, and the contact-section shell — always as a solid fill, never a gradient wash across the whole viewport. `#99A57D` (moss) appears only as a small chip fill (the "chains" badge) — a deliberately muted, low-saturation counterpoint that stops the orange from feeling like the only signal color. `#A8A29A` is the secondary/muted text tone used for metadata, tag lists, and captions against dark backgrounds. Borders run hairline at `#F6F1ED` on dark surfaces and `#100C0C` on light ones. Nothing is left neutral-gray in between: the palette is binary (near-black / warm-white) with orange as the sole hot mediator.

## Typography
Sora carries every display and heading role at 600 weight with tight negative tracking (-1px to -2.4px) — this is the structural, architectural voice, used from the 80px hero line down to 32px section headlines. Outfit is the body-reading face at 16px/400, regular tracking, used for paragraph copy in both light and dark contexts (`#F5F1EC` on dark, `#100C0B` on light). Azeret Mono is the signature accent family: all-caps, letter-spaced, 11px/500 — it labels every eyebrow, nav item, tag pill, chip, and metadata line ("SERVICES", "PROCESS", numbered indices). This mono/display/body triad is rigid and repeats without exception: mono never carries a sentence, Sora never carries body copy, Outfit never carries a label.

## Layout
Max-width container is 1320px, centered, with section padding of 152px top/bottom. The mid-page work-showcase grid runs as split cards at 50/50 item widths across two rows (a two-up masonry-adjacent card grid, image-panel left, dark info-panel right, repeating). The services section is a four-tile grid at 48/48 widths across two rows — a clean 2×2 with hairline dividers and zero gap gutters (cards touch, separated only by 1px borders). The process section drops to a single-column list of five rows, each row a numbered mono index + Sora label + body sentence, divided by hairline rules — this is a list-layout, not a card grid, and it is the page's only strictly vertical, undecorated section. The footer resolves into an 8-link two-column nav plus a giant dot-matrix wordmark rendered in a scattered-glyph texture. Spacing scale runs 4/8/16/20/24/28px for internal card gaps and gutters; corner radii are near-zero (0px) on all content cards and panels, reserved roundness (24-32px) only for the hero's blob panel and its two stat cards, and full pill (9999px) exclusively for buttons, tag chips, and the utility strip at the page bottom.

## Components
- **Navbar**: 74px tall, sticky, transparent background, 10 total items (logo mark + 4 text links + CTA + spacing elements). Logo is a two-dot orange/moss cluster beside wordmark text. CTA sits far right: solid `#EB4604` fill, `#100C0B` text, radius 9999px, height 44px.
- **Button — primary (hero)**: the dark pill directly under the hero paragraph is the true primary — solid near-black fill (`#100C0B`), off-white text, full pill radius, sitting on the light shell for maximum contrast; this is an *observed* fill/radius pairing, not separately measured, but reads as ~9999px with ~44-48px height matching the nav CTA's proportions.
- **Button — accent CTA**: the measured `#EB4604`/`#100C0B` pill (radius 9999px, height 48px, padding 0 28px, hover→`#F77E0D`) appears at page's end inside the contact form ("send enquiry" role) and doubles as the navbar CTA at 44px — this is a nav/form utility variant, not the hero's primary.
- **Button — outline pill**: thin `#EB4604`-bordered, transparent-fill pill used for the top-of-hero availability tag, with a small circular arrow-icon terminus.
- **Hero stat panel (×2, stacked)**: top card solid `#EB4604` fill, `#100C0B` text, radius ~32px, padding ~36px; contains a moss-chip label, a two-line Sora headline, and a thin sparkline/line-chart graphic with plotted dots. Bottom card solid `#100C0B` fill, `#F5F1EC` text, same radius/padding; contains a two-line headline, a mono metadata row (names separated by dots), and a dark pill sub-CTA.
- **Tag/skill chip strip**: full-bleed `#EB4604` band; dozens of pill-shaped outline chips (transparent fill, dark hairline border) arranged in a wrapping cluster/rail, each holding one mono all-caps label.
- **Work showcase card (×4 measured, ×3 fullwidth variant)**: `#100C0B` fill, 0px radius, 36px padding; anatomy top-to-bottom is a screenshot/media block (roughly half the card height) with an inverted-color info panel beside or below it holding a Sora headline, a short body sentence, and a small pill CTA; rows run 50/50 paired, alternating with full-width 100%-span panels that repeat the same media+text anatomy at 152px vertical padding for emphasis.
- **Services tile (×4)**: transparent fill on the dark section background, 0px radius, 36px padding, hairline borders; each tile stacks a small grayscale 3D icon render, a Sora heading paired with a mono duration label at top-right, a body sentence, a hairline rule, then a 2-3 line checklist of mono all-caps items each prefixed with a short dash.
- **Process row (×5)**: transparent fill, 0px radius, 36px 0px padding, full-width single-column rows divided by hairline borders; each row holds a mono two-digit index at far left, a large Sora step label, and a right-aligned body sentence — no card chrome, pure list-layout.
- **Contact form panel**: `#1C1B17`-toned dark card, radius ~24px, containing labeled input fields (name/email/company/budget in a 2×2 grid) plus a full-width textarea and a full-width accent-orange submit pill.
- **Contact info list**: transparent rows on the orange shell, hairline-divided, each pairing a mono label (email/github/x/journal/availability) with a right-aligned underlined value.
- **Utility strip (bottom of contact section)**: three-cell horizontal rail, transparent fill inside an orange pill-bordered container, each cell a short mono statement separated by vertical hairlines.
- **Footer**: `#100C0B` background, 8 links across two mono-labeled columns ("sections"/"elsewhere"), plus a giant dot-matrix/ASCII-texture wordmark rendered in scattered glyph characters as the closing visual signature.

## Graphics & Effects
Illustration style throughout is grayscale clay-render 3D objects (payment terminal, cursor blob, pill capsules, earbud case) line-art robotic hand — all rendered in white/gray with the sole exception of orange accent details (a button, a dot) picked out on each object, reinforcing the single-accent rule. The one measured gradient, `linear-gradient(to top, rgb(16, 12, 11) 0%, oklab(0.159102 0.00599828 0.00409382 / 0.75) 50%, oklab(0.159102 0.00599828 0.00409382 / 0.25) 100%)`, is a scrim applied over media/screenshot blocks inside the work-showcase cards only — it darkens the bottom of each embedded product screenshot for text legibility, not a page background. Card elevation uses a single soft shadow, `rgba(16, 12, 11, 0.8) 0px 24px 60px -20px`, applied to floated panels (the contact form card, hero stat cards) to lift them off the surrounding flat band. A `blur(24px)` backdrop-filter is available for glass-style overlays though the dominant surfaces stay flat-opaque rather than glassmorphic. The footer wordmark is built from a dot-matrix/ASCII noise texture — a scattered monospace-character fill simulating grain within the letterforms, the page's only textured surface.

## Motion
Interactive color changes (text, background, border, fill) transition at `0.15s cubic-bezier(0.4, 0, 0.2, 1)` — a fast, snappy hover response for buttons and links. Larger reveal transitions use `opacity, translate 0.5s cubic-bezier(0.16, 1, 0.3, 1)` and a matching `clip-path 0.5s cubic-bezier(0.16, 1, 0.3, 1)`, suggesting panels and cards clip-reveal into place as they enter. A slower `opacity, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)` governs scroll-triggered section entrances — headline blocks and card grids likely fade/rise in as they cross the viewport, at a deliberate, unhurried pace consistent with the page's confident, unrushed editorial rhythm.

## Guardrails
- Never spread the orange as a full-viewport gradient wash — it is a solid rationed fill confined to CTAs, one hero panel, and named full-bleed bands only.
- Never round the work-showcase, services, or process cards — their signature is 0px sharp corners; reserve rounding for buttons, chips, and the hero's blob/stat panels only.
- Never substitute the nav/form orange pill's values for the hero's primary button — the hero primary is a dark near-black pill on the light shell, not the orange CTA.
- Never mix body copy into Sora or labels into Outfit — the mono/display/body role split is absolute.
- Never fill the mid-page dark bands with anything but flat `#100C0B`/`#171614` — no gradients or noise there; texture is reserved for the footer wordmark only.