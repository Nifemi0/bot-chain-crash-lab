import { describe, expect, it } from "vitest";
import { ATTESTATION_PREFIX, createAiReportHash, createAttestationData } from "@/lib/attestation";
import type { AiInvestigation, Simulation } from "@/lib/types";

const simulation = {
  chainId: 677,
  contractAddress: "0x756892F17A7F8d5b870ee2910DF610fEC2E1930C",
  simulationId: `0x${"11".repeat(32)}`,
  codeHash: `0x${"22".repeat(32)}`,
  reportHash: `0x${"33".repeat(32)}`,
} as Simulation;

const investigation = {
  investigationId: "investigation-1",
  model: "deepseek-v4-flash",
  reportSource: "deepseek",
  status: "completed",
  overview: "Evidence-grounded report",
  reviewLevel: "review",
  confidence: 0.82,
  findings: [],
  evidence: [],
  toolsUsed: ["runtimeFingerprint", "interfaceProfile"],
  limitations: ["Read-only analysis"],
  createdAt: "2026-08-15T00:00:00.000Z",
} satisfies AiInvestigation;

describe("AI report attestations", () => {
  it("hashes the full evidence envelope deterministically", () => {
    expect(createAiReportHash(simulation, investigation)).toMatch(/^0x[0-9a-f]{64}$/);
    expect(createAiReportHash(simulation, investigation)).toBe(createAiReportHash(simulation, investigation));
  });

  it("encodes the schema prefix, simulation ID, and AI report hash", () => {
    const result = createAttestationData(simulation, investigation);
    expect(result.data).toContain(Buffer.from(ATTESTATION_PREFIX).toString("hex"));
    expect(result.data).toContain(simulation.simulationId.slice(2).toLowerCase());
    expect(result.data.endsWith(result.aiReportHash.slice(2))).toBe(true);
  });
});
