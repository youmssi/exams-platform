"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import { centerInput } from "../schemas";
import type { AdminCenter } from "./types";
import { useCatalogSaveHandlers } from "./use-catalog-save";

type Props = {
  center?: AdminCenter;
  countries: { value: string; label: string }[];
  onSaved: () => void;
};

export function CenterForm({ center, countries, onSaved }: Props) {
  const t = useTranslations("admin.catalog");
  const trpc = useTRPC();
  const save = useMutation(
    trpc.catalog.saveCenter.mutationOptions(useCatalogSaveHandlers(onSaved)),
  );

  const form = useAppForm({
    defaultValues: {
      countryId: center?.countryId ?? countries[0]?.value ?? "",
      name: center?.name ?? "",
      city: center?.city ?? "",
      officialUrl: center?.officialUrl ?? "",
      datesUrl: center?.datesUrl ?? "",
      autoDates: center?.autoDates ?? false,
      active: center?.active ?? true,
    },
    validators: { onSubmit: centerInput },
    onSubmit: ({ value }) =>
      // The server parses the input (empty dates page → none).
      save.mutateAsync({ id: center?.id, data: value }),
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
        <form.AppField name="countryId">
          {(field) => (
            <field.SelectField label={t("center.country")} items={countries} />
          )}
        </form.AppField>
        <form.AppField name="name">
          {(field) => <field.TextField label={t("center.name")} />}
        </form.AppField>
        <form.AppField name="city">
          {(field) => <field.TextField label={t("center.city")} />}
        </form.AppField>
        <form.AppField name="officialUrl">
          {(field) => (
            <field.TextField
              label={t("center.officialUrl")}
              type="url"
              inputMode="url"
            />
          )}
        </form.AppField>
        <form.AppField name="datesUrl">
          {(field) => (
            <field.TextField
              label={t("center.datesUrl")}
              description={t("center.datesUrlHint")}
              type="url"
              inputMode="url"
            />
          )}
        </form.AppField>
        <form.AppField name="autoDates">
          {(field) => (
            <field.SwitchField
              label={t("center.autoDates")}
              description={t("center.autoDatesHint")}
            />
          )}
        </form.AppField>
        <form.AppField name="active">
          {(field) => <field.SwitchField label={t("center.active")} />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>{t("save")}</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
