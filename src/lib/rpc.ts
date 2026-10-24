import { Interface, JsonRpcProvider, getAddress } from "ethers";
import { BOT_CHAIN, chainFor } from "@/lib/network";
import { analyzeRuntimeBytecode } from "@/lib/analysis";

const providers = new Map<number, JsonRpcProvider>();

async function within<T>(promise: Promise<T>, milliseconds: number, message: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), milliseconds);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function getBotChainProvider(chainId = 677) {
  const chain = chainFor(chainId);
  if (!providers.has(chainId)) providers.set(chainId, new JsonRpcProvider(chain.rpcUrl, chain.chainId, {
    staticNetwork: true,
  }));
  return providers.get(chainId)!;
}

/** Network-neutral name for new integrations. The legacy BOT name remains exported. */
export const getActiveProvider = getBotChainProvider;

export async function getVerifiedBytecode(address: string, chainId = 677) {
  const active = chainFor(chainId);
  const chain = await within(
    getBotChainProvider(chainId).getNetwork(),
    8_000,
    `${active.name} RPC did not answer in time. Try the scan again.`,
  );
  if (Number(chain.chainId) !== chainId) {
    throw new Error(`RPC returned chain ${chain.chainId}; expected ${chainId}.`);
  }
  const bytecode = await within(
    getBotChainProvider(chainId).getCode(address),
    8_000,
    `${active.name} RPC did not return contract bytecode in time. Try the scan again.`,
  );
  if (bytecode === "0x") {
    throw new Error(`No deployed contract bytecode was found at this address on ${active.name}.`);
  }
  return bytecode;
}

const EIP1967_IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
const probe = new Interface([
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function asset() view returns (address)",
  "function totalAssets() view returns (uint256)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function permit(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)",
  "function flashLoan(address receiver,address token,uint256 amount,bytes data)",
  "function multicall(bytes[] data) view returns (bytes[] results)",
]);

async function canCall(address: string, data: string, chainId: number) {
  try {
    const result = await within(
      getBotChainProvider(chainId).call({ to: address, data }),
      4_000,
      "Interface probe timed out.",
    );
    return result !== "0x";
  } catch {
    return false;
  }
}

async function supportsInterface(address: string, interfaceId: string, chainId: number) {
  try {
    const data = probe.encodeFunctionData("supportsInterface", [interfaceId]);
    const result = await within(
      getBotChainProvider(chainId).call({ to: address, data }),
      4_000,
      "ERC-165 probe timed out.",
    );
    return probe.decodeFunctionResult("supportsInterface", result)[0] === true;
  } catch {
    return false;
  }
}

async function proxyImplementation(address: string, chainId: number) {
  try {
    const stored = await within(
      getBotChainProvider(chainId).getStorage(address, EIP1967_IMPLEMENTATION_SLOT),
      4_000,
      "Proxy probe timed out.",
    );
    if (/^0x0{64}$/i.test(stored)) return null;
    const candidate = getAddress(`0x${stored.slice(-40)}`);
    const code = await within(
      getBotChainProvider(chainId).getCode(candidate),
      4_000,
      "Proxy implementation bytecode probe timed out.",
    );
    return code === "0x" ? null : candidate;
  } catch {
    return null;
  }
}

export async function inspectBotChainContract(address: string, knownBytecode?: string, chainId = 677) {
  const bytecode = knownBytecode ?? (await getVerifiedBytecode(address, chainId));
  const zero = "0x0000000000000000000000000000000000000000";
  const zeroHash = `0x${"00".repeat(32)}`;
  const [erc165, erc721, erc1155, erc777, erc2981, accessControl, totalSupply, balanceOf, asset, totalAssets, ownable, pausable, permit, flashLender, multicall, implementationAddress] =
    await Promise.all([
      supportsInterface(address, "0x01ffc9a7", chainId),
      supportsInterface(address, "0x80ac58cd", chainId),
      supportsInterface(address, "0xd9b67a26", chainId),
      supportsInterface(address, "0xe58e113c", chainId),
      supportsInterface(address, "0x2a55205a", chainId),
      supportsInterface(address, "0x7965db0b", chainId),
      canCall(address, probe.encodeFunctionData("totalSupply"), chainId),
      canCall(address, probe.encodeFunctionData("balanceOf", [zero]), chainId),
      canCall(address, probe.encodeFunctionData("asset"), chainId),
      canCall(address, probe.encodeFunctionData("totalAssets"), chainId),
      canCall(address, probe.encodeFunctionData("owner"), chainId),
      canCall(address, probe.encodeFunctionData("paused"), chainId),
      canCall(address, probe.encodeFunctionData("permit", [zero, zero, 0, 0, 0, zeroHash, zeroHash]), chainId),
      canCall(address, probe.encodeFunctionData("flashLoan", [zero, zero, 0, "0x"]), chainId),
      canCall(address, probe.encodeFunctionData("multicall", [[]]), chainId),
      proxyImplementation(address, chainId),
    ]);

  const erc4626 = asset && totalAssets;
  const erc20 = !erc721 && totalSupply && balanceOf;
  return {
    bytecode,
    analysis: analyzeRuntimeBytecode(bytecode, {
      erc165,
      erc20,
      erc777,
      erc721,
      erc1155,
      erc2981,
      erc4626,
      ownable,
      accessControl,
      pausable,
      permit,
      flashLender,
      multicall,
      implementationAddress,
    }),
  };
}
