"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import { assistantProfileInput } from "../schemas";
import type { AssistantProfile } from "./types";

/** Phone and Mobile Money account: what candidates need to reach and pay the assistant. */
export function AssistantProfileForm({
  data: { profile, countries },
  onSaved,
}: {
  data: AssistantProfile;
  onSaved: () => void;
}) {
  const t = useTranslations("assistantProfile");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const save = useMutation(
    trpc.assistants.saveProfile.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.assistants.profile.queryKey(),
        });
        toast.success(t("saved"));
        onSaved();
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );

  const form = useAppForm({
    defaultValues: {
      countryId: profile?.countryId ?? countries[0]?.id ?? "",
      operator: profile?.operator ?? "",
      momoNumber: profile?.momoNumber ?? "",
      momoName: profile?.momoName ?? "",
      phone: profile?.phone ?? "",
    },
    validators: { onSubmit: assistantProfileInput },
    onSubmit: ({ value }) => save.mutateAsync(value),
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
        <form.AppField name="phone">
          {(field) => (
            <field.TextField
              label={t("phone")}
              description={t("phoneHint")}
              type="tel"
              inputMode="tel"
            />
          )}
        </form.AppField>
        <FieldSet>
          <FieldLegend>{t("payout")}</FieldLegend>
          <FieldGroup>
            {countries.length > 1 && (
              <form.AppField name="countryId">
                {(field) => (
                  <field.SelectField
                    label={t("country")}
                    items={countries.map((country) => ({
                      value: country.id,
                      label: country.code,
                    }))}
                  />
                )}
              </form.AppField>
            )}
            <form.Subscribe selector={(state) => state.values.countryId}>
              {(countryId) => (
                <form.AppField name="operator">
                  {(field) => (
                    <field.ChoiceCardsField
                      legend={t("operator")}
                      options={(
                        countries.find((country) => country.id === countryId)
                          ?.mobileMoneyOperators ?? []
                      ).map((operator) => ({
                        value: operator,
                        title: operator,
                      }))}
                    />
                  )}
                </form.AppField>
              )}
            </form.Subscribe>
            <form.AppField name="momoNumber">
              {(field) => (
                <field.TextField
                  label={t("momoNumber")}
                  type="tel"
                  inputMode="tel"
                />
              )}
            </form.AppField>
            <form.AppField name="momoName">
              {(field) => (
                <field.TextField
                  label={t("momoName")}
                  description={t("momoNameHint")}
                />
              )}
            </form.AppField>
          </FieldGroup>
        </FieldSet>
        <form.AppForm>
          <form.SubmitButton>{t("save")}</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
