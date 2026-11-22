import { TRPCError } from "@trpc/server";
import { after } from "next/server";
import { z } from "zod";
import { publishQueueChange } from "@/modules/realtime";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { publishInput } from "../schemas";
import { listQueue } from "./queue";
import { cancelRequest, listMyRequests, publishRequests } from "./service";

/** Assistants see the queue; candidates never do. */
const assistantProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.activeRole !== "assistant")
    throw new TRPCError({ code: "FORBIDDEN" });
  return next();
});

/** After a change to the queue, connected assistants refresh it once the response is sent. */
const notifyQueue = <T>(result: T) => {
  after(publishQueueChange);
  return result;
};

export const requestsRouter = createTRPCRouter({
  mine: protectedProcedure.query(({ ctx }) =>
    listMyRequests(ctx.session.user.id),
  ),
  publish: protectedProcedure
    .input(publishInput)
    .mutation(async ({ ctx, input }) =>
      notifyQueue(await publishRequests(ctx.session.user.id, input)),
    ),
  cancel: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) =>
      notifyQueue(await cancelRequest(ctx.session.user.id, input.id)),
    ),
  queue: assistantProcedure.query(({ ctx }) => listQueue(ctx.session.user.id)),
});
