# BOT Chain Crash Lab Design System

Source of truth: approved Superdesign draft `b5eb1190-fe7a-46a5-9aa0-977c402fd002`, “BOT Chain Crash Lab — Test Footage Concept”, version 14.

## Product context

Crash Lab is a live, read-only BOT Chain testnet contract analyzer. It retrieves deployed runtime bytecode, probes standard interfaces, checks proxy storage, and surfaces opcode-level review targets. It never submits transactions or presents simulated exploits as findings.

## Visual direction

- Industrial editorial laboratory, not a generic SaaS dashboard.
- Warm paper background with dense black technical sections and signal-yellow controls.
- Oversized condensed uppercase display typography paired with compact monospaced labels.
- Physical test-rig artwork enters from the right edge of the hero and may sit behind copy with a controlled blend mask.
- Use full-width rails, continuous ledgers, calibration labels, square dossier surfaces, and restrained borders. Avoid soft card grids, gradients, glassmorphism, or decorative rounded rectangles.

## Tokens

- Paper: `#F2EEE6`; elevated paper: `#E5DFD3`; input paper: `#F7F3EA`.
- Ink: `#12110F`; secondary ink: `#6A645B`; dark-section muted text: `#AAA297`.
- Signal yellow: `#F2C230`; yellow hover: `#FFD64D`.
- Failure red: `#D9362B`; verified green: `#8FB56F`.
- Display: Barlow Condensed 600/700; body: Inter Tight 400/500/600; technical: IBM Plex Mono 400/600.
- Desktop content maximum: 1440px, 12-column composition, 32–48px gutters.
- CTAs are pill-shaped with one-pixel ink borders. Inputs, dossier panels, ledger rows, and evidence surfaces remain square.

## Page composition

1. Fixed compact navigation layered over the hero: yellow dash, `BOT / CRASH LAB`, three monospaced section links, yellow simulation CTA, and an accessible mobile menu.
2. Hero: `BREAK YOUR / PROTOCOL BEFORE / MAINNET DOES.` with a short adversarial-sandbox explanation, two CTAs, and a right-side impact rig viewport with a specimen readout and angled yellow activity tape.
3. Full-bleed yellow capability rail: live bytecode retrieval, interface classification, proxy detection, and opcode surface checks.
4. Black methodology ledger: runtime retrieval, read-only interface probes, and evidence-only reporting.
5. Physical dossier analysis form: square elevated-paper panel with a live-RPC tab, address input, and yellow pill button. The analysis console and report expand beneath it without changing the visual language.
6. Structured footer with only functional analyzer anchors and verified external explorer, API, repository, and contract links.

## Responsive and motion

- Desktop hero is text-left/art-right; mobile uses a readable blended background with no horizontal clipping.
- Navigation compresses after scrolling and exposes a keyboard-accessible mobile drawer.
- Use 280–400ms restrained transitions, a slow technical marquee, and smooth anchors.
- Honor `prefers-reduced-motion`; preserve focus rings and 44px minimum touch targets.

## Accuracy constraints

- Always show BOT Chain testnet chain ID `968`, RPC `https://rpc.bohr.life`, and BOTScan `https://scan.bohr.life`.
- Use the repository’s real contract addresses and live RPC observations.
- Never display simulated attacks, replay results, victim-share values, fabricated transactions, or automatic vulnerability claims.
