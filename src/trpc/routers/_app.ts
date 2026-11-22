import { beneficiariesRouter } from "@/modules/beneficiaries";
import { catalogRouter } from "@/modules/catalog";
import { identityRouter } from "@/modules/identity";
import { operationsRouter } from "@/modules/operations";
import { requestsRouter } from "@/modules/requests";
import { systemRouter } from "@/modules/system";
import { createTRPCRouter } from "../init";

/**
 * Root router. Each module exposes its router from its public `index.ts`
 * and is mounted here under its own namespace.
 */
export const appRouter = createTRPCRouter({
  beneficiaries: beneficiariesRouter,
  catalog: catalogRouter,
  identity: identityRouter,
  operations: operationsRouter,
  requests: requestsRouter,
  system: systemRouter,
});

export type AppRouter = typeof appRouter;
