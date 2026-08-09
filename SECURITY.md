# Security policy

Crash Lab is a controlled testnet demonstration, not a universal audit or safety certification.

## Safety model

- Chain-changing scripts refuse networks other than BOT Chain testnet (`968`).
- The public product never attacks arbitrary submitted contracts.
- `.secrets/`, `.env*`, and Vercel project metadata are excluded from Git.
- The Passport owner key is never required by the application.
- Dynamic publication is off by default and requires both a limited publisher wallet and a server-only authorization key.

## Reporting

Please open a private GitHub security advisory rather than a public issue when disclosing a vulnerability in the application itself.
