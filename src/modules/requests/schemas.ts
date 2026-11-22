import { z } from "zod";

export const publishInput = z.object({
  sessionId: z.string().min(1, "required"),
  beneficiaryIds: z.array(z.string().min(1)).min(1, "pickBeneficiary").max(5),
  /** All the offer's modules for the full exam, or the ones still to take. */
  modules: z.array(z.string().min(1)).min(1, "pickModule"),
  bonus: z.int().nonnegative(),
});
export type PublishInput = z.infer<typeof publishInput>;
