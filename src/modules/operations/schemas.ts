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
