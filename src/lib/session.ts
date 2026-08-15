const SESSION_COOKIE = "crash_lab_session";
const SESSION_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type BrowserSession = {
  id: string;
  setCookie?: string;
};

function readCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  for (const part of cookies.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

export function getBrowserSession(request: Request): BrowserSession {
  const existing = readCookie(request, SESSION_COOKIE);
  if (existing && SESSION_PATTERN.test(existing)) return { id: existing };

  const id = crypto.randomUUID();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return {
    id,
    setCookie: `${SESSION_COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`,
  };
}

export function privateResponseHeaders(session: BrowserSession) {
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    Vary: "Cookie",
  });
  if (session.setCookie) headers.set("Set-Cookie", session.setCookie);
  return headers;
}
