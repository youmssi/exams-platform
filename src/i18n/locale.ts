import { hasLocale } from "next-intl";
import { type Locale, routing } from "./routing";

/** Resolves the visitor's locale from the next-intl cookie, for server code outside a page. */
export function localeFromHeaders(headers?: Headers | null): Locale {
  const match = headers?.get("cookie")?.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const value = match?.[1];
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}
