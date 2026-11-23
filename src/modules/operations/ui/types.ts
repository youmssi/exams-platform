import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type Outputs = inferRouterOutputs<AppRouter>;
export type PaymentRow = Outputs["operations"]["payments"][number];
export type DisputeRow = Outputs["operations"]["disputes"][number];
