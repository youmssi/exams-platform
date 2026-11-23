"use client";

import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { bonusOptions } from "@/modules/catalog/client";

/** Modules of the level, all selected for the full exam (publishing and editing share it). */
export function ModulesPicker({
  available,
  value,
  onChange,
}: {
  available: string[];
  value: string[];
  onChange: (modules: string[]) => void;
}) {
  const t = useTranslations("publish");
  return (
    <FieldSet>
      <FieldLegend variant="label">{t("modules")}</FieldLegend>
      <ToggleGroup
        multiple
        variant="outline"
        size="sm"
        className="flex-wrap"
        value={value}
        onValueChange={onChange}
      >
        {available.map((module) => (
          <ToggleGroupItem key={module} value={module}>
            <CheckIcon className="hidden group-aria-pressed/toggle:block" />
            {module}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <FieldDescription>
        {value.length === available.length ? t("fullExam") : t("pickModules")}
      </FieldDescription>
    </FieldSet>
  );
}

/** Bonus steps allowed by the offer; `min` hides the steps below the current bonus when editing. */
export function BonusPicker({
  offer,
  value,
  onChange,
  money,
  min = 0,
}: {
  offer: { bonusStep: number; bonusCap: number };
  value: number;
  onChange: (bonus: number) => void;
  money: (amount: number) => string;
  min?: number;
}) {
  const t = useTranslations("publish");
  return (
    <div className="flex flex-col gap-2">
      <FieldDescription>{t("bonusHint")}</FieldDescription>
      <ToggleGroup
        variant="outline"
        size="sm"
        className="flex-wrap"
        value={[String(value)]}
        onValueChange={(next) => onChange(Number(next[0] ?? min))}
      >
        {bonusOptions(offer)
          .filter((option) => option >= min)
          .map((option) => (
            <ToggleGroupItem key={option} value={String(option)}>
              {option ? `+${money(option)}` : t("noBonus")}
            </ToggleGroupItem>
          ))}
      </ToggleGroup>
    </div>
  );
}
