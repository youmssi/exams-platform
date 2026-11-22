import { z } from "zod";
import { nameSchema as name, phoneSchema } from "@/shared/schemas";

/** Messages are translation keys from the `validation` namespace. */
const optional = z.string().trim().max(80, "tooLong");

export const beneficiaryInput = z.object({
  firstName: name,
  lastName: name,
  birthDate: z.iso
    .date("date")
    .refine((date) => date < new Date().toISOString().slice(0, 10), "pastDate"),
  birthPlace: name,
  phone: phoneSchema,
  city: optional,
  district: optional,
  participantNumber: optional,
  email: z.email("email"),
  /** Empty means "keep the saved password". */
  password: z.string().max(200, "tooLong"),
  /** Required for a friend; ignored for the account holder. */
  consent: z.boolean(),
});
export type BeneficiaryInput = z.infer<typeof beneficiaryInput>;

export const newFriendInput = beneficiaryInput.refine(
  (input) => input.consent,
  { path: ["consent"], message: "consentRequired" },
);
