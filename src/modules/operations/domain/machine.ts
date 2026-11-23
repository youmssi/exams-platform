/**
 * Operation lifecycle. An assistant claims a request and books it before the deadline,
 * releases it, reports refused credentials, or loses it when the deadline passes; the
 * candidate can withdraw it meanwhile. Once booked, the candidate confirms the centre's
 * email or disputes the booking (handled in EXM-010). A confirmed booking is paid in two
 * deposits: received in time, it closes; otherwise it becomes unpaid until it is settled.
 */
export type OperationStatus =
  | "CLAIMED"
  | "RELEASED"
  | "WITHDRAWN"
  | "EXPIRED"
  | "REPORTED"
  | "RESERVED"
  | "CONFIRMED"
  | "DISPUTED"
  | "CLOSED"
  | "UNPAID";
export type OperationEvent =
  | "release"
  | "withdraw"
  | "expire"
  | "report"
  | "reserve"
  | "confirm"
  | "dispute"
  | "close"
  | "lapse";

const TRANSITIONS: Record<
  OperationStatus,
  Partial<Record<OperationEvent, OperationStatus>>
> = {
  CLAIMED: {
    release: "RELEASED",
    withdraw: "WITHDRAWN",
    expire: "EXPIRED",
    report: "REPORTED",
    reserve: "RESERVED",
  },
  RESERVED: { confirm: "CONFIRMED", dispute: "DISPUTED" },
  RELEASED: {},
  WITHDRAWN: {},
  EXPIRED: {},
  REPORTED: {},
  CONFIRMED: { close: "CLOSED", lapse: "UNPAID" },
  UNPAID: { close: "CLOSED" },
  DISPUTED: {},
  CLOSED: {},
};

/** The next status, or null when the event is not allowed. */
export const transition = (
  status: OperationStatus,
  event: OperationEvent,
): OperationStatus | null => TRANSITIONS[status][event] ?? null;

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60_000);

/** Deadline to book after a claim, from the offer's setting. */
export const claimDeadline = (claimTimeoutMin: number, now = new Date()) =>
  addMinutes(now, claimTimeoutMin);

/**
 * When a booked operation frees the assistant: sooner when the candidate is offline,
 * so an absent candidate never blocks the assistant.
 */
export const releaseTime = (
  offer: { confirmOnlineMin: number; confirmOfflineMin: number },
  candidateOnline: boolean,
  now = new Date(),
) =>
  addMinutes(
    now,
    candidateOnline ? offer.confirmOnlineMin : offer.confirmOfflineMin,
  );

/** Last day to pay the exam fees to the centre, or null when the offer does not say. */
export const centerFeeDeadline = (centerFeeDays: number, confirmedAt: Date) =>
  centerFeeDays > 0
    ? new Date(confirmedAt.getTime() + centerFeeDays * 86_400_000)
    : null;
