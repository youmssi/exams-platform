"use client";

import { BadgeCheckIcon, EyeOffIcon, LockIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Eyebrow } from "./eyebrow";
import { reveal, useInView } from "./use-in-view";

const ITEMS = [
  { id: "encrypted", Icon: LockIcon },
  { id: "anonymous", Icon: EyeOffIcon },
  { id: "erased", Icon: Trash2Icon },
  { id: "verified", Icon: BadgeCheckIcon },
] as const;

/** What protects candidates and their credentials. */
export function SecuritySection() {
  const t = useTranslations("landing.security");
  const tags = t.raw("tags") as string[];
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <section
      id="security"
      ref={ref}
      className="relative overflow-hidden bg-foreground/[0.02] py-24 lg:py-32"
    >
      <div className="mx-auto grid max-w-[1400px] gap-16 px-6 lg:grid-cols-2 lg:gap-24 lg:px-12">
        <div className={reveal(inView)}>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mb-8 font-display text-4xl tracking-tight lg:text-6xl">
            {t("title")}
            <br />
            {t("titleEnd")}
          </h2>
          <p className="mb-12 text-muted-foreground text-xl leading-relaxed">
            {t("description")}
          </p>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag, index) => (
              <span
                key={tag}
                className={`border border-foreground/10 px-4 py-2 font-mono text-sm ${reveal(inView, "translate-y-4")}`}
                style={{ transitionDelay: `${index * 50 + 200}ms` }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-6">
          {ITEMS.map(({ id, Icon, ...item }, index) => (
            <div
              key={id}
              className={`group border border-foreground/10 p-6 hover:border-foreground/20 ${reveal(inView, "translate-x-8")}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center border border-foreground/10 transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="mb-1 font-medium text-lg transition-transform duration-300 group-hover:translate-x-1">
                    {t(`items.${id}.title`)}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(`items.${id}.description`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
