import "server-only";
import { createHmac } from "node:crypto";
import * as Ably from "ably";
import { env } from "@/server/env";
import { realtimeChannels } from "../channels";

const ably = env.ABLY_API_KEY ? new Ably.Rest(env.ABLY_API_KEY) : null;

export const isRealtimeEnabled = ably !== null;

export const channels = realtimeChannels(env.VERCEL_ENV ?? "development");

/**
 * Opaque, stable key for a user in realtime channels and the queue:
 * assistants can tell whether a candidate is online without learning who they are.
 */
export const presenceKey = (userId: string) =>
  createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(`presence:${userId}`)
    .digest("base64url")
    .slice(0, 22);

/** Tells connected assistants to refresh the queue. Never fails the caller. */
export async function publishQueueChange() {
  try {
    await ably?.channels.get(channels.queue).publish("changed", null);
  } catch (error) {
    console.error("Queue change not published", error);
  }
}

/** Short-lived token limited to what the role needs: candidates announce presence, assistants listen. */
export function createRealtimeToken(
  userId: string,
  role: "candidate" | "assistant",
) {
  if (!ably) return null;
  const capability =
    role === "assistant"
      ? { [channels.queue]: ["subscribe"], [channels.presence]: ["subscribe"] }
      : { [channels.presence]: ["presence"] };
  return ably.auth.createTokenRequest({
    clientId: presenceKey(userId),
    capability: JSON.stringify(capability),
  });
}
