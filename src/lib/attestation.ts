import { concat, getBytes, hexlify, keccak256, toUtf8Bytes } from "ethers";
import type { AiInvestigation, Simulation } from "@/lib/types";

export const ATTESTATION_PREFIX = "CRASHLAB_AI_V1";

export function createAiReportHash(simulation: Simulation, investigation: AiInvestigation) {
  return keccak256(toUtf8Bytes(JSON.stringify({
    schema: "crash-lab.ai-attestation.v1",
    chainId: simulation.chainId,
    contractAddress: simulation.contractAddress,
    simulationId: simulation.simulationId,
    runtimeCodeHash: simulation.codeHash,
    deterministicReportHash: simulation.reportHash,
    investigation,
  })));
}

export function createAttestationData(simulation: Simulation, investigation: AiInvestigation) {
  const aiReportHash = createAiReportHash(simulation, investigation);
  return {
    aiReportHash,
    data: hexlify(concat([
      toUtf8Bytes(ATTESTATION_PREFIX),
      getBytes(simulation.simulationId),
      getBytes(aiReportHash),
    ])),
  };
}
