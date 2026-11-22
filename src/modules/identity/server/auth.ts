import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, twoFactor } from "better-auth/plugins";
import { getTranslations } from "next-intl/server";
import { localeFromHeaders } from "@/i18n/locale";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email";
import { env } from "@/server/env";
import { OtpEmail } from "../emails/otp-email";
import { OTP_EXPIRES_IN_SECONDS } from "../schemas";

type OtpPurpose =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email"
  | "two-factor";

async function sendOtp(
  email: string,
  code: string,
  purpose: OtpPurpose,
  headers?: Headers | null,
) {
  const locale = localeFromHeaders(headers);
  const t = await getTranslations({ locale, namespace: "emails.otp" });
  const minutes = OTP_EXPIRES_IN_SECONDS / 60;
  await sendEmail({
    to: email,
    subject: t(`subject.${purpose}`, { code }),
    react: OtpEmail({
      code,
      copy: {
        preview: t("preview", { code }),
        title: t(`subject.${purpose}`, { code }),
        intro: t("intro"),
        expiry: t("expiry", { minutes }),
        ignore: t("ignore"),
      },
    }),
  });
}

const socialProviders = {
  ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
    ? {
        microsoft: {
          clientId: env.MICROSOFT_CLIENT_ID,
          clientSecret: env.MICROSOFT_CLIENT_SECRET,
          tenantId: "common",
        },
      }
    : {}),
};

export const auth = betterAuth({
  appName: "Exams",
  baseURL: env.APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "microsoft"],
    },
  },
  user: {
    additionalFields: {
      activeRole: {
        type: ["candidate", "assistant"],
        required: false,
        defaultValue: "candidate",
        input: false,
      },
      termsAcceptedAt: { type: "date", required: false, input: false },
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/email-otp/send-verification-otp": { window: 60, max: 3 },
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-in/email-otp": { window: 60, max: 5 },
      "/email-otp/request-password-reset": { window: 60, max: 3 },
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: OTP_EXPIRES_IN_SECONDS,
      allowedAttempts: 5,
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: ({ email, otp, type }, ctx) =>
        sendOtp(email, otp, type, ctx?.request?.headers),
    }),
    twoFactor({
      issuer: "Exams",
      otpOptions: {
        sendOTP: ({ user, otp }, ctx) =>
          sendOtp(user.email, otp, "two-factor", ctx?.request?.headers),
      },
    }),
    admin(),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;

/** Social providers with credentials configured, in display order. */
export const enabledSocialProviders = (["google", "microsoft"] as const).filter(
  (provider) => provider in socialProviders,
);
