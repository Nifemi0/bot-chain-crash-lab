import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Sandbox } from "@vercel/sandbox";
import { isDemoReplayTarget } from "@/lib/replay-policy";
import { keccak256, toUtf8Bytes } from "ethers";
import { errorResponse, readJsonObject } from "@/lib/api";
import { contractsFor, chainFor } from "@/lib/network";
import { getActiveProvider } from "@/lib/rpc";
import { getBrowserSession, privateResponseHeaders } from "@/lib/session";
import { claimForkReplayQuota, getSimulation, saveSimulation } from "@/lib/storage";
import type { ForkReplay } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function parseRunnerOutput(raw: string) {
  const value = JSON.parse(raw.trim()) as Partial<ForkReplay>;
  const outcomes = ["reproduced", "not-reproduced", "deposit-reverted", "inconclusive"];
  if (!value.outcome || !outcomes.includes(value.outcome) || typeof value.reason !== "string" || !Array.isArray(value.transactions)) {
    throw new Error("The isolated fork returned an invalid replay result.");
  }
  return value;
}

export async function POST(request: Request) {
  const session = getBrowserSession(request);
  try {
    const body = await readJsonObject(request);
    const simulationId = String(body.simulationId ?? "");
    if (!/^0x[0-9a-f]{64}$/i.test(simulationId)) {
      return errorResponse(new Error("A valid private analysis ID is required."), 400);
    }
    const simulation = await getSimulation(simulationId, session.id);
    if (!simulation) return errorResponse(new Error("Private analysis was not found."), 404);
    if (!isDemoReplayTarget(simulation.chainId, simulation.contractAddress)) {
      return errorResponse(new Error("Replay is limited to Crash Lab's fixed demo contracts. Other contracts support read-only analysis."), 403);
    }
    if (simulation.analysis.kind !== "erc4626-vault") {
      return errorResponse(new Error("The first fork replay supports ERC-4626 vaults only."), 422);
    }
    if (simulation.forkReplay) {
      return Response.json({ replay: simulation.forkReplay, cached: true }, { headers: privateResponseHeaders(session) });
    }

    const chain = chainFor(simulation.chainId);
    const provider = getActiveProvider(chain.chainId);
    const latestBlock = await provider.getBlockNumber();
    const pinnedBlock = await provider.getBlock(latestBlock);
    if (!pinnedBlock?.hash) throw new Error("The chain RPC did not return a pinned block hash.");
    const referenceContracts = contractsFor(chain.chainId);
    const reference = simulation.contractAddress === referenceContracts.vulnerableVault ||
      simulation.contractAddress === referenceContracts.patchedVault;
    const blockNumber = latestBlock;
    const quota = await claimForkReplayQuota(session.id);
    const script = await readFile(join(process.cwd(), "scripts/fork/replay-erc4626.mjs"));
    const runnerInput = {
      rpcUrl: chain.rpcUrl,
      chainId: chain.chainId,
      contractAddress: simulation.contractAddress,
      codeHash: simulation.codeHash,
      blockNumber,
      blockHash: pinnedBlock.hash,
      emptyReferenceFixture: reference,
      expectedAssetAddress: reference ? referenceContracts.mockBot : undefined,
    };

    const sandbox = await Sandbox.create({ persistent: false, timeout: 240_000, resources: { vcpus: 1 } });
    let result: ReturnType<typeof parseRunnerOutput>;
    try {
      await sandbox.mkDir("/vercel/run");
      await sandbox.writeFiles([
        { path: "/vercel/run/replay.mjs", content: script },
        { path: "/vercel/run/input.json", content: Buffer.from(JSON.stringify(runnerInput)) },
      ]);
      const install = await sandbox.runCommand({
        cmd: "npm",
        args: ["install", "--prefix", "/vercel/run", "--no-audit", "--no-fund", "ethers@6.17.0", "@foundry-rs/anvil@1.7.1"],
      });
      if (install.exitCode !== 0) throw new Error("The fork runner could not install its pinned execution tools.");
      const execution = await sandbox.runCommand({
        cmd: "node",
        args: ["/vercel/run/replay.mjs", "/vercel/run/input.json"],
        cwd: "/vercel/run",
      });
      if (execution.exitCode !== 0) throw new Error("The isolated fork runner exited before producing evidence.");
      result = parseRunnerOutput(await execution.stdout());
    } finally {
      await sandbox.stop();
    }

    const evidence = { scenario: "erc4626-donation-inflation", chainId: chain.chainId, blockNumber, blockHash: pinnedBlock.hash,
      contractAddress: simulation.contractAddress, codeHash: simulation.codeHash,
      outcome: result.outcome, reason: result.reason, transactions: result.transactions,
      assetAddress: result.assetAddress, stateFixture: result.stateFixture,
      observedSupply: result.observedSupply, observedAssets: result.observedAssets,
      initialSupply: result.initialSupply, initialAssets: result.initialAssets,
      seedAssets: result.seedAssets, donatedAssets: result.donatedAssets,
      victimDepositAssets: result.victimDepositAssets, victimShares: result.victimShares };
    const replay: ForkReplay = {
      ...evidence,
      scenario: "erc4626-donation-inflation",
      outcome: result.outcome!,
      reason: result.reason!,
      transactions: result.transactions!,
      evidenceHash: keccak256(toUtf8Bytes(JSON.stringify(evidence))),
      createdAt: new Date().toISOString(),
    };
    simulation.forkReplay = replay;
    await saveSimulation(simulation, session.id);
    return Response.json({ replay, sessionRemaining: quota.sessionRemaining, cached: false }, { status: 201, headers: privateResponseHeaders(session) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fork replay failed.";
    const status = message.includes("limit") || message.includes("allowance") ? 429
      : message.includes("configured") ? 503 : 502;
    return errorResponse(error, status);
  }
}
