"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { ExternalLinkIcon, EyeIcon, InfoIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";
import { Countdown } from "@/components/countdown";
import { PresenceBadge } from "@/components/presence-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { InputGroupButton } from "@/components/ui/input-group";
import { routes } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { type LiveState, LiveUpdates } from "@/modules/realtime/client";
import { track } from "@/shared/analytics";
import { useTRPC } from "@/trpc/client";
import { CopyField } from "./copy-field";

const POLL_MS = 15_000;

/** The assistant's running operation: who to book for, the centre credentials, the time left. */
export function OperationPanel() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: trpc.operations.current.queryKey(),
      }),
    [queryClient, trpc],
  );
  return (
    <LiveUpdates source="user" onChange={refresh}>
      {(state) => <Panel state={state} refresh={refresh} />}
    </LiveUpdates>
  );
}

function Panel({ state, refresh }: { state: LiveState; refresh: () => void }) {
  const t = useTranslations("operation");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const router = useRouter();
  const trpc = useTRPC();
  const { data: operation } = useSuspenseQuery({
    ...trpc.operations.current.queryOptions(),
    refetchInterval: state.live ? false : POLL_MS,
  });
  const reveal = useMutation(trpc.operations.revealPassword.mutationOptions());
  const release = useMutation(
    trpc.operations.release.mutationOptions({
      onSuccess: () => {
        track({ name: "operation_released" });
        toast.success(t("released"));
        router.push(routes.queue);
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );

  if (!operation) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>{t("none.title")}</EmptyTitle>
          <EmptyDescription>{t("none.description")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href={routes.queue} />}>
            {t("none.action")}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const { request } = operation;
  const { offer } = request.session;
  const person = request.beneficiary;
  const officialUrl = request.session.officialUrl ?? offer.center.officialUrl;
  const field = (key: string, value: string | null) =>
    value ? (
      <CopyField key={key} id={key} label={t(`fields.${key}`)} value={value} />
    ) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {offer.center.name} · {offer.level}
        </CardTitle>
        <CardDescription>
          {request.isFullExam ? t("fullExam") : request.modules.join(", ")} ·{" "}
          {format.dateTime(new Date(request.session.examDate), {
            dateStyle: "long",
            timeZone: "UTC",
          })}
        </CardDescription>
        <CardAction>
          <PresenceBadge online={state.online.has(operation.candidateKey)} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Countdown
          start={new Date(operation.claimedAt)}
          end={new Date(operation.deadlineAt)}
          label={t("timeLeft")}
          onEnd={refresh}
        />
        <Alert>
          <InfoIcon />
          <AlertDescription>{t("deadlineRule")}</AlertDescription>
        </Alert>

        <FieldSet>
          <FieldLegend>{t("account")}</FieldLegend>
          <FieldGroup className="gap-4">
            {field("email", person.email)}
            <CopyField
              id="password"
              label={t("fields.password")}
              value={reveal.data?.password ?? ""}
            >
              {!reveal.data && (
                <InputGroupButton
                  size="xs"
                  disabled={reveal.isPending}
                  onClick={() => reveal.mutate({ id: operation.id })}
                >
                  <EyeIcon />
                  {t("show")}
                </InputGroupButton>
              )}
            </CopyField>
          </FieldGroup>
        </FieldSet>

        <FieldSet>
          <FieldLegend>{t("candidate")}</FieldLegend>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            {field("firstName", person.firstName)}
            {field("lastName", person.lastName)}
            {field(
              "birthDate",
              person.birthDate &&
                format.dateTime(new Date(person.birthDate), {
                  dateStyle: "short",
                  timeZone: "UTC",
                }),
            )}
            {field("birthPlace", person.birthPlace)}
            {field("phone", person.phone)}
            {field("city", person.city)}
            {field("district", person.district)}
            {field("participantNumber", person.participantNumber)}
          </FieldGroup>
        </FieldSet>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-2">
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="outline" />}>
            {t("release")}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("releaseTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("releaseBody")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("keep")}</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => release.mutate({ id: operation.id })}
              >
                {t("release")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {officialUrl && (
          <Button
            render={
              // biome-ignore lint/a11y/useAnchorContent: the button renders its children inside the anchor.
              <a href={officialUrl} target="_blank" rel="noopener noreferrer" />
            }
          >
            {t("openSite")}
            <ExternalLinkIcon />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
