"use client";

import {
  ChannelProvider,
  useChannel,
  useConnectionStateListener,
  usePresenceListener,
} from "@ably/pubsub-device/react";
import { type ReactNode, useState } from "react";
import type { RealtimeChannels } from "../channels";
import { useRealtimeChannels } from "./realtime-provider";

export type LiveState = {
  /** Live updates are flowing; otherwise the caller polls. */
  live: boolean;
  /** Realtime is configured but the connection dropped. */
  offline: boolean;
  /** Presence keys of users currently in the app. */
  online: ReadonlySet<string>;
};

type Props = {
  /** `queue` for the public queue (assistants), `user` for the signed-in user's own updates. */
  source: "queue" | "user";
  onChange: () => void;
  children: (state: LiveState) => ReactNode;
};

const NOT_LIVE: LiveState = { live: false, offline: false, online: new Set() };
const OFFLINE_STATES = new Set(["disconnected", "suspended", "failed"]);

/** Change signals from one channel, plus who is online. Without realtime, children get a polling state. */
export function LiveUpdates({ source, onChange, children }: Props) {
  const channels = useRealtimeChannels();
  if (!channels) return children(NOT_LIVE);
  return (
    <ChannelProvider channelName={channels[source]}>
      <ChannelProvider channelName={channels.presence}>
        <Live channels={channels} source={source} onChange={onChange}>
          {children}
        </Live>
      </ChannelProvider>
    </ChannelProvider>
  );
}

function Live({
  channels,
  source,
  onChange,
  children,
}: Props & { channels: RealtimeChannels }) {
  const [state, setState] = useState("initialized");
  useConnectionStateListener((change) => setState(change.current));
  useChannel(channels[source], onChange);
  const { presenceData } = usePresenceListener(channels.presence);
  return children({
    live: state === "connected",
    offline: OFFLINE_STATES.has(state),
    online: new Set(presenceData.map((member) => member.clientId)),
  });
}
