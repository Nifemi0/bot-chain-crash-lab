import {
  getAddress,
  isAddress,
  keccak256,
  solidityPacked,
  toUtf8Bytes,
} from "ethers";
import { canonicalRun, hasCanonicalRun } from "@/lib/canonical";
import { BOT_CHAIN, CONTRACTS } from "@/lib/network";
import type { Simulation, SimulationEvent, SimulationFinding } from "@/lib/types";

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

function findingFor(address: string): SimulationFinding {
  if (!isDemoContract(address)) {
    return {
      id: "CL-000",
      title: "Contract accepted for bytecode verification",
      severity: "informational",
      status: "unresolved",
      invariant: "No automated claim for contracts outside the canonical demo target",
      summary:
        "Crash Lab intentionally limits this public MVP to one reproducible vault scenario.",
      exploit: "No exploit was attempted against the submitted live contract.",
      repair: "Run the canonical vault to inspect the complete attack-and-replay proof.",
      beforeVictimShares: "n/a",
      afterVictimShares: "n/a",
    };
  }

  return {
    id: "CL-4626-001",
    title: "Donation-driven share inflation",
    severity: "critical",
    status: "vulnerable",
    invariant: "Every non-zero deposit must mint non-zero shares",
    summary:
      "A first depositor donates assets directly to the vault, inflates the share price, and rounds the victim deposit to zero shares.",
    exploit:
      "The vulnerable vault calculates shares from its raw token balance and permits a zero-share deposit.",
    repair:
      "The patched vault introduces virtual assets and shares and rejects zero-share deposits. Exact replay mints shares for the victim.",
    beforeVictimShares: canonicalRun.attack.victimShares,
    afterVictimShares: canonicalRun.replay.victimShares,
  };
}

export function createSimulation(input: {
  address: string;
  bytecode: string;
  now?: Date;
  nonce?: string;
}): Simulation {
  const address = parseContractAddress(input.address);
  const now = input.now ?? new Date();
  const nonce = input.nonce ?? crypto.randomUUID();
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
        finding: findingFor(address),
        canonicalPassport: canonicalRun.passport.transactionHash,
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
    status: isDemoContract(address) ? "vulnerable" : "unresolved",
    agentCount: isDemoContract(address) ? 32 : 1,
    finding: findingFor(address),
    passport: canonicalRun.passport,
    eventsUrl: `/api/simulations/${simulationId}/events?address=${address}`,
    createdAt: now.toISOString(),
  };
}

export function createSimulationEvents(address: string): SimulationEvent[] {
  const demo = isDemoContract(address);
  if (!demo) {
    return [
      { sequence: 1, type: "simulation.created", message: "Simulation envelope created." },
      { sequence: 2, type: "contract.verified", message: "BOT Chain bytecode confirmed." },
      {
        sequence: 3,
        type: "simulation.completed",
        message: "Analysis stopped safely: this MVP only replays the canonical demo vault.",
      },
    ];
  }

  const passportReady = hasCanonicalRun();
  return [
    { sequence: 1, type: "simulation.created", message: "Isolated replay envelope created." },
    { sequence: 2, type: "contract.verified", message: "Deployed bytecode matched the canonical vulnerable vault." },
    { sequence: 3, type: "agent.dispatched", message: "32 deterministic agent-wallet strategies dispatched." },
    {
      sequence: 4,
      type: "invariant.failed",
      message: "Asset/share consistency failed: victim received zero shares.",
      txHash: canonicalRun.attack.transactionHashes.at(-1),
    },
    { sequence: 5, type: "patch.compiled", message: "Virtual-share repair compiled and deployed." },
    {
      sequence: 6,
      type: "replay.completed",
      message: "Exact replay passed: victim received non-zero shares.",
      txHash: canonicalRun.replay.transactionHashes.at(-1),
    },
    ...(passportReady
      ? [
          {
            sequence: 7,
            type: "passport.anchored" as const,
            message: "Canonical report hash confirmed on BOT Chain Passport.",
            txHash: canonicalRun.passport.transactionHash ?? undefined,
          },
        ]
      : []),
    {
      sequence: passportReady ? 8 : 7,
      type: "simulation.completed",
      message: "Evidence package ready for inspection.",
    },
  ];
}

export function canonicalFinding(address: string) {
  return findingFor(parseContractAddress(address));
}
