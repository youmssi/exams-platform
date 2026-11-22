import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

/**
 * Request context. The auth session is added in EXM-002.
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = cache(async () => {
  return {};
});

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
