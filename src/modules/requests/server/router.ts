import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { publishInput } from "../schemas";
import { cancelRequest, listMyRequests, publishRequests } from "./service";

export const requestsRouter = createTRPCRouter({
  mine: protectedProcedure.query(({ ctx }) =>
    listMyRequests(ctx.session.user.id),
  ),
  publish: protectedProcedure
    .input(publishInput)
    .mutation(({ ctx, input }) => publishRequests(ctx.session.user.id, input)),
  cancel: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ ctx, input }) => cancelRequest(ctx.session.user.id, input.id)),
});
