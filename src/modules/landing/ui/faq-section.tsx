"use client";

import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eyebrow } from "./eyebrow";
import { reveal, useInView } from "./use-in-view";

type Question = { q: string; a: string };

/** Honest answers instead of testimonials, until there are real ones. */
export function FaqSection({
  claimMinutes,
  others,
}: {
  claimMinutes: number;
  others: number;
}) {
  const t = useTranslations("landing.faq");
  const items = (t.raw("items") as Question[]).map(({ q, a }) => ({
    q,
    a: a
      .replace("{claim}", String(claimMinutes))
      .replace("{others}", String(others)),
  }));
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <section
      id="faq"
      ref={ref}
      className="relative border-foreground/10 border-t py-24 lg:py-32"
    >
      <div className="mx-auto grid max-w-[1400px] gap-16 px-6 lg:grid-cols-[2fr_3fr] lg:gap-24 lg:px-12">
        <div className={reveal(inView)}>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="font-display text-4xl tracking-tight lg:text-6xl">
            {t("title")}
            <br />
            <span className="text-muted-foreground">{t("titleEnd")}</span>
          </h2>
        </div>
        <Accordion className={`delay-200 ${reveal(inView, "translate-y-4")}`}>
          {items.map((item) => (
            <AccordionItem
              key={item.q}
              value={item.q}
              className="border-foreground/10"
            >
              <AccordionTrigger className="py-6 font-display text-xl hover:no-underline lg:text-2xl">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-base text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
