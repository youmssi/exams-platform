import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { reportInput } from "../schemas";
import { createReport, myStanding } from "./service";

export const trustRouter = createTRPCRouter({
  standing: protectedProcedure.query(({ ctx }) =>
    myStanding(ctx.session.user.id),
  ),
  report: protectedProcedure
    .input(reportInput)
    .mutation(({ ctx, input }) => createReport(ctx.session.user.id, input)),
});
