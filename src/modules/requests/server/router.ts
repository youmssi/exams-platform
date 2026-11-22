import { after } from "next/server";
import { z } from "zod";
import { publishQueueChange } from "@/modules/realtime";
import {
  assistantProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { publishInput } from "../schemas";
import { listQueue } from "./queue";
import {
  cancelRequest,
  listMyRequests,
  markBookedElsewhere,
  publishRequests,
} from "./service";

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
  bookedElsewhere: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) =>
      notifyQueue(await markBookedElsewhere(ctx.session.user.id, input.id)),
    ),
  queue: assistantProcedure.query(({ ctx }) => listQueue(ctx.session.user.id)),
});
