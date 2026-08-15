import { getAddress } from "ethers";

const chainId = Number(process.env.BOTCHAIN_CHAIN_ID ?? 677);
const isMainnet = chainId === 677;

export const BOT_CHAIN = {
  name: isMainnet ? "BOT Chain Mainnet" : "BOT Chain Testnet",
  chainId,
  rpcUrl: process.env.BOTCHAIN_RPC_URL ?? (isMainnet ? "https://rpc.botchain.ai" : "https://rpc.bohr.life"),
  explorerUrl: process.env.BOTCHAIN_EXPLORER_URL ?? (isMainnet ? "https://scan.botchain.ai" : "https://scan.bohr.life"),
  nativeCurrency: "BOT",
} as const;

export const CONTRACTS = {
  passport: getAddress(
    process.env.PASSPORT_CONTRACT_ADDRESS ??
      "0x219A1cd376d72Bd5EeFABA61aD48C77BbcBa1e4B",
  ),
  mockBot: getAddress(
    process.env.MOCK_BOT_ADDRESS ?? "0x48590156ceC049082695469A1749fED9DeF52eE5",
  ),
  vulnerableVault: getAddress(
    process.env.VULNERABLE_VAULT_ADDRESS ??
      "0x756892F17A7F8d5b870ee2910DF610fEC2E1930C",
  ),
  patchedVault: getAddress(
    process.env.PATCHED_VAULT_ADDRESS ??
      "0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA",
  ),
} as const;

export function explorerAddress(address: string) {
  return `${BOT_CHAIN.explorerUrl}/address/${address}`;
}

export function explorerTransaction(hash: string) {
  return `${BOT_CHAIN.explorerUrl}/tx/${hash}`;
}
