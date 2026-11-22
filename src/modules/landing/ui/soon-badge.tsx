"use client";

import { useTranslations } from "next-intl";
import { ShinyText } from "@/components/react-bits/shiny-text";

/** Marks a feature announced but not live yet; removed when its story ships. */
export function SoonBadge({ inverted = false }: { inverted?: boolean }) {
  const t = useTranslations("landing");
  return (
    <span className="ml-3 inline-flex border border-current/20 px-2 py-0.5 align-middle font-mono text-[0.65rem] uppercase tracking-widest">
      <ShinyText
        text={t("soon")}
        color={inverted ? "var(--background)" : "var(--muted-foreground)"}
        shineColor={inverted ? "var(--muted-foreground)" : "var(--foreground)"}
        speed={2.5}
        delay={1.5}
      />
    </span>
  );
}
