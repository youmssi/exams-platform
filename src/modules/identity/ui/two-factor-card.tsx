"use client";

import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { routes } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppForm } from "@/shared/form";
import { authClient } from "../auth-client";
import { OTP_LENGTH, otpSchema, passwordSchema } from "../schemas";
import { useAuthErrorMessage } from "./use-auth-error";

type Setup = { totpURI: string; backupCodes: string[] };

/** Authenticator-app second factor, required for admins. */
export function TwoFactorCard({ enabled }: { enabled: boolean }) {
  const t = useTranslations("account.security");
  const [setup, setSetup] = useState<Setup | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("title")}
          {enabled && <Badge>{t("enabled")}</Badge>}
        </CardTitle>
        <CardDescription>
          {enabled ? t("enabledHint") : t("hint")}
        </CardDescription>
      </CardHeader>
      {!enabled && (
        <CardContent>
          {setup ? (
            <ConfirmSetup setup={setup} />
          ) : (
            <StartSetup onStarted={setSetup} />
          )}
        </CardContent>
      )}
    </Card>
  );
}

function StartSetup({ onStarted }: { onStarted: (setup: Setup) => void }) {
  const t = useTranslations("account.security");
  const errorMessage = useAuthErrorMessage();
  const form = useAppForm({
    defaultValues: { password: "" },
    validators: { onSubmit: z.object({ password: passwordSchema }) },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.twoFactor.enable({
        password: value.password,
      });
      if (error || data?.method !== "totp")
        return toast.error(errorMessage(error));
      onStarted(data);
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
        <form.AppField name="password">
          {(field) => (
            <field.TextField
              label={t("password")}
              type="password"
              autoComplete="current-password"
              description={
                <Link href={routes.resetPassword}>{t("noPassword")}</Link>
              }
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton className="self-start">
            {t("start")}
          </form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}

function ConfirmSetup({ setup }: { setup: Setup }) {
  const t = useTranslations("account.security");
  const errorMessage = useAuthErrorMessage();
  const router = useRouter();
  const secret = new URL(setup.totpURI).searchParams.get("secret") ?? "";

  const form = useAppForm({
    defaultValues: { code: "" },
    validators: { onSubmit: z.object({ code: otpSchema }) },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: value.code,
      });
      if (error) return toast.error(errorMessage(error));
      toast.success(t("done"));
      router.refresh();
    },
  });

  const copyBackupCodes = async () => {
    await navigator.clipboard.writeText(setup.backupCodes.join("\n"));
    toast.success(t("copied"));
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
        <FieldSet>
          <FieldLegend variant="label">{t("scanTitle")}</FieldLegend>
          <div className="self-start rounded-md bg-white p-3">
            <QRCodeSVG
              value={setup.totpURI}
              size={176}
              title={t("scanTitle")}
            />
          </div>
          <FieldDescription className="break-all">
            {t("manualKey", { key: secret })}
          </FieldDescription>
        </FieldSet>
        <FieldSet>
          <FieldLegend variant="label">{t("backupTitle")}</FieldLegend>
          <FieldDescription>{t("backupHint")}</FieldDescription>
          <ul className="grid grid-cols-2 gap-1 font-mono text-sm">
            {setup.backupCodes.map((code) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            className="self-start"
            onClick={copyBackupCodes}
          >
            {t("copyBackup")}
          </Button>
        </FieldSet>
        <form.AppField name="code">
          {(field) => (
            <field.OtpField label={t("confirmTitle")} length={OTP_LENGTH} />
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton className="self-start">
            {t("confirm")}
          </form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
