import { describe, expect, it } from "vitest";
import { isDemoReplayTarget } from "../../src/lib/replay-policy";

describe("demo replay boundary", () => {
  it("allows fixed demo fixtures on supported chains", () => {
    expect(isDemoReplayTarget(677, "0x756892F17A7F8d5b870ee2910DF610fEC2E1930C")).toBe(true);
    expect(isDemoReplayTarget(4663, "0x696A0e79973711BCC89E52EDfdbA34cEA972A6aA")).toBe(true);
  });
  it("rejects other addresses and chains", () => {
    expect(isDemoReplayTarget(677, "0x0000000000000000000000000000000000000001")).toBe(false);
    expect(isDemoReplayTarget(1, "0x756892F17A7F8d5b870ee2910DF610fEC2E1930C")).toBe(false);
  });
});
