import { canonicalRun, hasCanonicalRun } from "@/lib/canonical";
import { errorResponse, readJsonObject } from "@/lib/api";
import { publishDynamicPassport } from "@/lib/passport";
import { parseContractAddress } from "@/lib/simulation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await readJsonObject(request);
    const protocol = parseContractAddress(body.contractAddress);
    const sourceHash = String(body.sourceHash ?? "");
    const reportHash = String(body.reportHash ?? "");

    if (process.env.PASSPORT_PUBLISH_ENABLED !== "true") {
      if (!hasCanonicalRun()) {
        return errorResponse(new Error("Canonical Passport evidence is not ready."), 503);
      }
      return Response.json({
        requestSimulationId: id,
        mode: "canonical",
        ...canonicalRun.passport,
      });
    }

    const publishKey = request.headers.get("x-crash-lab-publish-key");
    if (!process.env.PASSPORT_PUBLISH_KEY || publishKey !== process.env.PASSPORT_PUBLISH_KEY) {
      return errorResponse(new Error("Dynamic Passport publishing requires an authorized key."), 401);
    }
    const result = await publishDynamicPassport({
      simulationId: id,
      protocol,
      sourceHash,
      reportHash,
    });
    return Response.json({ simulationId: id, mode: "dynamic", ...result }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
