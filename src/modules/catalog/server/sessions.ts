import "server-only";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { zonedToUtc } from "@/shared/time-zone";
import { isConfirmedBy } from "../domain/sessions";
import type { CatalogRequestInput, SessionInput } from "../schemas";

/** Active offers with their centre and country, for pickers. */
export function listOffers() {
  return db.offer.findMany({
    where: {
      active: true,
      center: { active: true, country: { active: true } },
    },
    orderBy: [{ center: { name: "asc" } }, { level: "asc" }],
    select: {
      id: true,
      level: true,
      center: {
        select: {
          name: true,
          city: true,
          country: { select: { code: true, currency: true, timeZone: true } },
        },
      },
    },
  });
}

/** Upcoming sessions of active offers, with what the current user can do on each. */
export async function listUpcomingSessions(userId: string) {
  const today = new Date(new Date().toISOString().slice(0, 10));
  const sessions = await db.examSession.findMany({
    where: { examDate: { gte: today }, offer: { active: true } },
    orderBy: [{ examDate: "asc" }],
    select: {
      id: true,
      examDate: true,
      registrationOpensAt: true,
      officialUrl: true,
      verifiedAt: true,
      createdById: true,
      offer: {
        select: {
          id: true,
          level: true,
          modules: true,
          standardPrice: true,
          commissionRateBp: true,
          commissionMin: true,
          bonusStep: true,
          bonusCap: true,
          center: {
            select: {
              name: true,
              city: true,
              country: { select: { timeZone: true, currency: true } },
            },
          },
        },
      },
      _count: { select: { confirmations: true } },
      confirmations: { where: { userId }, select: { userId: true } },
    },
  });
  return sessions.map(({ _count, confirmations, createdById, ...session }) => ({
    ...session,
    confirmationCount: _count.confirmations,
    canConfirm:
      !session.verifiedAt &&
      createdById !== userId &&
      confirmations.length === 0,
  }));
}

/**
 * Creates a session, or returns the existing one for the same offer and date
 * so the user can join it instead of duplicating it.
 */
export async function createSession(
  userId: string,
  input: SessionInput,
  /** Set when an admin creates it: no confirmations needed. */
  verified = false,
) {
  const offer = await db.offer.findFirst({
    where: { id: input.offerId, active: true },
    select: { center: { select: { country: { select: { timeZone: true } } } } },
  });
  if (!offer) throw new TRPCError({ code: "NOT_FOUND" });

  const examDate = new Date(`${input.examDate}T00:00:00Z`);
  try {
    const session = await db.examSession.create({
      data: {
        offerId: input.offerId,
        examDate,
        registrationOpensAt: zonedToUtc(
          input.registrationOpensAt,
          offer.center.country.timeZone,
        ),
        officialUrl: input.officialUrl || null,
        createdById: userId,
        verifiedAt: verified ? new Date() : null,
      },
      select: { id: true },
    });
    return { id: session.id, existing: false };
  } catch (error) {
    if (
      !(
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
    )
      throw error;
    const existing = await db.examSession.findUniqueOrThrow({
      where: { offerId_examDate: { offerId: input.offerId, examDate } },
      select: { id: true },
    });
    return { id: existing.id, existing: true };
  }
}

/** Another user vouches for a session; enough confirmations verify it. */
export async function confirmSession(userId: string, sessionId: string) {
  return db.$transaction(async (tx) => {
    const session = await tx.examSession.findUnique({
      where: { id: sessionId },
      select: { createdById: true, verifiedAt: true },
    });
    if (!session) throw new TRPCError({ code: "NOT_FOUND" });
    if (session.createdById === userId)
      throw new TRPCError({ code: "FORBIDDEN" });
    await tx.sessionConfirmation.upsert({
      where: { sessionId_userId: { sessionId, userId } },
      create: { sessionId, userId },
      update: {},
    });
    const confirmations = await tx.sessionConfirmation.count({
      where: { sessionId },
    });
    if (!session.verifiedAt && isConfirmedBy(confirmations)) {
      await tx.examSession.update({
        where: { id: sessionId },
        data: { verifiedAt: new Date() },
      });
    }
  });
}

export function requestCatalogAddition(
  userId: string,
  input: CatalogRequestInput,
) {
  return db.catalogRequest.create({
    data: {
      requesterId: userId,
      ...input,
      officialUrl: input.officialUrl || null,
    },
    select: { id: true },
  });
}
