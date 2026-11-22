import { describe, expect, it } from "vitest";
import {
  claimDeadline,
  type OperationEvent,
  type OperationStatus,
  transition,
} from "./machine";

const events: OperationEvent[] = ["release", "withdraw", "expire"];
const ended: OperationStatus[] = ["RELEASED", "WITHDRAWN", "EXPIRED"];

describe("transition", () => {
  it.each([
    ["release", "RELEASED"],
    ["withdraw", "WITHDRAWN"],
    ["expire", "EXPIRED"],
  ] as const)("a claimed operation can %s", (event, next) => {
    expect(transition("CLAIMED", event)).toBe(next);
  });

  it.each(
    ended.flatMap((status) => events.map((event) => [status, event] as const)),
  )("an ended operation (%s) refuses %s", (status, event) => {
    expect(transition(status, event)).toBeNull();
  });
});

describe("claimDeadline", () => {
  it("adds the offer's timeout", () => {
    const now = new Date("2027-01-10T09:00:00Z");
    expect(claimDeadline(20, now)).toEqual(new Date("2027-01-10T09:20:00Z"));
  });
});
