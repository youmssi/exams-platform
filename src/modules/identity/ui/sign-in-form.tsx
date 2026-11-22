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

export function SignInForm({ providers, next }: Props) {
  const [email, setEmail] = useState<string | null>(null);
  return email ? (
    <CodeStep email={email} next={next} onChangeEmail={() => setEmail(null)} />
  ) : (
    <EmailStep providers={providers} next={next} onCodeSent={setEmail} />
  );
}

function EmailStep({
  providers,
  next,
  onCodeSent,
}: Props & { onCodeSent: (email: string) => void }) {
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
      const { error } = withPassword
        ? await authClient.signIn.email({
            email: value.email,
            password: value.password,
          })
        : await authClient.emailOtp.sendVerificationOtp({
            email: value.email,
            type: "sign-in",
          });
      if (error) return toast.error(errorMessage(error));
      if (withPassword) {
        track({ name: "auth_completed", data: { method } });
        return router.replace(next);
      }
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
              <field.TextField
                label={t("password")}
                type="password"
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
