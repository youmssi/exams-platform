import { z } from "zod";

/** Operation statuses the admin filters on, as the overview groups them. */
export const OPERATION_FILTERS = [
  "active",
  "toConfirm",
  "toPay",
  "disputed",
  "unpaid",
  "closed",
  "all",
] as const;
export type OperationFilter = (typeof OPERATION_FILTERS)[number];

export const userSearchInput = z.object({ query: z.string().trim().max(100) });

export const userActionInput = z.object({
  userId: z.string().min(1),
  action: z.enum([
    "suspend",
    "unsuspend",
    "ban",
    "unban",
    "revokeSessions",
    "delete",
  ]),
});
export type UserAction = z.infer<typeof userActionInput>["action"];
