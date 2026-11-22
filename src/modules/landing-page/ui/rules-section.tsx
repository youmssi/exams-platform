"use client";

import { useFormatter, useNow, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Eyebrow } from "./eyebrow";
import { reveal, useInView } from "./use-in-view";

function Counter({ end, run }: { end: number; run: boolean }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 2000, 1);
      setValue(Math.round((1 - (1 - progress) ** 3) * end));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, run]);
  return (
    <div className="font-display text-6xl tracking-tight lg:text-8xl">
      {value}
    </div>
  );
}

/** The deadlines everyone works with, from the catalogue settings. */
export function RulesSection({
  rules,
}: {
  rules: { claim: number; confirm: number; payment: number; group: number };
}) {
  const t = useTranslations("landing.rules");
  const format = useFormatter();
  const now = useNow({ updateInterval: 1000 });
  const [ref, inView] = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      className="relative border-foreground/10 border-y py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mb-16 flex flex-col gap-8 lg:mb-24 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2
              className={`font-display text-4xl tracking-tight lg:text-6xl ${reveal(inView, "translate-y-4")}`}
            >
              {t("title")}
              <br />
              {t("titleEnd")}
            </h2>
          </div>
          <div className="flex items-center gap-4 font-mono text-muted-foreground text-sm">
            <span className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-green-500" />
              {t("live")}
            </span>
            <span className="text-foreground/30">|</span>
            <span suppressHydrationWarning>
              {format.dateTime(now, { timeStyle: "medium" })}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-px bg-foreground/10 md:grid-cols-2">
          {(Object.keys(rules) as (keyof typeof rules)[]).map((key, index) => (
            <div
              key={key}
              className={`bg-background p-8 lg:p-12 ${reveal(inView)}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Counter end={rules[key]} run={inView} />
              <div className="mt-4 text-lg text-muted-foreground">{t(key)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
