"use client";

import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { SpotlightCard } from "@/components/react-bits/spotlight-card";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import type { PublicOffer } from "./types";

/** One card per level, prices and split straight from the catalogue. */
export function PricingSection({ offers }: { offers: PublicOffer[] }) {
  const t = useTranslations("landing.pricing");
  const format = useFormatter();
  const money = (amount: number, currency: string) =>
    format.number(amount, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

  return (
    <section
      id="pricing"
      className="relative border-foreground/10 border-t py-32 lg:py-40"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-20 max-w-3xl">
          <span className="mb-6 block font-mono text-muted-foreground text-xs uppercase tracking-widest">
            {t("eyebrow")}
          </span>
          <h2 className="mb-6 font-display text-5xl text-foreground tracking-tight md:text-6xl lg:text-7xl">
            {t("title")}
            <br />
            <span className="text-stroke">{t("titleEnd")}</span>
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground">
            {t("description")}
          </p>
        </div>

        {offers.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <div
            className={`grid gap-px bg-foreground/10 md:grid-cols-2 ${offers.length >= 3 ? "lg:grid-cols-3" : ""}`}
          >
            {offers.map((offer, index) => {
              const currency = offer.center.country.currency;
              return (
                <SpotlightCard
                  key={offer.id}
                  theme="light"
                  className="flex flex-col rounded-none bg-background p-8 lg:p-12"
                  style={
                    {
                      "--spotlight-card-surface": "var(--background)",
                      "--spotlight-card-border": "transparent",
                      "--spotlight-card-shadow": "none",
                    } as React.CSSProperties
                  }
                >
                  <div className="mb-8">
                    <span className="font-mono text-muted-foreground text-xs">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 font-display text-3xl text-foreground">
                      {offer.level}
                    </h3>
                    <p className="mt-2 text-muted-foreground text-sm">
                      {offer.center.name} · {offer.center.city}
                    </p>
                  </div>
                  <div className="mb-8 flex flex-wrap items-baseline gap-x-2 border-foreground/10 border-b pb-8">
                    <span className="whitespace-nowrap font-display text-5xl text-foreground lg:text-6xl">
                      {money(offer.price.total, currency)}
                    </span>
                    <span className="text-muted-foreground">
                      {t("perPerson")}
                    </span>
                  </div>
                  <ul className="mb-10 flex-1 space-y-4">
                    {[
                      t("assistant", {
                        amount: money(offer.price.assistantShare, currency),
                      }),
                      t("platform", {
                        amount: money(offer.price.commission, currency),
                      }),
                      ...(offer.bonusCap > 0
                        ? [
                            t("bonus", {
                              amount: money(offer.bonusCap, currency),
                            }),
                          ]
                        : []),
                      t("modules"),
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-3">
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
                        <span className="text-muted-foreground text-sm">
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={routes.signIn}
                    className="group flex w-full items-center justify-center gap-2 border border-foreground/20 py-4 font-medium text-foreground text-sm transition-colors hover:border-foreground hover:bg-foreground/5"
                  >
                    {t("cta")}
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </SpotlightCard>
              );
            })}
          </div>
        )}
        <p className="mt-12 text-center text-muted-foreground text-sm">
          {t("note")}
        </p>
      </div>
    </section>
  );
}
