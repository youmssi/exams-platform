import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";
import {
  OPERATION_FILTERS,
  userActionInput,
  userSearchInput,
} from "../schemas";
import { listOperations } from "./operations";
import { overview } from "./overview";
import { listAudit, listInbox, markHandled } from "./reports";
import { applyUserAction, searchUsers } from "./users";

/** Back office (EXM-012): admin role and a session opened with the second factor. */
export const adminRouter = createTRPCRouter({
  overview: adminProcedure.query(() => overview()),
  operations: adminProcedure
    .input(z.object({ filter: z.enum(OPERATION_FILTERS) }))
    .query(({ input }) => listOperations(input.filter)),
  users: adminProcedure
    .input(userSearchInput)
    .query(({ input }) => searchUsers(input.query)),
  userAction: adminProcedure
    .input(userActionInput)
    .mutation(({ ctx, input }) =>
      applyUserAction(ctx.session.user.id, input.userId, input.action),
    ),
  inbox: adminProcedure.query(() => listInbox()),
  handle: adminProcedure
    .input(
      z.object({
        kind: z.enum(["report", "catalogRequest"]),
        id: z.string().min(1),
      }),
    )
    .mutation(({ ctx, input }) =>
      markHandled(ctx.session.user.id, input.kind, input.id),
    ),
  audit: adminProcedure.query(() => listAudit()),
});
