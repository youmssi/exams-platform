"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldGroup } from "@/components/ui/field";
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.beneficiaries.list.queryKey(),
      });
      toast.success(t("saved"));
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
      fullName: beneficiary?.fullName ?? "",
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
        <form.AppField name="fullName">
          {(field) => (
            <field.TextField
              label={t("fields.fullName")}
              description={t("fields.fullNameHint")}
              autoComplete="off"
            />
          )}
        </form.AppField>
        <form.AppField name="email">
          {(field) => (
            <field.TextField
              label={t("fields.email")}
              description={t("fields.emailHint")}
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
                  : t("fields.passwordHint")
              }
              autoComplete="off"
            />
          )}
        </form.AppField>
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
