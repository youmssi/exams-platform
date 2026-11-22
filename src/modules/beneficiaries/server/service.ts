import "server-only";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@/generated/prisma/client";
import { encryptSecret } from "@/server/crypto";
import { db } from "@/server/db";
import { canAddBeneficiary } from "../domain/limits";
import type { BeneficiaryInput } from "../schemas";

/** What the owner may see: never the password, only whether one is saved. */
const PUBLIC_FIELDS = {
  id: true,
  isSelf: true,
  fullName: true,
  email: true,
  passwordCipher: true,
  updatedAt: true,
} as const;

type Owner = { id: string; name: string; email: string };

const toPublic = ({
  passwordCipher,
  ...beneficiary
}: Prisma.BeneficiaryGetPayload<{ select: typeof PUBLIC_FIELDS }>) => ({
  ...beneficiary,
  hasPassword: passwordCipher !== null,
});

/** The account holder always has a "self" beneficiary, pre-filled from the account. */
async function ensureSelf(owner: Owner) {
  const exists = await db.beneficiary.count({
    where: { ownerId: owner.id, isSelf: true },
  });
  if (exists) return;
  try {
    await db.beneficiary.create({
      data: {
        ownerId: owner.id,
        isSelf: true,
        fullName: owner.name,
        email: owner.email,
      },
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

export async function listBeneficiaries(owner: Owner) {
  await ensureSelf(owner);
  const rows = await db.beneficiary.findMany({
    where: { ownerId: owner.id },
    orderBy: [{ isSelf: "desc" }, { createdAt: "asc" }],
    select: PUBLIC_FIELDS,
  });
  return rows.map(toPublic);
}

const passwordData = (password: string) =>
  password ? { passwordCipher: encryptSecret(password) } : {};

export async function addFriend(ownerId: string, input: BeneficiaryInput) {
  return db.$transaction(async (tx) => {
    const count = await tx.beneficiary.count({ where: { ownerId } });
    if (!canAddBeneficiary(count))
      throw new TRPCError({ code: "FORBIDDEN", message: "limitReached" });
    const created = await tx.beneficiary.create({
      data: {
        ownerId,
        fullName: input.fullName,
        email: input.email,
        consentAt: new Date(),
        ...passwordData(input.password),
      },
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
    data: {
      fullName: input.fullName,
      email: input.email,
      ...passwordData(input.password),
    },
  });
  if (!count) throw new TRPCError({ code: "NOT_FOUND" });
}

/** The account holder's own profile cannot be removed. */
export async function removeBeneficiary(ownerId: string, id: string) {
  const { count } = await db.beneficiary.deleteMany({
    where: { id, ownerId, isSelf: false },
  });
  if (!count) throw new TRPCError({ code: "NOT_FOUND" });
}
