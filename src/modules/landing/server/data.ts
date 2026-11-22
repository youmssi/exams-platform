import "server-only";
import { connection } from "next/server";
import { listPublicOffers } from "@/modules/catalog";

/**
 * Catalogue data for the landing page, read at request time (never at build) and served
 * from the catalog cache, which admin edits expire.
 */
export async function getLandingOffers() {
  await connection();
  return listPublicOffers();
}

/** Deadlines shown publicly: those of the first offer, as every level shares the defaults. */
export const publicRules = (
  offers: Awaited<ReturnType<typeof listPublicOffers>>,
) => {
  const [offer] = offers;
  return offer
    ? {
        claim: offer.claimTimeoutMin,
        confirm: offer.confirmOnlineMin,
        payment: offer.paymentDeadlineH,
      }
    : null;
};
