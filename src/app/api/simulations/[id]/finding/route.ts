import { canonicalFinding, parseContractAddress } from "@/lib/simulation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const address = parseContractAddress(new URL(request.url).searchParams.get("address"));
    return Response.json({ simulationId: id, finding: canonicalFinding(address) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Finding unavailable." },
      { status: 400 },
    );
  }
}
