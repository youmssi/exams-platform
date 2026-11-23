"use client";

import { createClient } from "@ably/pubsub-device";
import {
  ChannelProvider,
  PubSubClientProvider,
  usePresence,
} from "@ably/pubsub-device/react";
import { createContext, type ReactNode, use, useState } from "react";
import type { RealtimeChannels } from "../channels";

const ChannelsContext = createContext<RealtimeChannels | null>(null);

/** Channel names when realtime is configured, null otherwise. */
export const useRealtimeChannels = () => use(ChannelsContext);

/**
 * Opens one Ably connection per tab, authenticated by `/api/realtime/token`, and keeps the user
 * present on the presence channel while the app is open. The presence channel is provided here,
 * once: Ably refuses two nested providers for the same channel. Without channels, renders children as is.
 */
export function RealtimeProvider({
  channels,
  children,
}: {
  channels: RealtimeChannels | null;
  children: ReactNode;
}) {
  const [client] = useState(() =>
    channels
      ? createClient({
          authUrl: "/api/realtime/token",
          autoConnect: typeof window !== "undefined",
        })
      : null,
  );
  if (!client || !channels) return children;
  return (
    <PubSubClientProvider client={client}>
      <ChannelsContext value={channels}>
        <ChannelProvider channelName={channels.presence}>
          <EnterPresence channel={channels.presence} />
          {children}
        </ChannelProvider>
      </ChannelsContext>
    </PubSubClientProvider>
  );
}

function EnterPresence({ channel }: { channel: string }) {
  usePresence(channel);
  return null;
}
