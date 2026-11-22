"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import { REPORT_REASONS, reportInput } from "../schemas";

/**
 * Hands the request back to the candidate with a reason, without penalty, instead of a dispute.
 * The candidate sees the reason and fixes it; the request then returns to the queue.
 */
export function ReportProblem({
  operationId,
  onDone,
}: {
  operationId: string;
  onDone: () => void;
}) {
  const t = useTranslations("operation.report");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const report = useMutation(
    trpc.operations.report.mutationOptions({
      onSuccess: () => {
        toast.success(t("sent"));
        setOpen(false);
        onDone();
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const form = useAppForm({
    defaultValues: {
      id: operationId,
      reason: "CREDENTIALS" as (typeof REPORT_REASONS)[number],
      note: "",
    },
    validators: { onSubmit: reportInput },
    onSubmit: ({ value }) => report.mutateAsync(reportInput.parse(value)),
  });

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
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
            <form.AppField name="reason">
              {(field) => (
                <field.ChoiceCardsField
                  legend={t("reason")}
                  options={REPORT_REASONS.map((reason) => ({
                    value: reason,
                    title: t(`reasons.${reason}`),
                  }))}
                />
              )}
            </form.AppField>
            <form.Subscribe selector={(state) => state.values.reason}>
              {(reason) =>
                reason === "OTHER" && (
                  <form.AppField name="note">
                    {(field) => (
                      <field.TextareaField
                        label={t("note")}
                        description={t("noteHint")}
                      />
                    )}
                  </form.AppField>
                )
              }
            </form.Subscribe>
            <form.AppForm>
              <form.SubmitButton>{t("submit")}</form.SubmitButton>
            </form.AppForm>
          </FieldGroup>
        </form>
      </ResponsiveDialog>
    </>
  );
}
