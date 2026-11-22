/** Channel names, prefixed by environment so previews never reach production clients. */
export const realtimeChannels = (environment: string, userKey: string) => ({
  /** Signals that the public queue changed; carries no data. */
  queue: `${environment}:queue`,
  /** Users present in the app, identified by an opaque key. */
  presence: `${environment}:presence`,
  /** Signals that something the user follows changed (their requests, their operation). */
  user: `${environment}:user:${userKey}`,
});

export type RealtimeChannels = ReturnType<typeof realtimeChannels>;
