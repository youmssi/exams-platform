import { z } from "zod";

/** Messages are translation keys from the `validation` namespace. */
const fields = {
  fullName: z.string().trim().min(1, "required").max(120, "tooLong"),
  email: z.email("email"),
  /** Empty means "keep the saved password". */
  password: z.string().max(200, "tooLong"),
};

export const beneficiaryInput = z.object({
  ...fields,
  /** Required for a friend; ignored for the account holder. */
  consent: z.boolean(),
});
export type BeneficiaryInput = z.infer<typeof beneficiaryInput>;

export const newFriendInput = beneficiaryInput.refine(
  (input) => input.consent,
  {
    path: ["consent"],
    message: "consentRequired",
  },
);
