import "server-only";
import { createHmac } from "node:crypto";
import { createHttpClient } from "@ably/pubsub-server";
import { env } from "@/server/env";
import { realtimeChannels } from "../channels";

/** Server client: authenticated with the API key, so Ably counts it as a server, not a user (MAU pricing). */
const ably = env.ABLY_API_KEY ? createHttpClient(env.ABLY_API_KEY) : null;

export const isRealtimeEnabled = ably !== null;

/**
 * Opaque, stable key for a user in realtime channels and the queue:
 * assistants can tell whether a candidate is online without learning who they are.
 */
export const presenceKey = (userId: string) =>
  createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(`presence:${userId}`)
    .digest("base64url")
    .slice(0, 22);

/** The channels a user may use, or null when realtime is not configured. */
export const channelsFor = (userId: string) =>
  ably
    ? realtimeChannels(env.VERCEL_ENV ?? "development", presenceKey(userId))
    : null;

/** A "changed" signal; never fails the caller. */
async function signal(channel: string) {
  try {
    await ably?.channels.get(channel).publish("changed", null);
  } catch (error) {
    console.error(`Realtime signal not published on ${channel}`, error);
  }
}

/** Tells connected assistants to refresh the queue. */
export const publishQueueChange = () =>
  signal(realtimeChannels(env.VERCEL_ENV ?? "development", "").queue);

/** Tells a user's open tabs to refresh what they follow. */
export async function publishUserChange(userId: string) {
  const channels = channelsFor(userId);
  if (channels) await signal(channels.user);
}

/**
 * Short-lived token limited to what the user needs: their own channel, presence
 * (announce and see who is online) and, for assistants, the queue.
 */
export function createRealtimeToken(
  userId: string,
  role: "candidate" | "assistant",
) {
  const channels = channelsFor(userId);
  if (!ably || !channels) return null;
  const capability = {
    [channels.user]: ["subscribe"],
    [channels.presence]: ["presence", "subscribe"],
    ...(role === "assistant" ? { [channels.queue]: ["subscribe"] } : {}),
  };
  return ably.auth.createTokenRequest({
    clientId: presenceKey(userId),
    capability: JSON.stringify(capability),
  });
}

/** Whether the user has the app open right now; false when realtime is not configured or unreachable. */
export async function isUserOnline(userId: string) {
  const channels = channelsFor(userId);
  if (!ably || !channels) return false;
  try {
    const members = await ably.channels.get(channels.presence).presence.get({
      clientId: presenceKey(userId),
    });
    return members.items.length > 0;
  } catch (error) {
    console.error("Presence not read", error);
    return false;
  }
}
