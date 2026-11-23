import { describe, expect, it } from "vitest";
import { decisionEffects, disputeStep, isReadyForReview } from "./dispute";

describe("dispute", () => {
  it("numbers the steps from the opening", () => {
    expect(disputeStep("PROOF_REQUESTED")).toBe(2);
    expect(disputeStep("REVIEW")).toBe(3);
    expect(disputeStep("DECIDED")).toBe(4);
  });

  it("is ready for review once the proof is sent or late", () => {
    const now = new Date("2027-01-10T12:00:00Z");
    const before = new Date("2027-01-10T11:00:00Z");
    const after = new Date("2027-01-10T13:00:00Z");
    expect(
      isReadyForReview({ status: "PROOF_REQUESTED", proofDueAt: after }, now),
    ).toBe(false);
    expect(
      isReadyForReview({ status: "PROOF_REQUESTED", proofDueAt: before }, now),
    ).toBe(true);
    expect(isReadyForReview({ status: "REVIEW", proofDueAt: after }, now)).toBe(
      true,
    );
    expect(
      isReadyForReview({ status: "DECIDED", proofDueAt: before }, now),
    ).toBe(false);
  });

  it("warns the candidate when the booking was made, the assistant otherwise", () => {
    expect(decisionEffects("BOOKED")).toEqual({
      event: "uphold",
      warn: "candidate",
      reason: "ABUSIVE_DISPUTE",
    });
    expect(decisionEffects("NOT_BOOKED")).toEqual({
      event: "cancel",
      warn: "assistant",
      reason: "AT_FAULT",
    });
  });
});
