import { ToolLoopAgent, generateText, hasToolCall, isStepCount, tool } from "ai";
import { keccak256 } from "ethers";
import { z } from "zod";
import { analyzeRuntimeBytecode } from "@/lib/analysis";
import { getInvestigationModel } from "@/lib/ai/provider";
import { BOT_CHAIN } from "@/lib/network";
import { getBotChainProvider, getVerifiedBytecode, inspectBotChainContract } from "@/lib/rpc";
import type { AiEvidence, AiInvestigation, Simulation } from "@/lib/types";

const investigationOutput = z.object({
  overview: z.string().min(20).max(700),
  reviewLevel: z.enum(["low", "review", "elevated", "unknown"]),
  confidence: z.number().min(0).max(1),
  findings: z.array(z.object({
    title: z.string().min(4).max(120),
    classification: z.enum(["notice", "caution", "unknown"]),
    evidenceIds: z.array(z.string().min(3).max(80)).min(1).max(5),
    observation: z.string().min(10).max(500),
    whyItMatters: z.string().min(10).max(500),
    nextStep: z.string().min(10).max(400),
  })).max(6),
  limitations: z.array(z.string().min(8).max(300)).min(1).max(6),
});

function extractSelectors(bytecode: string) {
  const bytes = Buffer.from(bytecode.slice(2), "hex");
  const selectors = new Set<string>();
  for (let index = 0; index < bytes.length; index += 1) {
    const opcode = bytes[index];
    if (opcode === 0x63 && index + 4 < bytes.length) {
      selectors.add(`0x${bytes.subarray(index + 1, index + 5).toString("hex")}`);
    }
    if (opcode >= 0x60 && opcode <= 0x7f) index += opcode - 0x5f;
  }
  return [...selectors].slice(0, 40);
}

export function keepEvidenceBackedFindings(
  findings: z.infer<typeof investigationOutput>["findings"],
  evidenceIds: Iterable<string>,
) {
  const validIds = new Set(evidenceIds);
  return findings
    .map((finding) => ({
      ...finding,
      evidenceIds: [...new Set(finding.evidenceIds)].filter((id) => validIds.has(id)),
    }))
    .filter((finding) => finding.evidenceIds.length > 0);
}

function buildEvidenceFallback(simulation: Simulation, evidence: Map<string, AiEvidence>, modelId: string): AiInvestigation {
  const ids = [...evidence.keys()];
  return {
    investigationId: crypto.randomUUID(),
    model: `${modelId} · evidence fallback`,
    reportSource: "deterministic-fallback",
    status: "completed",
    overview: `The live AI provider did not return a valid report, so Crash Lab returned a deterministic evidence-only review for ${simulation.analysis.label}. These observations are not an audit or proof of safety.`,
    reviewLevel: "review",
    confidence: 0.55,
    findings: [{
      title: "Manual review required",
      classification: "unknown",
      evidenceIds: ids.slice(0, 3),
      observation: "Live runtime, interface, and opcode evidence was collected, but the AI provider did not complete its narrative report.",
      whyItMatters: "A provider failure must not be presented as a clean security result or a simulated exploit outcome.",
      nextStep: "Review the cited evidence with the verified source code and run protocol-specific tests before relying on this contract.",
    }],
    evidence: [...evidence.values()],
    toolsUsed: ["runtimeFingerprint", "interfaceProfile", "opcodeSurface"],
    limitations: [
      "The AI provider did not return a valid submitted report for this run.",
      "This is a live read-only evidence review, not a full audit and not an exploit simulation.",
    ],
    createdAt: new Date().toISOString(),
  };
}

async function generateEvidenceReport(model: ReturnType<typeof getInvestigationModel>["model"], simulation: Simulation, evidence: Map<string, AiEvidence>, modelId: string): Promise<AiInvestigation> {
  const response = await generateText({
    model,
    maxOutputTokens: 1_400,
    prompt: `You are the defensive report writer for Crash Lab. Write an evidence-grounded report for ${simulation.contractAddress} on ${BOT_CHAIN.name} chain ${BOT_CHAIN.chainId}. Use only the JSON evidence below. Never claim a vulnerability, exploitability, malicious intent, or safety has been proven. This is live read-only evidence, not a simulation or full audit. Never assign a function or error name to a raw selector candidate unless that name is explicitly present in the evidence. Return ONLY valid JSON matching this shape: {"overview":string,"reviewLevel":"low|review|elevated|unknown","confidence":number,"findings":[{"title":string,"classification":"notice|caution|unknown","evidenceIds":[string],"observation":string,"whyItMatters":string,"nextStep":string}],"limitations":[string]}. Every finding evidenceIds value must be one of: ${[...evidence.keys()].join(", ")}.\n\nEVIDENCE:\n${JSON.stringify([...evidence.values()])}`,
  });
  const text = response.text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const parsed = investigationOutput.parse(JSON.parse(text));
  return {
    investigationId: crypto.randomUUID(), model: modelId, reportSource: "deepseek", status: "completed" as const,
    overview: parsed.overview, reviewLevel: parsed.reviewLevel, confidence: parsed.confidence,
    findings: keepEvidenceBackedFindings(parsed.findings, evidence.keys()), evidence: [...evidence.values()],
    toolsUsed: ["runtimeFingerprint", "interfaceProfile", "opcodeSurface"], limitations: parsed.limitations,
    createdAt: new Date().toISOString(),
  };
}

export async function runContractInvestigation(simulation: Simulation): Promise<AiInvestigation> {
  const { model, modelId } = getInvestigationModel();
  const evidence = new Map<string, AiEvidence>();
  let submittedOutput: z.infer<typeof investigationOutput> | undefined;
  const record = (item: AiEvidence) => {
    evidence.set(item.id, item);
    return item;
  };

  record({
    id: "E-BASELINE",
    source: "deterministic-scan",
    title: "Deterministic scan baseline",
    observation: `${simulation.analysis.label}; ${simulation.analysis.runtimeBytes.toLocaleString()} runtime bytes; ${simulation.analysis.checks.length} deterministic checks.`,
    data: {
      contractAddress: simulation.contractAddress,
      chainId: simulation.chainId,
      codeHash: simulation.codeHash,
      kind: simulation.analysis.kind,
      capabilities: simulation.analysis.capabilities,
      selectorCandidates: simulation.analysis.selectorCandidates,
      checks: simulation.analysis.checks,
    },
  });

  const purposeSchema = z.object({
    purpose: z.string().min(4).max(160).describe("Why this read-only probe helps the investigation"),
  });

  const agent = new ToolLoopAgent({
    model,
    instructions: `You are Crash Lab's defensive BOT Chain contract investigation agent.

Rules:
- Investigate only the contract supplied in the user prompt on ${BOT_CHAIN.name} chain ${BOT_CHAIN.chainId}.
- Use at least two complementary read-only tools before producing the report.
- Never claim that a vulnerability, exploitability, malicious intent, or safety has been proven.
- Findings must be limited to observable capabilities, cautionary surfaces, and unknowns.
- Every finding must cite one or more exact evidence IDs returned by tools or E-BASELINE.
- Treat opcode presence as a review target, not proof that the behavior is reachable or unsafe.
- Never assign a function or error name to a raw selector candidate unless that name is explicitly present in the evidence.
- Do not invent source code, transactions, balances, owners, implementation addresses, or standards.
- State limitations clearly and recommend manual source-level review or protocol-specific testing where appropriate.
- No transaction or exploit simulation is available.
- After using at least two evidence tools, call submitInvestigation exactly once with the final report.`,
    maxOutputTokens: 1_400,
    providerOptions: {
      deepseek: {
        thinking: { type: "disabled" },
      },
    },
    stopWhen: [isStepCount(4), hasToolCall("submitInvestigation")],
    prepareStep: ({ steps }) => {
      const evidenceTools = ["runtimeFingerprint", "interfaceProfile", "opcodeSurface"] as const;
      const usedEvidenceTools = new Set(
        steps.flatMap((step) => step.toolCalls.map((call) => call.toolName))
          .filter((toolName) => evidenceTools.includes(toolName as (typeof evidenceTools)[number])),
      );
      if (usedEvidenceTools.size >= 2) {
        return { activeTools: ["submitInvestigation"], toolChoice: "required" };
      }
      return {
        activeTools: evidenceTools.filter((toolName) => !usedEvidenceTools.has(toolName)),
        toolChoice: "required",
      };
    },
    tools: {
      runtimeFingerprint: tool({
        description: "Read the deployed runtime bytecode and return its live fingerprint and embedded PUSH4 selector candidates.",
        inputSchema: purposeSchema,
        execute: async () => {
          const bytecode = await getVerifiedBytecode(simulation.contractAddress);
          const blockNumber = await getBotChainProvider().getBlockNumber();
          return record({
            id: "E-RUNTIME",
            source: "runtime-rpc",
            title: "Live runtime fingerprint",
            observation: `${Math.max(0, (bytecode.length - 2) / 2).toLocaleString()} runtime bytes retrieved at BOT Chain block ${blockNumber}.`,
            data: {
              codeHash: keccak256(bytecode as `0x${string}`),
              runtimeBytes: Math.max(0, (bytecode.length - 2) / 2),
              blockNumber,
              selectorCandidates: extractSelectors(bytecode),
            },
          });
        },
      }),
      interfaceProfile: tool({
        description: "Run read-only standard-interface calls and inspect the EIP-1967 implementation slot.",
        inputSchema: purposeSchema,
        execute: async () => {
          const { analysis } = await inspectBotChainContract(simulation.contractAddress);
          return record({
            id: "E-INTERFACES",
            source: "interface-rpc",
            title: "Read-only interface profile",
            observation: `${analysis.label} classified from live eth_call probes and proxy-slot inspection.`,
            data: {
              kind: analysis.kind,
              label: analysis.label,
              capabilities: analysis.capabilities,
              implementationAddress: analysis.implementationAddress,
            },
          });
        },
      }),
      opcodeSurface: tool({
        description: "Parse executable runtime positions and identify cautionary EVM opcode surfaces without executing them.",
        inputSchema: purposeSchema,
        execute: async () => {
          const bytecode = await getVerifiedBytecode(simulation.contractAddress);
          const analysis = analyzeRuntimeBytecode(bytecode);
          const opcodeChecks = analysis.checks.filter(
            (check) => check.id.startsWith("opcode-") && check.outcome === "caution",
          );
          return record({
            id: "E-OPCODES",
            source: "opcode-scan",
            title: "Executable opcode surface",
            observation: opcodeChecks.length
              ? `${opcodeChecks.length} cautionary executable opcode surface${opcodeChecks.length === 1 ? "" : "s"} found.`
              : "No configured cautionary opcodes were found in executable bytecode positions.",
            data: { checks: opcodeChecks },
          });
        },
      }),
      submitInvestigation: tool({
        description: "Submit the final evidence-cited investigation report after using at least two read-only evidence tools.",
        inputSchema: investigationOutput,
        execute: async (report) => {
          submittedOutput = report;
          return { accepted: true, findingCount: report.findings.length };
        },
      }),
    },
  });

  let result;
  try {
    result = await agent.generate({
      prompt: `Investigate ${simulation.contractAddress}. The deterministic baseline is E-BASELINE. Select the read-only probes needed to produce an evidence-backed review report.`,
    });
  } catch {
    // Keep the product usable when the external model is unavailable or times out.
    // Collect the same live, read-only evidence directly and label the result honestly.
    const bytecode = await getVerifiedBytecode(simulation.contractAddress);
    const blockNumber = await getBotChainProvider().getBlockNumber();
    const { analysis } = await inspectBotChainContract(simulation.contractAddress);
    const opcodeChecks = analyzeRuntimeBytecode(bytecode).checks.filter(
      (check) => check.id.startsWith("opcode-") && check.outcome === "caution",
    );
    record({
      id: "E-RUNTIME",
      source: "runtime-rpc",
      title: "Live runtime fingerprint",
      observation: `${Math.max(0, (bytecode.length - 2) / 2).toLocaleString()} runtime bytes retrieved at BOT Chain block ${blockNumber}.`,
      data: { codeHash: keccak256(bytecode as `0x${string}`), runtimeBytes: Math.max(0, (bytecode.length - 2) / 2), blockNumber },
    });
    record({
      id: "E-INTERFACES",
      source: "interface-rpc",
      title: "Read-only interface profile",
      observation: `${analysis.label} classified from live eth_call probes and proxy-slot inspection.`,
      data: { kind: analysis.kind, label: analysis.label, capabilities: analysis.capabilities, implementationAddress: analysis.implementationAddress },
    });
    record({
      id: "E-OPCODES",
      source: "opcode-scan",
      title: "Executable opcode surface",
      observation: opcodeChecks.length ? `${opcodeChecks.length} cautionary executable opcode surfaces found.` : "No configured cautionary opcodes were found in executable bytecode positions.",
      data: { checks: opcodeChecks },
    });
    try {
      return await generateEvidenceReport(model, simulation, evidence, modelId);
    } catch {
      return buildEvidenceFallback(simulation, evidence, modelId);
    }
  }
  const output = submittedOutput;
  if (!output) {
    try {
      return await generateEvidenceReport(model, simulation, evidence, modelId);
    } catch {
      return buildEvidenceFallback(simulation, evidence, modelId);
    }
  }
  const findings = keepEvidenceBackedFindings(output.findings, evidence.keys());
  const toolsUsed = [...new Set(result.steps.flatMap((step) => step.toolCalls.map((call) => call.toolName)))]
    .filter((toolName) => toolName !== "submitInvestigation");

  return {
    investigationId: crypto.randomUUID(),
    model: modelId,
    reportSource: "deepseek",
    status: "completed",
    overview: output.overview,
    reviewLevel: output.reviewLevel,
    confidence: output.confidence,
    findings,
    evidence: [...evidence.values()],
    toolsUsed,
    limitations: output.limitations,
    createdAt: new Date().toISOString(),
  };
}
