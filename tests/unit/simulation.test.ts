import { describe, expect, it } from "vitest";
import { CONTRACTS } from "@/lib/network";
import {
  createSimulation,
  createSimulationEvents,
  isDemoContract,
  parseContractAddress,
} from "@/lib/simulation";

describe("simulation model", () => {
  it("normalizes a valid EVM contract address", () => {
    expect(parseContractAddress(CONTRACTS.vulnerableVault.toLowerCase())).toBe(
      CONTRACTS.vulnerableVault,
    );
  });

  it("rejects malformed addresses", () => {
    expect(() => parseContractAddress("0x1234")).toThrow(/valid 42-character/);
  });

  it("identifies only the deployed canonical vault as the demo target", () => {
    expect(isDemoContract(CONTRACTS.vulnerableVault)).toBe(true);
    expect(isDemoContract(CONTRACTS.passport)).toBe(false);
  });

  it("creates a deterministic evidence envelope when time and nonce are fixed", () => {
    const input = {
      address: CONTRACTS.vulnerableVault,
      bytecode: "0x60006000" as const,
      now: new Date("2026-08-09T00:00:00.000Z"),
      nonce: "unit-test",
    };
    expect(createSimulation(input)).toEqual(createSimulation(input));
    expect(createSimulation(input).finding.status).toBe("vulnerable");
  });

  it("finishes the canonical event stream with replay and Passport evidence", () => {
    const events = createSimulationEvents(CONTRACTS.vulnerableVault);
    expect(events.some((event) => event.type === "invariant.failed")).toBe(true);
    expect(events.some((event) => event.type === "replay.completed")).toBe(true);
    expect(events.some((event) => event.type === "passport.anchored")).toBe(true);
    expect(events.at(-1)?.type).toBe("simulation.completed");
  });
});
