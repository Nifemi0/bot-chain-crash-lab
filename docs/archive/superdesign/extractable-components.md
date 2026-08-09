# Extractable Components

The current prototype is single-file HTML. These inline patterns are the candidates for later production extraction.

## PrimaryNavigation
- Source: `work/test-footage-redesign.html`
- Category: layout
- Description: Responsive sticky navigation with wordmark, desktop links, mobile menu, and primary CTA.
- Extractable props: activeSection, menuOpen
- Hardcoded: brand mark, section labels, visual styling

## FailureLedger
- Source: `work/test-footage-redesign.html`
- Category: basic
- Description: Three-stage attack, impact, and replay narrative with status values.
- Extractable props: activeStage, stages, reducedMotion
- Hardcoded: stage treatment and status colors

## ContractSimulationForm
- Source: `work/test-footage-redesign.html`
- Category: basic
- Description: Contract address input with validation, loading, and results states.
- Extractable props: state, address, error, result
- Hardcoded: BOT Chain network treatment

## SiteFooter
- Source: `work/test-footage-redesign.html`
- Category: layout
- Description: Product summary and four compact navigation columns.
- Extractable props: none
- Hardcoded: labels and visual styling

