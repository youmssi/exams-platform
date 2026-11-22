/**
 * Wall-clock times in a given IANA time zone, independent of the server's or browser's zone.
 * Input/output format is the one of `<input type="datetime-local">`: "YYYY-MM-DDTHH:mm".
 */
const parts = (date: Date, timeZone: string) => {
  const values = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
};

/** Offset of `timeZone` from UTC at `date`, in minutes. */
const offsetMinutes = (date: Date, timeZone: string) =>
  (Date.parse(`${parts(date, timeZone)}:00Z`) -
    Math.floor(date.getTime() / 60_000) * 60_000) /
  60_000;

/** "2026-12-01T09:00" in Africa/Douala → the matching UTC instant. */
export function zonedToUtc(local: string, timeZone: string): Date {
  const asUtc = new Date(`${local}:00Z`);
  const first = new Date(
    asUtc.getTime() - offsetMinutes(asUtc, timeZone) * 60_000,
  );
  // A second pass settles instants close to a daylight-saving change.
  return new Date(asUtc.getTime() - offsetMinutes(first, timeZone) * 60_000);
}

/** A UTC instant → "YYYY-MM-DDTHH:mm" as seen in `timeZone`. */
export function utcToZoned(date: Date, timeZone: string): string {
  return parts(date, timeZone);
}
