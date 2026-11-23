"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import {
  type OfferFormValues,
  offerFormSchema,
  toOfferForm,
  toOfferInput,
} from "../schemas";
import { PricePreview } from "./price-preview";
import type { AdminOffer } from "./types";
import { useCatalogSaveHandlers } from "./use-catalog-save";

type Props = {
  offer?: AdminOffer;
  centers: { value: string; label: string; currency: string }[];
  onSaved: () => void;
};

/** Starting values for a new level, taken from the product decisions (see docs/product/spec.md §4). */
const NEW_OFFER: Omit<OfferFormValues, "centerId"> = {
  level: "",
  modules: "",
  standardPrice: 3000,
  commissionPercent: 10,
  commissionMin: 300,
  bonusStep: 500,
  bonusCap: 3000,
  claimTimeoutMin: 20,
  confirmOnlineMin: 15,
  confirmOfflineMin: 5,
  paymentDeadlineH: 24,
  centerFeeDays: 0,
  active: true,
};

export function OfferForm({ offer, centers, onSaved }: Props) {
  const t = useTranslations("admin.catalog");
  const trpc = useTRPC();
  const save = useMutation(
    trpc.catalog.saveOffer.mutationOptions(useCatalogSaveHandlers(onSaved)),
  );

  const form = useAppForm({
    defaultValues: offer
      ? toOfferForm(offer)
      : { ...NEW_OFFER, centerId: centers[0]?.value ?? "" },
    validators: { onSubmit: offerFormSchema },
    onSubmit: ({ value }) =>
      save.mutateAsync({ id: offer?.id, data: toOfferInput(value) }),
  });

  const units = {
    currency: (centerId: string) =>
      centers.find((center) => center.value === centerId)?.currency ?? "",
    min: t("offer.units.min"),
    h: t("offer.units.h"),
    days: t("offer.units.days"),
    percent: t("offer.units.percent"),
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.AppField name="centerId">
          {(field) => (
            <field.SelectField label={t("offer.center")} items={centers} />
          )}
        </form.AppField>
        <form.AppField name="level">
          {(field) => (
            <field.TextField
              label={t("offer.level")}
              description={t("offer.levelHint")}
            />
          )}
        </form.AppField>
        <form.AppField name="modules">
          {(field) => (
            <field.TextField
              label={t("offer.modules")}
              description={t("offer.modulesHint")}
            />
          )}
        </form.AppField>

        <form.Subscribe selector={(state) => state.values}>
          {(values) => {
            const currency = units.currency(values.centerId);
            return (
              <>
                <FieldSet>
                  <FieldLegend>{t("offer.pricing")}</FieldLegend>
                  <FieldGroup>
                    <form.AppField name="standardPrice">
                      {(field) => (
                        <field.NumberField
                          label={t("offer.standardPrice")}
                          unit={currency}
                          step={100}
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="commissionPercent">
                      {(field) => (
                        <field.NumberField
                          label={t("offer.commission")}
                          unit={units.percent}
                          step={0.5}
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="commissionMin">
                      {(field) => (
                        <field.NumberField
                          label={t("offer.commissionMin")}
                          unit={currency}
                          step={50}
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="bonusStep">
                      {(field) => (
                        <field.NumberField
                          label={t("offer.bonusStep")}
                          unit={currency}
                          step={100}
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="bonusCap">
                      {(field) => (
                        <field.NumberField
                          label={t("offer.bonusCap")}
                          unit={currency}
                          step={values.bonusStep || 1}
                        />
                      )}
                    </form.AppField>
                  </FieldGroup>
                </FieldSet>
                {currency && offerFormSchema.safeParse(values).success && (
                  <PricePreview
                    settings={toOfferInput(values)}
                    currency={currency}
                  />
                )}
              </>
            );
          }}
        </form.Subscribe>

        <FieldSet>
          <FieldLegend>{t("offer.timers")}</FieldLegend>
          <FieldGroup>
            <form.AppField name="claimTimeoutMin">
              {(field) => (
                <field.NumberField
                  label={t("offer.claimTimeout")}
                  unit={units.min}
                />
              )}
            </form.AppField>
            <form.AppField name="confirmOnlineMin">
              {(field) => (
                <field.NumberField
                  label={t("offer.confirmOnline")}
                  unit={units.min}
                />
              )}
            </form.AppField>
            <form.AppField name="confirmOfflineMin">
              {(field) => (
                <field.NumberField
                  label={t("offer.confirmOffline")}
                  unit={units.min}
                />
              )}
            </form.AppField>
            <form.AppField name="paymentDeadlineH">
              {(field) => (
                <field.NumberField
                  label={t("offer.paymentDeadline")}
                  unit={units.h}
                />
              )}
            </form.AppField>
            <form.AppField name="centerFeeDays">
              {(field) => (
                <field.NumberField
                  label={t("offer.centerFeeDays")}
                  description={t("offer.centerFeeDaysHint")}
                  unit={units.days}
                />
              )}
            </form.AppField>
          </FieldGroup>
        </FieldSet>

        <form.AppField name="active">
          {(field) => <field.SwitchField label={t("offer.active")} />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>{t("save")}</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
