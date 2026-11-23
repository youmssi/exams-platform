"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ExternalLinkIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { FieldGroup } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { useAppForm } from "@/shared/form";
import { useTRPC } from "@/trpc/client";
import { proposalSessionInput } from "../schemas";
import type { DateProposalRow } from "./types";

/** Dates found on centres' pages, sessions users added, and centres whose page could not be read. */
export function SessionReview() {
  const t = useTranslations("admin.sessions");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trpc.catalog.sessionReview.queryOptions());
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: trpc.catalog.sessionReview.queryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: trpc.catalog.sessions.queryKey(),
      }),
    ]);
  const handlers = (message: string) => ({
    onSuccess: async () => {
      await refresh();
      toast.success(message);
    },
    onError: () => toast.error(tCommon("error")),
  });
  const dismiss = useMutation(
    trpc.catalog.dismissProposal.mutationOptions(handlers(t("dismissed"))),
  );
  const verify = useMutation(
    trpc.catalog.verifySession.mutationOptions(handlers(t("verified"))),
  );
  const day = (date: Date | string) =>
    format.dateTime(new Date(date), { dateStyle: "long", timeZone: "UTC" });
  const empty =
    !data.proposals.length && !data.unverified.length && !data.failing.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>
      {empty && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{t("empty.title")}</EmptyTitle>
            <EmptyDescription>{t("empty.description")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {data.failing.map((center) => (
        <Alert key={center.id} variant="destructive">
          <AlertTitle>{t("failing", { center: center.name })}</AlertTitle>
          <AlertDescription>
            {center.datesError === "noDates"
              ? t("noDates")
              : t("readError", { error: center.datesError ?? "" })}
          </AlertDescription>
        </Alert>
      ))}
      {data.proposals.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-lg">{t("proposals")}</h2>
          <ItemGroup>
            {data.proposals.map((proposal) => (
              <Item key={proposal.id} variant="outline" className="flex-wrap">
                <ItemContent>
                  <ItemTitle>
                    {proposal.offer.center.name} · {proposal.offer.level}
                  </ItemTitle>
                  <ItemDescription>
                    {day(proposal.examDate)} ·{" "}
                    <a
                      href={proposal.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 underline"
                    >
                      {t("source")}
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={dismiss.isPending}
                    onClick={() => dismiss.mutate({ id: proposal.id })}
                  >
                    {t("dismiss")}
                  </Button>
                  <CreateFromProposal proposal={proposal} onDone={refresh} />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </section>
      )}
      {data.unverified.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-semibold text-lg">{t("unverified")}</h2>
          <ItemGroup>
            {data.unverified.map((session) => (
              <Item key={session.id} variant="outline" className="flex-wrap">
                <ItemContent>
                  <ItemTitle className="flex-wrap">
                    {session.offer.center.name} · {session.offer.level}
                    <Badge variant="outline">
                      {t("confirmations", {
                        count: session._count.confirmations,
                      })}
                    </Badge>
                  </ItemTitle>
                  <ItemDescription>{day(session.examDate)}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    size="sm"
                    disabled={verify.isPending}
                    onClick={() => verify.mutate({ id: session.id })}
                  >
                    {t("verify")}
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </section>
      )}
    </div>
  );
}

/** Turns a detected date into a confirmed session: only the opening time is asked. */
function CreateFromProposal({
  proposal,
  onDone,
}: {
  proposal: DateProposalRow;
  onDone: () => void;
}) {
  const t = useTranslations("admin.sessions");
  const tForm = useTranslations("sessions.form");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const create = useMutation(
    trpc.catalog.createFromProposal.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        await onDone();
        toast.success(t("created"));
      },
      onError: (error) =>
        toast.error(
          error.message === "opensAfterExam"
            ? tForm("opensAfterExam")
            : tCommon("error"),
        ),
    }),
  );
  const form = useAppForm({
    defaultValues: {
      id: proposal.id,
      registrationOpensAt: "",
      officialUrl: "",
    },
    validators: { onSubmit: proposalSessionInput },
    onSubmit: ({ value }) => create.mutateAsync(value),
  });

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        {t("create")}
      </Button>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title={t("createTitle")}
        description={`${proposal.offer.center.name} · ${proposal.offer.level}`}
      >
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.AppField name="registrationOpensAt">
              {(field) => (
                <field.TextField
                  label={tForm("opensAt")}
                  description={tForm("opensAtHint", {
                    zone: proposal.offer.center.country.timeZone,
                  })}
                  type="datetime-local"
                />
              )}
            </form.AppField>
            <form.AppField name="officialUrl">
              {(field) => (
                <field.TextField
                  label={tForm("officialUrl")}
                  description={tForm("officialUrlHint")}
                  type="url"
                  inputMode="url"
                />
              )}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton>{t("create")}</form.SubmitButton>
            </form.AppForm>
          </FieldGroup>
        </form>
      </ResponsiveDialog>
    </>
  );
}
