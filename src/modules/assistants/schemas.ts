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
