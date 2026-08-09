import { errorResponse, readJsonObject } from "@/lib/api";
import { getVerifiedBytecode } from "@/lib/rpc";
import { createSimulation, parseContractAddress } from "@/lib/simulation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const address = parseContractAddress(body.contractAddress);
    const bytecode = await getVerifiedBytecode(address);
    const simulation = createSimulation({ address, bytecode });
    return Response.json(simulation, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Simulation could not be created.";
    const status = message.startsWith("No deployed contract") ? 422 : 400;
    return errorResponse(error, status);
  }
}
