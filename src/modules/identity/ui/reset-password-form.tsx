"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { routes } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppForm } from "@/shared/form";
import { authClient } from "../auth-client";
import { emailSchema, OTP_LENGTH, otpSchema, passwordSchema } from "../schemas";
import { useAuthErrorMessage } from "./use-auth-error";

export function ResetPasswordForm() {
  const t = useTranslations("resetPassword");
  const tAuth = useTranslations("auth");
  const errorMessage = useAuthErrorMessage();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  const requestForm = useAppForm({
    defaultValues: { email: "" },
    validators: { onSubmit: z.object({ email: emailSchema }) },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.emailOtp.requestPasswordReset({
        email: value.email,
      });
      if (error) return toast.error(errorMessage(error));
      setEmail(value.email);
    },
  });

  const resetForm = useAppForm({
    defaultValues: { otp: "", password: "" },
    validators: {
      onSubmit: z.object({ otp: otpSchema, password: passwordSchema }),
    },
    onSubmit: async ({ value }) => {
      if (!email) return;
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        ...value,
      });
      if (error) return toast.error(errorMessage(error));
      toast.success(t("done"));
      router.replace(routes.signIn);
    },
  });

  const form = email ? resetForm : requestForm;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-xl">{t("title")}</h1>
          <FieldDescription>
            {email ? tAuth("codeSentTo", { email }) : t("subtitle")}
          </FieldDescription>
        </div>
        {email ? (
          <>
            <resetForm.AppField name="otp">
              {(field) => (
                <field.OtpField label={tAuth("code")} length={OTP_LENGTH} />
              )}
            </resetForm.AppField>
            <resetForm.AppField name="password">
              {(field) => (
                <field.PasswordField
                  label={t("newPassword")}
                  description={t("passwordHint")}
                  autoComplete="new-password"
                />
              )}
            </resetForm.AppField>
            <resetForm.AppForm>
              <resetForm.SubmitButton>{t("submit")}</resetForm.SubmitButton>
            </resetForm.AppForm>
          </>
        ) : (
          <>
            <requestForm.AppField name="email">
              {(field) => (
                <field.TextField
                  label={tAuth("email")}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                />
              )}
            </requestForm.AppField>
            <requestForm.AppForm>
              <requestForm.SubmitButton>
                {t("sendCode")}
              </requestForm.SubmitButton>
            </requestForm.AppForm>
          </>
        )}
        <Field>
          <FieldDescription className="text-center">
            <Link href={routes.signIn}>{t("backToSignIn")}</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
