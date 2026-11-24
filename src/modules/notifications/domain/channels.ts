/**
 * Which channel each notification uses (EXM-011). Everything shows in the app; email only for what
 * has a deadline or a consequence. Follow-up emails can be turned off, critical ones cannot.
 */
export type NotificationType =
  | "REQUEST_CLAIMED"
  | "REQUEST_RETURNED"
  | "BOOKING_DECLARED"
  | "PROBLEM_REPORTED"
  | "BOOKING_CONFIRMED"
  | "DISPUTE_OPENED"
  | "PAYMENT_DECLARED"
  | "PAYMENT_REJECTED"
  | "OPERATION_CLOSED"
  | "DISPUTE_DECIDED"
  | "STRIKE"
  | "ASSISTANT_VERIFIED"
  | "ASSISTANT_REJECTED"
  | "PAYMENT_REMINDER";

export type EmailLevel = "none" | "update" | "critical";

export const EMAIL_LEVEL: Record<NotificationType, EmailLevel> = {
  REQUEST_CLAIMED: "none",
  REQUEST_RETURNED: "none",
  BOOKING_DECLARED: "update",
  PROBLEM_REPORTED: "update",
  BOOKING_CONFIRMED: "none",
  DISPUTE_OPENED: "critical",
  PAYMENT_DECLARED: "update",
  PAYMENT_REJECTED: "critical",
  OPERATION_CLOSED: "none",
  DISPUTE_DECIDED: "critical",
  STRIKE: "critical",
  ASSISTANT_VERIFIED: "update",
  ASSISTANT_REJECTED: "update",
  PAYMENT_REMINDER: "critical",
};

export const shouldEmail = (type: NotificationType, emailUpdates: boolean) =>
  EMAIL_LEVEL[type] === "critical" ||
  (EMAIL_LEVEL[type] === "update" && emailUpdates);

/** Where each notification leads: the page where the recipient acts on it. */
export type NotificationTarget = "requests" | "queue" | "account";
