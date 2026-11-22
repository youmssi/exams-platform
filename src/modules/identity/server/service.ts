import "server-only";
import { db } from "@/server/db";
import type { OnboardingInput, Role } from "../schemas";

export function completeOnboarding(userId: string, input: OnboardingInput) {
  return db.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      activeRole: input.role,
      termsAcceptedAt: new Date(),
    },
    select: { id: true },
  });
}

export function setActiveRole(userId: string, role: Role) {
  return db.user.update({
    where: { id: userId },
    data: { activeRole: role },
    select: { activeRole: true },
  });
}
