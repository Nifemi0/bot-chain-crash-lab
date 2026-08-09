import { JsonRpcProvider } from "ethers";
import { BOT_CHAIN } from "@/lib/network";

let provider: JsonRpcProvider | undefined;

export function getBotChainProvider() {
  provider ??= new JsonRpcProvider(BOT_CHAIN.rpcUrl, BOT_CHAIN.chainId, {
    staticNetwork: true,
  });
  return provider;
}

export async function getVerifiedBytecode(address: string) {
  const chain = await getBotChainProvider().getNetwork();
  if (Number(chain.chainId) !== BOT_CHAIN.chainId) {
    throw new Error(`RPC returned chain ${chain.chainId}; expected ${BOT_CHAIN.chainId}.`);
  }
  const bytecode = await getBotChainProvider().getCode(address);
  if (bytecode === "0x") {
    throw new Error("No deployed contract bytecode was found at this address on BOT Chain testnet.");
  }
  return bytecode;
}
