import "server-only";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@/generated/prisma/client";
import { isValidBonus, priceBreakdown } from "@/modules/catalog";
import { db } from "@/server/db";
import { publishAtFor, requestVisibility } from "../domain/visibility";
import type { PublishInput } from "../schemas";

/**
 * Creates one request per beneficiary, with the price frozen from the offer.
 * Requests stay hidden from assistants until registrations open.
 */
export async function publishRequests(ownerId: string, input: PublishInput) {
  const session = await db.examSession.findUnique({
    where: { id: input.sessionId },
    select: {
      examDate: true,
      registrationOpensAt: true,
      offer: {
        select: {
          active: true,
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
  if (!session || !session.offer.active)
    throw new TRPCError({ code: "NOT_FOUND" });
  if (session.examDate < new Date(new Date().toISOString().slice(0, 10))) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "sessionPast" });
  }
  if (!isValidBonus(session.offer, input.bonus)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "invalidBonus" });
  }

  const beneficiaries = await db.beneficiary.findMany({
    where: { id: { in: input.beneficiaryIds }, ownerId },
    select: { id: true, passwordCipher: true },
  });
  if (beneficiaries.length !== input.beneficiaryIds.length)
    throw new TRPCError({ code: "NOT_FOUND" });
  if (beneficiaries.some((beneficiary) => !beneficiary.passwordCipher)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "missingPassword" });
  }

  const price = priceBreakdown(session.offer, input.bonus);
  const publishAt = publishAtFor(session.registrationOpensAt);
  try {
    await db.request.createMany({
      data: beneficiaries.map((beneficiary) => ({
        sessionId: input.sessionId,
        beneficiaryId: beneficiary.id,
        ownerId,
        publishAt,
        currency: session.offer.center.country.currency,
        standardPrice: session.offer.standardPrice,
        bonus: input.bonus,
        total: price.total,
        commission: price.commission,
        assistantShare: price.assistantShare,
      })),
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new TRPCError({ code: "CONFLICT", message: "alreadyRequested" });
    }
    throw error;
  }
  return {
    count: beneficiaries.length,
    publishAt,
    total: price.total * beneficiaries.length,
  };
}

export async function listMyRequests(ownerId: string) {
  const requests = await db.request.findMany({
    where: { ownerId },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      status: true,
      publishAt: true,
      currency: true,
      bonus: true,
      total: true,
      beneficiary: { select: { fullName: true } },
      session: {
        select: {
          examDate: true,
          offer: {
            select: {
              level: true,
              center: { select: { name: true, city: true } },
            },
          },
        },
      },
    },
  });
  return requests.map((request) => ({
    ...request,
    visibility: requestVisibility(request.publishAt),
  }));
}

/** Only an open request can be cancelled (before an assistant takes it — EXM-007). */
export async function cancelRequest(ownerId: string, id: string) {
  const { count } = await db.request.updateMany({
    where: { id, ownerId, status: "OPEN" },
    data: { status: "CANCELLED", version: { increment: 1 } },
  });
  if (!count) throw new TRPCError({ code: "NOT_FOUND" });
}
