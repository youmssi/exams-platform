import "server-only";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@/generated/prisma/client";
import { encryptSecret } from "@/server/crypto";
import { db } from "@/server/db";
import { canAddBeneficiary } from "../domain/limits";
import { displayName, isReadyToBook } from "../domain/profile";
import type { BeneficiaryInput } from "../schemas";

/** What the owner may see: never the password, only whether one is saved. */
const PUBLIC_FIELDS = {
  id: true,
  isSelf: true,
  firstName: true,
  lastName: true,
  birthDate: true,
  birthPlace: true,
  phone: true,
  city: true,
  district: true,
  participantNumber: true,
  email: true,
  passwordCipher: true,
  updatedAt: true,
} as const;

type Owner = { id: string; email: string };

const toPublic = ({
  passwordCipher,
  ...beneficiary
}: Prisma.BeneficiaryGetPayload<{ select: typeof PUBLIC_FIELDS }>) => {
  const hasPassword = passwordCipher !== null;
  return {
    ...beneficiary,
    name: displayName(beneficiary),
    hasPassword,
    isReady: isReadyToBook({ ...beneficiary, hasPassword }),
  };
};

/** The account holder always has a "self" beneficiary, pre-filled with the account email. */
async function ensureSelf(owner: Owner) {
  const exists = await db.beneficiary.count({
    where: { ownerId: owner.id, isSelf: true },
  });
  if (exists) return;
  try {
    await db.beneficiary.create({
      data: { ownerId: owner.id, isSelf: true, email: owner.email },
    });
  } catch (error) {
    // A concurrent request created it first (partial unique index).
    if (
      !(
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
    )
      throw error;
  }
}

/** Whether the account holder can publish for themselves. */
export async function isSelfReady(ownerId: string) {
  const self = await db.beneficiary.findFirst({
    where: { ownerId, isSelf: true },
    select: PUBLIC_FIELDS,
  });
  return Boolean(self && toPublic(self).isReady);
}

export async function listBeneficiaries(owner: Owner) {
  await ensureSelf(owner);
  const rows = await db.beneficiary.findMany({
    where: { ownerId: owner.id },
    orderBy: [{ isSelf: "desc" }, { createdAt: "asc" }],
    select: PUBLIC_FIELDS,
  });
  return rows.map(toPublic);
}

/** Columns written from the form; optional texts are stored as null when empty. */
const profileData = ({ consent, password, ...input }: BeneficiaryInput) => ({
  ...input,
  birthDate: new Date(input.birthDate),
  city: input.city || null,
  district: input.district || null,
  participantNumber: input.participantNumber || null,
  ...(password ? { passwordCipher: encryptSecret(password) } : {}),
});

export async function addFriend(ownerId: string, input: BeneficiaryInput) {
  return db.$transaction(async (tx) => {
    const count = await tx.beneficiary.count({ where: { ownerId } });
    if (!canAddBeneficiary(count))
      throw new TRPCError({ code: "FORBIDDEN", message: "limitReached" });
    const created = await tx.beneficiary.create({
      data: { ownerId, consentAt: new Date(), ...profileData(input) },
      select: PUBLIC_FIELDS,
    });
    return toPublic(created);
  });
}

export async function updateBeneficiary(
  ownerId: string,
  id: string,
  input: BeneficiaryInput,
) {
  const { count } = await db.beneficiary.updateMany({
    where: { id, ownerId },
    data: profileData(input),
  });
  if (!count) throw new TRPCError({ code: "NOT_FOUND" });
  // New centre password: requests held for refused credentials go back to the queue (EXM-008).
  if (input.password)
    await db.request.updateMany({
      where: {
        beneficiaryId: id,
        status: "OPEN",
        credentialsRejectedAt: { not: null },
      },
      data: { credentialsRejectedAt: null, version: { increment: 1 } },
    });
}

/**
 * The account holder's own profile cannot be removed, nor anyone with a live request.
 * Their cancelled requests go with them.
 */
export async function removeBeneficiary(ownerId: string, id: string) {
  await db.$transaction(async (tx) => {
    const beneficiary = await tx.beneficiary.findFirst({
      where: { id, ownerId, isSelf: false },
      select: {
        _count: {
          select: { requests: { where: { status: { not: "CANCELLED" } } } },
        },
      },
    });
    if (!beneficiary) throw new TRPCError({ code: "NOT_FOUND" });
    if (beneficiary._count.requests)
      throw new TRPCError({ code: "CONFLICT", message: "hasOpenRequest" });
    await tx.request.deleteMany({ where: { beneficiaryId: id } });
    await tx.beneficiary.delete({ where: { id } });
  });
}
