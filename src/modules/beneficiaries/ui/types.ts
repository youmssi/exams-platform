import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type Beneficiary =
  inferRouterOutputs<AppRouter>["beneficiaries"]["list"][number];
