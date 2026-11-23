import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  emailPreferences,
  listNotifications,
  markAllRead,
  setEmailUpdates,
} from "./service";

export const notificationsRouter = createTRPCRouter({
  list: protectedProcedure.query(({ ctx }) =>
    listNotifications(ctx.session.user.id),
  ),
  markAllRead: protectedProcedure.mutation(({ ctx }) =>
    markAllRead(ctx.session.user.id),
  ),
  preferences: protectedProcedure.query(({ ctx }) =>
    emailPreferences(ctx.session.user.id),
  ),
  setEmailUpdates: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(({ ctx, input }) =>
      setEmailUpdates(ctx.session.user.id, input.enabled),
    ),
});
