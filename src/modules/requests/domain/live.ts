/** A request still counts for its session until it is cancelled or closed elsewhere. */
export const LIVE_STATUSES = ["OPEN", "BOOKED"] as const;

/** Beneficiaries who already have a live request for this session (one request per person and session). */
export const requestedFor = (
  requests: { sessionId: string; beneficiaryId: string; status: string }[],
  sessionId: string,
) =>
  new Set(
    requests
      .filter(
        (request) =>
          request.sessionId === sessionId &&
          (LIVE_STATUSES as readonly string[]).includes(request.status),
      )
      .map((request) => request.beneficiaryId),
  );
