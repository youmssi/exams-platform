"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import {
  CATALOG_REQUEST_KINDS,
  type CatalogRequestInput,
  catalogRequestInput,
} from "../schemas";

/** Asks the admins to add a country, a centre or a level that is missing. */
export function CatalogRequestForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations("sessions.catalogRequest");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const send = useMutation(
    trpc.catalog.requestAddition.mutationOptions({
      onSuccess: () => {
        toast.success(t("sent"));
        onDone();
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );

  const form = useAppForm({
    defaultValues: {
      kind: "LEVEL" as CatalogRequestInput["kind"],
      details: "",
      officialUrl: "",
    },
    validators: { onSubmit: catalogRequestInput },
    onSubmit: ({ value }) => send.mutateAsync(catalogRequestInput.parse(value)),
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
        <form.AppField name="kind">
          {(field) => (
            <field.ChoiceCardsField
              legend={t("kind")}
              options={CATALOG_REQUEST_KINDS.map((kind) => ({
                value: kind,
                title: t(`kinds.${kind}`),
              }))}
            />
          )}
        </form.AppField>
        <form.AppField name="details">
          {(field) => (
            <field.TextareaField
              label={t("details")}
              description={t("detailsHint")}
            />
          )}
        </form.AppField>
        <form.AppField name="officialUrl">
          {(field) => (
            <field.TextField
              label={t("officialUrl")}
              type="url"
              inputMode="url"
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>{t("submit")}</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
