import "server-only";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import type { AssistantProfileInput } from "../schemas";

/** An assistant can take requests once their profile exists (identity check comes with EXM-014). */
export async function isAssistantReady(userId: string) {
  const count = await db.assistantProfile.count({ where: { userId } });
  return count > 0;
}

/** The assistant's profile, and the countries and operators they can choose from. */
export async function getAssistantProfile(userId: string) {
  const [profile, countries] = await Promise.all([
    db.assistantProfile.findUnique({
      where: { userId },
      select: {
        countryId: true,
        phone: true,
        operator: true,
        momoNumber: true,
        momoName: true,
      },
    }),
    db.country.findMany({
      where: { active: true },
      orderBy: { code: "asc" },
      select: { id: true, code: true, mobileMoneyOperators: true },
    }),
  ]);
  return { profile, countries };
}

export async function saveAssistantProfile(
  userId: string,
  input: AssistantProfileInput,
) {
  const country = await db.country.findFirst({
    where: { id: input.countryId, active: true },
    select: { mobileMoneyOperators: true },
  });
  if (!country?.mobileMoneyOperators.includes(input.operator))
    throw new TRPCError({ code: "BAD_REQUEST", message: "invalidOperator" });
  await db.assistantProfile.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
}
