/**
 * Settlement of a confirmed booking: the candidate sends two deposits (the assistant's share and
 * the platform's commission), each recipient confirms its own. Amounts come from the request's
 * frozen price.
 */
export type PaymentRecipient = "ASSISTANT" | "PLATFORM";
export type PaymentStatus = "DUE" | "DECLARED" | "RECEIVED";

/** The two deposits, in the order the candidate sees them. */
export const paymentsFor = (request: {
  assistantShare: number;
  commission: number;
}): { recipient: PaymentRecipient; amount: number }[] => [
  { recipient: "ASSISTANT", amount: request.assistantShare },
  { recipient: "PLATFORM", amount: request.commission },
];

/** Short reference the candidate writes in the transfer, so each recipient can match it. */
export const paymentReference = (operationId: string) =>
  `EX-${operationId.slice(-6).toUpperCase()}`;

/** Both deposits must be received before this time. */
export const paymentDeadline = (paymentDeadlineH: number, confirmedAt: Date) =>
  new Date(confirmedAt.getTime() + paymentDeadlineH * 3_600_000);

/** The operation closes once every deposit is received. */
export const isSettled = (payments: { status: PaymentStatus }[]) =>
  payments.length > 0 &&
  payments.every((payment) => payment.status === "RECEIVED");

/** What the candidate still has to send across their bookings. */
export const amountDue = (
  payments: { status: PaymentStatus; amount: number }[],
) =>
  payments
    .filter((payment) => payment.status === "DUE")
    .reduce((sum, payment) => sum + payment.amount, 0);
