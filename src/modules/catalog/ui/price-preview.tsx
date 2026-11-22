"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { type PricingSettings, priceBreakdown } from "../domain/pricing";

/** Live split of what the candidate pays, without bonus and with the maximum bonus. */
export function PricePreview({
  settings,
  currency,
}: {
  settings: PricingSettings;
  currency: string;
}) {
  const t = useTranslations("admin.catalog.offer");
  const format = useFormatter();
  const money = (amount: number) =>
    format.number(amount, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

  const cases = [
    { key: "previewBase", bonus: 0 },
    { key: "previewMax", bonus: settings.bonusCap },
  ] as const;

  return (
    <Card size="sm" aria-live="polite">
      <CardHeader>
        <CardTitle>{t("preview")}</CardTitle>
        <CardDescription>{t("newRequestsOnly")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {cases.map(({ key, bonus }) => {
            const split = priceBreakdown(settings, bonus);
            return (
              <Item key={key} variant="outline" size="sm">
                <ItemContent>
                  <ItemTitle>
                    {t(key)} · {t("total")} {money(split.total)}
                  </ItemTitle>
                  <ItemDescription>
                    {t("assistant")} {money(split.assistantShare)} ·{" "}
                    {t("platform")} {money(split.commission)}
                  </ItemDescription>
                </ItemContent>
              </Item>
            );
          })}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
