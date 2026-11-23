/**
 * Reads exam dates from the text of a centre's official page (EXM-023). The page layout is not
 * known in advance: a date belongs to the closest level mentioned just before it, in the formats
 * centres use ("15.03.2027", "15/03/2027", "15 mars 2027", "15. März 2027", "March 15, 2027").
 */
const MONTHS: Record<string, number> = {
  janvier: 1,
  fevrier: 2,
  mars: 3,
  avril: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  aout: 8,
  septembre: 9,
  octobre: 10,
  novembre: 11,
  decembre: 12,
  januar: 1,
  februar: 2,
  marz: 3,
  april: 4,
  juni: 6,
  juli: 7,
  august: 8,
  oktober: 10,
  dezember: 12,
  january: 1,
  february: 2,
  march: 3,
  may: 5,
  june: 6,
  july: 7,
  october: 10,
  december: 12,
};

/** How far before a date its level must appear, in characters. */
const WINDOW = 160;
/** Level names a page may mention; the closest one before a date owns it. */
const LEVELS = /\b(?:a1|a2|b1|b2|c1|c2)\b/g;

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ");

const iso = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date.toISOString().slice(0, 10)
    : null;
};

const PATTERNS: {
  regex: RegExp;
  read: (m: RegExpExecArray) => string | null;
}[] = [
  {
    regex: /\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/g,
    read: (m) => iso(Number(m[3]), Number(m[2]), Number(m[1])),
  },
  {
    regex: /\b(\d{1,2})\.? ([a-z]+) (\d{4})\b/g,
    read: (m) =>
      MONTHS[m[2]] ? iso(Number(m[3]), MONTHS[m[2]], Number(m[1])) : null,
  },
  {
    regex: /\b([a-z]+) (\d{1,2}),? (\d{4})\b/g,
    read: (m) =>
      MONTHS[m[1]] ? iso(Number(m[3]), MONTHS[m[1]], Number(m[2])) : null,
  },
];

/** Dates ("YYYY-MM-DD") that follow a mention of `level`, from today on, without duplicates. */
export function extractExamDates(text: string, level: string, today: string) {
  const page = normalize(text);
  const wanted = normalize(level);
  const own = new RegExp(
    `\\b${wanted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "g",
  );
  const mentions = [...page.matchAll(LEVELS), ...page.matchAll(own)]
    .map((m) => ({ at: m.index ?? 0, level: m[0] }))
    .sort((a, b) => a.at - b.at);
  const ownerOf = (at: number) =>
    mentions
      .filter((mention) => mention.at <= at && at - mention.at <= WINDOW)
      .at(-1)?.level;
  const found = new Set<string>();
  for (const { regex, read } of PATTERNS)
    for (const match of page.matchAll(regex)) {
      const date = read(match);
      if (date && date >= today && ownerOf(match.index ?? 0) === wanted)
        found.add(date);
    }
  return [...found].sort();
}

/** Visible text of an HTML page, without scripts and styles. */
export const pageText = (html: string) =>
  html
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&");
