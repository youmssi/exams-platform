"use client";

import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { palette } from "@/components/brand/palette";
import { BlurText } from "@/components/react-bits/blur-text";
import { ShinyText } from "@/components/react-bits/shiny-text";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { AnimatedSphere } from "./animations";
import { reveal, useInView } from "./use-in-view";

type Fact = { value: string; label: string; tag: string };

/** Big editorial headline with a rotating word, the ASCII sphere and a marquee of facts. */
export function HeroSection({
  signedIn,
  maxPeople,
}: {
  signedIn: boolean;
  maxPeople: number;
}) {
  const t = useTranslations("landing.hero");
  const words = t.raw("words") as string[];
  const facts = (t.raw("facts") as Fact[]).map((fact) => ({
    ...fact,
    value: fact.value.replace("{max}", String(maxPeople)),
  }));
  const [ref, inView] = useInView<HTMLElement>(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((current) => (current + 1) % words.length),
      2500,
    );
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden"
    >
      <div className="pointer-events-none absolute top-1/2 right-0 size-[600px] -translate-y-1/2 opacity-40 lg:size-[800px]">
        <AnimatedSphere />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-30">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static decorative grid.
            key={`h-${i}`}
            className="absolute inset-x-0 h-px bg-foreground/10"
            style={{ top: `${12.5 * (i + 1)}%` }}
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static decorative grid.
            key={`v-${i}`}
            className="absolute inset-y-0 w-px bg-foreground/10"
            style={{ left: `${8.33 * (i + 1)}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 py-32 lg:px-12 lg:py-40">
        <div className={`mb-8 ${reveal(inView, "translate-y-4")}`}>
          <span className="inline-flex items-center gap-3 font-mono text-sm">
            <span className="h-px w-8 bg-foreground/30" />
            <ShinyText
              text={t("eyebrow")}
              color={palette.muted}
              shineColor={palette.foreground}
              speed={3}
              delay={2}
            />
          </span>
        </div>

        <h1
          className={`mb-12 font-display text-[clamp(3rem,10vw,9rem)] leading-[0.9] tracking-tight duration-1000 ${reveal(inView)}`}
        >
          <BlurText
            text={t("line1")}
            className="block"
            delay={45}
            stepDuration={0.3}
            blur={8}
            distance={16}
            trigger="load"
          />
          <span className="block">
            {t("line2")}{" "}
            <span className="relative inline-block" aria-live="polite">
              <span key={index} className="inline-flex">
                {[...words[index]].map((char, i) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: letters of one word, re-keyed by word.
                    key={`${index}-${i}`}
                    className="char-in inline-block"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {char === " " ? " " : char}
                  </span>
                ))}
              </span>
              <span className="absolute inset-x-0 -bottom-2 h-3 bg-foreground/10" />
            </span>
          </span>
        </h1>

        <div className="grid items-end gap-12 lg:grid-cols-2 lg:gap-24">
          <p
            className={`max-w-xl text-muted-foreground text-xl leading-relaxed delay-200 lg:text-2xl ${reveal(inView, "translate-y-4")}`}
          >
            {t("description")}
          </p>
          <div
            className={`flex flex-col items-start gap-4 delay-300 sm:flex-row ${reveal(inView, "translate-y-4")}`}
          >
            <Button
              size="lg"
              className="group h-14 rounded-full px-8 text-base"
              render={<Link href={signedIn ? routes.home : routes.signIn} />}
            >
              {t("primary")}
              <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-foreground/20 px-8 text-base"
              // biome-ignore lint/a11y/useAnchorContent: the button renders its label inside the anchor.
              render={<a href="#how-it-works" />}
            >
              {t("secondary")}
            </Button>
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-12 delay-500 lg:bottom-24 ${reveal(inView, "")}`}
      >
        <div className="marquee flex w-max gap-16 whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-16" aria-hidden={copy === 1}>
              {facts.map((fact) => (
                <div key={fact.tag} className="flex items-baseline gap-4">
                  <span className="font-display text-4xl lg:text-5xl">
                    {fact.value}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {fact.label}
                    <span className="mt-1 block font-mono text-xs">
                      {fact.tag}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
