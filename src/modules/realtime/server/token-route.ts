import "server-only";
import { getSession } from "@/modules/identity";
import { createRealtimeToken } from "./realtime";

/** GET /api/realtime/token — Ably calls it to (re)authenticate the signed-in user. */
export async function GET() {
  const session = await getSession();
  if (!session || session.user.banned)
    return new Response(null, { status: 401 });
  const role =
    session.user.activeRole === "assistant" ? "assistant" : "candidate";
  const token = await createRealtimeToken(session.user.id, role);
  if (!token) return new Response(null, { status: 404 });
  return Response.json(token, { headers: { "Cache-Control": "no-store" } });
}
