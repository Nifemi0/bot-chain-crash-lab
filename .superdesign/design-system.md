# Crash Lab Design System

Source of truth: the current live Crash Lab implementation and the approved illustrated Superdesign draft `50a7b40c-45fb-46e9-a24e-82a2fcb78b90`. The earlier industrial testnet concept is obsolete.

## Product and audience

Crash Lab helps builders, reviewers, and wallet users inspect a deployed smart contract on BOT Chain Mainnet or Robinhood Chain Mainnet. The core scan retrieves live runtime bytecode, reads standard interface and proxy signals, and provides an evidence-only surface report. An optional DeepSeek investigation explains cited read-only evidence; if the provider fails, the product labels the deterministic fallback. The isolated fork replay is limited to fixed Crash Lab ERC-4626 demo contracts. A connected wallet can anchor an exact report hash with a zero-value self-transaction; scanning itself needs no wallet. None of these features constitutes a full audit or proof of safety.

## Page architecture and visitor journey

- `/` is an introductory landing page. It should state the product purpose immediately, show a concrete scan-to-evidence example without fabricated results, explain the read-only trust boundary, introduce AI and Passport accurately, and end with a clear “Open Crash Lab” action.
- `/app` is the existing working analyzer, retaining chain selection, address entry, private scan history, report, optional AI investigation, restricted demo replay, and Passport flow.
- Keep direct links and existing functionality accessible when implementing the split. This document is design context, not authorization to change production routes before draft approval.

## Visual identity

- Original illustrated contract landscape, not a generic SaaS dashboard or copied reference artwork.
- Sky-blue field `#6DB3E8`, cream paper `#FDF9F1`, navy `#1C3F5E`, sand `#E6C28F`, darker sand `#C89F6B`, coral `#FF8BA0`, yellow `#FFD25E`, and ink `#111827`.
- Bangers display type with Plus Jakarta Sans body. Thick ink outlines, purposeful hard shadows, playful geometric forms, and cream information surfaces.
- The exact existing Crash Lab mark at `public/images/crash-lab-mark.png` is the logo. Never replace it with initials, emoji, a generic shield, or invented mark.
- Current navigation is a floating cream pill. Carry its recognizable shape into the landing page, but simplify it for visitors: What it does, How it works, Trust boundaries, Open Crash Lab.

## Landing-page content direction

- Lead with a plain-English promise such as “Understand a contract before you interact.” Follow immediately with “Live, read-only evidence across BOT Chain and Robinhood Chain.” Do not use “audit any contract,” “find every exploit,” or “safe to use.”
- Explain the actual flow: choose a supported chain and address; read runtime/interface/proxy evidence; optionally request an AI explanation; optionally anchor the exact report hash from a wallet.
- Show one honest product preview rather than fake statistics, logos, testimonials, or vulnerability verdicts. A labeled illustrative example is acceptable; real findings require real evidence.
- Make the primary call to action lead to `/app`; a secondary action may scroll to the explanation. Wallet connection belongs inside the app, not as a prerequisite to reading the landing page.
- Clearly distinguish generic read-only reports from the demo-only vault fork replay.

## Responsive and accessible behavior

- Compose for desktop and mobile; keep headings readable, cards non-overlapping, and actions at least 44px high.
- Use meaningful links, keyboard-visible focus, restrained animation, and reduced-motion support.
- Preserve the current footer’s official BOT Chain website and explorer links and the real product destinations.

## Accuracy constraints

- BOT Chain Mainnet chain ID `677`; Robinhood Chain Mainnet chain ID `4663`.
- The family coverage matrix is a set of review lenses. Tokens, NFTs, vaults, and proxies may show interface signals. Other protocol families remain unestablished without verified ABI/source evidence.
- A provider fallback is never presented as a completed AI report. An opcode or selector is a review target, not proof of a vulnerability.
- No decorative slash-number section labels. Use plain descriptive section names.
