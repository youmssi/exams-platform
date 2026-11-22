import "server-only";
import { TRPCError } from "@trpc/server";
import { type OperationStatus, Prisma } from "@/generated/prisma/client";
import { displayName } from "@/modules/beneficiaries";
import { isFullExam } from "@/modules/catalog";
import { presenceKey } from "@/modules/realtime";
import { recordAudit } from "@/server/audit";
import { decryptSecret } from "@/server/crypto";
import { db } from "@/server/db";
import {
  claimDeadline,
  type OperationEvent,
  transition,
} from "../domain/machine";

type Client = Prisma.TransactionClient | typeof db;

/** An operation still running: claimed and before its deadline. */
export const activeOperation = (now = new Date()) =>
  ({
    status: "CLAIMED",
    deadlineAt: { gt: now },
  }) satisfies Prisma.OperationWhereInput;

/**
 * Deadlines are checked when data is read: overdue claims end here, so the request is back
 * in the queue and the assistant is free (product decision, EXM-007).
 */
async function expireOverdue(
  client: Client,
  where: Prisma.OperationWhereInput,
) {
  const now = new Date();
  await client.operation.updateMany({
    where: { ...where, status: "CLAIMED", deadlineAt: { lte: now } },
    data: {
      status: next("CLAIMED", "expire"),
      endedAt: now,
      version: { increment: 1 },
    },
  });
}

function next(status: OperationStatus, event: OperationEvent) {
  const to = transition(status, event);
  if (!to)
    throw new TRPCError({ code: "CONFLICT", message: "invalidTransition" });
  return to;
}

/** Atomic claim: the partial unique indexes guarantee one active operation per request and per assistant. */
export async function claimRequest(assistantId: string, requestId: string) {
  return db.$transaction(async (tx) => {
    await expireOverdue(tx, { OR: [{ requestId }, { assistantId }] });
    const now = new Date();
    const request = await tx.request.findFirst({
      where: {
        id: requestId,
        status: "OPEN",
        publishAt: { lte: now },
        ownerId: { not: assistantId },
        session: {
          examDate: { gte: new Date(now.toISOString().slice(0, 10)) },
        },
      },
      select: {
        ownerId: true,
        session: { select: { offer: { select: { claimTimeoutMin: true } } } },
      },
    });
    if (!request)
      throw new TRPCError({ code: "CONFLICT", message: "alreadyTaken" });
    try {
      await tx.operation.create({
        data: {
          requestId,
          assistantId,
          deadlineAt: claimDeadline(request.session.offer.claimTimeoutMin, now),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const busy = await tx.operation.count({
          where: { assistantId, ...activeOperation(now) },
        });
        throw new TRPCError({
          code: "CONFLICT",
          message: busy ? "busy" : "alreadyTaken",
        });
      }
      throw error;
    }
    return { ownerId: request.ownerId };
  });
}

/** The assistant's running operation, with what they need to book. Never the password. */
export async function currentOperation(assistantId: string) {
  await expireOverdue(db, { assistantId });
  const operation = await db.operation.findFirst({
    where: { assistantId, ...activeOperation() },
    select: {
      id: true,
      claimedAt: true,
      deadlineAt: true,
      request: {
        select: {
          ownerId: true,
          modules: true,
          currency: true,
          assistantShare: true,
          bonus: true,
          beneficiary: {
            select: {
              firstName: true,
              lastName: true,
              birthDate: true,
              birthPlace: true,
              phone: true,
              city: true,
              district: true,
              participantNumber: true,
              email: true,
            },
          },
          session: {
            select: {
              examDate: true,
              officialUrl: true,
              offer: {
                select: {
                  level: true,
                  modules: true,
                  center: {
                    select: { name: true, city: true, officialUrl: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!operation) return null;
  const { ownerId, beneficiary, ...request } = operation.request;
  return {
    ...operation,
    request: {
      ...request,
      isFullExam: isFullExam(request.session.offer.modules, request.modules),
      beneficiary: { ...beneficiary, name: displayName(beneficiary) },
    },
    candidateKey: presenceKey(ownerId),
  };
}

/** Decrypts the exam-centre password for the assistant of the running operation; every read is audited. */
export async function revealPassword(assistantId: string, operationId: string) {
  const operation = await db.operation.findFirst({
    where: { id: operationId, assistantId, ...activeOperation() },
    select: {
      request: {
        select: { beneficiary: { select: { passwordCipher: true } } },
      },
    },
  });
  const cipher = operation?.request.beneficiary.passwordCipher;
  if (!cipher) throw new TRPCError({ code: "NOT_FOUND" });
  await recordAudit(db, {
    actorId: assistantId,
    action: "operation.revealPassword",
    targetType: "operation",
    targetId: operationId,
  });
  return { password: decryptSecret(cipher) };
}

/** Ends a running operation; the request goes back to the queue. Returns the candidate to notify. */
async function endOperation(
  where: Prisma.OperationWhereInput,
  event: "release" | "withdraw",
) {
  const operation = await db.operation.findFirst({
    where: { ...where, ...activeOperation() },
    select: {
      id: true,
      version: true,
      assistantId: true,
      request: { select: { ownerId: true } },
    },
  });
  if (!operation) throw new TRPCError({ code: "NOT_FOUND" });
  const { count } = await db.operation.updateMany({
    where: { id: operation.id, version: operation.version, status: "CLAIMED" },
    data: {
      status: next("CLAIMED", event),
      endedAt: new Date(),
      version: { increment: 1 },
    },
  });
  if (!count)
    throw new TRPCError({ code: "CONFLICT", message: "invalidTransition" });
  return {
    ownerId: operation.request.ownerId,
    assistantId: operation.assistantId,
  };
}

export const releaseOperation = (assistantId: string, id: string) =>
  endOperation({ id, assistantId }, "release");

export const withdrawOperation = (ownerId: string, id: string) =>
  endOperation({ id, request: { ownerId } }, "withdraw");
