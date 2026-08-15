import { Interface, JsonRpcProvider, getAddress } from "ethers";
import { BOT_CHAIN } from "@/lib/network";
import { analyzeRuntimeBytecode } from "@/lib/analysis";

let provider: JsonRpcProvider | undefined;

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

export function getBotChainProvider() {
  provider ??= new JsonRpcProvider(BOT_CHAIN.rpcUrl, BOT_CHAIN.chainId, {
    staticNetwork: true,
  });
  return provider;
}

export async function getVerifiedBytecode(address: string) {
  const chain = await within(
    getBotChainProvider().getNetwork(),
    8_000,
    "BOT Chain RPC did not answer in time. Try the scan again.",
  );
  if (Number(chain.chainId) !== BOT_CHAIN.chainId) {
    throw new Error(`RPC returned chain ${chain.chainId}; expected ${BOT_CHAIN.chainId}.`);
  }
  const bytecode = await within(
    getBotChainProvider().getCode(address),
    8_000,
    "BOT Chain RPC did not return contract bytecode in time. Try the scan again.",
  );
  if (bytecode === "0x") {
    throw new Error(`No deployed contract bytecode was found at this address on ${BOT_CHAIN.name}.`);
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

async function canCall(address: string, data: string) {
  try {
    const result = await within(
      getBotChainProvider().call({ to: address, data }),
      4_000,
      "Interface probe timed out.",
    );
    return result !== "0x";
  } catch {
    return false;
  }
}

async function supportsInterface(address: string, interfaceId: string) {
  try {
    const data = probe.encodeFunctionData("supportsInterface", [interfaceId]);
    const result = await within(
      getBotChainProvider().call({ to: address, data }),
      4_000,
      "ERC-165 probe timed out.",
    );
    return probe.decodeFunctionResult("supportsInterface", result)[0] === true;
  } catch {
    return false;
  }
}

async function proxyImplementation(address: string) {
  try {
    const stored = await within(
      getBotChainProvider().getStorage(address, EIP1967_IMPLEMENTATION_SLOT),
      4_000,
      "Proxy probe timed out.",
    );
    if (/^0x0{64}$/i.test(stored)) return null;
    const candidate = getAddress(`0x${stored.slice(-40)}`);
    const code = await within(
      getBotChainProvider().getCode(candidate),
      4_000,
      "Proxy implementation bytecode probe timed out.",
    );
    return code === "0x" ? null : candidate;
  } catch {
    return null;
  }
}

export async function inspectBotChainContract(address: string, knownBytecode?: string) {
  const bytecode = knownBytecode ?? (await getVerifiedBytecode(address));
  const zero = "0x0000000000000000000000000000000000000000";
  const zeroHash = `0x${"00".repeat(32)}`;
  const [erc165, erc721, erc1155, erc777, erc2981, accessControl, totalSupply, balanceOf, asset, totalAssets, ownable, pausable, permit, flashLender, multicall, implementationAddress] =
    await Promise.all([
      supportsInterface(address, "0x01ffc9a7"),
      supportsInterface(address, "0x80ac58cd"),
      supportsInterface(address, "0xd9b67a26"),
      supportsInterface(address, "0xe58e113c"),
      supportsInterface(address, "0x2a55205a"),
      supportsInterface(address, "0x7965db0b"),
      canCall(address, probe.encodeFunctionData("totalSupply")),
      canCall(address, probe.encodeFunctionData("balanceOf", [zero])),
      canCall(address, probe.encodeFunctionData("asset")),
      canCall(address, probe.encodeFunctionData("totalAssets")),
      canCall(address, probe.encodeFunctionData("owner")),
      canCall(address, probe.encodeFunctionData("paused")),
      canCall(address, probe.encodeFunctionData("permit", [zero, zero, 0, 0, 0, zeroHash, zeroHash])),
      canCall(address, probe.encodeFunctionData("flashLoan", [zero, zero, 0, "0x"])),
      canCall(address, probe.encodeFunctionData("multicall", [[]])),
      proxyImplementation(address),
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
