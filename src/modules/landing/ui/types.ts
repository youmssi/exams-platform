import type { listPublicOffers } from "@/modules/catalog";

/** An offer as the landing page receives it (centre, level, price split, deadlines). */
export type PublicOffer = Awaited<ReturnType<typeof listPublicOffers>>[number];
