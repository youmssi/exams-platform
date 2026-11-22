import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/** Signed-in, not banned. */
export const protectedProcedure = baseProcedure.use(({ ctx, next }) => {
  const { session } = ctx;
  if (!session || session.user.banned) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session } });
});

/** Admin whose session was opened with password + authenticator app. */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const { user, session } = ctx.session;
  if (user.role !== "admin" || !session.secondFactorAt) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});
