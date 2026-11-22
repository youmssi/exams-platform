import "server-only";
import { getSession } from "@/modules/identity";
import { createRealtimeToken } from "./realtime";

/** Tokens and refusals are per user and per moment: never cached, or a stale refusal would outlive a fix. */
const NO_STORE = { "Cache-Control": "no-store" };

/** GET /api/realtime/token — Ably calls it to (re)authenticate the signed-in user. */
export async function GET() {
  const session = await getSession();
  if (!session || session.user.banned)
    return new Response(null, { status: 401, headers: NO_STORE });
  const role =
    session.user.activeRole === "assistant" ? "assistant" : "candidate";
  const token = await createRealtimeToken(session.user.id, role);
  if (!token) return new Response(null, { status: 404, headers: NO_STORE });
  return Response.json(token, { headers: NO_STORE });
}
