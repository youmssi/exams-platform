"use client";

import {
  ChannelProvider,
  useChannel,
  useConnectionStateListener,
  usePresenceListener,
} from "ably/react";
import { type ReactNode, useState } from "react";
import type { RealtimeChannels } from "../channels";
import { useRealtimeChannels } from "./realtime-provider";

export type QueueLiveState = {
  /** Live updates are flowing; otherwise the caller polls. */
  live: boolean;
  /** Realtime is configured but the connection dropped. */
  offline: boolean;
  /** Presence keys of candidates currently in the app. */
  online: ReadonlySet<string>;
};

type Props = {
  onChange: () => void;
  children: (state: QueueLiveState) => ReactNode;
};

const NOT_LIVE: QueueLiveState = {
  live: false,
  offline: false,
  online: new Set(),
};
const OFFLINE_STATES = new Set(["disconnected", "suspended", "failed"]);

/** Queue change signals and candidate presence, for assistants. */
export function QueueChannel({ onChange, children }: Props) {
  const channels = useRealtimeChannels();
  if (!channels) return children(NOT_LIVE);
  return (
    <ChannelProvider channelName={channels.queue}>
      <ChannelProvider channelName={channels.presence}>
        <LiveQueue channels={channels} onChange={onChange}>
          {children}
        </LiveQueue>
      </ChannelProvider>
    </ChannelProvider>
  );
}

function LiveQueue({
  channels,
  onChange,
  children,
}: Props & { channels: RealtimeChannels }) {
  const [state, setState] = useState("initialized");
  useConnectionStateListener((change) => setState(change.current));
  useChannel(channels.queue, onChange);
  const { presenceData } = usePresenceListener(channels.presence);
  return children({
    live: state === "connected",
    offline: OFFLINE_STATES.has(state),
    online: new Set(presenceData.map((member) => member.clientId)),
  });
}
