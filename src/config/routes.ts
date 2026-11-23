/** Application routes, without locale prefix. Single source for links and redirects. */
export const routes = {
  landing: "/",
  signIn: "/sign-in",
  resetPassword: "/reset-password",
  welcome: "/welcome",
  home: "/home",
  account: "/account",
  beneficiaries: "/beneficiaries",
  sessions: "/sessions",
  requests: "/requests",
  queue: "/queue",
  blacklist: "/blacklist",
  terms: "/terms",
  privacy: "/privacy",
  /** Public page a friend opens from the consent email (EXM-024). */
  consent: "/consent",
  adminCatalog: "/admin/catalog",
  adminPayments: "/admin/payments",
  adminDisputes: "/admin/disputes",
  adminSessions: "/admin/sessions",
} as const;

/** Routes reachable without a session. */
export const publicRoutes: readonly string[] = [
  routes.landing,
  routes.signIn,
  routes.resetPassword,
  routes.terms,
  routes.privacy,
  routes.consent,
];

/** Keeps a post-sign-in redirect inside the app. */
export function safeNextPath(next: string | null | undefined): string {
  return next?.startsWith("/") && !next.startsWith("//") ? next : routes.home;
}
