/**
 * A dispute goes through named steps; the outcome decides what happens to the booking and who
 * gets a strike (spec §6.4 and §9).
 */
export type DisputeStatus = "PROOF_REQUESTED" | "REVIEW" | "DECIDED";
export type DisputeOutcome = "BOOKED" | "NOT_BOOKED";

/** Steps shown to both parties: opened → proof requested → under review → decided. */
export const DISPUTE_STEPS = [
  "OPENED",
  "PROOF_REQUESTED",
  "REVIEW",
  "DECIDED",
] as const;

export const disputeStep = (status: DisputeStatus) =>
  DISPUTE_STEPS.indexOf(status) + 1;

/** Proof sent or its deadline passed: the admin can decide. */
export const isReadyForReview = (
  dispute: { status: DisputeStatus; proofDueAt: Date },
  now = new Date(),
) =>
  dispute.status === "REVIEW" ||
  (dispute.status === "PROOF_REQUESTED" && dispute.proofDueAt <= now);

/** What a decision does: the booking stands (candidate warned) or not (assistant warned). */
export const decisionEffects = (outcome: DisputeOutcome) =>
  outcome === "BOOKED"
    ? ({
        event: "uphold",
        warn: "candidate",
        reason: "ABUSIVE_DISPUTE",
      } as const)
    : ({ event: "cancel", warn: "assistant", reason: "AT_FAULT" } as const);
