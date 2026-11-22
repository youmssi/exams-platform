import { cache } from "react";
import { getSession } from "@/modules/identity";

/** @see https://trpc.io/docs/server/context */
export const createTRPCContext = cache(async () => ({
  session: await getSession(),
}));

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
