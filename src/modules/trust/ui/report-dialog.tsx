"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ComponentProps, useState } from "react";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { track } from "@/shared/analytics";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import { REPORT_CATEGORIES, type ReportInput, reportInput } from "../schemas";

/** One choice and an optional message, then a confirmation of what happens next. */
export function ReportDialog({
  targetType,
  targetId,
  variant = "ghost",
  size = "sm",
}: {
  targetType: ReportInput["targetType"];
  targetId: string;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
}) {
  const t = useTranslations("report");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const send = useMutation(
    trpc.trust.report.mutationOptions({
      onSuccess: () => {
        track({ name: "report_sent" });
        toast.success(t("sent"));
        setOpen(false);
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const categories =
    targetType === "SESSION"
      ? REPORT_CATEGORIES
      : REPORT_CATEGORIES.filter((category) => category !== "WRONG_SESSION");
  const form = useAppForm({
    defaultValues: {
      targetType,
      targetId,
      category: categories[0],
      message: "",
    } as ReportInput,
    validators: { onSubmit: reportInput },
    onSubmit: ({ value }) => send.mutateAsync(reportInput.parse(value)),
  });
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {t("action")}
      </Button>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title={t("title")}
        description={t("description")}
      >
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="category">
              {(field) => (
                <field.ChoiceCardsField
                  legend={t("category")}
                  options={categories.map((category) => ({
                    value: category,
                    title: t(`categories.${category}`),
                  }))}
                />
              )}
            </form.AppField>
            <form.AppField name="message">
              {(field) => (
                <field.TextareaField
                  label={t("message")}
                  description={t("messageHint")}
                />
              )}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton>{t("submit")}</form.SubmitButton>
            </form.AppForm>
          </FieldGroup>
        </form>
      </ResponsiveDialog>
    </>
  );
}
