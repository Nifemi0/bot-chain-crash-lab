# BOT Chain Smart-Contract Crash Lab — Design System

## Product context

Working-name-neutral AI developer tool for adversarial smart-contract simulation on BOT Chain. A developer submits a BOT Chain contract address (optionally a GitHub repository), autonomous agent-wallets attack the protocol through real transactions in a controlled environment, and the product diagnoses failures, generates a Foundry reproduction, proposes a patch, then replays the exact same attack. Successful runs produce an on-chain Simulation Passport.

Primary audience: smart-contract developers, protocol teams, auditors, and BOT Chain hackathon builders.

Core message: **Break your protocol before mainnet does.**

MVP network is fixed and must be visibly locked:

- BOT Chain
- Chain ID 677
- RPC `https://rpc.botchain.ai`
- Explorer `https://scan.botchain.ai`
- Never imply arbitrary RPC or chain support in the create flow

All seeded data is visibly labeled **DEMO DATA**. Never invent certifications, adoption metrics, audit claims, or private-key inputs.

## Experience architecture

1. Landing page — asymmetric editorial hero that immediately explains controlled real-transaction attacks and same-attack replay. Primary CTA: “Start a simulation.” Secondary CTA: “Watch a protocol break.” Include a large live-lab preview, not three feature cards.
2. Create simulation — BOT Chain address, optional GitHub repository, contract type, agent count, duration, intensity, and invariant checklist. Main CTA: “Spawn simulation.” BOT Chain network lock is explicit.
3. Live simulation theatre — dominant desktop workspace with contract/money-flow schematic, agent-wallet ingress, live transaction log, metrics rail, invariants, strategies, speed, and risk state.
4. Exploit discovery — system-wide incident state led by “PROTOCOL COMPROMISED,” attacker economics, broken invariant, exact transactions, code lines, call trace, Foundry reproduction, and AI explanation.
5. Patch and replay — synchronized split timelines labeled ORIGINAL UNIVERSE and PATCHED UNIVERSE, showing identical initial state, attacker, and transaction sequence until the patched rejection point.
6. Simulation Passport — laboratory-style final report anchored on BOT Chain with report hash, chain transaction, findings, and remediation status.
7. Simulation history — editorial test ledger/table, never a repetitive equal-card grid.

## Style source and interpretation

Inspired by the extracted “Signal Black Industrial” system from `https://labs.winszn.xyz/`: borrow the disciplined asymmetric composition, warm-paper/ink contrast, large display typography, mono micro-labels, sharp content panels, hairline rules, and solid full-bleed transition bands.

Do not copy its content, brand marks, blob hero, orange/moss identity, rounded stat-card composition, footer texture, or portfolio structure. Reinterpret the source as a physical engineering crash laboratory: test-rig framing, calibration marks, impact vectors, numbered specimens, hazard strips, stateful traces, and incident documentation.

## Design principles

## Distinctiveness correction for the next design round

The rejected first draft looked like a generic dark crypto landing page. Do not preserve its composition, styling, copy, or decorative effects. Specifically discard the near-black full-page shell, orange gradient headline, glowing/scanning overlay, fake terminal window, icon-led three-column feature row, rounded dashboard panel, generic lightning mark, and invented “industrial-grade” or “first” claims.

The revision must spend its boldness in exactly one place: the **protocol impact rig**. Use the uploaded original hero artwork as a large, materially present piece of art—not a thumbnail inside a UI card. The artwork depicts a machined smart-contract vault mounted in a physical crash-test frame, struck by six signal-yellow transaction actuators, with one destructive-red fault seam. This visual is the thesis: autonomous transactions physically stressing protocol accounting until the invariant fractures.

Keep everything surrounding the impact rig quiet and precise. Type, rules, captions, and controls should behave like documentation attached to a physical specimen. No extra decorative effect competes with the rig.

Preferred hero structures for exploration:

```text
DIRECTION A — FULL-BLEED TEST FOOTAGE
┌──────────────────────────────────────────────────────────────┐
│ slim paper navigation / BOT CHAIN 677 / START A SIMULATION  │
├──────────────────────────────────────────────────────────────┤
│ giant headline on paper          │ impact rig bleeds beyond │
│ and two direct actions           │ right and bottom edges   │
│                                  │ live specimen captions   │
├──────────────────────────────────┴───────────────────────────┤
│ yellow calibrated transaction tape crossing both columns    │
└──────────────────────────────────────────────────────────────┘
```

```text
DIRECTION B — CRASH DOSSIER COVER
┌──────────────────────────────────────────────────────────────┐
│ small identity / navigation                                  │
├──────────────────────────────────────────────────────────────┤
│ oversized vertical headline │ edge-to-edge rig crop          │
│ and incident thesis         │ with paper annotations layered │
│                              │ directly on the image          │
├──────────────────────────────┴───────────────────────────────┤
│ a single continuous failure ledger, not feature cards        │
└──────────────────────────────────────────────────────────────┘
```

Structural labels must encode real test information: specimen/run ID, chain ID, initial treasury, exact agent count, exact transaction count, invariant ID, or transaction sequence. Do not add ornamental `01 / 02 / 03` labels unless they are the actual ordered attack/repair process.

### The interface is a test instrument

Every mark should explain structure or state. Lines connect money flow, labels identify test parameters, and motion shows state change. Avoid decorative particles, ornamental code, and generic terminal theater.

### Editorial outside, operational inside

Marketing and reports use generous negative space, oversized headlines, full-bleed bands, and structured lists. The simulator becomes denser and more instrument-like, but keeps the same tokens and typographic hierarchy.

### One event owns the screen

The exploit moment is the visual climax. Normal simulation states are controlled and quiet. Compromise introduces destructive red, accelerated traces, one controlled impact shake, and a locked incident overlay.

### Same attack, two outcomes

Patch replay must make identity unmistakable: same seed, block zero, agent ID, six transaction IDs, timestamps, and input capital appear on both timelines. Corresponding events align horizontally; the divergence point is a strong vertical marker.

## Color tokens

Use flat colors only. Never use gradient text, glow, glassmorphism, neon, teal/violet, or dark navy.

- `paper`: `#F2EEE6` — warm off-white page shell
- `paper-muted`: `#E5DFD3` — secondary documentation panels
- `ink`: `#12110F` — primary text and dark surfaces
- `ink-raised`: `#1C1A17` — raised simulator panels
- `ink-muted`: `#292621` — secondary dark zones
- `rule-on-paper`: `#292621` at 20–35% opacity
- `rule-on-ink`: `#F2EEE6` at 18–30% opacity
- `text-muted-on-paper`: `#6A645B`
- `text-muted-on-ink`: `#AAA297`
- `signal-yellow`: `#F2C230` — active test, selection, focus, queued path, primary accent
- `signal-yellow-hover`: `#FFD64D`
- `destructive-red`: `#D9362B` — compromise, protocol loss, failed invariant, original-universe failure only
- `destructive-red-dark`: `#8F211A`
- `verified-green`: `#5D7D4A` — remediated/pass state, used sparingly
- `neutral-blueprint`: `#8D9189` — dormant graph edges and inactive agents only

Color rationing:

- Paper and ink own most of the surface.
- Yellow identifies what is live, interactive, selected, or in motion.
- Red does not appear as decoration; it is reserved for a real failed state or destructive value.
- Green appears only after a patch is tested or a run passes.
- A full-bleed yellow band may be used once on the landing page as a transition or live status strip.

## Typography

Use exactly these families and roles:

- Display: `Barlow Condensed`, weights 600–700. Large, narrow, uppercase or sentence case. Used for hero statements, section titles, risk states, and incident headlines.
- Body/UI: `Inter Tight`, weights 400–600. Used for readable prose, inputs, buttons, tables, and operational UI.
- Technical labels/data: `IBM Plex Mono`, weights 400–600. Used only for short all-caps labels, addresses, hashes, block numbers, values, transaction IDs, and code. Never set long explanatory paragraphs in monospace.

Desktop scale:

- Hero display: 104px / 0.88 line-height / -1.5px tracking
- Incident display: 88px / 0.9 / uppercase
- Section display: 64px / 0.95
- H2: 40px / 1.0
- H3: 24px / 1.1
- Body large: 19px / 1.5
- Body: 15px / 1.5
- UI: 14px / 1.35
- Mono label: 11px / 1.2 / 0.08em uppercase tracking
- Data value: 13px / 1.3

Mobile scale compresses hero to 56px and incident display to 48px; preserve hierarchy rather than line count.

## Layout and spacing

- Desktop canvas: design at 1440px, max content width 1320px, page gutter 48px.
- Landing hero: 12-column asymmetric grid, typically 7 columns for message and 5 for a technical lab specimen or simulator cutaway.
- Section vertical padding: 112–144px for editorial bands; 24–40px inside operational screens.
- Simulator: header 64px, main graph/theatre 7–8 columns, transaction log 4–5 columns, bottom metrics/invariant rail as needed.
- Base spacing unit: 4px. Core scale: 4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96, 128.
- Hairline rules and shared baselines create structure. Prefer grouped rails, tables, logs, numbered rows, and split panels over floating cards.
- Content panels use 0–4px radius. Controls may use 2–6px. Only small status chips may use a full pill. Avoid rounded floating dashboard cards.

## Core components

### Navigation

74px tall on the landing page, warm-paper background, fine bottom rule. Left: temporary typographic mark “BOT / CRASH LAB” or neutral “SIMULATION LAB” with a small `NAME TBD` label; never permanently use GHOSTFORK or CRASHTEST. Middle: HOW IT WORKS, SIMULATOR, PASSPORT. Right: BOT CHAIN · 677 status and yellow “START A SIMULATION” button.

### Buttons

- Primary: solid signal yellow, ink text, 48px height, 4px radius, horizontal padding 24px. Optional arrow/impact marker at end.
- Secondary: transparent on paper or ink, 1px current-color border, 48px height, 4px radius.
- Destructive: red only for confirmed incident/replay actions, never as the default CTA.
- Focus: 2px signal-yellow outline with 2px offset.

### Labels and chips

Small IBM Plex Mono uppercase text, rectangular or lightly rounded (2px); use a left status square or short rule. Agent roles use line/pattern/shape identifiers as well as color so they remain distinguishable without cartoon avatars or color-only encoding.

### Risk state

A strong compact instrument with state word and calibrated scale: STABLE / STRESSED / COMPROMISED / INSOLVENT. Yellow moves through Stable/Stressed; red owns Compromised/Insolvent. Include text and an icon/marker, not color alone.

### Agent wallet marker

Geometric technical glyph, not avatar: numbered hex/diamond/chevron forms with role-specific internal line patterns. Label format `A-23 / ADVERSARIAL STRATEGIST`. Key roles: depositor, whale, MEV searcher, adversarial strategist, governance attacker.

### Transaction log

Dense vertically streaming table: block/time, agent, function, direction, BOT amount, gas, result. Use real demo values and seed label. Yellow marks the active transaction; red locks only the failure sequence. Avoid green/red on every row.

### Contract graph

React Flow/custom SVG visual language: sharp rectangular contract/function nodes, orthogonal or carefully curved connectors, small moving packets representing transactions/money, arrowheads, calibration ticks, and a highlighted attack path. Use weight and pattern to separate call flow from asset flow.

### Invariant rail

Numbered checklist with live values, expected relation, and state. The demo failure reads `INV-01 · totalAssets >= totalShares` and visibly fractures at compromise.

### Test log / history

Full-width editorial rows with specimen number, contract, date, agents, transactions, findings, status, and passport hash. Strong horizontal rules and expandable details. No equal-card grid.

## Seeded demo scenario

Use these exact values wherever the demo appears:

- Vulnerable vault
- 32 autonomous agents
- 486 total transactions
- Initial treasury: 100,000 BOT
- Attacker: Agent 23 — Adversarial strategist
- Attacker initial capital: 10 BOT
- Attacker profit: 82,400 BOT
- Example outcome sentence: “Agent 23 converted 10 BOT into 82,410 BOT through a six-transaction accounting exploit.”
- Broken invariant: `totalAssets >= totalShares`
- Root cause: share-accounting manipulation
- Patch: virtual-share offset and deposit-order correction
- Replay: exploit rejected; normal deposits and withdrawals remain functional

## Landing-page composition

Avoid a generic centered hero. Use an asymmetric first viewport:

- Left/top: small `BOT CHAIN · CHAIN 677 · DEMO ENVIRONMENT` technical line, huge 3–4 line “Break your protocol before mainnet does.” headline, concise supporting paragraph, and two CTAs.
- Right/bottom: live simulation cutaway framed as a physical test rig, showing a vulnerable vault node, agents entering, treasury meter, and a six-step attack trajectory. It should feel operational, not like a decorative app screenshot.
- Include `DEMO RUN #0042` and a compressed incident readout with 100,000 BOT → 17,590 BOT, 32 agents, 486 transactions, and `INV-01 FAIL`.
- Below the fold, use a solid signal-yellow live-status rail with short labels such as REAL TRANSACTIONS, AUTONOMOUS AGENTS, INVARIANT MONITORING, SAME-ATTACK REPLAY.
- Follow with a dark full-bleed “inside the test” section that expands the simulator theatre in split editorial/instrument layout, then a numbered process ledger for attack → diagnose → patch → replay → passport.

## Live theatre states and motion

### Startup

1. Contract architecture assembles as a technical test rig.
2. Agent-wallet glyphs load one by one with IDs and roles.
3. Invariant probes connect.
4. Block clock begins and transaction packets enter the graph.

### Impact

1. Activity accelerates.
2. Agent 23’s path becomes dominant in yellow.
3. Treasury values destabilize.
4. `INV-01` fractures and turns red.
5. One controlled 120–180ms impact shake affects the major frame, never continuous jitter.
6. “PROTOCOL COMPROMISED” locks in, with the six attacking transactions frozen and readable.

### Rewind/replay

1. Timeline rewinds and values visibly restore to the initial state.
2. Patch enters between identical state markers.
3. The same six transaction IDs replay on both sides.
4. Patched universe rejects the exploit at the exact prior failure point.
5. Green appears only after invariant verification and a normal-user regression check.

Motion uses physics-based springs for packets and rigid UI elements, 150ms ease-out for hovers, 350–550ms clip/reveal for panels, and 700–1000ms for large state transitions. Under `prefers-reduced-motion`, replace path motion, shake, and rewind with crossfades, stepped state markers, and clear textual announcements.

## Accessibility and responsive behavior

- Minimum 4.5:1 contrast for standard text; do not place small white text on yellow.
- All status changes include a label/icon, never color alone.
- Keyboard focus is highly visible and logical through graph controls, logs, and replay actions.
- Announce compromise and replay results in an ARIA live region without repeatedly announcing every transaction.
- Desktop is the canonical simulator. Tablet stacks graph over logs. Mobile becomes a condensed transaction timeline plus incident report; do not force the full node graph into a tiny viewport.
- Respect `prefers-reduced-motion` throughout.

## Explicit guardrails

- No dark navy, teal/violet gradients, glassmorphism, glow effects, gradient text, space motifs, decorative particles, or floating rounded dashboard cards.
- No centered crypto hero or three equal feature cards.
- No cartoon avatars for agents.
- No excessive monospace or generic terminal aesthetic.
- No meaningless animation; all motion represents a transaction, state transition, replay, or user action.
- Do not use “revolutionary,” “seamless,” “premium,” or “cutting-edge.”
- Do not imply support for networks other than BOT Chain in the MVP.
- Do not request wallet secrets or private keys.
- Do not permanently brand the concept as GHOSTFORK or CRASHTEST; use working-name-neutral labels.
