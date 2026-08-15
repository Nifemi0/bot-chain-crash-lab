import { getAddress } from "ethers";
import type { AnalysisCheck, ContractAnalysis, ContractKind } from "@/lib/types";

type InspectionHints = {
  erc20?: boolean;
  erc165?: boolean;
  erc777?: boolean;
  erc721?: boolean;
  erc1155?: boolean;
  erc2981?: boolean;
  erc4626?: boolean;
  ownable?: boolean;
  accessControl?: boolean;
  pausable?: boolean;
  permit?: boolean;
  flashLender?: boolean;
  multicall?: boolean;
  implementationAddress?: string | null;
};

const OPCODES: Record<number, { label: string; detail: string }> = {
  0x32: {
    label: "tx.origin authorization surface",
    detail: "Runtime contains ORIGIN. Confirm authorization never relies on tx.origin.",
  },
  0xf2: {
    label: "Legacy CALLCODE surface",
    detail: "Runtime contains CALLCODE, a legacy execution primitive that warrants manual review.",
  },
  0xf4: {
    label: "Delegated execution surface",
    detail: "Runtime contains DELEGATECALL. Review upgrade authority and storage-layout assumptions.",
  },
  0xf5: {
    label: "Deterministic deployment surface",
    detail: "Runtime contains CREATE2. Review salt control and address-collision assumptions.",
  },
  0xff: {
    label: "Destruction opcode surface",
    detail: "Runtime contains SELFDESTRUCT. Its modern behavior is constrained but still deserves review.",
  },
};

function executableOpcodes(bytecode: string) {
  const runtime = Buffer.from(bytecode.slice(2), "hex");
  const metadataLength = runtime.length >= 2 ? runtime.readUInt16BE(runtime.length - 2) : 0;
  const bytes =
    metadataLength > 0 && metadataLength + 2 < runtime.length
      ? runtime.subarray(0, runtime.length - metadataLength - 2)
      : runtime;
  const found = new Set<number>();
  for (let index = 0; index < bytes.length; index += 1) {
    const opcode = bytes[index];
    found.add(opcode);
    if (opcode >= 0x60 && opcode <= 0x7f) index += opcode - 0x5f;
  }
  return found;
}

function selectorCandidates(bytecode: string) {
  const runtime = Buffer.from(bytecode.slice(2), "hex");
  const selectors = new Set<string>();
  for (let index = 0; index < runtime.length; index += 1) {
    const opcode = runtime[index];
    if (opcode === 0x63 && index + 4 < runtime.length) {
      selectors.add(`0x${runtime.subarray(index + 1, index + 5).toString("hex")}`);
    }
    if (opcode >= 0x60 && opcode <= 0x7f) index += opcode - 0x5f;
  }
  return [...selectors].slice(0, 80);
}

function classify(hints: InspectionHints): { kind: ContractKind; label: string } {
  const proxy = Boolean(hints.implementationAddress);
  if (hints.erc4626) return { kind: "erc4626-vault", label: proxy ? "ERC-4626 vault proxy" : "ERC-4626 vault" };
  if (hints.erc2981 && hints.erc721) return { kind: "erc2981-nft", label: proxy ? "ERC-2981 royalty NFT proxy" : "ERC-2981 royalty NFT" };
  if (hints.erc777) return { kind: "erc777-token", label: proxy ? "ERC-777 token proxy" : "ERC-777 token" };
  if (hints.erc721) return { kind: "erc721-nft", label: proxy ? "ERC-721 proxy" : "ERC-721 NFT" };
  if (hints.erc1155) return { kind: "erc1155-token", label: proxy ? "ERC-1155 proxy" : "ERC-1155 token" };
  if (hints.erc20) return { kind: "erc20-token", label: proxy ? "ERC-20 proxy" : "ERC-20 token" };
  if (proxy) return { kind: "proxy", label: "Upgradeability proxy" };
  return { kind: "contract", label: "Custom smart contract" };
}

export function analyzeRuntimeBytecode(
  bytecode: string,
  hints: InspectionHints = {},
): ContractAnalysis {
  const runtimeBytes = Math.max(0, (bytecode.length - 2) / 2);
  const opcodes = executableOpcodes(bytecode);
  const selectors = selectorCandidates(bytecode);
  const { kind, label } = classify(hints);
  const capabilities = [
    hints.erc20 && "ERC-20",
    hints.erc165 && "ERC-165",
    hints.erc777 && "ERC-777",
    hints.erc721 && "ERC-721",
    hints.erc1155 && "ERC-1155",
    hints.erc4626 && "ERC-4626",
    hints.erc2981 && "ERC-2981 royalties",
    hints.ownable && "Ownable surface",
    hints.accessControl && "AccessControl surface",
    hints.pausable && "Pausable surface",
    hints.permit && "Permit surface",
    hints.flashLender && "Flash-loan surface",
    hints.multicall && "Multicall surface",
    hints.implementationAddress && "EIP-1967 proxy",
  ].filter((value): value is string => Boolean(value));

  const checks: AnalysisCheck[] = [
    {
      id: "runtime-size",
      label: "Runtime size",
      outcome: runtimeBytes <= 24_576 ? "pass" : "caution",
      detail:
        runtimeBytes <= 24_576
          ? `${runtimeBytes.toLocaleString()} bytes are within the EIP-170 runtime limit.`
          : `${runtimeBytes.toLocaleString()} bytes exceed the standard EIP-170 runtime limit.`,
    },
    {
      id: "contract-profile",
      label: "Contract profile",
      outcome: "pass",
      detail: `${label} detected${capabilities.length ? ` with ${capabilities.join(", ")}` : " from deployed runtime bytecode"}.`,
    },
  ];

  if (hints.implementationAddress) {
    checks.push({
      id: "proxy-implementation",
      label: "Proxy implementation",
      outcome: "notice",
      detail: `EIP-1967 implementation resolved to ${getAddress(hints.implementationAddress)}. Analyze both proxy and implementation.`,
    });
  }

  for (const [value, definition] of Object.entries(OPCODES)) {
    if (opcodes.has(Number(value))) {
      checks.push({
        id: `opcode-${Number(value).toString(16)}`,
        label: definition.label,
        outcome: "caution",
        detail: definition.detail,
      });
    }
  }

  if (!checks.some((check) => check.outcome === "caution")) {
    checks.push({
      id: "opcode-surface",
      label: "Opcode surface",
      outcome: "pass",
      detail: "No flagged execution opcodes were found in executable bytecode positions.",
    });
  }

  return {
    kind,
    label,
    runtimeBytes,
    capabilities,
    implementationAddress: hints.implementationAddress
      ? getAddress(hints.implementationAddress)
      : null,
    checks,
    selectorCandidates: selectors,
  };
}
