import { canonicalFinding, parseContractAddress } from "@/lib/simulation";
import { inspectBotChainContract } from "@/lib/rpc";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const address = parseContractAddress(new URL(request.url).searchParams.get("address"));
    const { analysis } = await inspectBotChainContract(address);
    return Response.json({ simulationId: id, finding: canonicalFinding(address, analysis), analysis });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Finding unavailable." },
      { status: 400 },
    );
  }
}
