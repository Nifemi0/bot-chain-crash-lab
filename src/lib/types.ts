export type SimulationStatus = "vulnerable" | "remediated" | "analyzed" | "unresolved";

export type ContractKind =
  | "erc4626-vault"
  | "erc20-token"
  | "erc777-token"
  | "erc721-nft"
  | "erc1155-token"
  | "erc2981-nft"
  | "proxy"
  | "contract";

export type AnalysisCheck = {
  id: string;
  label: string;
  outcome: "pass" | "notice" | "caution";
  detail: string;
};

export type ContractAnalysis = {
  kind: ContractKind;
  label: string;
  runtimeBytes: number;
  capabilities: string[];
  implementationAddress: string | null;
  checks: AnalysisCheck[];
  selectorCandidates: string[];
};

export type AiEvidence = {
  id: string;
  source: "deterministic-scan" | "runtime-rpc" | "interface-rpc" | "opcode-scan";
  title: string;
  observation: string;
  data: Record<string, unknown>;
};

export type AiInvestigationFinding = {
  title: string;
  classification: "notice" | "caution" | "unknown";
  evidenceIds: string[];
  observation: string;
  whyItMatters: string;
  nextStep: string;
};

export type AiInvestigation = {
  investigationId: string;
  model: string;
  reportSource: "deepseek" | "deterministic-fallback";
  status: "completed";
  overview: string;
  reviewLevel: "low" | "review" | "elevated" | "unknown";
  confidence: number;
  findings: AiInvestigationFinding[];
  evidence: AiEvidence[];
  toolsUsed: string[];
  limitations: string[];
  createdAt: string;
};

export type SimulationEvent = {
  sequence: number;
  type:
    | "simulation.created"
    | "contract.verified"
    | "contract.classified"
    | "surface.scanned"
    | "adapter.selected"
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
  mode: "canonical-replay" | "universal-scan";
  agentCount: number;
  analysis: ContractAnalysis;
  finding: SimulationFinding;
  passport: PassportEvidence;
  eventsUrl: string;
  createdAt: string;
  aiInvestigation?: AiInvestigation;
};
