"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import { countryInput } from "../schemas";
import type { AdminCountry } from "./types";
import { useCatalogSaveHandlers } from "./use-catalog-save";

export function CountryForm({
  country,
  onSaved,
}: {
  country?: AdminCountry;
  onSaved: () => void;
}) {
  const t = useTranslations("admin.catalog");
  const trpc = useTRPC();
  const save = useMutation(
    trpc.catalog.saveCountry.mutationOptions(useCatalogSaveHandlers(onSaved)),
  );

  const form = useAppForm({
    defaultValues: {
      code: country?.code ?? "",
      currency: country?.currency ?? "",
      timeZone: country?.timeZone ?? "",
      active: country?.active ?? true,
    },
    validators: { onSubmit: countryInput },
    onSubmit: ({ value }) =>
      save.mutateAsync({ id: country?.id, data: countryInput.parse(value) }),
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.AppField name="code">
          {(field) => (
            <field.TextField
              label={t("country.code")}
              description={t("country.codeHint")}
              maxLength={2}
            />
          )}
        </form.AppField>
        <form.AppField name="currency">
          {(field) => (
            <field.TextField
              label={t("country.currency")}
              description={t("country.currencyHint")}
              maxLength={3}
            />
          )}
        </form.AppField>
        <form.AppField name="timeZone">
          {(field) => (
            <field.TextField
              label={t("country.timeZone")}
              description={t("country.timeZoneHint")}
            />
          )}
        </form.AppField>
        <form.AppField name="active">
          {(field) => <field.SwitchField label={t("country.active")} />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>{t("save")}</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
