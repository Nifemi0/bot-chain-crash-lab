import { mkdir, readFile, writeFile } from "node:fs/promises";
import { ContractFactory, JsonRpcProvider, Wallet, formatEther, parseUnits } from "ethers";

const chainId = 4663;
const rpcUrl = "https://rpc.mainnet.chain.robinhood.com";
const explorerUrl = "https://robinhoodchain.blockscout.com";
const path = "deployments/robinhood/mainnet-contracts.json";
const provider = new JsonRpcProvider(rpcUrl);
const network = await provider.getNetwork();
if (Number(network.chainId) !== chainId) throw new Error(`Wrong chain: ${network.chainId}`);

const keystore = await readFile(".secrets/bot-testnet-wallet.json", "utf8");
const password = (await readFile(".secrets/bot-testnet-wallet-password.txt", "utf8")).trim();
const wallet = (await Wallet.fromEncryptedJson(keystore, password)).connect(provider);
if (wallet.address.toLowerCase() !== "0x9BE04a075a4f37985fAb13B6FC3a0c4aC58Be652".toLowerCase()) {
  throw new Error("Deployer address mismatch");
}
const gasPrice = (await provider.getFeeData()).gasPrice;
if (!gasPrice || gasPrice > parseUnits("1", "gwei")) throw new Error("Gas price unavailable or above 1 gwei");

let state;
try {
  state = JSON.parse(await readFile(path, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  state = { product: "Crash Lab", network: "Robinhood Chain Mainnet", chainId, rpcUrl, explorerUrl,
    deployer: wallet.address, contracts: {}, createdAt: new Date().toISOString() };
}
if (state.deployer.toLowerCase() !== wallet.address.toLowerCase() || state.chainId !== chainId) {
  throw new Error("Existing record belongs to another wallet or chain");
}
async function save() {
  await mkdir("deployments/robinhood", { recursive: true });
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`);
}
async function deploy(key, name, args = []) {
  const existing = state.contracts[key];
  if (existing) {
    if (await provider.getCode(existing.address) === "0x") throw new Error(`Missing deployed code: ${key}`);
    return existing.address;
  }
  const artifact = JSON.parse(await readFile(`contracts/artifacts/${name}.json`, "utf8"));
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const unsigned = await factory.getDeployTransaction(...args);
  const estimate = await provider.estimateGas({ ...unsigned, from: wallet.address });
  const limit = estimate * 12n / 10n;
  const balance = await provider.getBalance(wallet.address);
  if (balance < limit * gasPrice * 2n) throw new Error(`Insufficient ETH for ${key}: ${formatEther(balance)}`);
  const contract = await factory.deploy(...args, { gasLimit: limit, gasPrice });
  const tx = contract.deploymentTransaction();
  console.log(`${key} transaction: ${tx.hash}`);
  const receipt = await tx.wait(1);
  if (receipt.status !== 1) throw new Error(`Deployment failed: ${tx.hash}`);
  const address = await contract.getAddress();
  if (await provider.getCode(address) === "0x") throw new Error(`Missing deployed code: ${address}`);
  state.contracts[key] = { contract: name, address, transactionHash: tx.hash,
    blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed.toString(),
    effectiveGasPriceWei: receipt.gasPrice.toString(), explorerUrl: `${explorerUrl}/address/${address}` };
  state.updatedAt = new Date().toISOString();
  await save();
  console.log(`${key}: ${address}`);
  return address;
}
const token = await deploy("mockBot", "MockBOT");
await deploy("vulnerableVault", "VulnerableVault", [token]);
await deploy("patchedVault", "PatchedVault", [token]);
await deploy("passport", "SimulationPassport");
state.complete = true;
state.remainingBalanceEth = formatEther(await provider.getBalance(wallet.address));
await save();
console.log(`Complete. Remaining ETH: ${state.remainingBalanceEth}`);
