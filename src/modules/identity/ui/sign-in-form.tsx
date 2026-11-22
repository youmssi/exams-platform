"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { routes } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { track } from "@/shared/analytics";
import { useAppForm } from "@/shared/form";
import { authClient } from "../auth-client";
import { emailSchema, OTP_LENGTH, otpSchema, passwordSchema } from "../schemas";
import { GoogleIcon, MicrosoftIcon } from "./social-icons";
import { useAuthErrorMessage } from "./use-auth-error";
import { useResendCountdown } from "./use-resend-countdown";

export type SocialProvider = "google" | "microsoft";

const PROVIDERS = {
  google: { label: "Google", Icon: GoogleIcon },
  microsoft: { label: "Microsoft", Icon: MicrosoftIcon },
} as const;

type Props = { providers: SocialProvider[]; next: string };

type Step =
  | { kind: "email" }
  | { kind: "code"; email: string }
  | { kind: "second-factor" };

export function SignInForm({ providers, next }: Props) {
  const [step, setStep] = useState<Step>({ kind: "email" });
  const backToEmail = () => setStep({ kind: "email" });

  if (step.kind === "code") {
    return (
      <CodeStep email={step.email} next={next} onChangeEmail={backToEmail} />
    );
  }
  if (step.kind === "second-factor") {
    return <SecondFactorStep next={next} onCancel={backToEmail} />;
  }
  return (
    <EmailStep
      providers={providers}
      next={next}
      onCodeSent={(email) => setStep({ kind: "code", email })}
      onSecondFactor={() => setStep({ kind: "second-factor" })}
    />
  );
}

function EmailStep({
  providers,
  next,
  onCodeSent,
  onSecondFactor,
}: Props & {
  onCodeSent: (email: string) => void;
  onSecondFactor: () => void;
}) {
  const t = useTranslations("auth");
  const errorMessage = useAuthErrorMessage();
  const router = useRouter();
  const [withPassword, setWithPassword] = useState(false);

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: {
      onSubmit: withPassword
        ? z.object({ email: emailSchema, password: passwordSchema })
        : z.object({ email: emailSchema, password: z.string() }),
    },
    onSubmit: async ({ value }) => {
      const method = withPassword ? "password" : "code";
      track({ name: "auth_started", data: { method } });
      if (withPassword) {
        const { data, error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        });
        if (error) return toast.error(errorMessage(error));
        if (data && "twoFactorRedirect" in data && data.twoFactorRedirect)
          return onSecondFactor();
        track({ name: "auth_completed", data: { method } });
        return router.replace(next);
      }
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: value.email,
        type: "sign-in",
      });
      if (error) return toast.error(errorMessage(error));
      onCodeSent(value.email);
    },
  });

  const signInWith = async (provider: SocialProvider) => {
    track({ name: "auth_started", data: { method: provider } });
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: next,
    });
    if (error) toast.error(errorMessage(error));
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
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-xl">{t("title")}</h1>
          <FieldDescription>{t("subtitle")}</FieldDescription>
        </div>
        {providers.length > 0 && (
          <>
            <Field className="grid gap-3">
              {providers.map((provider) => {
                const { label, Icon } = PROVIDERS[provider];
                return (
                  <Button
                    key={provider}
                    type="button"
                    variant="outline"
                    onClick={() => signInWith(provider)}
                  >
                    <Icon />
                    {t("continueWith", { provider: label })}
                  </Button>
                );
              })}
            </Field>
            <FieldSeparator>{t("or")}</FieldSeparator>
          </>
        )}
        <form.AppField name="email">
          {(field) => (
            <field.TextField
              label={t("email")}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="nom@exemple.com"
            />
          )}
        </form.AppField>
        {withPassword && (
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                label={t("password")}
                autoComplete="current-password"
              />
            )}
          </form.AppField>
        )}
        <Field>
          <form.AppForm>
            <form.SubmitButton>
              {withPassword ? t("signIn") : t("sendCode")}
            </form.SubmitButton>
          </form.AppForm>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setWithPassword((v) => !v)}
          >
            {withPassword ? t("useCode") : t("usePassword")}
          </Button>
          {withPassword && (
            <FieldDescription className="text-center">
              <Link href={routes.resetPassword}>{t("forgotPassword")}</Link>
            </FieldDescription>
          )}
        </Field>
        <FieldDescription className="text-center">
          {t.rich("terms", {
            terms: (chunks) => <Link href={routes.terms}>{chunks}</Link>,
          })}
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}

function CodeStep({
  email,
  next,
  onChangeEmail,
}: {
  email: string;
  next: string;
  onChangeEmail: () => void;
}) {
  const t = useTranslations("auth");
  const errorMessage = useAuthErrorMessage();
  const router = useRouter();
  const countdown = useResendCountdown();

  const form = useAppForm({
    defaultValues: { otp: "" },
    validators: { onSubmit: z.object({ otp: otpSchema }) },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp: value.otp,
      });
      if (error) return toast.error(errorMessage(error));
      track({ name: "auth_completed", data: { method: "code" } });
      router.replace(next);
    },
  });

  const resend = async () => {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    if (error) return toast.error(errorMessage(error));
    countdown.restart();
    toast.success(t("codeResent"));
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
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-xl">{t("codeTitle")}</h1>
          <FieldDescription>{t("codeSentTo", { email })}</FieldDescription>
        </div>
        <form.AppField name="otp">
          {(field) => <field.OtpField label={t("code")} length={OTP_LENGTH} />}
        </form.AppField>
        <Field>
          <form.AppForm>
            <form.SubmitButton>{t("verify")}</form.SubmitButton>
          </form.AppForm>
          <Button
            type="button"
            variant="ghost"
            disabled={!countdown.canResend}
            onClick={resend}
          >
            {countdown.canResend
              ? t("resend")
              : t("resendIn", { seconds: countdown.secondsLeft })}
          </Button>
          <Button type="button" variant="link" onClick={onChangeEmail}>
            {t("changeEmail")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

function SecondFactorStep({
  next,
  onCancel,
}: {
  next: string;
  onCancel: () => void;
}) {
  const t = useTranslations("auth.secondFactor");
  const errorMessage = useAuthErrorMessage();
  const router = useRouter();
  const [withBackupCode, setWithBackupCode] = useState(false);

  const form = useAppForm({
    defaultValues: { code: "" },
    validators: {
      onSubmit: z.object({
        code: withBackupCode ? z.string().trim().min(1, "required") : otpSchema,
      }),
    },
    onSubmit: async ({ value }) => {
      const { error } = withBackupCode
        ? await authClient.twoFactor.verifyBackupCode({
            code: value.code.trim(),
          })
        : await authClient.twoFactor.verifyTotp({ code: value.code });
      if (error) return toast.error(errorMessage(error));
      track({ name: "auth_completed", data: { method: "password" } });
      router.replace(next);
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
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-bold text-xl">{t("title")}</h1>
          <FieldDescription>
            {withBackupCode ? t("backupHint") : t("hint")}
          </FieldDescription>
        </div>
        <form.AppField name="code">
          {(field) =>
            withBackupCode ? (
              <field.TextField
                label={t("backupCode")}
                autoComplete="off"
                autoFocus
              />
            ) : (
              <field.OtpField label={t("code")} length={OTP_LENGTH} />
            )
          }
        </form.AppField>
        <Field>
          <form.AppForm>
            <form.SubmitButton>{t("verify")}</form.SubmitButton>
          </form.AppForm>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset();
              setWithBackupCode((v) => !v);
            }}
          >
            {withBackupCode ? t("useApp") : t("useBackupCode")}
          </Button>
          <Button type="button" variant="link" onClick={onCancel}>
            {t("cancel")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
