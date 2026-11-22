/** Application routes, without locale prefix. Single source for links and redirects. */
export const routes = {
  landing: "/",
  signIn: "/sign-in",
  resetPassword: "/reset-password",
  welcome: "/welcome",
  home: "/home",
  account: "/account",
  beneficiaries: "/beneficiaries",
  terms: "/terms",
  adminCatalog: "/admin/catalog",
} as const;

/** Routes reachable without a session. */
export const publicRoutes: readonly string[] = [
  routes.landing,
  routes.signIn,
  routes.resetPassword,
  routes.terms,
];

/** Keeps a post-sign-in redirect inside the app. */
export function safeNextPath(next: string | null | undefined): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : routes.home;
}
