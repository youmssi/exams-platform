import { z } from "zod";
import { nameSchema, phoneSchema } from "@/shared/schemas";

/** Messages are translation keys from the `validation` namespace. */
export const assistantProfileInput = z.object({
  countryId: z.string().min(1, "required"),
  operator: z.string().min(1, "required"),
  momoNumber: phoneSchema,
  momoName: nameSchema,
  phone: phoneSchema,
});
export type AssistantProfileInput = z.infer<typeof assistantProfileInput>;

/** The admin's answer to an identity check; a refusal says what to fix. */
export const reviewInput = z
  .object({
    userId: z.string().min(1),
    approve: z.boolean(),
    reason: z.string().trim().max(200, "tooLong"),
  })
  .refine((input) => input.approve || input.reason.length > 0, {
    path: ["reason"],
    message: "required",
  });
