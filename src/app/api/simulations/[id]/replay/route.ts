import { canonicalRun, hasCanonicalRun } from "@/lib/canonical";
import { errorResponse, readJsonObject } from "@/lib/api";
import { isDemoContract, parseContractAddress } from "@/lib/simulation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await readJsonObject(request);
    const address = parseContractAddress(body.contractAddress);
    if (!isDemoContract(address)) {
      return errorResponse(new Error("Replay is limited to the canonical demo vault."), 422);
    }
    if (!hasCanonicalRun()) {
      return errorResponse(new Error("Canonical replay evidence is not ready."), 503);
    }
    return Response.json({
      simulationId: id,
      status: "passed",
      invariantHeld: canonicalRun.replay.invariantHeld,
      victimShares: canonicalRun.replay.victimShares,
      transactionHashes: canonicalRun.replay.transactionHashes,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
