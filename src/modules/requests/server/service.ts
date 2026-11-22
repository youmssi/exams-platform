import "server-only";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@/generated/prisma/client";
import { displayName, isReadyToBook } from "@/modules/beneficiaries";
import {
  bookedModules,
  isFullExam,
  isValidBonus,
  priceBreakdown,
} from "@/modules/catalog";
import { activeOperation, centerFeeDeadline } from "@/modules/operations";
import { presenceKey } from "@/modules/realtime";
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
  if (!session || !session.offer.active)
    throw new TRPCError({ code: "NOT_FOUND" });
  if (session.examDate < new Date(new Date().toISOString().slice(0, 10))) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "sessionPast" });
  }
  if (!isValidBonus(session.offer, input.bonus)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "invalidBonus" });
  }
  const modules = bookedModules(session.offer.modules, input.modules);
  if (!modules)
    throw new TRPCError({ code: "BAD_REQUEST", message: "invalidModules" });

  const beneficiaries = await db.beneficiary.findMany({
    where: { id: { in: input.beneficiaryIds }, ownerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      birthPlace: true,
      phone: true,
      passwordCipher: true,
    },
  });
  if (beneficiaries.length !== input.beneficiaryIds.length)
    throw new TRPCError({ code: "NOT_FOUND" });
  if (
    beneficiaries.some(
      ({ passwordCipher, ...profile }) =>
        !isReadyToBook({ ...profile, hasPassword: passwordCipher !== null }),
    )
  ) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "incompleteProfile" });
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
        modules,
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
      modules: true,
      credentialsRejectedAt: true,
      beneficiary: { select: { firstName: true, lastName: true, email: true } },
      operations: {
        // The claim in progress, or the booking the candidate answers or pays.
        where: {
          OR: [
            activeOperation(),
            { status: { in: ["RESERVED", "CONFIRMED", "DISPUTED"] } },
          ],
        },
        orderBy: { claimedAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          claimedAt: true,
          deadlineAt: true,
          confirmedAt: true,
          assistantId: true,
        },
      },
      session: {
        select: {
          examDate: true,
          offer: {
            select: {
              level: true,
              modules: true,
              centerFeeDays: true,
              center: {
                select: {
                  name: true,
                  city: true,
                  country: { select: { timeZone: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  return requests.map(
    ({ beneficiary, operations: [operation], ...request }) => ({
      ...request,
      operation: operation && {
        id: operation.id,
        status: operation.status,
        claimedAt: operation.claimedAt,
        deadlineAt: operation.deadlineAt,
        assistantKey: presenceKey(operation.assistantId),
        centerFeeDeadline:
          operation.confirmedAt &&
          centerFeeDeadline(
            request.session.offer.centerFeeDays,
            operation.confirmedAt,
          ),
      },
      beneficiaryName: displayName(beneficiary),
      beneficiaryEmail: beneficiary.email,
      isFullExam: isFullExam(request.session.offer.modules, request.modules),
      visibility: requestVisibility(request.publishAt),
    }),
  );
}

/** The candidate got a seat another way: closes an open request nobody is working on. */
export async function markBookedElsewhere(ownerId: string, id: string) {
  const { count } = await db.request.updateMany({
    where: {
      id,
      ownerId,
      status: "OPEN",
      operations: { none: activeOperation() },
    },
    data: { status: "ELSEWHERE", version: { increment: 1 } },
  });
  if (!count) throw new TRPCError({ code: "NOT_FOUND" });
}

/** Only an open request nobody is working on can be cancelled; withdraw it from the assistant first. */
export async function cancelRequest(ownerId: string, id: string) {
  const { count } = await db.request.updateMany({
    where: {
      id,
      ownerId,
      status: "OPEN",
      operations: { none: activeOperation() },
    },
    data: { status: "CANCELLED", version: { increment: 1 } },
  });
  if (!count) throw new TRPCError({ code: "NOT_FOUND" });
}
