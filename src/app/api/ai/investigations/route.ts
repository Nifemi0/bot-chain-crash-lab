import { errorResponse, readJsonObject } from "@/lib/api";
import { runContractInvestigation } from "@/lib/ai/contract-agent";
import { getBrowserSession, privateResponseHeaders } from "@/lib/session";
import { claimAiInvestigationQuota, getSimulation, saveSimulation } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    if (simulation.aiInvestigation) {
      return Response.json(
        { investigation: simulation.aiInvestigation, sessionRemaining: null, cached: true },
        { headers: privateResponseHeaders(session) },
      );
    }

    const quota = await claimAiInvestigationQuota(session.id);
    const investigation = await runContractInvestigation(simulation);
    simulation.aiInvestigation = investigation;
    await saveSimulation(simulation, session.id);

    return Response.json(
      { investigation, sessionRemaining: quota.sessionRemaining, cached: false },
      { status: 201, headers: privateResponseHeaders(session) },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI investigation failed.";
    const status = message.includes("limit") || message.includes("allowance") ? 429
      : message.includes("configured") ? 503
        : 502;
    return errorResponse(error, status);
  }
}
