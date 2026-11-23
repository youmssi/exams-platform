import * as Sentry from "@sentry/nextjs";

/**
 * Error monitoring on the server (Node and edge). Off until `NEXT_PUBLIC_SENTRY_DSN` is set; no
 * personal data is sent (no IP, no cookies, no request bodies).
 */
/** Nothing about the person or the request: no user, cookies, headers, bodies or query. */
const PRIVATE = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
};

export function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? "development",
    dataCollection: PRIVATE,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;
