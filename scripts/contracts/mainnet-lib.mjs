import { mkdir, readFile, writeFile } from "node:fs/promises";
import { JsonRpcProvider, Wallet, formatEther, parseUnits } from "ethers";

export const MAINNET = {
  name: "BOT Chain Mainnet",
  chainId: 677,
  rpcUrl: process.env.BOTCHAIN_MAINNET_RPC_URL ?? "https://rpc.botchain.ai",
  explorerUrl: "https://scan.botchain.ai",
};

export const MAINNET_DEPLOYMENT_PATH = "deployments/mainnet/contracts.json";
export const MAINNET_RUN_PATH = "deployments/mainnet/canonical-run.json";
export const MAX_GAS_PRICE = parseUnits("100", "gwei");

let cachedProvider;

export function mainnetProvider() {
  cachedProvider ??= new JsonRpcProvider(MAINNET.rpcUrl, MAINNET.chainId, { staticNetwork: true });
  return cachedProvider;
}

export async function assertMainnet() {
  if (process.env.CONFIRM_BOT_MAINNET !== "DEPLOY_CHAIN_677") {
    throw new Error("Refusing mainnet operation without CONFIRM_BOT_MAINNET=DEPLOY_CHAIN_677.");
  }
  const network = await mainnetProvider().getNetwork();
  if (Number(network.chainId) !== MAINNET.chainId) {
    throw new Error(`Refusing BOT mainnet operation on chain ${network.chainId}.`);
  }
}

export async function loadMainnetWallet(prefix = "bot-testnet-wallet") {
  const [keystore, password] = await Promise.all([
    readFile(`.secrets/${prefix}.json`, "utf8"),
    readFile(`.secrets/${prefix}-password.txt`, "utf8"),
  ]);
  return (await Wallet.fromEncryptedJson(keystore, password.trim())).connect(mainnetProvider());
}

export async function readArtifact(name) {
  return JSON.parse(await readFile(`contracts/artifacts/${name}.json`, "utf8"));
}

export async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

export async function writeJson(path, value) {
  await mkdir("deployments/mainnet", { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export async function assertAffordable(wallet, estimatedGas, gasPrice, reserveWei = 0n) {
  if (gasPrice > MAX_GAS_PRICE) {
    throw new Error(`Gas price ${formatEther(gasPrice * 1_000_000_000n)} is above the 100 Gwei safety ceiling.`);
  }
  const balance = await mainnetProvider().getBalance(wallet.address);
  const required = estimatedGas * gasPrice * 12n / 10n + reserveWei;
  if (balance < required) {
    throw new Error(`Insufficient BOT: ${formatEther(balance)} available, ${formatEther(required)} required with buffer.`);
  }
}

export function addressUrl(address) {
  return `${MAINNET.explorerUrl}/address/${address}`;
}

export function transactionUrl(hash) {
  return `${MAINNET.explorerUrl}/tx/${hash}`;
}
