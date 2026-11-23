"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { WalletIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/confirm-action";
import { Countdown } from "@/components/countdown";
import { PresenceBadge } from "@/components/presence-badge";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { amountDue } from "@/modules/operations/client";
import { type LiveState, LiveUpdates } from "@/modules/realtime/client";
import { track } from "@/shared/analytics";
import { useTRPC } from "@/trpc/client";
import { PaymentPanel } from "./payment-panel";
import { BonusPicker, ModulesPicker } from "./pickers";
import type { MyRequest } from "./types";

const POLL_MS = 15_000;

/** The candidate's requests, one line per beneficiary and session, updated live. */
export function MyRequests() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: trpc.requests.mine.queryKey(),
      }),
    [queryClient, trpc],
  );
  return (
    <LiveUpdates source="user" onChange={refresh}>
      {(state) => <RequestList state={state} refresh={refresh} />}
    </LiveUpdates>
  );
}

function RequestList({
  state,
  refresh,
}: {
  state: LiveState;
  refresh: () => void;
}) {
  const t = useTranslations("myRequests");
  const format = useFormatter();
  const trpc = useTRPC();
  const { data: requests } = useSuspenseQuery({
    ...trpc.requests.mine.queryOptions(),
    refetchInterval: state.live ? false : POLL_MS,
  });

  const due = requests.flatMap((request) => request.operation?.payments ?? []);
  const toPay = amountDue(due);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-semibold text-2xl">{t("title")}</h1>
        <Button render={<Link href={routes.sessions} />}>{t("new")}</Button>
      </div>
      {toPay > 0 && (
        <Alert>
          <WalletIcon />
          <AlertTitle>
            {t("totalDue", {
              total: format.number(toPay, {
                style: "currency",
                currency: due[0].currency,
                maximumFractionDigits: 0,
              }),
            })}
          </AlertTitle>
          <AlertDescription>{t("totalDueHint")}</AlertDescription>
        </Alert>
      )}
      {requests.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{t("empty.title")}</EmptyTitle>
            <EmptyDescription>{t("empty.description")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href={routes.sessions} />}>{t("new")}</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ItemGroup>
          {requests.map((request) => (
            <RequestItem
              key={request.id}
              request={request}
              online={state.online}
              refresh={refresh}
            />
          ))}
        </ItemGroup>
      )}
    </div>
  );
}

type Status =
  | "scheduled"
  | "published"
  | "inProgress"
  | "toConfirm"
  | "toPay"
  | "paymentSent"
  | "closed"
  | "unpaid"
  | "disputed"
  | "toFix"
  | "elsewhere"
  | "cancelled";

/** One status per request, read from the request and its latest operation. */
function statusOf(request: MyRequest): Status {
  if (request.status === "CANCELLED") return "cancelled";
  if (request.status === "ELSEWHERE") return "elsewhere";
  const operation = request.operation;
  if (operation?.status === "RESERVED") return "toConfirm";
  if (operation?.status === "CONFIRMED")
    return operation.payments.some((payment) => payment.status === "DUE")
      ? "toPay"
      : "paymentSent";
  if (operation?.status === "UNPAID") return "unpaid";
  if (operation?.status === "CLOSED") return "closed";
  if (operation?.status === "DISPUTED") return "disputed";
  if (operation) return "inProgress";
  if (request.issue) return "toFix";
  return request.visibility;
}

/** A confirmed booking: the candidate pays, then keeps the summary. */
const PAYMENT_STATUSES: Status[] = ["toPay", "paymentSent", "unpaid", "closed"];

const BADGE: Record<
  Status,
  "default" | "secondary" | "outline" | "destructive"
> = {
  scheduled: "secondary",
  published: "default",
  inProgress: "default",
  toConfirm: "default",
  toPay: "default",
  paymentSent: "secondary",
  closed: "secondary",
  unpaid: "destructive",
  disputed: "destructive",
  toFix: "destructive",
  elsewhere: "outline",
  cancelled: "outline",
};

function RequestItem({
  request,
  online,
  refresh,
}: {
  request: MyRequest;
  online: ReadonlySet<string>;
  refresh: () => void;
}) {
  const t = useTranslations("myRequests");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const handlers = (message: string, event?: () => void) => ({
    onSuccess: async () => {
      event?.();
      await refresh();
      toast.success(message);
    },
    onError: () => toast.error(tCommon("error")),
  });
  const cancel = useMutation(
    trpc.requests.cancel.mutationOptions(handlers(t("cancelled"))),
  );
  const resolve = useMutation(
    trpc.requests.resolveIssue.mutationOptions(handlers(t("backInQueue"))),
  );
  const elsewhere = useMutation(
    trpc.requests.bookedElsewhere.mutationOptions(
      handlers(t("closedElsewhere")),
    ),
  );
  const withdraw = useMutation(
    trpc.operations.withdraw.mutationOptions(
      handlers(t("withdrawn"), () => track({ name: "candidate_withdrew" })),
    ),
  );
  const { operation } = request;
  const status = statusOf(request);
  const { offer } = request.session;
  const { timeZone } = offer.center.country;
  const name = request.beneficiaryName;

  return (
    <Item variant="outline" className="flex-wrap">
      <ItemContent className="min-w-0">
        <ItemTitle className="flex-wrap">
          {name}
          <Badge variant={BADGE[status]}>{t(`status.${status}`)}</Badge>
          {operation && status === "inProgress" && (
            <PresenceBadge online={online.has(operation.assistantKey)} />
          )}
        </ItemTitle>
        <ItemDescription>
          {offer.center.name} · {offer.level} ·{" "}
          {request.isFullExam ? t("fullExam") : request.modules.join(", ")} ·{" "}
          {format.dateTime(new Date(request.session.examDate), {
            dateStyle: "medium",
            timeZone: "UTC",
          })}
          <br />
          {format.number(request.total, {
            style: "currency",
            currency: request.currency,
            maximumFractionDigits: 0,
          })}
          {status === "scheduled" &&
            ` · ${t("publishesAt", { date: format.dateTime(new Date(request.publishAt), { dateStyle: "medium", timeStyle: "short" }) })}`}
        </ItemDescription>
        {operation && status === "inProgress" && (
          <Countdown
            start={new Date(operation.claimedAt)}
            end={new Date(operation.deadlineAt)}
            label={t("assistantOnIt")}
            onEnd={refresh}
          />
        )}
        {operation && status === "toConfirm" && (
          <BookingAnswer
            operationId={operation.id}
            email={request.beneficiaryEmail}
            refresh={refresh}
          />
        )}
        {operation && PAYMENT_STATUSES.includes(status) && (
          <PaymentPanel
            operation={operation}
            timeZone={timeZone}
            refresh={refresh}
          />
        )}
        {operation?.centerFeeDeadline && PAYMENT_STATUSES.includes(status) && (
          <Alert>
            <AlertTitle>{t("centerFee.title")}</AlertTitle>
            <AlertDescription>
              {t("centerFee.description", {
                date: format.dateTime(
                  new Date(operation.centerFeeDeadline),
                  "zoned",
                  { timeZone, weekday: "long" },
                ),
              })}
            </AlertDescription>
          </Alert>
        )}
        {status === "toFix" && request.issue && (
          <Alert variant="destructive">
            <AlertTitle>{t(`issue.${request.issue}`)}</AlertTitle>
            <AlertDescription>
              {request.issueNote ?? t("issue.hint")}
            </AlertDescription>
          </Alert>
        )}
        {status === "disputed" && (
          <p className="text-muted-foreground text-sm">{t("disputedHint")}</p>
        )}
      </ItemContent>

      <ItemActions className="flex-wrap">
        {status === "toFix" && (
          <>
            <Button size="sm" render={<Link href={routes.beneficiaries} />}>
              {t("fixProfile")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={resolve.isPending}
              onClick={() => resolve.mutate({ id: request.id })}
            >
              {t("resolved")}
            </Button>
          </>
        )}
        {operation && status === "inProgress" && (
          <ConfirmAction
            trigger={<Button variant="outline" size="sm" />}
            title={t("withdrawTitle")}
            description={t("withdrawBody")}
            confirm={t("withdraw")}
            cancel={t("keep")}
            onConfirm={() => withdraw.mutate({ id: operation.id })}
          >
            {t("withdraw")}
          </ConfirmAction>
        )}
        {request.status === "OPEN" && !operation && (
          <>
            {status !== "toFix" && (
              <EditRequest request={request} refresh={refresh} />
            )}
            <ConfirmAction
              trigger={<Button variant="ghost" size="sm" />}
              title={t("elsewhereTitle", { name })}
              description={t("elsewhereBody")}
              confirm={t("elsewhere")}
              cancel={t("keep")}
              onConfirm={() => elsewhere.mutate({ id: request.id })}
            >
              {t("elsewhere")}
            </ConfirmAction>
            <ConfirmAction
              trigger={<Button variant="outline" size="sm" />}
              title={t("cancelTitle", { name })}
              description={t("cancelBody")}
              confirm={t("cancel")}
              cancel={t("keep")}
              destructive
              onConfirm={() => cancel.mutate({ id: request.id })}
            >
              {t("cancel")}
            </ConfirmAction>
          </>
        )}
      </ItemActions>
    </Item>
  );
}

const CHECKS = ["inbox", "spam", "tabs", "account", "warning"] as const;

/** The centre's email decides: confirm it, or contest after checking every usual hiding place. */
function BookingAnswer({
  operationId,
  email,
  refresh,
}: {
  operationId: string;
  email: string;
  refresh: () => void;
}) {
  const t = useTranslations("myRequests.answer");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);
  const answer = useMutation(
    trpc.operations.answer.mutationOptions({
      onSuccess: async (_, { answer }) => {
        track({
          name: answer === "confirm" ? "mail_confirmed" : "booking_disputed",
        });
        setOpen(false);
        await refresh();
        toast.success(answer === "confirm" ? t("confirmed") : t("disputed"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const complete = checked.length === CHECKS.length;

  return (
    <Alert>
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>
          {t("check")} <strong className="break-all">{email}</strong>
        </span>
        <span className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={answer.isPending}
            onClick={() =>
              answer.mutate({
                id: operationId,
                answer: "confirm",
                checked: false,
              })
            }
          >
            {t("received")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            {t("notReceived")}
          </Button>
        </span>
      </AlertDescription>
      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title={t("checklistTitle")}
        description={t("checklistHint")}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (complete)
              answer.mutate({
                id: operationId,
                answer: "dispute",
                checked: true,
              });
          }}
        >
          <FieldGroup>
            <FieldSet>
              {CHECKS.map((check) => (
                <Field key={check} orientation="horizontal">
                  <Checkbox
                    id={`check-${check}`}
                    checked={checked.includes(check)}
                    onCheckedChange={(value) =>
                      setChecked((current) =>
                        value
                          ? [...current, check]
                          : current.filter((item) => item !== check),
                      )
                    }
                  />
                  <FieldLabel
                    htmlFor={`check-${check}`}
                    className="font-normal"
                  >
                    {t(`checks.${check}`, { email })}
                  </FieldLabel>
                </Field>
              ))}
            </FieldSet>
            {!complete && (
              <p className="text-muted-foreground text-sm">{t("checkAll")}</p>
            )}
            <Button
              type="submit"
              variant="destructive"
              disabled={!complete || answer.isPending}
            >
              {t("dispute")}
            </Button>
          </FieldGroup>
        </form>
      </ResponsiveDialog>
    </Alert>
  );
}

/** Change the modules or raise the bonus of an open request nobody is working on. */
function EditRequest({
  request,
  refresh,
}: {
  request: MyRequest;
  refresh: () => void;
}) {
  const t = useTranslations("myRequests.edit");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const { offer } = request.session;
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState(request.modules);
  const [bonus, setBonus] = useState(request.bonus);
  const money = (amount: number) =>
    format.number(amount, {
      style: "currency",
      currency: request.currency,
      maximumFractionDigits: 0,
    });
  const update = useMutation(
    trpc.requests.update.mutationOptions({
      onSuccess: async () => {
        setOpen(false);
        await refresh();
        toast.success(t("saved"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const unchanged =
    bonus === request.bonus &&
    modules.length === request.modules.length &&
    modules.every((module) => request.modules.includes(module));

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {t("action")}
      </Button>
      <ResponsiveDialog open={open} onOpenChange={setOpen} title={t("title")}>
        <FieldGroup>
          <ModulesPicker
            available={offer.modules}
            value={modules}
            onChange={setModules}
          />
          {offer.bonusCap > 0 && (
            <BonusPicker
              offer={offer}
              value={bonus}
              onChange={setBonus}
              money={money}
              min={request.bonus}
            />
          )}
          <Button
            disabled={unchanged || !modules.length || update.isPending}
            onClick={() => update.mutate({ id: request.id, modules, bonus })}
          >
            {t("save")}
          </Button>
        </FieldGroup>
      </ResponsiveDialog>
    </>
  );
}
