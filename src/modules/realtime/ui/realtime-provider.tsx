"use client";

import { createClient } from "@ably/pubsub-device";
import { PubSubClientProvider } from "@ably/pubsub-device/react";
import { createContext, type ReactNode, use, useState } from "react";
import type { RealtimeChannels } from "../channels";

const ChannelsContext = createContext<RealtimeChannels | null>(null);

/** Channel names when realtime is configured, null otherwise. */
export const useRealtimeChannels = () => use(ChannelsContext);

/** Opens one Ably connection per tab, authenticated by `/api/realtime/token`. Without channels, renders children as is. */
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
  if (!client) return children;
  return (
    <PubSubClientProvider client={client}>
      <ChannelsContext value={channels}>{children}</ChannelsContext>
    </PubSubClientProvider>
  );
}
