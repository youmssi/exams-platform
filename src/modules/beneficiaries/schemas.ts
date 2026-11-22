import { z } from "zod";

/** Messages are translation keys from the `validation` namespace. */
const name = z.string().trim().min(1, "required").max(80, "tooLong");
const optional = z.string().trim().max(80, "tooLong");

export const beneficiaryInput = z.object({
  firstName: name,
  lastName: name,
  birthDate: z.iso
    .date("date")
    .refine((date) => date < new Date().toISOString().slice(0, 10), "pastDate"),
  birthPlace: name,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s.-]{8,20}$/, "phone"),
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
