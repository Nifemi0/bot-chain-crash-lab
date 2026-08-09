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
      return errorResponse(new Error("Patch generation is limited to the canonical demo vault."), 422);
    }
    if (!hasCanonicalRun() || !canonicalRun.contracts.patchedVault) {
      return errorResponse(new Error("Canonical patched vault has not been deployed yet."), 503);
    }
    return Response.json({
      simulationId: id,
      status: "compiled",
      patchedVaultAddress: canonicalRun.contracts.patchedVault,
      strategy: "virtual assets + virtual shares + zero-share rejection",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
