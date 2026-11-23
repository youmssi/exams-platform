import { z } from "zod";

export const REPORT_CATEGORIES = [
  "WRONG_SESSION",
  "ABUSE",
  "FRAUD",
  "OTHER",
] as const;

/** One choice, one optional message. Messages are translation keys from the `validation` namespace. */
export const reportInput = z.object({
  targetType: z.enum(["SESSION", "OPERATION"]),
  targetId: z.string().min(1),
  category: z.enum(REPORT_CATEGORIES),
  message: z.string().trim().max(500, "tooLong"),
});
export type ReportInput = z.infer<typeof reportInput>;
