# Architecture

## User story

A judge opens the application, runs the preloaded canonical vault, watches the attack and exact replay stream, inspects the finding, and follows the Passport proof to BOTScan.

```text
Browser form
  → POST /api/simulations
  → BOT Chain RPC bytecode + chain verification
  → signed evidence envelope
  → GET SSE event stream
  → canonical attack/replay transaction record
  → Simulation Passport proof on BOT Chain testnet
```

## Trust boundary

- The browser receives no private key.
- The default public deployment returns the immutable canonical Passport record.
- Optional dynamic publication is disabled unless `PASSPORT_PUBLISH_ENABLED=true` and a separate server-side authorization key is supplied.
- The configured dynamic signer is a limited publisher wallet, not the Passport owner.
- The public MVP never executes transactions against user-submitted contracts.

## Reproducibility

Solidity compiler artifacts include compiler and optimizer metadata. Deployment receipts and every canonical attack/replay transaction hash live under `deployments/testnet/`. `npm run contracts:verify` confirms all four runtime bytecodes and the Passport record through the BOT Chain RPC.

## Scope

Crash Lab does not claim universal contract understanding. It proves a constrained security workflow around one intentionally vulnerable vault and one deterministic repair.
