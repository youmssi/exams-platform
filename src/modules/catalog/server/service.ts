import "server-only";
import { TRPCError } from "@trpc/server";
import { revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db";
import type { CenterInput, CountryInput, OfferInput } from "../schemas";
import { CATALOG_TAG } from "./public";

/** Countries with their centers and offers, for the back office. */
export function listCatalog() {
  return db.country.findMany({
    orderBy: { code: "asc" },
    include: {
      centers: {
        orderBy: { name: "asc" },
        include: { offers: { orderBy: { level: "asc" } } },
      },
    },
  });
}

type Tx = Prisma.TransactionClient;
type Row = { id: string };

/**
 * Runs a catalog write and its audit entry in one transaction.
 * `find` loads the current row for updates; unique-constraint errors become CONFLICT.
 */
async function audited<T extends Row>(
  actorId: string,
  targetType: "country" | "center" | "offer",
  id: string | undefined,
  find: (tx: Tx, id: string) => Promise<T | null>,
  write: (tx: Tx) => Promise<T>,
) {
  try {
    const saved = await db.$transaction(async (tx) => {
      const before = id ? await find(tx, id) : null;
      if (id && !before) throw new TRPCError({ code: "NOT_FOUND" });
      const after = await write(tx);
      await recordAudit(tx, {
        actorId,
        action: `${targetType}.${id ? "update" : "create"}`,
        targetType,
        targetId: after.id,
        before,
        after,
      });
      return after;
    });
    // Public pages (landing prices, centres) show the change.
    revalidateTag(CATALOG_TAG, "max");
    return saved;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new TRPCError({ code: "CONFLICT", message: "duplicate" });
    }
    throw error;
  }
}

export const saveCountry = (actorId: string, data: CountryInput, id?: string) =>
  audited(
    actorId,
    "country",
    id,
    (tx, id) => tx.country.findUnique({ where: { id } }),
    (tx) =>
      id
        ? tx.country.update({ where: { id }, data })
        : tx.country.create({ data }),
  );

export const saveCenter = (actorId: string, data: CenterInput, id?: string) =>
  audited(
    actorId,
    "center",
    id,
    (tx, id) => tx.center.findUnique({ where: { id } }),
    (tx) =>
      id
        ? tx.center.update({ where: { id }, data })
        : tx.center.create({ data }),
  );

/** Offer changes only affect requests published afterwards: each request keeps its own price snapshot. */
export const saveOffer = (actorId: string, data: OfferInput, id?: string) =>
  audited(
    actorId,
    "offer",
    id,
    (tx, id) => tx.offer.findUnique({ where: { id } }),
    (tx) =>
      id ? tx.offer.update({ where: { id }, data }) : tx.offer.create({ data }),
  );
