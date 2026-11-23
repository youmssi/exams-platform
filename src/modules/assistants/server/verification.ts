import "server-only";
import { TRPCError } from "@trpc/server";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db";
import { fileUrl, isValidImage, parseFilePath } from "@/server/storage";

/** Where the assistant stands: no document, waiting for an admin, verified or refused. */
export async function verificationOf(userId: string) {
  const profile = await db.assistantProfile.findUnique({
    where: { userId },
    select: { verification: true },
  });
  return profile?.verification ?? "NONE";
}

/** The assistant sends (or replaces) a photo of their identity document; an admin checks it. */
export async function submitIdentity(userId: string, path: string) {
  const file = parseFilePath(path);
  if (
    file?.kind !== "identity" ||
    file.ownerId !== userId ||
    !(await isValidImage(path))
  )
    throw new TRPCError({ code: "BAD_REQUEST", message: "invalidFile" });
  const { count } = await db.assistantProfile.updateMany({
    where: { userId, verification: { not: "VERIFIED" } },
    data: {
      identityPath: path,
      submittedAt: new Date(),
      verification: "PENDING",
      rejectionReason: null,
    },
  });
  if (!count) throw new TRPCError({ code: "NOT_FOUND" });
}

/** Assistants waiting for a check, oldest first, with what the admin compares. */
export async function pendingAssistants() {
  const profiles = await db.assistantProfile.findMany({
    where: { verification: "PENDING" },
    orderBy: { submittedAt: "asc" },
    select: {
      userId: true,
      phone: true,
      operator: true,
      momoNumber: true,
      momoName: true,
      identityPath: true,
      submittedAt: true,
      user: { select: { name: true, email: true } },
    },
  });
  return profiles.map(({ identityPath, user, ...profile }) => ({
    ...profile,
    ...user,
    identityUrl: identityPath && fileUrl(identityPath),
  }));
}

/** The admin validates the assistant, or refuses with a reason they can act on. */
export async function reviewAssistant(
  adminId: string,
  userId: string,
  approve: boolean,
  reason: string,
) {
  await db.$transaction(async (tx) => {
    const { count } = await tx.assistantProfile.updateMany({
      where: { userId, verification: "PENDING" },
      data: approve
        ? {
            verification: "VERIFIED",
            verifiedAt: new Date(),
            rejectionReason: null,
          }
        : { verification: "REJECTED", rejectionReason: reason },
    });
    if (!count) throw new TRPCError({ code: "NOT_FOUND" });
    await recordAudit(tx, {
      actorId: adminId,
      action: approve ? "assistant.verify" : "assistant.reject",
      targetType: "user",
      targetId: userId,
      after: approve ? undefined : { reason },
    });
  });
}
