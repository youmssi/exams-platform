"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { WifiOffIcon } from "lucide-react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { PresenceBadge } from "@/components/presence-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { type LiveState, LiveUpdates } from "@/modules/realtime/client";
import { track } from "@/shared/analytics";
import { useTRPC } from "@/trpc/client";
import type { QueueRequest } from "./types";

const POLL_LIVE_MS = 60_000;
const POLL_FALLBACK_MS = 15_000;

/** Published requests, live. A taken or cancelled request disappears at once; new ones wait for a tap. */
export function QueueBoard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: trpc.requests.queue.queryKey() });

  return (
    <LiveUpdates source="queue" onChange={refresh}>
      {(state) => <Queue state={state} />}
    </LiveUpdates>
  );
}

function Queue({ state }: { state: LiveState }) {
  const t = useTranslations("queue");
  const trpc = useTRPC();
  const {
    data: { state: queueState, requests },
  } = useSuspenseQuery({
    ...trpc.requests.queue.queryOptions(),
    refetchInterval: state.live ? POLL_LIVE_MS : POLL_FALLBACK_MS,
    refetchOnWindowFocus: true,
  });

  // Rows already on screen keep their place; arrivals are announced, not inserted under the finger.
  const [seen, setSeen] = useState(
    () => new Set(requests.map((request) => request.id)),
  );
  const onScreen = requests.filter((request) => seen.has(request.id));
  const visible = onScreen.length ? onScreen : requests;
  const arrivals = requests.length - visible.length;

  const sessions = groupBySession(visible);

  if (queueState !== "open") {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>{t(`${queueState}.title`)}</EmptyTitle>
          <EmptyDescription>{t(`${queueState}.description`)}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            render={
              <Link
                href={queueState === "busy" ? routes.operation : routes.account}
              />
            }
          >
            {t(`${queueState}.action`)}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">
          {state.live ? t("live") : t("polling")}
        </p>
      </div>

      {state.offline && (
        <Alert variant="destructive">
          <WifiOffIcon />
          <AlertTitle>{t("offline.title")}</AlertTitle>
          <AlertDescription>{t("offline.description")}</AlertDescription>
        </Alert>
      )}

      <div aria-live="polite">
        {arrivals > 0 && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() =>
              setSeen(new Set(requests.map((request) => request.id)))
            }
          >
            {t("arrivals", { count: arrivals })}
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{t("empty.title")}</EmptyTitle>
            <EmptyDescription>{t("empty.description")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : sessions.length === 1 ? (
        <RequestList requests={sessions[0].requests} online={state.online} />
      ) : (
        <Tabs defaultValue={sessions[0].id}>
          <TabsList className="h-auto w-full flex-wrap justify-start">
            {sessions.map((session) => (
              <TabsTrigger key={session.id} value={session.id}>
                <SessionLabel request={session.requests[0]} />
                <Badge variant="secondary">{session.requests.length}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          {sessions.map((session) => (
            <TabsContent key={session.id} value={session.id}>
              <RequestList requests={session.requests} online={state.online} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

function groupBySession(requests: QueueRequest[]) {
  const sessions = new Map<string, QueueRequest[]>();
  for (const request of requests) {
    const list = sessions.get(request.session.id) ?? [];
    list.push(request);
    sessions.set(request.session.id, list);
  }
  return [...sessions].map(([id, list]) => ({ id, requests: list }));
}

function SessionLabel({ request }: { request: QueueRequest }) {
  const format = useFormatter();
  const { offer, examDate } = request.session;
  return (
    <>
      {offer.level} ·{" "}
      {format.dateTime(new Date(examDate), {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      })}
    </>
  );
}

function RequestList({
  requests,
  online,
}: {
  requests: QueueRequest[];
  online: ReadonlySet<string>;
}) {
  return (
    <ItemGroup>
      {requests.map((request) => (
        <RequestRow
          key={request.id}
          request={request}
          isOnline={online.has(request.candidateKey)}
        />
      ))}
    </ItemGroup>
  );
}

function RequestRow({
  request,
  isOnline,
}: {
  request: QueueRequest;
  isOnline: boolean;
}) {
  const t = useTranslations("queue");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const now = useNow({ updateInterval: 30_000 });
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const claim = useMutation(
    trpc.operations.claim.mutationOptions({
      onSuccess: () => {
        track({ name: "request_claimed", data: { bonus: request.bonus } });
        router.push(routes.operation);
      },
      onError: (error) => {
        if (error.message === "profileIncomplete") {
          toast.error(t("profileIncomplete.title"));
          router.push(routes.account);
          return;
        }
        if (error.message === "busy") {
          toast.error(t("errors.busy"));
          router.push(routes.operation);
          return;
        }
        toast.error(
          error.message === "alreadyTaken"
            ? t("errors.alreadyTaken")
            : tCommon("error"),
        );
        queryClient.invalidateQueries({
          queryKey: trpc.requests.queue.queryKey(),
        });
      },
    }),
  );
  const { offer } = request.session;
  const money = (amount: number) =>
    format.number(amount, {
      style: "currency",
      currency: request.currency,
      maximumFractionDigits: 0,
    });

  return (
    <Item variant="outline">
      <ItemContent className="min-w-0">
        <ItemTitle className="flex-wrap">
          {offer.center.name} · {offer.level}
          <PresenceBadge online={isOnline} />
        </ItemTitle>
        <ItemDescription className="line-clamp-none">
          {request.isFullExam ? t("fullExam") : request.modules.join(", ")} ·{" "}
          {format.dateTime(new Date(request.session.examDate), {
            dateStyle: "medium",
            timeZone: "UTC",
          })}
          <br />
          {t("publishedAgo", {
            ago: format.relativeTime(new Date(request.publishAt), now),
          })}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="flex-col items-end gap-1">
        <span className="font-semibold tabular-nums">
          {money(request.assistantShare)}
        </span>
        {request.bonus > 0 && (
          <Badge variant="secondary">
            {t("bonus", { bonus: money(request.bonus) })}
          </Badge>
        )}
        <Button
          size="sm"
          disabled={claim.isPending}
          onClick={() => claim.mutate({ id: request.id })}
        >
          {claim.isPending && <Spinner />}
          {t("claim")}
        </Button>
      </ItemActions>
    </Item>
  );
}
