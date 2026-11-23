import "server-only";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/modules/identity";
import { liftSuspension, suspendUser } from "@/modules/trust";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db";
import type { UserAction } from "../schemas";

/** Users matching a name or an email, with their role, standing and access. */
export async function searchUsers(query: string) {
  const users = await db.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      activeRole: true,
      banned: true,
      suspendedAt: true,
      twoFactorEnabled: true,
      createdAt: true,
      assistantProfile: { select: { verification: true } },
      _count: {
        select: {
          strikes: { where: { liftedAt: null } },
          requests: true,
          operations: true,
        },
      },
    },
  });
  return users.map(({ _count, assistantProfile, ...user }) => ({
    ...user,
    verification: assistantProfile?.verification ?? null,
    strikes: _count.strikes,
    requests: _count.requests,
    operations: _count.operations,
  }));
}

/**
 * Account actions. Ban, unban, revoke and delete go through Better Auth's admin plugin (sessions are
 * revoked with them); every action is written to the audit log.
 */
export async function applyUserAction(
  adminId: string,
  userId: string,
  action: UserAction,
) {
  if (userId === adminId)
    throw new TRPCError({ code: "BAD_REQUEST", message: "self" });
  const requestHeaders = await headers();
  switch (action) {
    case "suspend":
      await suspendUser(adminId, userId);
      return;
    case "unsuspend":
      await liftSuspension(adminId, userId);
      return;
    case "ban":
      await auth.api.banUser({ body: { userId }, headers: requestHeaders });
      break;
    case "unban":
      await auth.api.unbanUser({ body: { userId }, headers: requestHeaders });
      break;
    case "revokeSessions":
      await auth.api.revokeUserSessions({
        body: { userId },
        headers: requestHeaders,
      });
      break;
    case "delete":
      await deleteAccount(userId, requestHeaders);
      break;
  }
  await db.$transaction((tx) =>
    recordAudit(tx, {
      actorId: adminId,
      action: `user.${action}`,
      targetType: "user",
      targetId: userId,
    }),
  );
}

/**
 * Deletes the account and what it owns. When operations it served as an assistant must stay for
 * the other party's history, the account is anonymised and banned instead.
 */
async function deleteAccount(userId: string, requestHeaders: Headers) {
  try {
    await auth.api.removeUser({ body: { userId }, headers: requestHeaders });
  } catch (error) {
    const restricted =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003";
    if (!restricted) throw error;
    await auth.api.revokeUserSessions({
      body: { userId },
      headers: requestHeaders,
    });
    await db.user.update({
      where: { id: userId },
      data: {
        name: "—",
        email: `deleted-${userId}@invalid.local`,
        image: null,
        banned: true,
        banReason: "deleted",
      },
    });
  }
}

/** Everything the platform holds about a user, for a data request. Never centre passwords. */
export async function exportUserData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      termsAcceptedAt: true,
      locale: true,
      activeRole: true,
      beneficiaries: {
        omit: { passwordCipher: true, consentTokenHash: true },
      },
      requests: { include: { operations: { include: { payments: true } } } },
      operations: { include: { payments: true } },
      assistantProfile: { omit: { identityPath: true } },
      strikes: true,
      reports: true,
      notifications: true,
    },
  });
  if (!user) throw new TRPCError({ code: "NOT_FOUND" });
  return user;
}
