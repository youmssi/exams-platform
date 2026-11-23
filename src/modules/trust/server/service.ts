import "server-only";
import { TRPCError } from "@trpc/server";
import { trustConfig } from "@/config/trust";
import type { Prisma, StrikeReason } from "@/generated/prisma/client";
import type { NotificationInput } from "@/modules/notifications";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db";
import { reachesSuspension, strikeCount } from "../domain/strikes";
import type { ReportInput } from "../schemas";

const ACTIVE = { liftedAt: null } satisfies Prisma.StrikeWhereInput;

/**
 * Warns a user; the strike that reaches the threshold suspends the account. Returns the
 * notification to send once the change is saved.
 */
export async function issueStrike(
  tx: Prisma.TransactionClient,
  userId: string,
  reason: StrikeReason,
  operationId?: string,
): Promise<NotificationInput> {
  await tx.strike.create({ data: { userId, reason, operationId } });
  const active = await tx.strike.count({ where: { userId, ...ACTIVE } });
  if (reachesSuspension(active, trustConfig.strikesToSuspend))
    await tx.user.updateMany({
      where: { id: userId, suspendedAt: null },
      data: { suspendedAt: new Date() },
    });
  const { count, threshold } = strikeCount(
    active,
    trustConfig.strikesToSuspend,
  );
  return {
    userId,
    type: "STRIKE",
    to: "account",
    values: { reason, count: String(count), threshold: String(threshold) },
  };
}

export async function isSuspended(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { suspendedAt: true },
  });
  return Boolean(user?.suspendedAt);
}

/** The user's strikes and suspension, for their account page. */
export async function myStanding(userId: string) {
  const [user, strikes] = await Promise.all([
    db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { suspendedAt: true },
    }),
    db.strike.findMany({
      where: { userId, ...ACTIVE },
      orderBy: { createdAt: "desc" },
      select: { id: true, reason: true, createdAt: true },
    }),
  ]);
  return {
    suspendedAt: user.suspendedAt,
    strikes,
    ...strikeCount(strikes.length, trustConfig.strikesToSuspend),
  };
}

/** An admin suspends an account by hand (fraud, abuse); only an admin lifts it. */
export async function suspendUser(adminId: string, userId: string) {
  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { suspendedAt: new Date() },
    });
    await recordAudit(tx, {
      actorId: adminId,
      action: "user.suspend",
      targetType: "user",
      targetId: userId,
    });
  });
}

/** An admin lifts a suspension: current strikes stop counting. */
export async function liftSuspension(adminId: string, userId: string) {
  await db.$transaction(async (tx) => {
    const now = new Date();
    await tx.user.update({
      where: { id: userId },
      data: { suspendedAt: null },
    });
    await tx.strike.updateMany({
      where: { userId, ...ACTIVE },
      data: { liftedAt: now },
    });
    await recordAudit(tx, {
      actorId: adminId,
      action: "user.unsuspend",
      targetType: "user",
      targetId: userId,
    });
  });
}

/** Reports reach the admins as is; a session or an operation the reporter took part in. */
export async function createReport(reporterId: string, input: ReportInput) {
  const allowed =
    input.targetType === "SESSION"
      ? await db.examSession.count({ where: { id: input.targetId } })
      : await db.operation.count({
          where: {
            id: input.targetId,
            OR: [
              { assistantId: reporterId },
              { request: { ownerId: reporterId } },
            ],
          },
        });
  if (!allowed) throw new TRPCError({ code: "NOT_FOUND" });
  await db.report.create({
    data: { reporterId, ...input, message: input.message || null },
  });
}
