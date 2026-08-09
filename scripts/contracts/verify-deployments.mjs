import { Contract } from "ethers";
import { readFile } from "node:fs/promises";
import {
  MOCK_BOT_ADDRESS,
  PASSPORT_ADDRESS,
  VULNERABLE_VAULT_ADDRESS,
  assertTestnet,
  provider,
  readArtifact,
} from "./lib.mjs";

await assertTestnet();
const patched = JSON.parse(await readFile("deployments/testnet/patched-vault.json", "utf8"));
const passportArtifact = await readArtifact("SimulationPassport");
const passport = new Contract(PASSPORT_ADDRESS, passportArtifact.abi, provider());
const addresses = {
  passport: PASSPORT_ADDRESS,
  mockBot: MOCK_BOT_ADDRESS,
  vulnerableVault: VULNERABLE_VAULT_ADDRESS,
  patchedVault: patched.contractAddress,
};
const checks = {};
for (const [name, address] of Object.entries(addresses)) {
  const code = await provider().getCode(address);
  checks[name] = { address, live: code !== "0x", codeBytes: (code.length - 2) / 2 };
}
const canonical = JSON.parse(await readFile("deployments/testnet/canonical-demo-run.json", "utf8"));
checks.passportRecord = {
  exists: await passport.exists(canonical.passport.simulationId),
  simulationId: canonical.passport.simulationId,
};
if (Object.values(checks).some((check) => check.live === false) || !checks.passportRecord.exists) {
  throw new Error(`Deployment verification failed: ${JSON.stringify(checks)}`);
}
process.stdout.write(`${JSON.stringify(checks, null, 2)}\n`);
