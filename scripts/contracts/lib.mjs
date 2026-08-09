import { readFile } from "node:fs/promises";
import { JsonRpcProvider, Wallet } from "ethers";

export const RPC_URL = process.env.BOTCHAIN_RPC_URL ?? "https://rpc.bohr.life";
export const CHAIN_ID = 968;
export const PASSPORT_ADDRESS = "0x48590156ceC049082695469A1749fED9DeF52eE5";
export const MOCK_BOT_ADDRESS = "0x756892F17A7F8d5b870ee2910DF610fEC2E1930C";
export const VULNERABLE_VAULT_ADDRESS = "0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA";
export const EXPLORER_URL = "https://scan.bohr.life";

export function provider() {
  return new JsonRpcProvider(RPC_URL, CHAIN_ID, { staticNetwork: true });
}

export async function readArtifact(name) {
  return JSON.parse(await readFile(`contracts/artifacts/${name}.json`, "utf8"));
}

export async function loadEncryptedWallet(prefix = "bot-testnet-wallet") {
  const [keystore, password] = await Promise.all([
    readFile(`.secrets/${prefix}.json`, "utf8"),
    readFile(`.secrets/${prefix}-password.txt`, "utf8"),
  ]);
  return (await Wallet.fromEncryptedJson(keystore, password.trim())).connect(provider());
}

export async function assertTestnet() {
  const network = await provider().getNetwork();
  if (Number(network.chainId) !== CHAIN_ID) {
    throw new Error(`Refusing BOT Chain operation on chain ${network.chainId}`);
  }
}

export function txUrl(hash) {
  return `${EXPLORER_URL}/tx/${hash}`;
}

export function addressUrl(address) {
  return `${EXPLORER_URL}/address/${address}`;
}
