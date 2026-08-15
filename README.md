# Crash Lab

Crash Lab is an evidence-grounded smart-contract investigation workflow for BOT Chain. It retrieves live runtime bytecode, probes standard interfaces and proxy storage, reviews executable opcode surfaces, and asks DeepSeek V4 Flash to select complementary read-only probes and cite the evidence it used.

The analysis itself is read-only and never calls the submitted contract. After the AI report is complete, a connected wallet can optionally anchor the exact report hash in a zero-value BOT Chain Mainnet transaction. The application never presents a simulated exploit as a live result.

**Live application:** [bot-chain-crash-lab.vercel.app](https://bot-chain-crash-lab.vercel.app)
**Demo video:** [2:49 product walkthrough](https://bot-chain-crash-lab.vercel.app/demo/crash-lab-demo.mp4)

## Mainnet deployment

| Component | BOT Chain mainnet address |
| --- | --- |
| Simulation Passport | [`0x219A1cd376d72Bd5EeFABA61aD48C77BbcBa1e4B`](https://scan.botchain.ai/address/0x219A1cd376d72Bd5EeFABA61aD48C77BbcBa1e4B) |
| MockBOT | [`0x48590156ceC049082695469A1749fED9DeF52eE5`](https://scan.botchain.ai/address/0x48590156ceC049082695469A1749fED9DeF52eE5) |
| VulnerableVault | [`0x756892F17A7F8d5b870ee2910DF610fEC2E1930C`](https://scan.botchain.ai/address/0x756892F17A7F8d5b870ee2910DF610fEC2E1930C) |
| PatchedVault | [`0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA`](https://scan.botchain.ai/address/0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA) |

- Chain ID: `677`
- RPC: `https://rpc.botchain.ai`
- Explorer: `https://scan.botchain.ai`
- Mainnet Passport simulation ID: `0xdf4d1a5d0b96275e855a94539f43159541fdc127ea852f722a9f3f3c59aa0ad5`
- Mainnet Passport transaction: [`0xa42a3cf549d23098a391a843547b16539ac3fb0fd3badff972f68c2998b360cc`](https://scan.botchain.ai/tx/0xa42a3cf549d23098a391a843547b16539ac3fb0fd3badff972f68c2998b360cc)

The intentionally vulnerable specimen uses only MockBOT, not a real asset. The controlled mainnet replay reproduced `0` victim shares before repair and `500000000000000000` after repair.

The original testnet deployment and receipts remain under [`deployments/testnet`](deployments/testnet); the mainnet receipts are under [`deployments/mainnet`](deployments/mainnet).

## Run locally

Requirements: Node.js 22+ and npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The checked-in example configuration targets BOT Chain Mainnet; use separate local values when reproducing the archived testnet run.

## Wallet and AI workflow

1. Connect an injected EVM wallet and switch to BOT Chain Mainnet.
2. Analyze any deployed contract using live, read-only RPC evidence.
3. Let DeepSeek choose complementary read-only tools and produce an evidence-cited report.
4. Review the report and explicitly approve a zero-value self-transaction.
5. The transaction data contains `CRASHLAB_AI_V1`, the private analysis ID, and the AI report hash.
6. Open the BOTScan transaction as public proof that this exact report existed.

Only hashes are placed on-chain. A wallet attestation proves provenance and timestamp; it is not a security certification.

## Validate

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The Remotion source for the hosted walkthrough lives under `video/`. Regenerate it with `npm run video:render`; rendered files under `video/` are ignored, while the judge-facing export is intentionally published at `public/demo/crash-lab-demo.mp4`.

## Contract operations

Private keystores are kept under `.secrets/` and excluded from Git. Never commit or expose them.

```bash
npm run contracts:compile
npm run contracts:verify
CONFIRM_BOT_MAINNET=DEPLOY_CHAIN_677 npm run contracts:mainnet:deploy
CONFIRM_BOT_MAINNET=DEPLOY_CHAIN_677 npm run contracts:mainnet:demo
CONFIRM_BOT_MAINNET=DEPLOY_CHAIN_677 npm run contracts:mainnet:verify
```

The mainnet scripts are separate, explicitly chain-locked to `677`, require the confirmation flag, persist every receipt, refuse duplicate Passport publication, and use MockBOT for the controlled specimen.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/simulations` | Verify a submitted address and create a private live evidence envelope |
| `GET` | `/api/simulations` | List the current browser session's private scans |
| `GET` | `/api/simulations/{id}` | Reopen one private scan |
| `GET` | `/api/simulations/{id}/events` | Stream deterministic read-only analysis events over SSE |
| `GET` | `/api/simulations/{id}/finding` | Return the scoped live finding |
| `POST` | `/api/ai/investigations` | Run the rate-limited, evidence-citing DeepSeek investigation |
| `GET` | `/api/health` | Verify RPC, chain ID, and reference bytecode readiness |

## Repository map

```text
src/app/                 Next.js page and API routes
src/components/          Interactive evidence console and AI report
src/lib/                 Network, RPC, analysis, storage, session, and AI agent modules
contracts/               Solidity source and reproducible compiler artifacts
scripts/contracts/       Testnet and guarded mainnet deployment tools
deployments/              Testnet and mainnet addresses, receipts, and Passport records
tests/                    Unit and browser end-to-end tests
docs/                     Architecture, submission, security, and design notes
```

See [architecture](docs/ARCHITECTURE.md), [hackathon submission notes](docs/SUBMISSION.md), and [security policy](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).
