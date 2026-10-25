import { getAddress } from "ethers";

const chainId = Number(process.env.BOTCHAIN_CHAIN_ID ?? 677);
const isMainnet = chainId === 677;

export const BOT_CHAIN = {
  name: "BOT Chain Mainnet", chainId: 677,
  rpcUrl: process.env.BOTCHAIN_RPC_URL ?? "https://rpc.botchain.ai",
  explorerUrl: "https://scan.botchain.ai", nativeCurrency: "BOT",
} as const;
export const ROBINHOOD_CHAIN = {
  name: "Robinhood Chain Mainnet", chainId: 4663,
  rpcUrl: process.env.ROBINHOOD_RPC_URL ?? "https://rpc.mainnet.chain.robinhood.com",
  explorerUrl: "https://robinhoodchain.blockscout.com", nativeCurrency: "ETH",
} as const;
export const ACTIVE_CHAIN = BOT_CHAIN;
export const CHAINS = [BOT_CHAIN, ROBINHOOD_CHAIN] as const;
export const chainFor = (chainId: number) => {
  const chain = CHAINS.find((item) => item.chainId === chainId);
  if (!chain) throw new Error("Unsupported chain. Choose BOT Chain or Robinhood Chain.");
  return chain;
};

export const CONTRACTS = {
  passport: getAddress(process.env.PASSPORT_CONTRACT_ADDRESS ?? "0x219A1cd376d72Bd5EeFABA61aD48C77BbcBa1e4B"),
  mockBot: getAddress(process.env.MOCK_BOT_ADDRESS ?? "0x48590156ceC049082695469A1749fED9DeF52eE5"),
  vulnerableVault: getAddress(process.env.VULNERABLE_VAULT_ADDRESS ?? "0x756892F17A7F8d5b870ee2910DF610fEC2E1930C"),
  patchedVault: getAddress(process.env.PATCHED_VAULT_ADDRESS ?? "0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA"),
} as const;
// The same deployer and nonce sequence produced identical addresses on both chains.
export const ROBINHOOD_CONTRACTS = {
  passport: getAddress("0x219A1cd376d72Bd5EeFABA61aD48C77BbcBa1e4B"),
  mockBot: getAddress("0x48590156ceC049082695469A1749fED9DeF52eE5"),
  vulnerableVault: getAddress("0x756892F17A7F8d5b870ee2910DF610fEC2E1930C"),
  patchedVault: getAddress("0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA"),
} as const;
export const contractsFor = (chainId: number) => chainFor(chainId).chainId === 677 ? CONTRACTS : ROBINHOOD_CONTRACTS;
export const CONTRACTS_CONFIGURED = true;
export function explorerAddress(address: string, chainId = 677) { return `${chainFor(chainId).explorerUrl}/address/${address}`; }
export function explorerTransaction(hash: string, chainId = 677) { return `${chainFor(chainId).explorerUrl}/tx/${hash}`; }
