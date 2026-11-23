import { z } from "zod";

/** Why an assistant hands a request back to the candidate; `OTHER` needs a short note. */
export const REPORT_REASONS = [
  "CREDENTIALS",
  "WRONG_DETAILS",
  "ACCOUNT_BLOCKED",
  "OTHER",
] as const;

/** Messages are translation keys from the `validation` namespace. */
export const reportInput = z
  .object({
    id: z.string().min(1),
    reason: z.enum(REPORT_REASONS),
    note: z.string().trim().max(140, "tooLong"),
  })
  .refine((input) => input.reason !== "OTHER" || input.note.length > 0, {
    path: ["note"],
    message: "required",
  });
export type ReportInput = z.infer<typeof reportInput>;

/** A recipient answers a declared deposit. */
export const paymentAnswerInput = z.object({
  id: z.string().min(1),
  received: z.boolean(),
});

/** The assistant's capture of the booking, already uploaded to private storage. */
export const proofInput = z.object({
  id: z.string().min(1),
  path: z.string().min(1),
});

/** The admin's decision on a dispute; the note is kept in the audit trail. */
export const decisionInput = z.object({
  id: z.string().min(1),
  outcome: z.enum(["BOOKED", "NOT_BOOKED"]),
  note: z.string().trim().max(500, "tooLong"),
});
