# Architecture

## User story

A judge connects a wallet, submits any deployed BOT Chain address, watches the live read-only analysis, asks the AI agent for complementary probes, and can anchor the exact AI report hash with a zero-value wallet transaction. The canonical controlled specimen also links to its dedicated on-chain Passport record.

```text
Browser form
  → POST /api/simulations
  → BOT Chain RPC runtime + interface + proxy + opcode checks
  → private browser-session evidence envelope
  → optional POST /api/ai/investigations
  → DeepSeek V4 Flash selects read-only tools
  → evidence-cited report persisted to the private scan
```

## Trust boundary

- The browser receives no private key or provider API key.
- User scans and AI reports are scoped to an HttpOnly browser session.
- The public product never submits transactions against user-submitted contracts.
- Wallet attestation is explicit and user-approved. It sends zero value to the connected wallet itself with a versioned report commitment in transaction data.
- The wallet transaction proves report provenance and timestamp only; it does not certify contract safety.
- AI tools are read-only RPC probes; unsupported evidence citations are discarded.
- The Passport owner key is never required by the application.
- Mainnet deployment scripts require chain `677` and an explicit confirmation flag.

## Reproducibility

Solidity artifacts include compiler and optimizer metadata. Deployment receipts and canonical Passport records live under `deployments/testnet/` and `deployments/mainnet/`. The verification scripts query the corresponding BOT Chain RPC and confirm every runtime bytecode plus the Passport record.

## Scope

Crash Lab is not a universal audit or safety certification. It reports observable runtime capabilities and review targets. The controlled donation-inflation specimen uses MockBOT and demonstrates a constrained vulnerable/patched comparison; arbitrary submitted contracts receive read-only surface analysis only.
