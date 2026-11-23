import { after } from "next/server";
import { z } from "zod";
import { notify } from "@/modules/notifications";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { assistantProfileInput, reviewInput } from "../schemas";
import { getAssistantProfile, saveAssistantProfile } from "./service";
import {
  pendingAssistants,
  reviewAssistant,
  submitIdentity,
} from "./verification";

export const assistantsRouter = createTRPCRouter({
  profile: protectedProcedure.query(({ ctx }) =>
    getAssistantProfile(ctx.session.user.id),
  ),
  saveProfile: protectedProcedure
    .input(assistantProfileInput)
    .mutation(({ ctx, input }) =>
      saveAssistantProfile(ctx.session.user.id, input),
    ),
  submitIdentity: protectedProcedure
    .input(z.object({ path: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      submitIdentity(ctx.session.user.id, input.path),
    ),
  /** Assistants waiting for an identity check (admin). */
  pending: adminProcedure.query(() => pendingAssistants()),
  review: adminProcedure.input(reviewInput).mutation(async ({ ctx, input }) => {
    await reviewAssistant(
      ctx.session.user.id,
      input.userId,
      input.approve,
      input.reason,
    );
    after(() =>
      notify([
        {
          userId: input.userId,
          type: input.approve ? "ASSISTANT_VERIFIED" : "ASSISTANT_REJECTED",
          to: "account",
          values: { reason: input.reason },
        },
      ]),
    );
  }),
});
