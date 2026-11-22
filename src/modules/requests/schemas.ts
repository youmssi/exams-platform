import { z } from "zod";

export const publishInput = z.object({
  sessionId: z.string().min(1, "required"),
  beneficiaryIds: z.array(z.string().min(1)).min(1, "pickBeneficiary").max(5),
  bonus: z.int().nonnegative(),
});
export type PublishInput = z.infer<typeof publishInput>;
