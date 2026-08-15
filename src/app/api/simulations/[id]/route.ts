import { errorResponse } from "@/lib/api";
import { getBrowserSession, privateResponseHeaders } from "@/lib/session";
import { getSimulation } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = getBrowserSession(request);
    const { id } = await params;
    if (!/^0x[0-9a-f]{64}$/i.test(id)) {
      return errorResponse(new Error("Invalid analysis ID."), 400);
    }
    const simulation = await getSimulation(id, session.id);
    if (!simulation) {
      return errorResponse(new Error("Analysis was not found."), 404);
    }
    return Response.json(simulation, { headers: privateResponseHeaders(session) });
  } catch (error) {
    return errorResponse(error, 503);
  }
}
