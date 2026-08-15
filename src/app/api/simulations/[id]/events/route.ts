import { createSimulationEvents, parseContractAddress } from "@/lib/simulation";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const searchParams = new URL(request.url).searchParams;
  const addressValue = searchParams.get("address");

  try {
    const address = parseContractAddress(addressValue);
    const profile = searchParams.get("profile")?.slice(0, 80) || "Custom smart contract";
    const numberParam = (name: string, maximum: number) => {
      const value = Number.parseInt(searchParams.get(name) ?? "0", 10);
      return Number.isFinite(value) ? Math.min(Math.max(value, 0), maximum) : 0;
    };
    const events = createSimulationEvents(address, undefined, {
      label: profile,
      runtimeBytes: numberParam("bytes", 100_000),
      checkCount: numberParam("checks", 100),
      cautionCount: numberParam("cautions", 100),
    });
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (const event of events) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ ...event, simulationId: id })}\n\n`),
          );
          await new Promise((resolve) => setTimeout(resolve, 180));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Event stream failed." },
      { status: 400 },
    );
  }
}
