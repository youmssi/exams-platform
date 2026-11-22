import { catalogRouter } from "@/modules/catalog";
import { identityRouter } from "@/modules/identity";
import { systemRouter } from "@/modules/system";
import { createTRPCRouter } from "../init";

/**
 * Root router. Each module exposes its router from its public `index.ts`
 * and is mounted here under its own namespace.
 */
export const appRouter = createTRPCRouter({
  catalog: catalogRouter,
  identity: identityRouter,
  system: systemRouter,
});

export type AppRouter = typeof appRouter;
