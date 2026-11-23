import "server-only";
import { activeOperation, lapseOverdue } from "@/modules/operations";
import { db } from "@/server/db";

const DAY = 86_400_000;

/** The numbers the admin watches, each with last week's figure for context. */
export async function overview() {
  await lapseOverdue(db);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * DAY);
  const twoWeeksAgo = new Date(now.getTime() - 14 * DAY);
  const created = (from: Date, to: Date) =>
    db.request.count({ where: { createdAt: { gte: from, lt: to } } });
  const [
    published,
    active,
    toConfirm,
    toPay,
    disputes,
    unpaid,
    assistants,
    reports,
    thisWeek,
    lastWeek,
  ] = await Promise.all([
    db.request.count({
      where: {
        status: "OPEN",
        publishAt: { lte: now },
        issue: null,
        operations: { none: activeOperation(now) },
      },
    }),
    db.operation.count({ where: activeOperation(now) }),
    db.operation.count({ where: { status: "RESERVED" } }),
    db.operation.count({ where: { status: "CONFIRMED" } }),
    db.dispute.count({ where: { status: { not: "DECIDED" } } }),
    db.operation.count({ where: { status: "UNPAID" } }),
    db.assistantProfile.count({ where: { verification: "PENDING" } }),
    db.report.count({ where: { handledAt: null } }),
    created(weekAgo, now),
    created(twoWeeksAgo, weekAgo),
  ]);
  return {
    published,
    active,
    toConfirm,
    toPay,
    disputes,
    unpaid,
    assistants,
    reports,
    requestsThisWeek: thisWeek,
    requestsLastWeek: lastWeek,
    updatedAt: now,
  };
}
