import "server-only";
import { TRPCError } from "@trpc/server";
import { trustConfig } from "@/config/trust";
import type { Prisma } from "@/generated/prisma/client";
import { issueStrike } from "@/modules/trust";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db";
import { fileUrl, isValidImage, parseFilePath } from "@/server/storage";
import { type DisputeOutcome, decisionEffects } from "../domain/dispute";
import { transition } from "../domain/machine";
import { openPayments } from "./payments";

const UNDECIDED = {
  status: { not: "DECIDED" },
} satisfies Prisma.DisputeWhereInput;

/** Opened when the candidate disputes a booking: the assistant has a few hours to send a proof. */
export function openDispute(
  tx: Prisma.TransactionClient,
  operationId: string,
  now: Date,
) {
  return tx.dispute.create({
    data: {
      operationId,
      proofDueAt: new Date(
        now.getTime() + trustConfig.proofDeadlineH * 3_600_000,
      ),
    },
  });
}

/** Proofs not sent in time go to review all the same (checked when read). */
async function reviewLate(where: Prisma.DisputeWhereInput = {}) {
  await db.dispute.updateMany({
    where: {
      ...where,
      status: "PROOF_REQUESTED",
      proofDueAt: { lte: new Date() },
    },
    data: { status: "REVIEW" },
  });
}

/** An assistant with an undecided dispute cannot take requests until the decision. */
export async function hasOpenDispute(assistantId: string) {
  return (
    (await db.dispute.count({
      where: { ...UNDECIDED, operation: { assistantId } },
    })) > 0
  );
}

/** The assistant's undecided dispute, if any, with what they need to answer it. */
export async function assistantDispute(assistantId: string) {
  await reviewLate({ operation: { assistantId } });
  return db.dispute.findFirst({
    where: { ...UNDECIDED, operation: { assistantId } },
    select: {
      id: true,
      status: true,
      proofDueAt: true,
      proofAt: true,
      operation: {
        select: {
          reservedAt: true,
          request: {
            select: {
              session: {
                select: {
                  examDate: true,
                  offer: {
                    select: { level: true, center: { select: { name: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

/** Whether this user may send (assistant of the operation) or see (both parties) a proof. */
export async function canAccessProof(
  userId: string,
  disputeId: string,
  mode: "write" | "read",
) {
  const operation =
    mode === "write"
      ? { assistantId: userId }
      : { OR: [{ assistantId: userId }, { request: { ownerId: userId } }] };
  return (
    (await db.dispute.count({
      where: {
        id: disputeId,
        operation,
        ...(mode === "write" ? { status: "PROOF_REQUESTED" as const } : {}),
      },
    })) > 0
  );
}

/** The assistant sent a capture of the booking: the dispute goes to review. */
export async function submitProof(
  assistantId: string,
  id: string,
  path: string,
) {
  const file = parseFilePath(path);
  if (
    file?.kind !== "proof" ||
    file.ownerId !== id ||
    !(await isValidImage(path))
  )
    throw new TRPCError({ code: "BAD_REQUEST", message: "invalidFile" });
  const dispute = await db.dispute.findFirst({
    where: { id, status: "PROOF_REQUESTED", operation: { assistantId } },
    select: {
      operation: { select: { request: { select: { ownerId: true } } } },
    },
  });
  if (!dispute) throw new TRPCError({ code: "NOT_FOUND" });
  await db.dispute.update({
    where: { id },
    data: { proofPath: path, proofAt: new Date(), status: "REVIEW" },
  });
  return { ownerId: dispute.operation.request.ownerId };
}

/**
 * The admin decides. Booked: the candidate pays as for a confirmed booking and is warned for an
 * abusive dispute. Not booked: the request is back in the queue and the assistant is warned.
 */
export async function decideDispute(
  adminId: string,
  id: string,
  outcome: DisputeOutcome,
  note: string,
) {
  const now = new Date();
  return db.$transaction(async (tx) => {
    const dispute = await tx.dispute.findFirst({
      where: { id, ...UNDECIDED, operation: { status: "DISPUTED" } },
      select: {
        operation: {
          select: {
            id: true,
            version: true,
            assistantId: true,
            requestId: true,
            request: {
              select: {
                ownerId: true,
                assistantShare: true,
                commission: true,
                currency: true,
                session: {
                  select: { offer: { select: { paymentDeadlineH: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!dispute) throw new TRPCError({ code: "NOT_FOUND" });
    const { operation } = dispute;
    const { ownerId, session, ...amounts } = operation.request;
    const effects = decisionEffects(outcome);
    const status = transition("DISPUTED", effects.event);
    if (!status)
      throw new TRPCError({ code: "CONFLICT", message: "invalidTransition" });
    const { count } = await tx.operation.updateMany({
      where: {
        id: operation.id,
        version: operation.version,
        status: "DISPUTED",
      },
      data: {
        status,
        version: { increment: 1 },
        ...(outcome === "BOOKED" ? { confirmedAt: now } : { endedAt: now }),
      },
    });
    if (!count) throw new TRPCError({ code: "CONFLICT", message: "changed" });
    if (outcome === "BOOKED")
      await openPayments(
        tx,
        operation.id,
        { ...amounts, paymentDeadlineH: session.offer.paymentDeadlineH },
        now,
      );
    else
      await tx.request.update({
        where: { id: operation.requestId },
        data: { status: "OPEN", version: { increment: 1 } },
      });
    await issueStrike(
      tx,
      effects.warn === "candidate" ? ownerId : operation.assistantId,
      effects.reason,
      operation.id,
    );
    await tx.dispute.update({
      where: { id },
      data: {
        status: "DECIDED",
        outcome,
        decisionNote: note || null,
        decidedById: adminId,
        decidedAt: now,
      },
    });
    await recordAudit(tx, {
      actorId: adminId,
      action: "dispute.decide",
      targetType: "dispute",
      targetId: id,
      after: { outcome },
    });
    return { ownerId, assistantId: operation.assistantId };
  });
}

const party = {
  name: true,
  email: true,
  _count: { select: { strikes: { where: { liftedAt: null } } } },
} satisfies Prisma.UserSelect;

/** Undecided disputes for the admin, ready ones first, with the timeline, proof and both parties. */
export async function listDisputes() {
  await reviewLate();
  const disputes = await db.dispute.findMany({
    where: UNDECIDED,
    orderBy: [{ status: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      status: true,
      proofDueAt: true,
      proofPath: true,
      proofAt: true,
      createdAt: true,
      operation: {
        select: {
          claimedAt: true,
          reservedAt: true,
          assistant: { select: party },
          request: {
            select: {
              total: true,
              currency: true,
              owner: { select: party },
              beneficiary: { select: { email: true } },
              session: {
                select: {
                  examDate: true,
                  offer: {
                    select: { level: true, center: { select: { name: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  return disputes.map(({ proofPath, operation, ...dispute }) => {
    const { owner, beneficiary, session, ...request } = operation.request;
    const person = ({ name, email, _count }: typeof owner) => ({
      name,
      email,
      strikes: _count.strikes,
    });
    return {
      ...dispute,
      proofUrl: proofPath && fileUrl(proofPath),
      claimedAt: operation.claimedAt,
      reservedAt: operation.reservedAt,
      candidate: person(owner),
      assistant: person(operation.assistant),
      bookingEmail: beneficiary.email,
      ...request,
      level: session.offer.level,
      center: session.offer.center.name,
      examDate: session.examDate,
    };
  });
}
