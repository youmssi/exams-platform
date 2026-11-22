/**
 * Operation lifecycle. An assistant claims a request, then books it before the deadline (EXM-008),
 * releases it, or loses it when the deadline passes; the candidate can withdraw it meanwhile.
 */
export type OperationStatus = "CLAIMED" | "RELEASED" | "WITHDRAWN" | "EXPIRED";
export type OperationEvent = "release" | "withdraw" | "expire";

const TRANSITIONS: Record<
  OperationStatus,
  Partial<Record<OperationEvent, OperationStatus>>
> = {
  CLAIMED: { release: "RELEASED", withdraw: "WITHDRAWN", expire: "EXPIRED" },
  RELEASED: {},
  WITHDRAWN: {},
  EXPIRED: {},
};

/** The next status, or null when the event is not allowed. */
export const transition = (
  status: OperationStatus,
  event: OperationEvent,
): OperationStatus | null => TRANSITIONS[status][event] ?? null;

/** Deadline to book after a claim, from the offer's setting. */
export const claimDeadline = (claimTimeoutMin: number, now = new Date()) =>
  new Date(now.getTime() + claimTimeoutMin * 60_000);
