import "server-only";
import { db } from "@/server/db";

/** Active public offers for the landing-page price preview. */
export function listPublicPricing() {
  return db.offer.findMany({
    where: {
      active: true,
      center: { active: true, country: { active: true } },
    },
    orderBy: [{ center: { name: "asc" } }, { level: "asc" }],
    select: {
      id: true,
      level: true,
      standardPrice: true,
      center: {
        select: {
          name: true,
          city: true,
          country: { select: { currency: true } },
        },
      },
    },
    take: 3,
  });
}
