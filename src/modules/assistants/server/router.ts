import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { assistantProfileInput } from "../schemas";
import { getAssistantProfile, saveAssistantProfile } from "./service";

export const assistantsRouter = createTRPCRouter({
  profile: protectedProcedure.query(({ ctx }) =>
    getAssistantProfile(ctx.session.user.id),
  ),
  saveProfile: protectedProcedure
    .input(assistantProfileInput)
    .mutation(({ ctx, input }) =>
      saveAssistantProfile(ctx.session.user.id, input),
    ),
});
