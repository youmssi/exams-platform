import "server-only";
import { TRPCError } from "@trpc/server";
import { type OperationStatus, Prisma } from "@/generated/prisma/client";
import { isAssistantReady } from "@/modules/assistants";
import { displayName } from "@/modules/beneficiaries";
import { isFullExam } from "@/modules/catalog";
import { isUserOnline, presenceKey } from "@/modules/realtime";
import { recordAudit } from "@/server/audit";
import { decryptSecret } from "@/server/crypto";
import { db } from "@/server/db";
import {
  claimDeadline,
  type OperationEvent,
  releaseTime,
  transition,
} from "../domain/machine";
import type { ReportInput } from "../schemas";

type Client = Prisma.TransactionClient | typeof db;

/** An operation still running: claimed and before its deadline. */
export const activeOperation = (now = new Date()) =>
  ({
    status: "CLAIMED",
    deadlineAt: { gt: now },
  }) satisfies Prisma.OperationWhereInput;

/** What keeps an assistant busy: a running claim, or a booking still waiting for the candidate. */
export const assistantBusy = (now = new Date()) =>
  ({
    OR: [activeOperation(now), { status: "RESERVED", releaseAt: { gt: now } }],
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
  if (!(await isAssistantReady(assistantId)))
    throw new TRPCError({ code: "FORBIDDEN", message: "profileIncomplete" });
  return db.$transaction(async (tx) => {
    await expireOverdue(tx, { OR: [{ requestId }, { assistantId }] });
    const now = new Date();
    if (
      await tx.operation.count({
        where: { assistantId, ...assistantBusy(now) },
      })
    )
      throw new TRPCError({ code: "CONFLICT", message: "busy" });
    const request = await tx.request.findFirst({
      where: {
        issue: null,
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

/** The assistant's running operation, with what they need to book. Never the password or the phone. */
export async function currentOperation(assistantId: string) {
  await expireOverdue(db, { assistantId });
  const operation = await db.operation.findFirst({
    where: { assistantId, ...assistantBusy() },
    select: {
      id: true,
      status: true,
      claimedAt: true,
      deadlineAt: true,
      reservedAt: true,
      releaseAt: true,
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

/**
 * Shows a protected detail to the assistant of the running operation: the exam-centre password
 * (only while booking) or the candidate's phone. Every read is audited.
 */
export async function revealDetail(
  assistantId: string,
  operationId: string,
  detail: "password" | "phone",
) {
  const operation = await db.operation.findFirst({
    where: {
      id: operationId,
      assistantId,
      ...(detail === "password" ? activeOperation() : assistantBusy()),
    },
    select: {
      request: {
        select: {
          beneficiary: { select: { passwordCipher: true, phone: true } },
        },
      },
    },
  });
  const beneficiary = operation?.request.beneficiary;
  const value =
    detail === "password"
      ? beneficiary?.passwordCipher && decryptSecret(beneficiary.passwordCipher)
      : beneficiary?.phone;
  if (!value) throw new TRPCError({ code: "NOT_FOUND" });
  await recordAudit(db, {
    actorId: assistantId,
    action: `operation.reveal.${detail}`,
    targetType: "operation",
    targetId: operationId,
  });
  return { value };
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

/** The running claim of this assistant, or NOT_FOUND. */
async function runningClaim(assistantId: string, id: string) {
  const operation = await db.operation.findFirst({
    where: { id, assistantId, ...activeOperation() },
    select: {
      id: true,
      version: true,
      requestId: true,
      request: {
        select: {
          ownerId: true,
          session: {
            select: {
              offer: {
                select: { confirmOnlineMin: true, confirmOfflineMin: true },
              },
            },
          },
        },
      },
    },
  });
  if (!operation) throw new TRPCError({ code: "NOT_FOUND" });
  return operation;
}

/** The candidate's view of things decides how long the assistant stays bound to them. */
export async function reserveOperation(assistantId: string, id: string) {
  const operation = await runningClaim(assistantId, id);
  const online = await isUserOnline(operation.request.ownerId);
  const now = new Date();
  await db.$transaction(async (tx) => {
    const { count } = await tx.operation.updateMany({
      where: { id, version: operation.version, status: "CLAIMED" },
      data: {
        status: next("CLAIMED", "reserve"),
        reservedAt: now,
        releaseAt: releaseTime(operation.request.session.offer, online, now),
        version: { increment: 1 },
      },
    });
    if (!count)
      throw new TRPCError({ code: "CONFLICT", message: "invalidTransition" });
    await tx.request.update({
      where: { id: operation.requestId },
      data: { status: "BOOKED", version: { increment: 1 } },
    });
  });
  return { ownerId: operation.request.ownerId };
}

/**
 * The assistant cannot book as is (credentials refused, wrong details, blocked account…): no
 * penalty, the request waits for the candidate to fix it. Every report is audited so the admin
 * can spot an assistant who drops requests this way.
 */
export async function reportProblem(
  assistantId: string,
  { id, reason, note }: ReportInput,
) {
  const operation = await runningClaim(assistantId, id);
  const now = new Date();
  await db.$transaction(async (tx) => {
    const { count } = await tx.operation.updateMany({
      where: { id, version: operation.version, status: "CLAIMED" },
      data: {
        status: next("CLAIMED", "report"),
        endedAt: now,
        version: { increment: 1 },
      },
    });
    if (!count)
      throw new TRPCError({ code: "CONFLICT", message: "invalidTransition" });
    await tx.request.update({
      where: { id: operation.requestId },
      data: {
        issue: reason,
        issueNote: reason === "OTHER" ? note : null,
        issueAt: now,
        version: { increment: 1 },
      },
    });
    await recordAudit(tx, {
      actorId: assistantId,
      action: "operation.report",
      targetType: "operation",
      targetId: id,
      after: { reason },
    });
  });
  return { ownerId: operation.request.ownerId };
}

/** The candidate answers a booking: email received, or disputed (the dispute itself is EXM-010). */
export async function answerBooking(
  ownerId: string,
  id: string,
  answer: "confirm" | "dispute",
) {
  const operation = await db.operation.findFirst({
    where: { id, status: "RESERVED", request: { ownerId } },
    select: { version: true, assistantId: true },
  });
  if (!operation) throw new TRPCError({ code: "NOT_FOUND" });
  const now = new Date();
  const { count } = await db.operation.updateMany({
    where: { id, version: operation.version, status: "RESERVED" },
    data: {
      status: next("RESERVED", answer),
      ...(answer === "confirm" ? { confirmedAt: now } : {}),
      // The assistant is free as soon as the candidate answers.
      releaseAt: now,
      version: { increment: 1 },
    },
  });
  if (!count)
    throw new TRPCError({ code: "CONFLICT", message: "invalidTransition" });
  return { assistantId: operation.assistantId };
}
