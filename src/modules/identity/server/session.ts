import "server-only";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { cache } from "react";
import { routes } from "@/config/routes";
import { redirect } from "@/i18n/navigation";
import { toRole } from "../schemas";
import { auth } from "./auth";

/** Current session, read once per request. */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/** Signed-in user, or a redirect to sign-in. */
export async function requireUser() {
  const session = await getSession();
  if (!session)
    return redirect({ href: routes.signIn, locale: await getLocale() });
  return { ...session.user, activeRole: toRole(session.user.activeRole) };
}

/** Signed-in user who accepted the terms, or a redirect to the welcome step. */
export async function requireOnboardedUser() {
  const user = await requireUser();
  if (!user.termsAcceptedAt)
    return redirect({ href: routes.welcome, locale: await getLocale() });
  return user;
}

/**
 * Admin access. Returns whether the session was opened with the second factor,
 * which admin pages require before showing anything.
 */
export async function requireAdmin() {
  const user = await requireOnboardedUser();
  if (user.role !== "admin") notFound();
  const session = await getSession();
  return { user, hasSecondFactor: Boolean(session?.session.secondFactorAt) };
}
