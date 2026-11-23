import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type Outputs = inferRouterOutputs<AppRouter>["admin"];
export type AdminOperation = Outputs["operations"][number];
export type AdminUser = Outputs["users"][number];
export type AuditEntry = Outputs["audit"][number];
