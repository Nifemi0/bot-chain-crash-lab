import {
  getAddress,
  isAddress,
  keccak256,
  solidityPacked,
  toUtf8Bytes,
} from "ethers";
import { analyzeRuntimeBytecode } from "@/lib/analysis";
import { BOT_CHAIN, CONTRACTS } from "@/lib/network";
import type { ContractAnalysis, Simulation, SimulationEvent, SimulationFinding } from "@/lib/types";

export const TOOL_VERSION = keccak256(toUtf8Bytes("crash-lab/1.0.0"));

export function parseContractAddress(value: unknown) {
  if (typeof value !== "string" || !isAddress(value)) {
    throw new Error("Enter a valid 42-character EVM contract address.");
  }
  return getAddress(value);
}

export function isDemoContract(address: string) {
  return getAddress(address) === CONTRACTS.vulnerableVault;
}

function findingFor(address: string, analysis?: ContractAnalysis): SimulationFinding {
  return {
    id: "CL-SURFACE-001",
    title: `${analysis?.label ?? "Contract"} surface analysis`,
    severity: "informational",
    status: "analyzed",
    invariant: "Deployed runtime must be inspectable without overstating security conclusions",
    summary:
      `Live read-only analysis completed for ${analysis?.label?.toLowerCase() ?? "this contract"}. Review each surfaced capability and caution with the source code and protocol design.`,
    exploit: "No state-changing transaction or simulated exploit was executed.",
    repair: "Cautions are review targets, not automatic vulnerability claims.",
    beforeVictimShares: "n/a",
    afterVictimShares: "n/a",
  };
}

export function createSimulation(input: {
  address: string;
  bytecode: string;
  analysis?: ContractAnalysis;
  now?: Date;
  nonce?: string;
}): Simulation {
  const address = parseContractAddress(input.address);
  const now = input.now ?? new Date();
  const nonce = input.nonce ?? crypto.randomUUID();
  const analysis = input.analysis ?? analyzeRuntimeBytecode(input.bytecode);
  const codeHash = keccak256(input.bytecode as `0x${string}`);
  const simulationId = keccak256(
    solidityPacked(
      ["address", "uint256", "string"],
      [address, BigInt(now.getTime()), nonce],
    ),
  );
  const reportHash = keccak256(
    toUtf8Bytes(
      JSON.stringify({
        simulationId,
        address,
        codeHash,
        finding: findingFor(address, analysis),
        evidenceSource: "BOT Chain live runtime bytecode and read-only RPC probes",
      }),
    ),
  );

  return {
    simulationId,
    contractAddress: address,
    chainId: BOT_CHAIN.chainId,
    network: BOT_CHAIN.name,
    codeHash,
    reportHash,
    status: "analyzed",
    mode: "universal-scan",
    agentCount: 1,
    analysis,
    finding: findingFor(address, analysis),
    passport: {
      contractAddress: CONTRACTS.passport,
      simulationId: null,
      reportHash: null,
      sourceHash: null,
      transactionHash: null,
      blockNumber: null,
      publisher: null,
    },
    eventsUrl: `/api/simulations/${simulationId}/events?${new URLSearchParams({
      address,
      profile: analysis.label,
      bytes: String(analysis.runtimeBytes),
      checks: String(analysis.checks.length),
      cautions: String(analysis.checks.filter((check) => check.outcome === "caution").length),
    })}`,
    createdAt: now.toISOString(),
  };
}

export function createSimulationEvents(
  address: string,
  analysis?: ContractAnalysis,
  summary?: { label: string; runtimeBytes: number; checkCount: number; cautionCount: number },
): SimulationEvent[] {
  const profile = analysis ?? analyzeRuntimeBytecode("0x");
  const label = summary?.label ?? profile.label;
  const runtimeBytes = summary?.runtimeBytes ?? profile.runtimeBytes;
  const checkCount = summary?.checkCount ?? profile.checks.length;
  const cautions = summary?.cautionCount ?? profile.checks.filter((check) => check.outcome === "caution").length;
  return [
    { sequence: 1, type: "simulation.created", message: "Read-only analysis record created." },
    { sequence: 2, type: "contract.verified", message: `${runtimeBytes.toLocaleString()} runtime bytes retrieved from BOT Chain.` },
    {
      sequence: 3,
      type: "contract.classified",
      message: `${label} classified from live interface probes and deployed bytecode.`,
    },
    {
      sequence: 4,
      type: "surface.scanned",
      message: `${checkCount} bytecode checks completed; ${cautions} caution${cautions === 1 ? "" : "s"} require human review.`,
    },
    {
      sequence: 5,
      type: "simulation.completed",
      message: "Live analysis complete. No transaction or simulated exploit was executed.",
    },
  ];
}

export function canonicalFinding(address: string, analysis?: ContractAnalysis) {
  return findingFor(parseContractAddress(address), analysis);
}
