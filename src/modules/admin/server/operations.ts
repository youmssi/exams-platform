import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import {
  activeOperation,
  lapseOverdue,
  paymentReference,
} from "@/modules/operations";
import { db } from "@/server/db";
import type { OperationFilter } from "../schemas";

const FILTERS: Record<OperationFilter, Prisma.OperationWhereInput> = {
  active: activeOperation(),
  toConfirm: { status: "RESERVED" },
  toPay: { status: "CONFIRMED" },
  disputed: { status: "DISPUTED" },
  unpaid: { status: "UNPAID" },
  closed: { status: "CLOSED" },
  all: {},
};

/** The latest operations for a filter, with both parties and the full history of each. */
export async function listOperations(filter: OperationFilter) {
  await lapseOverdue(db);
  const operations = await db.operation.findMany({
    where: FILTERS[filter],
    orderBy: { claimedAt: "desc" },
    take: 100,
    select: {
      id: true,
      status: true,
      claimedAt: true,
      deadlineAt: true,
      reservedAt: true,
      confirmedAt: true,
      paymentDueAt: true,
      closedAt: true,
      endedAt: true,
      assistant: { select: { email: true } },
      payments: { select: { recipient: true, status: true, amount: true } },
      request: {
        select: {
          total: true,
          currency: true,
          owner: { select: { email: true } },
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
  });
  const history = await db.auditLog.findMany({
    where: {
      targetType: "operation",
      targetId: { in: operations.map((o) => o.id) },
    },
    orderBy: { createdAt: "asc" },
    select: { targetId: true, action: true, createdAt: true },
  });
  return operations.map(({ request, assistant, ...operation }) => ({
    ...operation,
    reference: paymentReference(operation.id),
    candidate: request.owner.email,
    assistant: assistant.email,
    total: request.total,
    currency: request.currency,
    center: request.session.offer.center.name,
    level: request.session.offer.level,
    examDate: request.session.examDate,
    history: history.filter((entry) => entry.targetId === operation.id),
  }));
}
