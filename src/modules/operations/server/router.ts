import { TRPCError } from "@trpc/server";
import { after } from "next/server";
import { z } from "zod";
import { type NotificationInput, notify } from "@/modules/notifications";
import { publishQueueChange, publishUserChange } from "@/modules/realtime";
import {
  adminProcedure,
  assistantProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import {
  decisionInput,
  paymentAnswerInput,
  proofInput,
  reportInput,
} from "../schemas";
import {
  assistantDispute,
  decideDispute,
  listDisputes,
  submitProof,
} from "./disputes";
import {
  answerPayment,
  assistantPayments,
  declarePayment,
  listBlacklist,
  platformPayments,
} from "./payments";
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

/**
 * After the response: the queue changed, both people involved see it at once, and the other
 * person gets a notification (in the app, and by email when its type calls for one).
 */
const refresh = (userIds: string[], notifications: NotificationInput[] = []) =>
  after(() =>
    Promise.all([
      publishQueueChange(),
      ...userIds.map(publishUserChange),
      notify(notifications),
    ]),
  );

/** A deposit not received asks the candidate to send it again; both received closes the operation. */
const paymentAnswered = (
  payment: Awaited<ReturnType<typeof answerPayment>>,
  received: boolean,
) => {
  const { ownerId, assistantId, reference, closed } = payment;
  const values = { reference };
  refresh(
    [ownerId, assistantId],
    !received
      ? [{ userId: ownerId, type: "PAYMENT_REJECTED", to: "requests", values }]
      : closed
        ? [
            {
              userId: ownerId,
              type: "OPERATION_CLOSED",
              to: "requests",
              values,
            },
            {
              userId: assistantId,
              type: "OPERATION_CLOSED",
              to: "queue",
              values,
            },
          ]
        : [],
  );
};

export const operationsRouter = createTRPCRouter({
  current: assistantProcedure.query(({ ctx }) =>
    currentOperation(ctx.session.user.id),
  ),
  claim: assistantProcedure.input(byId).mutation(async ({ ctx, input }) => {
    const { ownerId } = await claimRequest(ctx.session.user.id, input.id);
    refresh(
      [ctx.session.user.id],
      [{ userId: ownerId, type: "REQUEST_CLAIMED", to: "requests" }],
    );
  }),
  reveal: assistantProcedure
    .input(byId.extend({ detail: z.enum(["password", "phone"]) }))
    .mutation(({ ctx, input }) =>
      revealDetail(ctx.session.user.id, input.id, input.detail),
    ),
  release: assistantProcedure.input(byId).mutation(async ({ ctx, input }) => {
    const { ownerId } = await releaseOperation(ctx.session.user.id, input.id);
    refresh(
      [ctx.session.user.id],
      [{ userId: ownerId, type: "REQUEST_RETURNED", to: "requests" }],
    );
  }),
  reserve: assistantProcedure.input(byId).mutation(async ({ ctx, input }) => {
    const { ownerId } = await reserveOperation(ctx.session.user.id, input.id);
    refresh(
      [ctx.session.user.id],
      [{ userId: ownerId, type: "BOOKING_DECLARED", to: "requests" }],
    );
  }),
  report: assistantProcedure
    .input(reportInput)
    .mutation(async ({ ctx, input }) => {
      const { ownerId } = await reportProblem(ctx.session.user.id, input);
      refresh(
        [ctx.session.user.id],
        [{ userId: ownerId, type: "PROBLEM_REPORTED", to: "requests" }],
      );
    }),
  withdraw: protectedProcedure.input(byId).mutation(async ({ ctx, input }) => {
    const { assistantId } = await withdrawOperation(
      ctx.session.user.id,
      input.id,
    );
    refresh([assistantId, ctx.session.user.id]);
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
      refresh(
        [ctx.session.user.id],
        [
          {
            userId: assistantId,
            type:
              input.answer === "confirm"
                ? "BOOKING_CONFIRMED"
                : "DISPUTE_OPENED",
            to: "queue",
          },
        ],
      );
    }),
  /** The candidate sent one deposit. */
  declarePayment: protectedProcedure
    .input(byId)
    .mutation(async ({ ctx, input }) => {
      const { ownerId, assistantId, recipient, reference } =
        await declarePayment(ctx.session.user.id, input.id);
      refresh(
        [ownerId, assistantId],
        recipient === "ASSISTANT"
          ? [
              {
                userId: assistantId,
                type: "PAYMENT_DECLARED",
                to: "queue",
                values: { reference },
              },
            ]
          : [],
      );
    }),
  /** The assistant's shares still to receive. */
  payments: assistantProcedure.query(({ ctx }) =>
    assistantPayments(ctx.session.user.id),
  ),
  answerPayment: assistantProcedure
    .input(paymentAnswerInput)
    .mutation(async ({ ctx, input }) => {
      paymentAnswered(
        await answerPayment(
          ctx.session.user.id,
          input.id,
          input.received,
          "ASSISTANT",
        ),
        input.received,
      );
    }),
  /** Commissions still to receive (admin). */
  platformPayments: adminProcedure.query(() => platformPayments()),
  answerPlatformPayment: adminProcedure
    .input(paymentAnswerInput)
    .mutation(async ({ ctx, input }) => {
      paymentAnswered(
        await answerPayment(
          ctx.session.user.id,
          input.id,
          input.received,
          "PLATFORM",
        ),
        input.received,
      );
    }),
  /** The assistant's undecided dispute, if any. */
  dispute: assistantProcedure.query(({ ctx }) =>
    assistantDispute(ctx.session.user.id),
  ),
  submitProof: assistantProcedure
    .input(proofInput)
    .mutation(async ({ ctx, input }) => {
      const { ownerId } = await submitProof(
        ctx.session.user.id,
        input.id,
        input.path,
      );
      refresh([ownerId]);
    }),
  /** Accounts with an unpaid booking, without personal data. */
  blacklist: assistantProcedure.query(() => listBlacklist()),
  disputes: adminProcedure.query(() => listDisputes()),
  decideDispute: adminProcedure
    .input(decisionInput)
    .mutation(async ({ ctx, input }) => {
      const { ownerId, assistantId, strike } = await decideDispute(
        ctx.session.user.id,
        input.id,
        input.outcome,
        input.note,
      );
      const values = { outcome: input.outcome };
      refresh(
        [],
        [
          { userId: ownerId, type: "DISPUTE_DECIDED", to: "requests", values },
          { userId: assistantId, type: "DISPUTE_DECIDED", to: "queue", values },
          strike,
        ],
      );
    }),
});
