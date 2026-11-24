import "server-only";
import { env } from "./env";

/**
 * Scheduled jobs (Vercel Cron daily, GitHub Actions hourly) authenticate with `CRON_SECRET`.
 * Without the secret, no job runs.
 */
export const isCronRequest = (request: Request) =>
  Boolean(env.CRON_SECRET) &&
  request.headers.get("authorization") === `Bearer ${env.CRON_SECRET}`;
