import { createSimulationEvents, parseContractAddress } from "@/lib/simulation";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const addressValue = new URL(request.url).searchParams.get("address");

  try {
    const address = parseContractAddress(addressValue);
    const events = createSimulationEvents(address);
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
