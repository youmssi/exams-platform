import "server-only";
import type { Prisma } from "@/generated/prisma/client";

type AuditEntry = {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
};

const toJson = (value: unknown) =>
  value === undefined
    ? undefined
    : (JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue);

/** Records a sensitive action (admin change, credential read), in the same transaction as the change when there is one. */
export function recordAudit(tx: Prisma.TransactionClient, entry: AuditEntry) {
  return tx.auditLog.create({
    data: {
      ...entry,
      before: toJson(entry.before),
      after: toJson(entry.after),
    },
  });
}
