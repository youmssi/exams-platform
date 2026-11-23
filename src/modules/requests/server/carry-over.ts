import "server-only";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@/generated/prisma/client";
import { bookedModules, priceBreakdown } from "@/modules/catalog";
import { activeOperation } from "@/modules/operations";
import { db } from "@/server/db";
import {
  autoCarryTarget,
  carriedBonus,
  laterSessions,
} from "../domain/carry-over";
import { publishAtFor } from "../domain/visibility";

const today = () => new Date(new Date().toISOString().slice(0, 10));

const carrySelect = {
  id: true,
  ownerId: true,
  beneficiaryId: true,
  modules: true,
  bonus: true,
  carryOver: true,
  session: { select: { examDate: true, offerId: true } },
} satisfies Prisma.RequestSelect;
type Carried = Prisma.RequestGetPayload<{ select: typeof carrySelect }>;

/** Upcoming sessions of these offers, to pick carry-over targets from. */
export function upcomingSessionsOf(offerIds: string[]) {
  return db.examSession.findMany({
    where: { offerId: { in: offerIds }, examDate: { gte: today() } },
    select: { id: true, offerId: true, examDate: true, verifiedAt: true },
  });
}

/**
 * Checked when data is read (and by the daily job): open requests whose session passed without a
 * booking become "unbooked", then move to the next confirmed session when the candidate allowed it.
 */
export async function sweepUnbooked(where: Prisma.RequestWhereInput = {}) {
  await db.request.updateMany({
    where: {
      ...where,
      status: "OPEN",
      session: { examDate: { lt: today() } },
      operations: { none: activeOperation() },
    },
    data: { status: "UNBOOKED", version: { increment: 1 } },
  });
  const waiting = await db.request.findMany({
    where: { ...where, status: "UNBOOKED", carryOver: true, carriedTo: null },
    select: carrySelect,
  });
  if (!waiting.length) return;
  const sessions = await upcomingSessionsOf([
    ...new Set(waiting.map((request) => request.session.offerId)),
  ]);
  for (const request of waiting) {
    const target = autoCarryTarget(
      sessions.filter((session) => session.offerId === request.session.offerId),
      request.session.examDate,
    );
    if (target) await carry(request, target.id).catch(skipDuplicate);
  }
}

const isDuplicate = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

/** The person already has an open request for that session: nothing to carry. */
const skipDuplicate = (error: unknown) => {
  if (!isDuplicate(error)) throw error;
};

/**
 * A new request for the target session, same person, modules and bonus, priced from today's
 * catalogue. Fails with a unique-constraint error when the person already has an open request there.
 */
async function carry(request: Carried, sessionId: string) {
  const session = await db.examSession.findUniqueOrThrow({
    where: { id: sessionId },
    select: {
      registrationOpensAt: true,
      offer: {
        select: {
          modules: true,
          standardPrice: true,
          commissionRateBp: true,
          commissionMin: true,
          bonusStep: true,
          bonusCap: true,
          center: { select: { country: { select: { currency: true } } } },
        },
      },
    },
  });
  const { offer } = session;
  const bonus = carriedBonus(request.bonus, offer);
  const price = priceBreakdown(offer, bonus);
  await db.request.create({
    data: {
      sessionId,
      beneficiaryId: request.beneficiaryId,
      ownerId: request.ownerId,
      carriedFromId: request.id,
      carryOver: request.carryOver,
      publishAt: publishAtFor(session.registrationOpensAt),
      modules: bookedModules(offer.modules, request.modules) ?? offer.modules,
      currency: offer.center.country.currency,
      standardPrice: offer.standardPrice,
      bonus,
      total: price.total,
      commission: price.commission,
      assistantShare: price.assistantShare,
    },
  });
}

/** The candidate moves an unbooked request to a later session of the same centre and level. */
export async function carryRequest(
  ownerId: string,
  id: string,
  sessionId: string,
) {
  const request = await db.request.findFirst({
    where: {
      id,
      ownerId,
      carriedTo: null,
      status: "UNBOOKED",
    },
    select: carrySelect,
  });
  if (!request) throw new TRPCError({ code: "NOT_FOUND" });
  const sessions = await upcomingSessionsOf([request.session.offerId]);
  if (
    !laterSessions(sessions, request.session.examDate).some(
      (session) => session.id === sessionId,
    )
  )
    throw new TRPCError({ code: "BAD_REQUEST", message: "invalidSession" });
  try {
    await carry(request, sessionId);
  } catch (error) {
    if (isDuplicate(error))
      throw new TRPCError({ code: "CONFLICT", message: "alreadyRequested" });
    throw error;
  }
}
