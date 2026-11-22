import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/server/db";
import { priceBreakdown } from "../domain/pricing";

/** Cache tag of everything public read from the catalog; catalog writes expire it. */
export const CATALOG_TAG = "catalog";

/** Active offers as the public sees them: centre, level, price split and deadlines. */
export async function listPublicOffers() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const offers = await db.offer.findMany({
    where: {
      active: true,
      center: { active: true, country: { active: true } },
    },
    orderBy: [{ center: { name: "asc" } }, { level: "asc" }],
    select: {
      id: true,
      level: true,
      modules: true,
      standardPrice: true,
      commissionRateBp: true,
      commissionMin: true,
      bonusStep: true,
      bonusCap: true,
      claimTimeoutMin: true,
      confirmOnlineMin: true,
      paymentDeadlineH: true,
      center: {
        select: {
          name: true,
          city: true,
          country: { select: { code: true, currency: true } },
        },
      },
    },
  });
  return offers.map((offer) => ({ ...offer, price: priceBreakdown(offer) }));
}
