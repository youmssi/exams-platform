import { TRPCError } from "@trpc/server";
import { after } from "next/server";
import { z } from "zod";
import { publishQueueChange, publishUserChange } from "@/modules/realtime";
import {
  assistantProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { reportInput } from "../schemas";
import {
  answerBooking,
  claimRequest,
  currentOperation,
  releaseOperation,
  reportProblem,
  reserveOperation,
  revealDetail,
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
  reveal: assistantProcedure
    .input(byId.extend({ detail: z.enum(["password", "phone"]) }))
    .mutation(({ ctx, input }) =>
      revealDetail(ctx.session.user.id, input.id, input.detail),
    ),
  release: assistantProcedure.input(byId).mutation(async ({ ctx, input }) => {
    const { ownerId } = await releaseOperation(ctx.session.user.id, input.id);
    notify([ownerId, ctx.session.user.id]);
  }),
  reserve: assistantProcedure.input(byId).mutation(async ({ ctx, input }) => {
    const { ownerId } = await reserveOperation(ctx.session.user.id, input.id);
    notify([ownerId, ctx.session.user.id]);
  }),
  report: assistantProcedure
    .input(reportInput)
    .mutation(async ({ ctx, input }) => {
      const { ownerId } = await reportProblem(ctx.session.user.id, input);
      notify([ownerId, ctx.session.user.id]);
    }),
  withdraw: protectedProcedure.input(byId).mutation(async ({ ctx, input }) => {
    const { assistantId } = await withdrawOperation(
      ctx.session.user.id,
      input.id,
    );
    notify([assistantId, ctx.session.user.id]);
  }),
  /** The candidate confirms the centre's email, or disputes after the checklist. */
  answer: protectedProcedure
    .input(
      byId.extend({
        answer: z.enum(["confirm", "dispute"]),
        /** Required to dispute: the candidate checked every point of the list. */
        checked: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.answer === "dispute" && !input.checked)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "checklistRequired",
        });
      const { assistantId } = await answerBooking(
        ctx.session.user.id,
        input.id,
        input.answer,
      );
      notify([assistantId, ctx.session.user.id]);
    }),
});
