import { Contract } from "ethers";
import {
  MAINNET_DEPLOYMENT_PATH,
  MAINNET_RUN_PATH,
  assertMainnet,
  mainnetProvider,
  readArtifact,
  readJson,
} from "./mainnet-lib.mjs";

await assertMainnet();
const [deployment, run, passportArtifact] = await Promise.all([
  readJson(MAINNET_DEPLOYMENT_PATH),
  readJson(MAINNET_RUN_PATH),
  readArtifact("SimulationPassport"),
]);
if (!deployment?.complete || !run?.passport?.simulationId) {
  throw new Error("Mainnet deployment and canonical run records are required.");
}

const provider = mainnetProvider();
const checks = {};
for (const [name, contract] of Object.entries(deployment.contracts)) {
  const code = await provider.getCode(contract.address);
  checks[name] = {
    address: contract.address,
    live: code !== "0x",
    codeBytes: Math.max(0, (code.length - 2) / 2),
  };
}
const passport = new Contract(deployment.contracts.passport.address, passportArtifact.abi, provider);
checks.passportRecord = {
  exists: await passport.exists(run.passport.simulationId),
  simulationId: run.passport.simulationId,
};
if (Object.values(checks).some((check) => check.live === false) || !checks.passportRecord.exists) {
  throw new Error(`Mainnet verification failed: ${JSON.stringify(checks)}`);
}
process.stdout.write(`${JSON.stringify(checks, null, 2)}\n`);
