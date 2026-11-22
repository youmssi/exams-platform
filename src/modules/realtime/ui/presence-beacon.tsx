"use client";

import { ChannelProvider, usePresence } from "@ably/pubsub-device/react";
import { useRealtimeChannels } from "./realtime-provider";

/** Marks the signed-in candidate as online while the app is open. */
export function PresenceBeacon() {
  const channels = useRealtimeChannels();
  if (!channels) return null;
  return (
    <ChannelProvider channelName={channels.presence}>
      <EnterPresence channel={channels.presence} />
    </ChannelProvider>
  );
}

function EnterPresence({ channel }: { channel: string }) {
  usePresence(channel);
  return null;
}
