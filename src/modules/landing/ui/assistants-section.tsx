"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { Eyebrow } from "./eyebrow";
import { SoonBadge } from "./soon-badge";
import { TerminalLines } from "./terminal-lines";
import { reveal, useInView } from "./use-in-view";

type Tab = { label: string; lines: string[]; soon?: boolean };
type Feature = { title: string; description: string };

/** For assistants: what they get, and a replay of the operation screen. */
export function AssistantsSection() {
  const t = useTranslations("landing.assistants");
  const tabs = t.raw("tabs") as Tab[];
  const features = t.raw("features") as Feature[];
  const [ref, inView] = useInView<HTMLElement>();
  const [active, setActive] = useState(0);

  return (
    <section
      id="assistants"
      ref={ref}
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid items-start gap-16 lg:grid-cols-2 lg:gap-24">
          <div className={reveal(inView)}>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 className="mb-8 font-display text-4xl tracking-tight lg:text-6xl">
              {t("title")}
              <br />
              <span className="text-muted-foreground">{t("titleEnd")}</span>
            </h2>
            <p className="mb-12 text-muted-foreground text-xl leading-relaxed">
              {t("description")}
            </p>
            <div className="grid grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={reveal(inView, "translate-y-4")}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  <h3 className="mb-1 font-medium">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`delay-200 lg:sticky lg:top-32 ${reveal(inView, "translate-x-8")}`}
          >
            <div className="border border-foreground/10">
              <div
                className="flex items-center overflow-x-auto border-foreground/10 border-b"
                role="tablist"
              >
                {tabs.map((tab, index) => (
                  <button
                    key={tab.label}
                    type="button"
                    role="tab"
                    aria-selected={active === index}
                    onClick={() => setActive(index)}
                    className={`relative shrink-0 px-6 py-4 font-mono text-sm transition-colors ${
                      active === index
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {tab.soon && <SoonBadge />}
                    {active === index && (
                      <span className="absolute inset-x-0 bottom-0 h-px bg-foreground" />
                    )}
                  </button>
                ))}
              </div>
              <div
                className="min-h-[220px] bg-foreground/[0.01] p-8"
                role="tabpanel"
              >
                <TerminalLines
                  id={active}
                  lines={tabs[active].lines}
                  className="text-foreground/80"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm">
              <Link
                href={routes.signIn}
                className="underline-offset-4 hover:underline"
              >
                {t("join")}
              </Link>
              <span className="text-foreground/20">|</span>
              <Link
                href={routes.terms}
                className="text-muted-foreground hover:text-foreground"
              >
                {t("terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
