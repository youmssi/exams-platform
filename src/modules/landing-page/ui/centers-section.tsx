"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Eyebrow } from "./eyebrow";
import type { PublicOffer } from "./types";
import { reveal, useInView } from "./use-in-view";

/** The centres served and their levels, straight from the catalogue. */
export function CentersSection({ offers }: { offers: PublicOffer[] }) {
  const t = useTranslations("landing.centers");
  const [ref, inView] = useInView<HTMLElement>();
  const centers = [
    ...offers
      .reduce((all, offer) => {
        const key = `${offer.center.name}|${offer.center.city}`;
        const levels = all.get(key)?.levels ?? [];
        return all.set(key, {
          ...offer.center,
          levels: [...levels, offer.level],
        });
      }, new Map<string, PublicOffer["center"] & { levels: string[] }>())
      .values(),
  ];
  const stats = [
    { label: t("stats.centers"), value: centers.length },
    {
      label: t("stats.levels"),
      value: new Set(offers.map((offer) => offer.level)).size,
    },
    {
      label: t("stats.countries"),
      value: new Set(centers.map((center) => center.country.code)).size,
    },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (centers.length < 2) return;
    const interval = setInterval(
      () => setActive((current) => (current + 1) % centers.length),
      2000,
    );
    return () => clearInterval(interval);
  }, [centers.length]);

  return (
    <section ref={ref} className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] items-center gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-12">
        <div className={reveal(inView, "-translate-x-8")}>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mb-8 font-display text-4xl tracking-tight lg:text-6xl">
            {t("title")}
            <br />
            {t("titleEnd")}
          </h2>
          <p className="mb-12 text-muted-foreground text-xl leading-relaxed">
            {t("description")}
          </p>
          <div className="grid grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 font-display text-4xl lg:text-5xl">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`delay-200 ${reveal(inView, "translate-x-8")}`}>
          <div className="border border-foreground/10">
            <div className="flex items-center justify-between border-foreground/10 border-b px-6 py-4">
              <span className="font-mono text-muted-foreground text-sm">
                {t("panel")}
              </span>
              <span className="flex items-center gap-2 font-mono text-green-700 text-xs">
                <span className="size-2 animate-pulse rounded-full bg-green-500" />
                {t("panelStatus")}
              </span>
            </div>
            {centers.length === 0 ? (
              <p className="px-6 py-5 text-muted-foreground">{t("empty")}</p>
            ) : (
              centers.map((center, index) => (
                <div
                  key={`${center.name}-${center.city}`}
                  className={`flex items-center justify-between border-foreground/5 border-b px-6 py-5 transition-colors duration-300 last:border-b-0 ${
                    active === index ? "bg-foreground/[0.02]" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`size-2 rounded-full transition-colors duration-300 ${
                        active === index ? "bg-foreground" : "bg-foreground/20"
                      }`}
                    />
                    <div>
                      <div className="font-medium">{center.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {center.city}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-muted-foreground text-sm">
                    {center.levels.join(" · ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
