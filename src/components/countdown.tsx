"use client";

import { useFormatter, useNow, useTranslations } from "next-intl";
import { useEffect } from "react";
import { Progress, ProgressLabel } from "@/components/ui/progress";

const WARNINGS_MS = [60_000, 300_000];

/**
 * Time left before a deadline, as a bar and mm:ss. Screen readers hear it only at 5 min and 1 min.
 * Calls `onEnd` once the deadline passes so the caller can refresh.
 */
export function Countdown({
  start,
  end,
  label,
  onEnd,
}: {
  start: Date;
  end: Date;
  label: string;
  onEnd: () => void;
}) {
  const t = useTranslations("countdown");
  const format = useFormatter();
  const now = useNow({ updateInterval: 1000 });
  const left = Math.max(0, end.getTime() - now.getTime());
  const total = end.getTime() - start.getTime();
  const ended = left === 0;

  useEffect(() => {
    if (ended) onEnd();
  }, [ended, onEnd]);

  const minutes = Math.floor(left / 60_000);
  const seconds = Math.floor((left % 60_000) / 1000);
  const warning = WARNINGS_MS.find((threshold) => left <= threshold);

  return (
    <Progress value={total > 0 ? (left / total) * 100 : 0}>
      <ProgressLabel className="flex w-full justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">
          {`${minutes}:${String(seconds).padStart(2, "0")}`}
        </span>
      </ProgressLabel>
      <span className="sr-only" aria-live="assertive">
        {warning ? t("warning", { minutes: Math.round(warning / 60_000) }) : ""}
      </span>
      <span className="sr-only">
        {t("until", {
          time: format.dateTime(end, { timeStyle: "short" }),
        })}
      </span>
    </Progress>
  );
}
