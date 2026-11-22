import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { beneficiaryInput, newFriendInput } from "../schemas";
import {
  addFriend,
  listBeneficiaries,
  removeBeneficiary,
  updateBeneficiary,
} from "./service";

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
});
