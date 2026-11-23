import { assistantsRouter } from "@/modules/assistants";
import { beneficiariesRouter } from "@/modules/beneficiaries";
import { catalogRouter } from "@/modules/catalog";
import { identityRouter } from "@/modules/identity";
import { notificationsRouter } from "@/modules/notifications";
import { operationsRouter } from "@/modules/operations";
import { requestsRouter } from "@/modules/requests";
import { systemRouter } from "@/modules/system";
import { trustRouter } from "@/modules/trust";
import { createTRPCRouter } from "../init";

/**
 * Root router. Each module exposes its router from its public `index.ts`
 * and is mounted here under its own namespace.
 */
export const appRouter = createTRPCRouter({
  assistants: assistantsRouter,
  beneficiaries: beneficiariesRouter,
  catalog: catalogRouter,
  identity: identityRouter,
  notifications: notificationsRouter,
  operations: operationsRouter,
  requests: requestsRouter,
  system: systemRouter,
  trust: trustRouter,
});

export type AppRouter = typeof appRouter;
