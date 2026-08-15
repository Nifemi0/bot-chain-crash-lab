import { describe, expect, it } from "vitest";
import { CONTRACTS } from "@/lib/network";
import {
  createSimulation,
  createSimulationEvents,
  parseContractAddress,
} from "@/lib/simulation";
import { analyzeRuntimeBytecode } from "@/lib/analysis";

describe("simulation model", () => {
  it("normalizes a valid EVM contract address", () => {
    expect(parseContractAddress(CONTRACTS.vulnerableVault.toLowerCase())).toBe(
      CONTRACTS.vulnerableVault,
    );
  });

  it("rejects malformed addresses", () => {
    expect(() => parseContractAddress("0x1234")).toThrow(/valid 42-character/);
  });

  it("creates a deterministic evidence envelope when time and nonce are fixed", () => {
    const input = {
      address: CONTRACTS.vulnerableVault,
      bytecode: "0x60006000" as const,
      now: new Date("2026-08-09T00:00:00.000Z"),
      nonce: "unit-test",
    };
    expect(createSimulation(input)).toEqual(createSimulation(input));
    expect(createSimulation(input).finding.status).toBe("analyzed");
    expect(createSimulation(input).mode).toBe("universal-scan");
  });

  it("reports only live read-only analysis events for the reference contract", () => {
    const events = createSimulationEvents(CONTRACTS.vulnerableVault);
    expect(events.some((event) => event.type === "invariant.failed")).toBe(false);
    expect(events.some((event) => event.type === "replay.completed")).toBe(false);
    expect(events.some((event) => event.type === "passport.anchored")).toBe(false);
    expect(events.some((event) => event.type === "surface.scanned")).toBe(true);
    expect(events.at(-1)?.type).toBe("simulation.completed");
  });

  it("produces a universal analysis report for any other deployed contract envelope", () => {
    const simulation = createSimulation({
      address: CONTRACTS.passport,
      bytecode: "0x60006000",
      now: new Date("2026-08-09T00:00:00.000Z"),
      nonce: "universal-test",
    });
    expect(simulation.mode).toBe("universal-scan");
    expect(simulation.status).toBe("analyzed");
    expect(simulation.finding.id).toBe("CL-SURFACE-001");
    expect(simulation.passport.simulationId).toBeNull();
  });

  it("does not confuse PUSH data with executable risk opcodes", () => {
    expect(analyzeRuntimeBytecode("0x60ff00").checks.some((check) => check.id === "opcode-ff")).toBe(false);
    expect(analyzeRuntimeBytecode("0xff").checks.some((check) => check.id === "opcode-ff")).toBe(true);
  });
});
