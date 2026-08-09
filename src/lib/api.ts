export function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Unexpected request failure.";
  return Response.json({ error: message }, { status });
}

export async function readJsonObject(request: Request) {
  const body = (await request.json()) as unknown;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be a JSON object.");
  }
  return body as Record<string, unknown>;
}
