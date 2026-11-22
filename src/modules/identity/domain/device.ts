/** A readable device label from a User-Agent header, e.g. "Chrome · Android". */
const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser\//, "Samsung Internet"],
  [/Firefox\/|FxiOS\//, "Firefox"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const SYSTEMS: [RegExp, string][] = [
  [/Android/, "Android"],
  [/iPhone|iPad|iPod/, "iOS"],
  [/Windows/, "Windows"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

const find = (rules: [RegExp, string][], value: string) =>
  rules.find(([pattern]) => pattern.test(value))?.[1];

export function deviceLabel(
  userAgent: string | null | undefined,
): string | null {
  if (!userAgent) return null;
  const parts = [find(BROWSERS, userAgent), find(SYSTEMS, userAgent)].filter(
    Boolean,
  );
  return parts.length ? parts.join(" · ") : null;
}
