import { after } from "next/server";
import { z } from "zod";
import { publishQueueChange, publishUserChange } from "@/modules/realtime";
import {
  assistantProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import {
  claimRequest,
  currentOperation,
  releaseOperation,
  revealPassword,
  withdrawOperation,
} from "./service";

const byId = z.object({ id: z.string().min(1) });

/** After the response: the queue changed, and both people involved see it at once. */
const notify = (userIds: string[]) =>
  after(() =>
    Promise.all([publishQueueChange(), ...userIds.map(publishUserChange)]),
  );

export const operationsRouter = createTRPCRouter({
  current: assistantProcedure.query(({ ctx }) =>
    currentOperation(ctx.session.user.id),
  ),
  claim: assistantProcedure.input(byId).mutation(async ({ ctx, input }) => {
    const { ownerId } = await claimRequest(ctx.session.user.id, input.id);
    notify([ownerId, ctx.session.user.id]);
  }),
  revealPassword: assistantProcedure
    .input(byId)
    .mutation(({ ctx, input }) =>
      revealPassword(ctx.session.user.id, input.id),
    ),
  release: assistantProcedure.input(byId).mutation(async ({ ctx, input }) => {
    const { ownerId } = await releaseOperation(ctx.session.user.id, input.id);
    notify([ownerId, ctx.session.user.id]);
  }),
  withdraw: protectedProcedure.input(byId).mutation(async ({ ctx, input }) => {
    const { assistantId } = await withdrawOperation(
      ctx.session.user.id,
      input.id,
    );
    notify([assistantId, ctx.session.user.id]);
  }),
});
