# Crash Lab

Crash Lab is a narrow, reproducible smart-contract security workflow built for BOT Chain. It demonstrates one ERC-4626 donation-inflation failure from end to end:

**Live application:** [bot-chain-crash-lab.vercel.app](https://bot-chain-crash-lab.vercel.app)

1. verify deployed runtime bytecode on BOT Chain testnet;
2. execute the first-depositor donation attack;
3. capture the zero-share victim deposit;
4. deploy a virtual-liquidity repair;
5. replay the exact scenario; and
6. publish the compact report proof to the on-chain Simulation Passport.

The public application never attacks an unrelated live contract. Addresses outside the canonical demo target receive bytecode verification only.

## Live testnet evidence

| Component | BOT Chain testnet address |
| --- | --- |
| Simulation Passport | [`0x48590156ceC049082695469A1749fED9DeF52eE5`](https://scan.bohr.life/address/0x48590156ceC049082695469A1749fED9DeF52eE5) |
| MockBOT | [`0x756892F17A7F8d5b870ee2910DF610fEC2E1930C`](https://scan.bohr.life/address/0x756892F17A7F8d5b870ee2910DF610fEC2E1930C) |
| VulnerableVault | [`0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA`](https://scan.bohr.life/address/0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA) |
| PatchedVault | [`0x219A1cd376d72Bd5EeFABA61aD48C77BbcBa1e4B`](https://scan.bohr.life/address/0x219A1cd376d72Bd5EeFABA61aD48C77BbcBa1e4B) |

Canonical Passport transaction: [`0x114ffdac…a40a868d`](https://scan.bohr.life/tx/0x114ffdac62f9ebbab40e2f0559bb457611925aa41b16c5ce8ee85a56a40a868d)

- Chain ID: `968`
- RPC: `https://rpc.bohr.life`
- Victim shares before patch: `0`
- Victim shares after exact replay: `500000000000000000`
- Canonical evidence: [`deployments/testnet/canonical-demo-run.json`](deployments/testnet/canonical-demo-run.json)

## Run locally

Requirements: Node.js 22+ and npm.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. The default form value is the deployed canonical vulnerable vault.

## Validate

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Contract operations

Private testnet keystores are kept under `.secrets/` and are excluded from Git. Never commit or expose them.

```bash
npm run contracts:compile
npm run contracts:verify
```

Deployment and demo scripts are intentionally explicit and chain-locked to BOT Chain testnet (`968`). The canonical attack script refuses to run if the vulnerable vault is no longer pristine.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/simulations` | Verify the address and create an evidence envelope |
| `GET` | `/api/simulations/{id}/events` | Stream deterministic replay events over SSE |
| `GET` | `/api/simulations/{id}/finding` | Return the scoped finding |
| `POST` | `/api/simulations/{id}/patch` | Return deployed repair evidence |
| `POST` | `/api/simulations/{id}/replay` | Return exact replay evidence |
| `POST` | `/api/simulations/{id}/passport` | Return the canonical Passport or publish in protected mode |
| `GET` | `/api/health` | Verify RPC, bytecode, and canonical-run readiness |

## Repository map

```text
src/app/                 Next.js pages and API routes
src/components/          Interactive evidence console
src/data/                Canonical on-chain evidence consumed by the app
src/lib/                 Network, contract, simulation, RPC, and Passport modules
contracts/               Solidity source and reproducible compiler artifacts
scripts/contracts/       Compile, deploy, demo, and verification tools
deployments/testnet/      Addresses, receipts, and canonical demo record
tests/                    Unit and browser end-to-end tests
docs/                     Architecture, submission, security, and design archive
```

See [architecture](docs/ARCHITECTURE.md), [hackathon submission notes](docs/SUBMISSION.md), and [security policy](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).
