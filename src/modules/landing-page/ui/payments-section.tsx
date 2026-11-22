"use client";

import { useTranslations } from "next-intl";
import { Eyebrow } from "./eyebrow";
import { reveal, useInView } from "./use-in-view";

type Chip = { name: string; category: string };

function Row({ items, reverse }: { items: Chip[]; reverse?: boolean }) {
  return (
    <div
      className={`flex w-max gap-6 ${reverse ? "marquee-reverse" : "marquee"}`}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className="flex shrink-0 gap-6"
          aria-hidden={copy === 1}
        >
          {items.map((item) => (
            <div
              key={item.name}
              className="group shrink-0 border border-foreground/10 px-8 py-6 transition-colors hover:border-foreground/30 hover:bg-foreground/[0.02]"
            >
              <div className="font-medium text-lg transition-transform group-hover:translate-x-1">
                {item.name}
              </div>
              <div className="text-muted-foreground text-sm">
                {item.category}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** How people pay and connect, on two opposite marquees. */
export function PaymentsSection() {
  const t = useTranslations("landing.payments");
  const items = t.raw("items") as Chip[];
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <section ref={ref} className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div
          className={`mx-auto mb-16 max-w-3xl text-center lg:mb-24 ${reveal(inView)}`}
        >
          <Eyebrow centered>{t("eyebrow")}</Eyebrow>
          <h2 className="mb-6 font-display text-4xl tracking-tight lg:text-6xl">
            {t("title")}
            <br />
            {t("titleEnd")}
          </h2>
          <p className="text-muted-foreground text-xl">{t("description")}</p>
        </div>
      </div>
      <div className="mb-6">
        <Row items={items} />
      </div>
      <Row items={[...items].reverse()} reverse />
    </section>
  );
}
