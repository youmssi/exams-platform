import "server-only";
import { TRPCError } from "@trpc/server";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db";

/** Reports and catalogue requests still to handle, oldest first. */
export async function listInbox() {
  const [reports, catalogRequests] = await Promise.all([
    db.report.findMany({
      where: { handledAt: null },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        category: true,
        message: true,
        createdAt: true,
        reporter: { select: { email: true } },
      },
    }),
    db.catalogRequest.findMany({
      where: { handledAt: null },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        kind: true,
        details: true,
        officialUrl: true,
        createdAt: true,
        requester: { select: { email: true } },
      },
    }),
  ]);
  return { reports, catalogRequests };
}

export async function markHandled(
  adminId: string,
  kind: "report" | "catalogRequest",
  id: string,
) {
  await db.$transaction(async (tx) => {
    const { count } =
      kind === "report"
        ? await tx.report.updateMany({
            where: { id, handledAt: null },
            data: { handledAt: new Date() },
          })
        : await tx.catalogRequest.updateMany({
            where: { id, handledAt: null },
            data: { handledAt: new Date() },
          });
    if (!count) throw new TRPCError({ code: "NOT_FOUND" });
    await recordAudit(tx, {
      actorId: adminId,
      action: `${kind}.handle`,
      targetType: kind,
      targetId: id,
    });
  });
}

/** The latest admin actions, with who did them. */
export async function listAudit() {
  const entries = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      actorId: true,
      action: true,
      targetType: true,
      targetId: true,
      createdAt: true,
    },
  });
  const actors = await db.user.findMany({
    where: { id: { in: [...new Set(entries.map((entry) => entry.actorId))] } },
    select: { id: true, email: true },
  });
  return entries.map((entry) => ({
    ...entry,
    actor:
      actors.find((actor) => actor.id === entry.actorId)?.email ??
      entry.actorId,
  }));
}
