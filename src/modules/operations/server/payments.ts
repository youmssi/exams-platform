import "server-only";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@/generated/prisma/client";
import { recordAudit } from "@/server/audit";
import { publicId } from "@/server/crypto";
import { db } from "@/server/db";
import { transition } from "../domain/machine";
import {
  isSettled,
  type PaymentRecipient,
  paymentDeadline,
  paymentReference,
  paymentsFor,
} from "../domain/payment";

type Client = Prisma.TransactionClient | typeof db;

/** Operations whose deposits are still expected. */
export const PAYING = ["CONFIRMED", "UNPAID"] as const;

/**
 * Deadlines are checked when data is read: a confirmed booking whose deposits are not all
 * received in time becomes unpaid (blacklist and suspension, EXM-010).
 */
export async function lapseOverdue(
  client: Client,
  where: Prisma.OperationWhereInput = {},
) {
  await client.operation.updateMany({
    where: { ...where, status: "CONFIRMED", paymentDueAt: { lte: new Date() } },
    data: { status: "UNPAID", version: { increment: 1 } },
  });
}

/** The candidate confirmed the booking: both deposits are now due, before the offer's deadline. */
export async function openPayments(
  tx: Prisma.TransactionClient,
  operationId: string,
  request: {
    assistantShare: number;
    commission: number;
    currency: string;
    paymentDeadlineH: number;
  },
  confirmedAt: Date,
) {
  await tx.operation.update({
    where: { id: operationId },
    data: {
      paymentDueAt: paymentDeadline(request.paymentDeadlineH, confirmedAt),
    },
  });
  await tx.paymentDeclaration.createMany({
    data: paymentsFor(request).map(({ recipient, amount }) => ({
      operationId,
      recipient,
      amount,
      currency: request.currency,
    })),
  });
}

/** A request whose booking was left unpaid. */
export const unpaidRequest = {
  operations: { some: { status: "UNPAID" } },
} satisfies Prisma.RequestWhereInput;

/** Users with a booking left unpaid: the blacklist, lifted as soon as it is settled. */
export const blacklisted = {
  requests: { some: unpaidRequest },
} satisfies Prisma.UserWhereInput;

/**
 * The blacklist shown to assistants: a public identifier, the level and the date, nothing personal.
 */
export async function listBlacklist() {
  await lapseOverdue(db);
  const operations = await db.operation.findMany({
    where: { status: "UNPAID" },
    orderBy: { paymentDueAt: "desc" },
    select: {
      id: true,
      paymentDueAt: true,
      request: {
        select: {
          ownerId: true,
          session: {
            select: {
              offer: {
                select: { level: true, center: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  });
  return operations.map(({ id, paymentDueAt, request }) => ({
    id,
    since: paymentDueAt,
    account: publicId(request.ownerId),
    level: request.session.offer.level,
    center: request.session.offer.center.name,
  }));
}

/** Whether this user has a booking left unpaid (blocks publishing and claiming). */
export async function hasUnpaid(userId: string) {
  await lapseOverdue(db, { request: { ownerId: userId } });
  return (
    (await db.operation.count({
      where: { status: "UNPAID", request: { ownerId: userId } },
    })) > 0
  );
}

/** The candidate says one deposit is sent. */
export async function declarePayment(ownerId: string, id: string) {
  const { count } = await db.paymentDeclaration.updateMany({
    where: {
      id,
      status: "DUE",
      operation: { status: { in: [...PAYING] }, request: { ownerId } },
    },
    data: {
      status: "DECLARED",
      declaredAt: new Date(),
      version: { increment: 1 },
    },
  });
  if (!count) throw new TRPCError({ code: "NOT_FOUND" });
  return paymentParties(id);
}

/**
 * The recipient answers a declared deposit. Received: the operation closes once both are, and the
 * exam-centre password is erased unless another request still needs it. Not received: the
 * candidate sends it again.
 */
export async function answerPayment(
  actorId: string,
  id: string,
  received: boolean,
  recipient: PaymentRecipient,
) {
  const now = new Date();
  await db.$transaction(async (tx) => {
    const payment = await tx.paymentDeclaration.findFirst({
      where: {
        id,
        recipient,
        status: "DECLARED",
        operation: {
          status: { in: [...PAYING] },
          ...(recipient === "ASSISTANT" ? { assistantId: actorId } : {}),
        },
      },
      select: { version: true, operationId: true },
    });
    if (!payment) throw new TRPCError({ code: "NOT_FOUND" });
    const { count } = await tx.paymentDeclaration.updateMany({
      where: { id, version: payment.version },
      data: received
        ? { status: "RECEIVED", receivedAt: now, version: { increment: 1 } }
        : {
            status: "DUE",
            declaredAt: null,
            rejections: { increment: 1 },
            version: { increment: 1 },
          },
    });
    if (!count) throw new TRPCError({ code: "CONFLICT", message: "changed" });
    if (recipient === "PLATFORM")
      await recordAudit(tx, {
        actorId,
        action: received ? "payment.received" : "payment.rejected",
        targetType: "payment",
        targetId: id,
      });
    if (received) await closeIfSettled(tx, payment.operationId, now);
  });
  return paymentParties(id);
}

async function closeIfSettled(
  tx: Prisma.TransactionClient,
  operationId: string,
  now: Date,
) {
  const operation = await tx.operation.findUniqueOrThrow({
    where: { id: operationId },
    select: {
      status: true,
      payments: { select: { status: true } },
      request: { select: { id: true, beneficiaryId: true } },
    },
  });
  if (!isSettled(operation.payments)) return;
  const status = transition(operation.status, "close");
  if (!status)
    throw new TRPCError({ code: "CONFLICT", message: "invalidTransition" });
  await tx.operation.update({
    where: { id: operationId },
    data: { status, closedAt: now, version: { increment: 1 } },
  });
  // The centre's credentials are only kept while a request may still use them.
  const { beneficiaryId, id: requestId } = operation.request;
  const stillNeeded = await tx.request.count({
    where: { beneficiaryId, status: "OPEN", id: { not: requestId } },
  });
  if (!stillNeeded)
    await tx.beneficiary.update({
      where: { id: beneficiaryId },
      data: { passwordCipher: null },
    });
}

/** Who to refresh after a payment changes: the candidate and the assistant. */
async function paymentParties(id: string) {
  const { operation } = await db.paymentDeclaration.findUniqueOrThrow({
    where: { id },
    select: {
      operation: {
        select: { assistantId: true, request: { select: { ownerId: true } } },
      },
    },
  });
  return {
    ownerId: operation.request.ownerId,
    assistantId: operation.assistantId,
  };
}

const paymentRow = {
  id: true,
  amount: true,
  currency: true,
  status: true,
  declaredAt: true,
  rejections: true,
  operation: {
    select: {
      id: true,
      status: true,
      paymentDueAt: true,
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
} satisfies Prisma.PaymentDeclarationSelect;

const toRow = ({
  operation,
  ...payment
}: Prisma.PaymentDeclarationGetPayload<{ select: typeof paymentRow }>) => ({
  ...payment,
  reference: paymentReference(operation.id),
  operationStatus: operation.status,
  paymentDueAt: operation.paymentDueAt,
  level: operation.request.session.offer.level,
  center: operation.request.session.offer.center.name,
  examDate: operation.request.session.examDate,
});

/** The assistant's shares still to receive, declared ones first. */
export async function assistantPayments(assistantId: string) {
  await lapseOverdue(db, { assistantId });
  const payments = await db.paymentDeclaration.findMany({
    where: {
      recipient: "ASSISTANT",
      status: { not: "RECEIVED" },
      operation: { assistantId, status: { in: [...PAYING] } },
    },
    orderBy: [{ status: "desc" }, { createdAt: "asc" }],
    select: paymentRow,
  });
  return payments.map(toRow);
}

/** Commissions still to receive, for the admin. */
export async function platformPayments() {
  await lapseOverdue(db);
  const payments = await db.paymentDeclaration.findMany({
    where: {
      recipient: "PLATFORM",
      status: { not: "RECEIVED" },
      operation: { status: { in: [...PAYING] } },
    },
    orderBy: [{ status: "desc" }, { createdAt: "asc" }],
    select: paymentRow,
  });
  return payments.map(toRow);
}
