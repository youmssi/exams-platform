"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { priceBreakdown } from "@/modules/catalog/client";
import { track } from "@/shared/analytics";
import { useTRPC } from "@/trpc/client";
import { requestedFor } from "../domain/live";
import { BonusPicker, ModulesPicker } from "./pickers";
import type { UpcomingSession } from "./types";

const ERRORS = new Set([
  "alreadyRequested",
  "incompleteProfile",
  "invalidModules",
  "sessionPast",
  "invalidBonus",
]);

/** Pick beneficiaries, optionally add a bonus, see the total, publish (or schedule) in one tap. */
export function PublishForm({
  session,
  onDone,
}: {
  session: UpcomingSession;
  onDone: () => void;
}) {
  const t = useTranslations("publish");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: beneficiaries } = useSuspenseQuery(
    trpc.beneficiaries.list.queryOptions(),
  );
  const { offer } = session;
  const { currency, timeZone } = offer.center.country;

  const { data: requests } = useSuspenseQuery(
    trpc.requests.mine.queryOptions(),
  );
  const requested = requestedFor(requests, session.id);
  const available = (beneficiary: { id: string; isReady: boolean }) =>
    beneficiary.isReady && !requested.has(beneficiary.id);
  const ready = beneficiaries.filter(available);
  const [selected, setSelected] = useState<string[]>(
    ready.length === 1 ? [ready[0].id] : [],
  );
  const [modules, setModules] = useState(offer.modules);
  const [bonus, setBonus] = useState(0);

  const money = (amount: number) =>
    format.number(amount, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  const price = priceBreakdown(offer, bonus);
  const opensAt = new Date(session.registrationOpensAt);
  const scheduled = opensAt > new Date();

  const publish = useMutation(
    trpc.requests.publish.mutationOptions({
      onSuccess: async ({ count }) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.requests.mine.queryKey(),
        });
        track({ name: "request_published", data: { count, bonus } });
        toast.success(
          scheduled
            ? t("scheduledToast", { count })
            : t("publishedToast", { count }),
        );
        onDone();
        router.push(routes.requests);
      },
      onError: (error) =>
        toast.error(
          ERRORS.has(error.message)
            ? t(`errors.${error.message}`)
            : tCommon("error"),
        ),
    }),
  );

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, id] : current.filter((value) => value !== id),
    );

  const submitLabel = scheduled
    ? t("schedule", {
        count: selected.length,
        date: format.dateTime(opensAt, {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone,
          timeZoneName: "short",
        }),
      })
    : t("submit", {
        count: selected.length,
        total: money(price.total * selected.length),
      });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (selected.length && modules.length)
          publish.mutate({
            sessionId: session.id,
            beneficiaryIds: selected,
            modules,
            bonus,
          });
      }}
    >
      <FieldGroup>
        <FieldDescription>
          {offer.center.name} · {offer.level} ·{" "}
          {format.dateTime(new Date(session.examDate), {
            dateStyle: "long",
            timeZone: "UTC",
          })}
        </FieldDescription>

        <FieldSet>
          <FieldLegend variant="label">{t("who")}</FieldLegend>
          <FieldGroup className="gap-3">
            {beneficiaries.map((beneficiary) => (
              <Field
                key={beneficiary.id}
                orientation="horizontal"
                data-disabled={!available(beneficiary)}
              >
                <Checkbox
                  id={`beneficiary-${beneficiary.id}`}
                  checked={selected.includes(beneficiary.id)}
                  disabled={!available(beneficiary)}
                  onCheckedChange={(checked) => toggle(beneficiary.id, checked)}
                />
                <FieldContent>
                  <FieldLabel htmlFor={`beneficiary-${beneficiary.id}`}>
                    {beneficiary.name || beneficiary.email}
                  </FieldLabel>
                  {requested.has(beneficiary.id) && (
                    <FieldDescription>{t("alreadyRequested")}</FieldDescription>
                  )}
                  {!beneficiary.isReady && !requested.has(beneficiary.id) && (
                    <FieldDescription>
                      <Link href={routes.beneficiaries}>
                        {t("completeProfile")}
                      </Link>
                    </FieldDescription>
                  )}
                </FieldContent>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>

        <ModulesPicker
          available={offer.modules}
          value={modules}
          onChange={setModules}
        />

        {offer.bonusCap > 0 && (
          <Collapsible>
            <CollapsibleTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="self-start px-0"
                />
              }
            >
              {bonus ? t("bonusSet", { bonus: money(bonus) }) : t("addBonus")}
              <ChevronDownIcon />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <BonusPicker
                offer={offer}
                value={bonus}
                onChange={setBonus}
                money={money}
              />
            </CollapsibleContent>
          </Collapsible>
        )}

        <Card size="sm" aria-live="polite">
          <CardHeader>
            <CardTitle>{t("summary", { total: money(price.total) })}</CardTitle>
            <CardDescription>
              {t("split", {
                assistant: money(price.assistantShare),
                platform: money(price.commission),
              })}
            </CardDescription>
          </CardHeader>
          {selected.length > 1 && (
            <CardContent className="text-sm">
              {t("totalFor", {
                count: selected.length,
                total: money(price.total * selected.length),
              })}
            </CardContent>
          )}
        </Card>

        <FieldDescription>{t("payLater")}</FieldDescription>

        <Button
          type="submit"
          disabled={!selected.length || !modules.length || publish.isPending}
        >
          {publish.isPending && <Spinner />}
          {selected.length ? submitLabel : t("pickSomeone")}
        </Button>
      </FieldGroup>
    </form>
  );
}
