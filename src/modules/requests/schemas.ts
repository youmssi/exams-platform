import { z } from "zod";

/** All the offer's modules for the full exam, or the ones still to take. */
const modules = z.array(z.string().min(1)).min(1, "pickModule");
const bonus = z.int().nonnegative();

export const publishInput = z.object({
  sessionId: z.string().min(1, "required"),
  beneficiaryIds: z.array(z.string().min(1)).min(1, "pickBeneficiary").max(5),
  modules,
  bonus,
});
export type PublishInput = z.infer<typeof publishInput>;

/** Change an open request nobody is working on: its modules, or a higher bonus. */
export const updateRequestInput = z.object({
  id: z.string().min(1),
  modules,
  bonus,
});
export type UpdateRequestInput = z.infer<typeof updateRequestInput>;
