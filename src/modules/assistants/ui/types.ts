import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type AssistantProfile =
  inferRouterOutputs<AppRouter>["assistants"]["profile"];
export type PendingAssistant =
  inferRouterOutputs<AppRouter>["assistants"]["pending"][number];
