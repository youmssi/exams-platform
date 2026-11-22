import { getSessionCookie } from "better-auth/cookies";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { publicRoutes, routes } from "@/config/routes";
import { routing } from "@/i18n/routing";

const intl = createMiddleware(routing);
const localePrefix = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
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
