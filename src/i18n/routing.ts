import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  /** French unless the visitor picks English: the browser language is not used. */
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
