import { describe, expect, it } from "vitest";
import {
  centerFeeDeadline,
  claimDeadline,
  type OperationEvent,
  type OperationStatus,
  releaseTime,
  transition,
} from "./machine";

const EVENTS: OperationEvent[] = [
  "release",
  "withdraw",
  "expire",
  "report",
  "reserve",
  "confirm",
  "dispute",
  "close",
  "lapse",
  "uphold",
  "cancel",
];
const ALLOWED: Partial<
  Record<OperationStatus, Partial<Record<OperationEvent, OperationStatus>>>
> = {
  CLAIMED: {
    release: "RELEASED",
    withdraw: "WITHDRAWN",
    expire: "EXPIRED",
    report: "REPORTED",
    reserve: "RESERVED",
  },
  RESERVED: { confirm: "CONFIRMED", dispute: "DISPUTED" },
  CONFIRMED: { close: "CLOSED", lapse: "UNPAID" },
  UNPAID: { close: "CLOSED" },
  DISPUTED: { uphold: "CONFIRMED", cancel: "CANCELLED" },
};
const STATUSES: OperationStatus[] = [
  "CLAIMED",
  "RELEASED",
  "WITHDRAWN",
  "EXPIRED",
  "REPORTED",
  "RESERVED",
  "CONFIRMED",
  "DISPUTED",
  "CLOSED",
  "UNPAID",
  "CANCELLED",
];

describe("transition", () => {
  it.each(
    STATUSES.flatMap((status) =>
      EVENTS.map((event) => [status, event] as const),
    ),
  )("%s + %s", (status, event) => {
    expect(transition(status, event)).toBe(ALLOWED[status]?.[event] ?? null);
  });
});

describe("deadlines", () => {
  const now = new Date("2027-01-10T09:00:00Z");

  it("gives the offer's time to book after a claim", () => {
    expect(claimDeadline(20, now)).toEqual(new Date("2027-01-10T09:20:00Z"));
  });

  it("frees the assistant sooner when the candidate is offline", () => {
    const offer = { confirmOnlineMin: 15, confirmOfflineMin: 5 };
    expect(releaseTime(offer, true, now)).toEqual(
      new Date("2027-01-10T09:15:00Z"),
    );
    expect(releaseTime(offer, false, now)).toEqual(
      new Date("2027-01-10T09:05:00Z"),
    );
  });

  it("counts the centre's fee deadline in days, or none", () => {
    expect(centerFeeDeadline(3, now)).toEqual(new Date("2027-01-13T09:00:00Z"));
    expect(centerFeeDeadline(0, now)).toBeNull();
  });
});
