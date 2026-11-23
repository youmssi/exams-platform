"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  ExternalLinkIcon,
  EyeIcon,
  InfoIcon,
  MailCheckIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/confirm-action";
import { CopyField } from "@/components/copy-field";
import { Countdown } from "@/components/countdown";
import { PresenceBadge } from "@/components/presence-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { InputGroupButton } from "@/components/ui/input-group";
import { type LiveState, LiveUpdates } from "@/modules/realtime/client";
import { track } from "@/shared/analytics";
import { useTRPC } from "@/trpc/client";
import { ReportProblem } from "./report-problem";

const POLL_MS = 15_000;

/** The assistant's running operation: who to book for, the centre credentials, the time left. */
export function OperationPanel() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const refresh = useCallback(
    () =>
      // The queue page decides between the operation and the queue: refresh both.
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.operations.current.queryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.requests.queue.queryKey(),
        }),
      ]),
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
  const trpc = useTRPC();
  const { data: operation } = useSuspenseQuery({
    ...trpc.operations.current.queryOptions(),
    refetchInterval: state.live ? false : POLL_MS,
  });
  const done = (message: string, then?: () => void) => ({
    onSuccess: () => {
      toast.success(message);
      if (then) then();
      else refresh();
    },
    onError: () => toast.error(tCommon("error")),
  });
  const release = useMutation(
    trpc.operations.release.mutationOptions(
      done(t("released"), () => {
        track({ name: "operation_released" });
        refresh();
      }),
    ),
  );
  const reserve = useMutation(
    trpc.operations.reserve.mutationOptions(
      done(t("reserved"), () => {
        track({ name: "reservation_declared" });
        refresh();
      }),
    ),
  );

  // Ended (released, expired, answered): the page switches back to the queue.
  if (!operation) return null;

  const { request } = operation;
  const { offer } = request.session;
  const person = request.beneficiary;
  const booked = operation.status === "RESERVED";
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
        {booked && operation.reservedAt && operation.releaseAt ? (
          <>
            <Alert>
              <MailCheckIcon />
              <AlertTitle>{t("waiting.title")}</AlertTitle>
              <AlertDescription>{t("waiting.description")}</AlertDescription>
            </Alert>
            <Countdown
              start={new Date(operation.reservedAt)}
              end={new Date(operation.releaseAt)}
              label={t("waiting.freeIn")}
              onEnd={refresh}
            />
          </>
        ) : (
          <>
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
          </>
        )}

        <FieldSet>
          <FieldLegend>{t("account")}</FieldLegend>
          <FieldGroup className="gap-4">
            {field("email", person.email)}
            {!booked && (
              <RevealedField operationId={operation.id} detail="password" />
            )}
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
            <RevealedField operationId={operation.id} detail="phone" />
            {field("city", person.city)}
            {field("district", person.district)}
            {field("participantNumber", person.participantNumber)}
          </FieldGroup>
        </FieldSet>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-2">
        {!booked && (
          <div className="flex flex-wrap gap-2">
            <ConfirmAction
              trigger={<Button variant="outline" />}
              title={t("releaseTitle")}
              description={t("releaseBody")}
              confirm={t("release")}
              cancel={t("keep")}
              destructive
              onConfirm={() => release.mutate({ id: operation.id })}
            >
              {t("release")}
            </ConfirmAction>
            <ReportProblem operationId={operation.id} onDone={refresh} />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {officialUrl && (
            <Button
              variant={booked ? "default" : "outline"}
              render={
                // biome-ignore lint/a11y/useAnchorContent: the button renders its children inside the anchor.
                <a
                  href={officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {t("openSite")}
              <ExternalLinkIcon />
            </Button>
          )}
          {!booked && (
            <ConfirmAction
              trigger={<Button disabled={reserve.isPending} />}
              title={t("reserveTitle")}
              description={t("reserveBody")}
              confirm={t("reserve")}
              cancel={t("notYet")}
              onConfirm={() => reserve.mutate({ id: operation.id })}
            >
              {t("reserve")}
            </ConfirmAction>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

/** A protected detail, hidden until the assistant asks for it (every read is audited). */
function RevealedField({
  operationId,
  detail,
}: {
  operationId: string;
  detail: "password" | "phone";
}) {
  const t = useTranslations("operation");
  const trpc = useTRPC();
  const reveal = useMutation(trpc.operations.reveal.mutationOptions());
  return (
    <CopyField
      id={detail}
      label={t(`fields.${detail}`)}
      value={reveal.data?.value ?? ""}
    >
      {!reveal.data && (
        <InputGroupButton
          size="xs"
          disabled={reveal.isPending}
          onClick={() => reveal.mutate({ id: operationId, detail })}
        >
          <EyeIcon />
          {t("show")}
        </InputGroupButton>
      )}
    </CopyField>
  );
}
