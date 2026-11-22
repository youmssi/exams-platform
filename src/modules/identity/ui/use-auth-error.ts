"use client";

import { useTranslations } from "next-intl";

const KNOWN = new Set([
  "INVALID_OTP",
  "OTP_EXPIRED",
  "TOO_MANY_ATTEMPTS",
  "INVALID_EMAIL_OR_PASSWORD",
  "BANNED_USER",
]);

type AuthError = { code?: string; status?: number } | null | undefined;

/** Maps a Better Auth error to a translated, actionable message. */
export function useAuthErrorMessage() {
  const t = useTranslations("auth.errors");
  return (error: AuthError) => {
    if (error?.status === 429) return t("RATE_LIMITED");
    if (error?.code && KNOWN.has(error.code)) return t(error.code);
    return t("default");
  };
}
