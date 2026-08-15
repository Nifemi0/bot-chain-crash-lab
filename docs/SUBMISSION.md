# Hackathon submission package

## Project

**Name:** Crash Lab  
**Tagline:** Inspect the runtime. Cite the evidence.
**Network:** BOT Chain mainnet, chain ID 677
**Track:** AI Native Applications / developer tooling / smart-contract security

## Description

Crash Lab is an AI-native contract investigation workflow. It accepts any deployed BOT Chain address, retrieves runtime bytecode, probes standard interfaces and proxy storage, and reviews executable opcode surfaces. DeepSeek V4 Flash autonomously chooses complementary read-only tools, produces evidence-cited findings, and hands the exact report envelope to the connected wallet for an optional zero-value Mainnet attestation. The controlled MockBOT specimen also has a Passport demonstrating the donation-inflation failure and patched replay.

## Evidence for judges

- Live app: https://bot-chain-crash-lab.vercel.app
- Demo video: https://bot-chain-crash-lab.vercel.app/demo/crash-lab-demo.mp4
- GitHub: https://github.com/Nifemi0/bot-chain-crash-lab
- Mainnet VulnerableVault: `0x756892F17A7F8d5b870ee2910DF610fEC2E1930C`
- Mainnet PatchedVault: `0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA`
- Mainnet Passport: `0x219A1cd376d72Bd5EeFABA61aD48C77BbcBa1e4B`
- Mainnet Passport transaction: `0xa42a3cf549d23098a391a843547b16539ac3fb0fd3badff972f68c2998b360cc`
- Before repair: victim received `0` shares
- After exact replay: victim received `500000000000000000` shares

## Three-minute demo outline

1. **0:00–0:25 — Problem:** static audit findings are difficult to reproduce and verify.
2. **0:25–0:55 — Product:** open Crash Lab and explain universal read-only scope.
3. **0:55–1:25 — Live analysis:** submit the mainnet reference address and show runtime/interface/opcode evidence.
4. **1:25–2:00 — AI investigation:** run DeepSeek V4 Flash and show the tools it selected and evidence it cited.
5. **2:00–2:25 — Wallet workflow:** connect a wallet and explain the optional zero-value report-hash attestation.
6. **2:25–2:45 — Passport:** open the controlled Mainnet Passport transaction and explain the anchored hashes.
7. **2:45–3:00 — Safety and vision:** explain private history, quotas, limitations, and future invariant libraries.

## Final submission checklist

- [x] Production Vercel URL
- [x] Public GitHub URL prepared for deployed source
- [x] Working MVP
- [x] BOT Chain mainnet integration
- [x] Four deployed mainnet contracts
- [x] Wallet connection and complete wallet attestation flow
- [x] AI-controlled read-only tool selection
- [ ] Add spendable DeepSeek API credit and confirm a live report returns `reportSource: deepseek` (the provider currently returns HTTP 402; Crash Lab fails safely to its labeled evidence-only fallback)
- [x] Reproducible transaction evidence
- [x] On-chain Passport record
- [x] Architecture and security documentation
- [x] Record and host the walkthrough
- [ ] Submit project and team information through the official portal

## Form-ready AI Native answers

### Project overview (100–300 words)

Smart-contract reviewers often receive source code, dashboards, or AI summaries that are disconnected from the runtime users actually interact with. Crash Lab is an AI-native investigation workspace for BOT Chain Mainnet. A user connects an EVM wallet and submits any deployed BOT Chain contract address. Crash Lab retrieves the live runtime bytecode, fingerprints the code, probes common token, NFT, vault, ownership, access-control, permit, flash-loan, multicall, and proxy surfaces, and reviews executable opcode positions without calling the submitted contract or changing its state.

DeepSeek V4 Flash then acts as the investigation controller. It selects complementary read-only tools and must cite exact evidence identifiers for every finding. Unsupported claims are discarded, and provider failure produces an explicitly labeled deterministic fallback rather than a false clean result. After reviewing the report, the user can approve a zero-value Mainnet transaction that anchors the private analysis ID and exact AI report hash, providing public timestamped provenance without exposing the report contents.

Crash Lab is designed for BOT Chain builders, security reviewers, protocol teams, and judges who need a fast, honest first-pass view of deployed behavior. A controlled ERC-4626 donation-inflation specimen and patched replay are separately anchored through the Simulation Passport.

### BOT Chain integration

Crash Lab is locked to BOT Chain Mainnet chain ID 677. Its core workflow uses BOT Chain RPC methods for runtime bytecode, read-only calls, proxy storage and block evidence; four Solidity contracts and a canonical replay are deployed on Mainnet; the AI output can be committed through a user-signed BOT Chain wallet transaction; and every proof links directly to BOTScan. The product also handles wallet network switching and can add the BOT Chain Mainnet configuration to compatible injected wallets.

### Mainnet contract and explorer link

Simulation Passport: https://scan.botchain.ai/address/0x219A1cd376d72Bd5EeFABA61aD48C77BbcBa1e4B

Additional specimen contracts are listed in the Mainnet deployment table in the project README.

### Mainnet deployment transaction

Canonical Passport publication: https://scan.botchain.ai/tx/0xa42a3cf549d23098a391a843547b16539ac3fb0fd3badff972f68c2998b360cc

### Post-challenge roadmap

1. Add verified-source matching and compiler metadata comparison.
2. Expand protocol-specific invariant libraries beyond the controlled ERC-4626 specimen.
3. Add organization workspaces and opt-in shared reports while preserving private-by-default scan history.
4. Introduce decentralized attestation indexing and reputation for reviewers.
5. Add monitoring that detects runtime bytecode or proxy implementation changes and automatically reopens an investigation.

### How is AI used as a core capability?

DeepSeek V4 Flash acts as the investigation controller. It receives a deterministic BOT Chain baseline, chooses at least two complementary read-only tools, evaluates the returned runtime/interface/opcode evidence, and produces a structured report whose findings must cite valid evidence IDs. Unsupported claims are discarded. The resulting evidence envelope is hashed and handed to the connected wallet for an optional BOT Chain Mainnet attestation.

### What actions or workflows are driven by AI?

The agent selects the next RPC investigation tools, decides when sufficient complementary evidence has been collected, classifies review targets, constructs evidence-linked findings, and submits the final structured report. The user retains control of the on-chain step and must explicitly approve the wallet transaction that anchors the AI report hash.

### Why is this AI Native rather than a standard AI API feature?

The model is inside the core analyze-to-attest loop rather than added as a chatbot. It operates through constrained tools, its output is validated against deterministic evidence, provider failure triggers an explicitly labeled evidence-only fallback, and the exact accepted report becomes the payload committed by the wallet on BOT Chain.
