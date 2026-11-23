import type { Formats } from "next-intl";

/**
 * Named formats shared by server and client (inherited by NextIntlClientProvider).
 * `zoned` shows a moment in a centre's time zone with its name; Intl refuses
 * `timeZoneName` next to `dateStyle`/`timeStyle`, hence the explicit fields.
 */
export const formats = {
  dateTime: {
    zoned: {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    },
  },
} satisfies Formats;
