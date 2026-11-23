import { z } from "zod";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { beneficiaryInput, newFriendInput } from "../schemas";
import { answerConsent, consentInfo, resendConsent } from "./consent";
import {
  addFriend,
  listBeneficiaries,
  removeBeneficiary,
  updateBeneficiary,
} from "./service";

const byToken = z.object({ token: z.string().min(20).max(100) });

const byId = z.object({ id: z.string().min(1) });

export const beneficiariesRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) =>
    listBeneficiaries(ctx.session.user),
  ),
  add: protectedProcedure
    .input(newFriendInput)
    .mutation(({ ctx, input }) => addFriend(ctx.session.user.id, input)),
  update: protectedProcedure
    .input(byId.extend({ data: beneficiaryInput }))
    .mutation(({ ctx, input }) =>
      updateBeneficiary(ctx.session.user.id, input.id, input.data),
    ),
  remove: protectedProcedure
    .input(byId)
    .mutation(({ ctx, input }) =>
      removeBeneficiary(ctx.session.user.id, input.id),
    ),
  resendConsent: protectedProcedure
    .input(byId)
    .mutation(({ ctx, input }) => resendConsent(ctx.session.user.id, input.id)),
  /** Public: the friend opens the emailed link, without an account. */
  consentInfo: baseProcedure
    .input(byToken)
    .query(({ input }) => consentInfo(input.token)),
  answerConsent: baseProcedure
    .input(byToken.extend({ accept: z.boolean() }))
    .mutation(({ input }) => answerConsent(input.token, input.accept)),
});
