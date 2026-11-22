"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import { sessionInput } from "../schemas";

/** Any signed-in user can add a missing session; duplicates point to the existing one. */
export function SessionForm({
  onDone,
}: {
  onDone: (sessionId: string) => void;
}) {
  const t = useTranslations("sessions.form");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: offers } = useSuspenseQuery(trpc.catalog.offers.queryOptions());

  const create = useMutation(
    trpc.catalog.createSession.mutationOptions({
      onSuccess: async ({ id, existing }) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.catalog.sessions.queryKey(),
        });
        toast.success(existing ? t("existing") : t("created"));
        onDone(id);
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );

  const form = useAppForm({
    defaultValues: {
      offerId: offers[0]?.id ?? "",
      examDate: "",
      registrationOpensAt: "",
      officialUrl: "",
    },
    validators: { onSubmit: sessionInput },
    onSubmit: ({ value }) => create.mutateAsync(sessionInput.parse(value)),
  });

  const offerItems = offers.map((offer) => ({
    value: offer.id,
    label: `${offer.center.name} · ${offer.center.city} · ${offer.level}`,
  }));

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.AppField name="offerId">
          {(field) => (
            <field.SelectField label={t("offer")} items={offerItems} />
          )}
        </form.AppField>
        <form.AppField name="examDate">
          {(field) => <field.TextField label={t("examDate")} type="date" />}
        </form.AppField>
        <form.Subscribe selector={(state) => state.values.offerId}>
          {(offerId) => (
            <form.AppField name="registrationOpensAt">
              {(field) => (
                <field.TextField
                  label={t("opensAt")}
                  description={t("opensAtHint", {
                    zone:
                      offers.find((offer) => offer.id === offerId)?.center
                        .country.timeZone ?? "",
                  })}
                  type="datetime-local"
                />
              )}
            </form.AppField>
          )}
        </form.Subscribe>
        <form.AppField name="officialUrl">
          {(field) => (
            <field.TextField
              label={t("officialUrl")}
              description={t("officialUrlHint")}
              type="url"
              inputMode="url"
            />
          )}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton>{t("submit")}</form.SubmitButton>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
