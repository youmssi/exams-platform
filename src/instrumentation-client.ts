import * as Sentry from "@sentry/nextjs";

/** Error monitoring in the browser, off until `NEXT_PUBLIC_SENTRY_DSN` is set. No personal data. */
const PRIVATE = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
};
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn)
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
    dataCollection: PRIVATE,
    tracesSampleRate: 0.1,
  });

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
