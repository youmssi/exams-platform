import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

type Outputs = inferRouterOutputs<AppRouter>;
export type UpcomingSession = Outputs["catalog"]["sessions"][number];
export type MyRequest = Outputs["requests"]["mine"][number];
