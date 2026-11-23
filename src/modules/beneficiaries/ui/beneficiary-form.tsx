"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import { beneficiaryInput, newFriendInput } from "../schemas";
import type { Beneficiary } from "./types";

type Props = {
  /** Absent when adding a friend. */
  beneficiary?: Beneficiary;
  onSaved: () => void;
};

export function BeneficiaryForm({ beneficiary, onSaved }: Props) {
  const t = useTranslations("beneficiaries");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isNewFriend = !beneficiary;

  const handlers = {
    onSuccess: async (
      _: unknown,
      variables: { data: { email: string } } | { email: string },
    ) => {
      await queryClient.invalidateQueries({
        queryKey: trpc.beneficiaries.list.queryKey(),
      });
      // A new friend gets an email to confirm; say where it went.
      toast.success(
        "data" in variables
          ? t("saved")
          : t("consentSent", { email: variables.email }),
      );
      onSaved();
    },
    onError: (error: { message: string }) =>
      toast.error(
        error.message === "limitReached" ? t("limitReached") : tCommon("error"),
      ),
  };
  const add = useMutation(trpc.beneficiaries.add.mutationOptions(handlers));
  const update = useMutation(
    trpc.beneficiaries.update.mutationOptions(handlers),
  );

  const schema = isNewFriend ? newFriendInput : beneficiaryInput;
  const form = useAppForm({
    defaultValues: {
      firstName: beneficiary?.firstName ?? "",
      lastName: beneficiary?.lastName ?? "",
      birthDate: beneficiary?.birthDate?.toISOString().slice(0, 10) ?? "",
      birthPlace: beneficiary?.birthPlace ?? "",
      phone: beneficiary?.phone ?? "",
      city: beneficiary?.city ?? "",
      district: beneficiary?.district ?? "",
      participantNumber: beneficiary?.participantNumber ?? "",
      email: beneficiary?.email ?? "",
      password: "",
      consent: false,
    },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      const data = schema.parse(value);
      if (beneficiary) await update.mutateAsync({ id: beneficiary.id, data });
      else await add.mutateAsync(data);
    },
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
        <FieldSet>
          <FieldLegend>{t("sections.identity")}</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="firstName">
              {(field) => (
                <field.TextField
                  label={t("fields.firstName")}
                  autoComplete="off"
                />
              )}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => (
                <field.TextField
                  label={t("fields.lastName")}
                  autoComplete="off"
                />
              )}
            </form.AppField>
            <form.AppField name="birthDate">
              {(field) => (
                <field.TextField label={t("fields.birthDate")} type="date" />
              )}
            </form.AppField>
            <form.AppField name="birthPlace">
              {(field) => (
                <field.TextField
                  label={t("fields.birthPlace")}
                  autoComplete="off"
                />
              )}
            </form.AppField>
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend>{t("sections.contact")}</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="phone">
              {(field) => (
                <field.TextField
                  label={t("fields.phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                />
              )}
            </form.AppField>
            <form.AppField name="city">
              {(field) => (
                <field.TextField label={t("fields.city")} autoComplete="off" />
              )}
            </form.AppField>
            <form.AppField name="district">
              {(field) => (
                <field.TextField
                  label={t("fields.district")}
                  autoComplete="off"
                />
              )}
            </form.AppField>
          </FieldGroup>
        </FieldSet>
        <FieldSet>
          <FieldLegend>{t("sections.centre")}</FieldLegend>
          <FieldGroup>
            <form.AppField name="email">
              {(field) => (
                <field.TextField
                  label={t("fields.email")}
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                />
              )}
            </form.AppField>
            <form.AppField name="password">
              {(field) => (
                <field.PasswordField
                  label={t("fields.password")}
                  description={
                    beneficiary?.hasPassword
                      ? t("fields.passwordSaved")
                      : undefined
                  }
                  autoComplete="off"
                />
              )}
            </form.AppField>
            <form.AppField name="participantNumber">
              {(field) => (
                <field.TextField
                  label={t("fields.participantNumber")}
                  autoComplete="off"
                />
              )}
            </form.AppField>
          </FieldGroup>
        </FieldSet>
        <Alert>
          <ShieldCheckIcon />
          <AlertDescription>{t("privacy")}</AlertDescription>
        </Alert>
        {isNewFriend && (
          <form.AppField name="consent">
            {(field) => <field.CheckboxField label={t("fields.consent")} />}
          </form.AppField>
        )}
        <form.AppForm>
          <form.SubmitButton>
            {isNewFriend ? t("add") : t("save")}
          </form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
