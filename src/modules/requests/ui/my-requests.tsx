"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";
import { Countdown } from "@/components/countdown";
import { PresenceBadge } from "@/components/presence-badge";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
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
import { type LiveState, LiveUpdates } from "@/modules/realtime/client";
import { track } from "@/shared/analytics";
import { useTRPC } from "@/trpc/client";
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
  const trpc = useTRPC();
  const { data: requests } = useSuspenseQuery({
    ...trpc.requests.mine.queryOptions(),
    refetchInterval: state.live ? false : POLL_MS,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="font-semibold text-2xl">{t("title")}</h1>
        <Button render={<Link href={routes.sessions} />}>{t("new")}</Button>
      </div>
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
  const queryClient = useQueryClient();
  const cancel = useMutation(
    trpc.requests.cancel.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.requests.mine.queryKey(),
        });
        toast.success(t("cancelled"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const withdraw = useMutation(
    trpc.operations.withdraw.mutationOptions({
      onSuccess: async () => {
        track({ name: "candidate_withdrew" });
        await refresh();
        toast.success(t("withdrawn"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const { operation } = request;
  const status =
    request.status === "CANCELLED"
      ? "cancelled"
      : operation
        ? "inProgress"
        : request.visibility;
  const { offer } = request.session;

  return (
    <Item variant="outline">
      <ItemContent className="min-w-0">
        <ItemTitle className="flex-wrap">
          {request.beneficiaryName}
          <Badge
            variant={
              status === "published"
                ? "default"
                : status === "scheduled"
                  ? "secondary"
                  : "outline"
            }
          >
            {t(`status.${status}`)}
          </Badge>
          {operation && (
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
        {operation && (
          <Countdown
            start={new Date(operation.claimedAt)}
            end={new Date(operation.deadlineAt)}
            label={t("assistantOnIt")}
            onEnd={refresh}
          />
        )}
      </ItemContent>
      {operation ? (
        <ItemActions>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
              {t("withdraw")}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("withdrawTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("withdrawBody")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("keep")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => withdraw.mutate({ id: operation.id })}
                >
                  {t("withdraw")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ItemActions>
      ) : (
        request.status === "OPEN" && (
          <ItemActions>
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="outline" size="sm" />}
              >
                {t("cancel")}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("cancelTitle", { name: request.beneficiaryName })}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("cancelBody")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("keep")}</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => cancel.mutate({ id: request.id })}
                  >
                    {t("cancel")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </ItemActions>
        )
      )}
    </Item>
  );
}
