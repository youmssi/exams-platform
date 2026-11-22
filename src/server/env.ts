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
  EMAIL_FROM: z.string().min(1),
});

/** Previews use their stable branch URL (e.g. the develop alias); production sets APP_URL. */
const vercelHost = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;

export const env = schema.parse({
  ...process.env,
  APP_URL:
    process.env.APP_URL ?? (vercelHost ? `https://${vercelHost}` : undefined),
});
