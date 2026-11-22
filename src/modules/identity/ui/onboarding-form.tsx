"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { routes } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import { onboardingSchema, ROLES, type Role } from "../schemas";

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const t = useTranslations("welcome");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const trpc = useTRPC();
  const complete = useMutation(
    trpc.identity.completeOnboarding.mutationOptions(),
  );

  const form = useAppForm({
    defaultValues: {
      name: defaultName,
      role: "candidate" as Role,
      acceptTerms: false as boolean,
    },
    validators: { onSubmit: onboardingSchema },
    onSubmit: async ({ value }) => {
      try {
        await complete.mutateAsync(onboardingSchema.parse(value));
        router.replace(routes.home);
      } catch {
        toast.error(tCommon("error"));
      }
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
        <div className="flex flex-col gap-2">
          <h1 className="font-bold text-xl">{t("title")}</h1>
          <FieldDescription>{t("subtitle")}</FieldDescription>
        </div>
        <form.AppField name="name">
          {(field) => (
            <field.TextField
              label={t("name")}
              description={t("nameHint")}
              autoComplete="name"
            />
          )}
        </form.AppField>
        <form.AppField name="role">
          {(field) => (
            <field.ChoiceCardsField
              legend={t("role")}
              options={ROLES.map((role) => ({
                value: role,
                title: t(`roles.${role}.title`),
                description: t(`roles.${role}.description`),
              }))}
            />
          )}
        </form.AppField>
        <FieldSet>
          <FieldLegend variant="label">{t("termsTitle")}</FieldLegend>
          <ul className="list-disc space-y-1 ps-5 text-muted-foreground text-sm">
            {t.raw("termsPoints").map((point: string) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <Link
            href={routes.terms}
            target="_blank"
            className="text-sm underline underline-offset-4"
          >
            {t("readTerms")}
          </Link>
        </FieldSet>
        <form.AppField name="acceptTerms">
          {(field) => <field.CheckboxField label={t("acceptTerms")} />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>{t("submit")}</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
