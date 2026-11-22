"use client";

import * as Ably from "ably";
import { AblyProvider } from "ably/react";
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
      ? new Ably.Realtime({
          authUrl: "/api/realtime/token",
          autoConnect: typeof window !== "undefined",
        })
      : null,
  );
  if (!client) return children;
  return (
    <AblyProvider client={client}>
      <ChannelsContext value={channels}>{children}</ChannelsContext>
    </AblyProvider>
  );
}
