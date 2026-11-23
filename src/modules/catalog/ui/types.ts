import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/trpc/routers/_app";

export type AdminCatalog =
  inferRouterOutputs<AppRouter>["catalog"]["adminList"];
export type AdminCountry = AdminCatalog[number];
export type AdminCenter = AdminCountry["centers"][number];
export type AdminOffer = AdminCenter["offers"][number];
export type SessionReviewData =
  inferRouterOutputs<AppRouter>["catalog"]["sessionReview"];
export type DateProposalRow = SessionReviewData["proposals"][number];
