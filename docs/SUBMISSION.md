# Hackathon submission package

## Project

**Name:** Crash Lab  
**Tagline:** Break the accounting. Prove the repair.  
**Network:** BOT Chain testnet, chain ID 968  
**Track:** Developer tooling / smart-contract security

## Description

Crash Lab turns an abstract audit finding into reproducible transaction evidence. The MVP demonstrates a real ERC-4626-style donation-inflation attack, a compiled virtual-liquidity repair, the exact same replay against that repair, and a compact on-chain Passport containing the target, source hash, report hash, status, timestamp, tool version, and publisher.

The key design choice is disciplined scope: the public demo does not pretend to understand every contract and never attacks arbitrary live code. It verifies any submitted BOT Chain bytecode, but only executes the canonical scenario against the purpose-built testnet specimen.

## Builder

- Adeyinka Aderogba ([@Nifemi0](https://github.com/Nifemi0)) — product, smart contracts, frontend, and demo infrastructure

## Evidence for judges

- Canonical vulnerable vault: `0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA`
- Patched vault: `0x219A1cd376d72Bd5EeFABA61aD48C77BbcBa1e4B`
- Passport: `0x48590156ceC049082695469A1749fED9DeF52eE5`
- Passport transaction: `0x114ffdac62f9ebbab40e2f0559bb457611925aa41b16c5ce8ee85a56a40a868d`
- Before repair: victim received `0` shares
- After exact replay: victim received `500000000000000000` shares

## Three-minute demo outline

1. **0:00–0:25 — Problem:** accounting exploits are hard to communicate and static reports are difficult to reproduce.
2. **0:25–0:55 — Product:** open Crash Lab, explain the controlled scope and preloaded testnet specimen.
3. **0:55–1:35 — Attack:** run the replay and show the invariant failure plus zero-share victim result.
4. **1:35–2:05 — Repair:** show the deployed patched vault and non-zero victim shares under the exact replay.
5. **2:05–2:35 — Proof:** open the Passport transaction and explain the compact on-chain fields.
6. **2:35–3:00 — Vision:** extend the same reproducible pipeline to more invariant libraries and protocol families.

## Final submission checklist

- [ ] Production Vercel URL
- [ ] Public GitHub URL
- [x] Working MVP
- [x] BOT Chain integration
- [x] Four deployed contracts
- [x] Reproducible transaction evidence
- [x] On-chain Passport record
- [x] Architecture and security documentation
- [ ] Record and upload the three-minute walkthrough
- [ ] Submit project and team information through the official portal
