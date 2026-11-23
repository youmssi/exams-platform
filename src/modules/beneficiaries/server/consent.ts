import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { routes } from "@/config/routes";
import { localeFromHeaders } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email";
import { env } from "@/server/env";
import {
  CONSENT_LINK_DAYS,
  canResendConsent,
  isConsentLinkValid,
} from "../domain/consent";
import { displayName } from "../domain/profile";
import { ConsentEmail } from "../emails/consent-email";

const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");

/**
 * Emails the friend a one-time link to confirm (or refuse) that the holder books for them.
 * Only the link's hash is stored. The email is in the holder's language.
 */
export async function requestConsent(beneficiaryId: string) {
  const beneficiary = await db.beneficiary.findUniqueOrThrow({
    where: { id: beneficiaryId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
      owner: { select: { name: true } },
    },
  });
  const token = randomBytes(32).toString("base64url");
  await db.beneficiary.update({
    where: { id: beneficiaryId },
    data: {
      consentConfirmedAt: null,
      consentTokenHash: hash(token),
      consentRequestedAt: new Date(),
    },
  });
  const locale = localeFromHeaders(await headers());
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const confirmUrl = `${env.APP_URL}${prefix}${routes.consent}?token=${token}`;
  const t = await getTranslations({ locale, namespace: "emails.consent" });
  await sendEmail({
    to: beneficiary.email,
    subject: t("subject", { holder: beneficiary.owner.name }),
    react: ConsentEmail({
      confirmUrl,
      copy: {
        preview: t("preview", { holder: beneficiary.owner.name }),
        title: t("title"),
        intro: t("intro", {
          holder: beneficiary.owner.name,
          name: displayName(beneficiary),
        }),
        data: t("data"),
        confirm: t("confirm"),
        refuse: t("refuse"),
        expiry: t("expiry", { days: CONSENT_LINK_DAYS }),
      },
    }),
  });
}

/** The holder sends the link again, at most every few minutes. */
export async function resendConsent(ownerId: string, id: string) {
  const beneficiary = await db.beneficiary.findFirst({
    where: { id, ownerId, isSelf: false, consentConfirmedAt: null },
    select: { consentRequestedAt: true },
  });
  if (!beneficiary) throw new TRPCError({ code: "NOT_FOUND" });
  if (!canResendConsent(beneficiary.consentRequestedAt))
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "tooSoon" });
  await requestConsent(id);
}

async function pendingByToken(token: string) {
  const beneficiary = await db.beneficiary.findUnique({
    where: { consentTokenHash: hash(token) },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      consentRequestedAt: true,
      owner: { select: { name: true } },
    },
  });
  return beneficiary && isConsentLinkValid(beneficiary.consentRequestedAt)
    ? beneficiary
    : null;
}

/** What the consent page shows: who asks, for whom. Null when the link is unknown or expired. */
export async function consentInfo(token: string) {
  const beneficiary = await pendingByToken(token);
  return (
    beneficiary && {
      holder: beneficiary.owner.name,
      name: displayName(beneficiary),
    }
  );
}

/**
 * The friend answers. Yes: the holder can publish for them. No: their data is erased, or
 * anonymised when past requests still refer to them.
 */
export async function answerConsent(token: string, accept: boolean) {
  const beneficiary = await pendingByToken(token);
  if (!beneficiary)
    throw new TRPCError({ code: "NOT_FOUND", message: "invalidLink" });
  if (accept) {
    await db.beneficiary.update({
      where: { id: beneficiary.id },
      data: { consentConfirmedAt: new Date(), consentTokenHash: null },
    });
    return;
  }
  await db.$transaction(async (tx) => {
    const kept = await tx.request.count({
      where: { beneficiaryId: beneficiary.id, operations: { some: {} } },
    });
    await tx.request.deleteMany({
      where: { beneficiaryId: beneficiary.id, operations: { none: {} } },
    });
    if (!kept) {
      await tx.beneficiary.delete({ where: { id: beneficiary.id } });
      return;
    }
    await tx.beneficiary.update({
      where: { id: beneficiary.id },
      data: {
        firstName: "",
        lastName: "",
        birthDate: null,
        birthPlace: null,
        phone: null,
        city: null,
        district: null,
        participantNumber: null,
        email: "",
        passwordCipher: null,
        consentTokenHash: null,
      },
    });
  });
}
