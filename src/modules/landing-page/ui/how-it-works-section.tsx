"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { TerminalLines } from "./terminal-lines";
import { reveal, useInView } from "./use-in-view";

type Step = {
  title: string;
  description: string;
  lines: string[];
};
const STEP_MS = 5000;
const NUMERALS = ["I", "II", "III"];

/** Three steps on a dark band; the panel replays what the candidate sees at each one. */
export function HowItWorksSection() {
  const t = useTranslations("landing.how");
  const steps = t.raw("steps") as Step[];
  const [ref, inView] = useInView<HTMLElement>();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setActive((current) => (current + 1) % steps.length),
      STEP_MS,
    );
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative overflow-hidden bg-foreground py-24 text-background lg:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="mb-6 inline-flex items-center gap-3 font-mono text-background/50 text-sm">
            <span className="h-px w-8 bg-background/30" />
            {t("eyebrow")}
          </span>
          <h2
            className={`font-display text-4xl tracking-tight lg:text-6xl ${reveal(inView, "translate-y-4")}`}
          >
            {t("title")}
            <br />
            <span className="text-background/50">{t("subtitle")}</span>
          </h2>
        </div>

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => setActive(index)}
                aria-pressed={active === index}
                className={`group w-full border-background/10 border-b py-8 text-left transition-opacity duration-500 ${
                  active === index
                    ? "opacity-100"
                    : "opacity-40 hover:opacity-70"
                }`}
              >
                <div className="flex items-start gap-6">
                  <span className="font-display text-3xl text-background/30">
                    {NUMERALS[index]}
                  </span>
                  <div className="flex-1">
                    <h3 className="mb-3 font-display text-2xl transition-transform duration-300 group-hover:translate-x-2 lg:text-3xl">
                      {step.title}
                    </h3>
                    <p className="text-background/60 leading-relaxed">
                      {step.description}
                    </p>
                    {active === index && (
                      <div className="mt-4 h-px overflow-hidden bg-background/20">
                        <div
                          className="progress-fill h-full w-0 bg-background"
                          style={
                            {
                              "--duration": `${STEP_MS}ms`,
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="self-start lg:sticky lg:top-32">
            <div className="overflow-hidden border border-background/10">
              <div className="flex items-center justify-between border-background/10 border-b px-6 py-4">
                <div className="flex gap-2">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="size-3 rounded-full bg-background/20"
                    />
                  ))}
                </div>
                <span className="font-mono text-background/40 text-xs">
                  {t("window")}
                </span>
              </div>
              <div className="min-h-[280px] p-8">
                <TerminalLines
                  id={active}
                  lines={steps[active].lines}
                  className="text-background/70"
                />
              </div>
              <div className="flex items-center gap-3 border-background/10 border-t px-6 py-4">
                <span className="size-2 animate-pulse rounded-full bg-green-400" />
                <span className="font-mono text-background/40 text-xs">
                  {t("status")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
