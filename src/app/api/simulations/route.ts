import { errorResponse, readJsonObject } from "@/lib/api";
import { inspectBotChainContract } from "@/lib/rpc";
import { createSimulation, parseContractAddress } from "@/lib/simulation";
import { getBrowserSession, privateResponseHeaders } from "@/lib/session";
import { listSimulations, saveSimulation } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = getBrowserSession(request);
    const requestedLimit = Number(new URL(request.url).searchParams.get("limit") ?? 30);
    const simulations = await listSimulations(session.id, Number.isFinite(requestedLimit) ? requestedLimit : 30);
    return Response.json({ simulations }, { headers: privateResponseHeaders(session) });
  } catch (error) {
    return errorResponse(error, 503);
  }
}

export async function POST(request: Request) {
  try {
    const session = getBrowserSession(request);
    const body = await readJsonObject(request);
    const address = parseContractAddress(body.contractAddress);
    const { bytecode, analysis } = await inspectBotChainContract(address);
    const simulation = createSimulation({ address, bytecode, analysis });
    await saveSimulation(simulation, session.id);
    return Response.json(simulation, {
      status: 201,
      headers: privateResponseHeaders(session),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis could not be created.";
    const status = message.startsWith("No deployed contract") ? 422 : 400;
    return errorResponse(error, status);
  }
}
