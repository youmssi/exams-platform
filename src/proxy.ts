import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { publicRoutes, routes } from "@/config/routes";
import { routing } from "@/i18n/routing";

const intl = createMiddleware(routing);
const localePrefix = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

/** Production answers on one address: the others (Vercel aliases) redirect there, so sign-in origins always match. */
const canonicalHost =
  process.env.VERCEL_ENV === "production" && process.env.APP_URL
    ? new URL(process.env.APP_URL).host
    : null;

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (canonicalHost && request.nextUrl.host !== canonicalHost) {
    const url = request.nextUrl.clone();
    url.host = canonicalHost;
    url.protocol = "https";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }
  const prefix = pathname.match(localePrefix)?.[0] ?? "";
  const path = pathname.slice(prefix.length) || "/";

  // Optimistic check only: pages and API verify the session on the server.
  if (!publicRoutes.includes(path) && !getSessionCookie(request)) {
    const url = new URL(`${prefix}${routes.signIn}`, request.url);
    url.searchParams.set("next", `${path}${search}`);
    return NextResponse.redirect(url);
  }

  return intl(request);
}

export const config = {
  // Skips API routes, Next internals, files with an extension and generated metadata images.
  matcher:
    "/((?!api|trpc|_next|_vercel|.*opengraph-image|apple-icon|.*\\..*).*)",
};
