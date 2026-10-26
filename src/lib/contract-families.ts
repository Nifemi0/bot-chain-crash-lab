import type { ContractFamilyCoverage } from "@/lib/types";

type FamilyHints = {
  erc20?: boolean;
  erc777?: boolean;
  erc721?: boolean;
  erc1155?: boolean;
  erc2981?: boolean;
  erc4626?: boolean;
  implementationAddress?: string | null;
};

const FAMILIES = [
  { id: "fungible-token", label: "Fungible tokens", reviewFocus: "Supply, transfer rules, allowances, and privileged roles." },
  { id: "nft", label: "NFTs and multi-tokens", reviewFocus: "Minting, transfers, approvals, metadata, and royalties." },
  { id: "vault", label: "Vaults", reviewFocus: "Share accounting, asset conversion, withdrawal rules, and permissions." },
  { id: "staking", label: "Staking and rewards", reviewFocus: "Deposit and withdrawal accounting, reward timing, and administrative controls." },
  { id: "exchange", label: "Exchanges and liquidity pools", reviewFocus: "Pricing assumptions, liquidity accounting, fees, and governance." },
  { id: "lending", label: "Lending", reviewFocus: "Collateral accounting, rate models, liquidations, and oracle dependencies." },
  { id: "governance", label: "Governance", reviewFocus: "Voting power, proposal execution, timelocks, and role controls." },
  { id: "bridge", label: "Bridges and messaging", reviewFocus: "Message verification, finality assumptions, custody, and privileged relayers." },
  { id: "proxy", label: "Upgradeable contracts", reviewFocus: "Upgrade authority, implementation identity, and storage compatibility." },
  { id: "custom", label: "Custom contracts", reviewFocus: "Obtain a verified ABI and source code to understand protocol-specific behavior." },
] as const;

/** A read-only signal is not a verified protocol classification. */
export function contractFamilyCoverage(hints: FamilyHints): ContractFamilyCoverage[] {
  const signals: Record<string, string | undefined> = {
    "fungible-token": hints.erc777 ? "ERC-777 interface response" : hints.erc20 ? "ERC-20-like read-only calls" : undefined,
    nft: hints.erc1155 ? "ERC-1155 interface response" : hints.erc721 ? "ERC-721 interface response" : hints.erc2981 ? "ERC-2981 royalty interface response" : undefined,
    vault: hints.erc4626 ? "asset() and totalAssets() read-only calls" : undefined,
    proxy: hints.implementationAddress ? "EIP-1967 implementation slot with deployed code" : undefined,
  };
  const hasRecognizedSignal = Object.values(signals).some(Boolean);
  signals.custom = hasRecognizedSignal ? undefined : "No supported standard-family signal established";

  return FAMILIES.map((family) => ({
    ...family,
    status: family.id === "custom" && !hasRecognizedSignal
      ? "unclassified" as const
      : signals[family.id] ? "interface-signal" as const : "not-established" as const,
    basis: signals[family.id] ?? "Requires verified ABI/source or protocol-specific read-only evidence",
  }));
}
