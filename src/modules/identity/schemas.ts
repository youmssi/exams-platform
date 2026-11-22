import { z } from "zod";

export const OTP_LENGTH = 6;
export const OTP_EXPIRES_IN_SECONDS = 10 * 60;
export const OTP_RESEND_AFTER_SECONDS = 30;
export const PASSWORD_MIN_LENGTH = 8;

export const ROLES = ["candidate", "assistant"] as const;
export type Role = (typeof ROLES)[number];

/** Normalizes the stored role, which Better Auth types as a plain string. */
export const toRole = (value: string | null | undefined): Role =>
  value === "assistant" ? "assistant" : "candidate";

/** Messages are translation keys from the `validation` namespace. */
export const emailSchema = z.email("email");
export const otpSchema = z
  .string()
  .regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), "otp");
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "passwordTooShort");

export const onboardingSchema = z.object({
  name: z.string().trim().min(1, "required").max(120, "tooLong"),
  role: z.enum(ROLES),
  acceptTerms: z.literal(true, "termsRequired"),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const roleSchema = z.object({ role: z.enum(ROLES) });
