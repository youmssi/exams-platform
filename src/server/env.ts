import "server-only";
import { z } from "zod";

/**
 * Server environment, validated on first use.
 * Every new variable is declared here and in `.env.example`.
 */
const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_URL: z.url(),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  /** Without it, the queue falls back to periodic refresh and presence is hidden. */
  ABLY_API_KEY: z.string().optional(),
  /** Set by Vercel; keeps preview and production realtime channels apart. */
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
  EMAIL_FROM: z.string().min(1),
  /** 32 random bytes, base64. Encrypts exam-centre passwords. */
  CREDENTIALS_ENCRYPTION_KEY: z
    .string()
    .refine(
      (value) => Buffer.from(value, "base64").length === 32,
      "must be 32 bytes in base64",
    ),
});

/** Previews use their stable branch URL (e.g. the develop alias); production sets APP_URL. */
const vercelHost = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;

export const env = schema.parse({
  ...process.env,
  APP_URL:
    process.env.APP_URL ?? (vercelHost ? `https://${vercelHost}` : undefined),
});
