import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { onboardingSchema, roleSchema } from "../schemas";
import { completeOnboarding, setActiveRole } from "./service";

export const identityRouter = createTRPCRouter({
  completeOnboarding: protectedProcedure
    .input(onboardingSchema)
    .mutation(({ ctx, input }) =>
      completeOnboarding(ctx.session.user.id, input),
    ),
  setActiveRole: protectedProcedure
    .input(roleSchema)
    .mutation(({ ctx, input }) =>
      setActiveRole(ctx.session.user.id, input.role),
    ),
});
