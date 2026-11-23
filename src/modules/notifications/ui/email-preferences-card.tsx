"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useTRPC } from "@/trpc/client";

/** Follow-up emails can be turned off; payment, dispute and sanction emails cannot. */
export function EmailPreferencesCard() {
  const t = useTranslations("notifications.preferences");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(
    trpc.notifications.preferences.queryOptions(),
  );
  const save = useMutation(
    trpc.notifications.setEmailUpdates.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.notifications.preferences.queryKey(),
        });
        toast.success(t("saved"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="email-updates">{t("updates")}</FieldLabel>
            <FieldDescription>{t("updatesHint")}</FieldDescription>
          </FieldContent>
          <Switch
            id="email-updates"
            checked={data.emailUpdates}
            disabled={save.isPending}
            onCheckedChange={(enabled) => save.mutate({ enabled })}
          />
        </Field>
        <p className="mt-3 text-muted-foreground text-sm">{t("critical")}</p>
      </CardContent>
    </Card>
  );
}
