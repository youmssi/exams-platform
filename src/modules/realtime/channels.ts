/** Channel names, prefixed by environment so previews never reach production clients. */
export const realtimeChannels = (environment: string) => ({
  /** Signals that the public queue changed; carries no data. */
  queue: `${environment}:queue`,
  /** Candidates present in the app, identified by an opaque key. */
  presence: `${environment}:presence`,
});

export type RealtimeChannels = ReturnType<typeof realtimeChannels>;
