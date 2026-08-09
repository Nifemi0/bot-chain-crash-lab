export type SimulationStatus = "vulnerable" | "remediated" | "unresolved";

export type SimulationEvent = {
  sequence: number;
  type:
    | "simulation.created"
    | "contract.verified"
    | "agent.dispatched"
    | "invariant.failed"
    | "patch.compiled"
    | "replay.completed"
    | "passport.anchored"
    | "simulation.completed";
  message: string;
  txHash?: string;
};

export type SimulationFinding = {
  id: string;
  title: string;
  severity: "critical" | "informational";
  status: SimulationStatus;
  invariant: string;
  summary: string;
  exploit: string;
  repair: string;
  beforeVictimShares: string;
  afterVictimShares: string;
};

export type PassportEvidence = {
  contractAddress: string;
  simulationId: string | null;
  reportHash: string | null;
  sourceHash: string | null;
  transactionHash: string | null;
  blockNumber: number | null;
  publisher: string | null;
};

export type CanonicalRun = {
  network: { name: string; chainId: number; rpcUrl: string; explorerUrl: string };
  contracts: {
    passport: string;
    mockBot: string;
    vulnerableVault: string;
    patchedVault: string | null;
  };
  attack: {
    transactionHashes: string[];
    victimShares: string;
    attackerRecoveredAssets: string;
  };
  replay: {
    transactionHashes: string[];
    victimShares: string;
    invariantHeld: boolean;
  };
  passport: PassportEvidence;
  generatedAt: string | null;
};

export type Simulation = {
  simulationId: string;
  contractAddress: string;
  chainId: number;
  network: string;
  codeHash: string;
  reportHash: string;
  status: SimulationStatus;
  agentCount: number;
  finding: SimulationFinding;
  passport: PassportEvidence;
  eventsUrl: string;
  createdAt: string;
};
