# Security policy

Crash Lab is an evidence-grounded BOT Chain Mainnet investigation tool, not a universal audit or safety certification.

## Safety model

- Mainnet deployment scripts are locked to BOT Chain chain ID `677`, require an explicit confirmation flag, and use only the purpose-built MockBOT specimen.
- Public analysis is read-only and never calls or attacks a submitted contract.
- Wallet attestations are optional, explicit, zero-value self-transactions. They commit only a versioned analysis ID and report hash in transaction data.
- An attestation proves provenance and timestamp; it does not prove that the analyzed contract is safe.
- `.secrets/`, `.env*`, and Vercel project metadata are excluded from Git.
- The Passport owner key is never required by the application.
- Server-side dynamic Passport publication is off by default. The public wallet workflow does not expose or depend on a server signing key.

## Reporting

Please open a private GitHub security advisory rather than a public issue when disclosing a vulnerability in the application itself.
