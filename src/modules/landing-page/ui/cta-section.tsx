"use client";

import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { AnimatedTetrahedron } from "./animations";
import { reveal, useInView } from "./use-in-view";

/** Last call, for both roles, under a spotlight that follows the pointer. */
export function CtaSection() {
  const t = useTranslations("landing.cta");
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const [spot, setSpot] = useState({ x: 50, y: 50 });

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div
          ref={ref}
          onPointerMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setSpot({
              x: ((event.clientX - rect.left) / rect.width) * 100,
              y: ((event.clientY - rect.top) / rect.height) * 100,
            });
          }}
          className={`relative border border-foreground duration-1000 ${reveal(inView)}`}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(600px circle at ${spot.x}% ${spot.y}%, rgba(0,0,0,0.15), transparent 40%)`,
            }}
          />
          <div className="relative z-10 flex flex-col items-center justify-between gap-12 px-8 py-16 lg:flex-row lg:px-16 lg:py-24">
            <div className="flex-1">
              <h2 className="mb-8 font-display text-4xl leading-[0.95] tracking-tight lg:text-7xl">
                {t("title")}
                <br />
                {t("titleEnd")}
              </h2>
              <p className="mb-12 max-w-xl text-muted-foreground text-xl leading-relaxed">
                {t("description")}
              </p>
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="group h-14 rounded-full px-8 text-base"
                  render={<Link href={routes.signIn} />}
                >
                  {t("candidate")}
                  <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-foreground/20 px-8 text-base"
                  render={<Link href={routes.signIn} />}
                >
                  {t("assistant")}
                </Button>
              </div>
              <p className="mt-8 font-mono text-muted-foreground text-sm">
                {t("free")}
              </p>
            </div>
            <div className="-mr-16 hidden size-[500px] items-center justify-center lg:flex">
              <AnimatedTetrahedron />
            </div>
          </div>
          <div className="absolute top-0 right-0 size-32 border-foreground/10 border-b border-l" />
          <div className="absolute bottom-0 left-0 size-32 border-foreground/10 border-t border-r" />
        </div>
      </div>
    </section>
  );
}
