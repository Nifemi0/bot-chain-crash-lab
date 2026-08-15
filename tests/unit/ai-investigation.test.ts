import { describe, expect, it } from "vitest";
import { keepEvidenceBackedFindings } from "@/lib/ai/contract-agent";

const finding = {
  title: "Review delegated execution",
  classification: "caution" as const,
  evidenceIds: ["E-OPCODES", "E-MADE-UP", "E-OPCODES"],
  observation: "A configured executable opcode was observed in runtime bytecode.",
  whyItMatters: "Delegated execution deserves source-level review before mainnet deployment.",
  nextStep: "Confirm reachability and authorization in verified source and protocol tests.",
};

describe("AI investigation evidence guard", () => {
  it("removes invented and duplicate evidence references", () => {
    expect(keepEvidenceBackedFindings([finding], ["E-BASELINE", "E-OPCODES"]))
      .toEqual([{ ...finding, evidenceIds: ["E-OPCODES"] }]);
  });

  it("drops a finding when none of its evidence references exist", () => {
    expect(keepEvidenceBackedFindings([{ ...finding, evidenceIds: ["E-MADE-UP"] }], ["E-BASELINE"]))
      .toEqual([]);
  });
});
