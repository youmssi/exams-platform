"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  CalendarPlusIcon,
  CheckIcon,
  MessageSquarePlusIcon,
  SendIcon,
  UserIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
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
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { CatalogRequestForm, SessionForm } from "@/modules/catalog/client";
import { useTRPC } from "@/trpc/client";
import { requestedFor } from "../domain/live";
import { PublishForm } from "./publish-form";
import type { UpcomingSession } from "./types";

type Dialog =
  | { kind: "create" }
  | { kind: "catalogRequest" }
  | { kind: "publish"; session: UpcomingSession }
  | null;

/** Upcoming sessions: confirm them, add a missing one, or publish requests for one. */
export function SessionsBoard() {
  const t = useTranslations("sessions");
  const trpc = useTRPC();
  const { data: sessions } = useSuspenseQuery(
    trpc.catalog.sessions.queryOptions(),
  );
  const { data: beneficiaries } = useSuspenseQuery(
    trpc.beneficiaries.list.queryOptions(),
  );
  const { data: requests } = useSuspenseQuery(
    trpc.requests.mine.queryOptions(),
  );
  const selfReady = beneficiaries.some(
    (beneficiary) => beneficiary.isSelf && beneficiary.isReady,
  );
  const readyIds = beneficiaries
    .filter((beneficiary) => beneficiary.isReady)
    .map((beneficiary) => beneficiary.id);
  /** Every person ready to book already has a live request for this session. */
  const allRequested = (sessionId: string) => {
    const requested = requestedFor(requests, sessionId);
    return readyIds.length > 0 && readyIds.every((id) => requested.has(id));
  };
  const [dialog, setDialog] = useState<Dialog>(null);
  const [created, setCreated] = useState<string | null>(null);
  const close = () => setDialog(null);

  // After a session is created, publishing for it is the obvious next step.
  const createdSession =
    created && sessions.find((session) => session.id === created);
  if (createdSession) {
    setCreated(null);
    setDialog({ kind: "publish", session: createdSession });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </div>
        <Button variant="outline" onClick={() => setDialog({ kind: "create" })}>
          <CalendarPlusIcon />
          {t("create")}
        </Button>
      </div>

      {!selfReady && (
        <Alert>
          <UserIcon />
          <AlertTitle>{t("profile.title")}</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            {t("profile.description")}
            <Button size="sm" render={<Link href={routes.beneficiaries} />}>
              {t("profile.action")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {sessions.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{t("empty.title")}</EmptyTitle>
            <EmptyDescription>{t("empty.description")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row flex-wrap justify-center">
            <Button onClick={() => setDialog({ kind: "create" })}>
              {t("create")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDialog({ kind: "catalogRequest" })}
            >
              {t("requestAddition")}
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ItemGroup>
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              published={allRequested(session.id)}
              onPublish={() => setDialog({ kind: "publish", session })}
            />
          ))}
        </ItemGroup>
      )}

      {sessions.length > 0 && (
        <Button
          variant="link"
          className="self-start"
          onClick={() => setDialog({ kind: "catalogRequest" })}
        >
          <MessageSquarePlusIcon />
          {t("missingCentre")}
        </Button>
      )}

      <ResponsiveDialog
        open={dialog !== null}
        onOpenChange={(open) => !open && close()}
        title={dialog ? t(`dialogs.${dialog.kind}`) : ""}
      >
        {dialog?.kind === "create" && <SessionForm onDone={setCreated} />}
        {dialog?.kind === "catalogRequest" && (
          <CatalogRequestForm onDone={close} />
        )}
        {dialog?.kind === "publish" && (
          <PublishForm session={dialog.session} onDone={close} />
        )}
      </ResponsiveDialog>
    </div>
  );
}

function SessionItem({
  session,
  published,
  onPublish,
}: {
  session: UpcomingSession;
  /** Nothing left to publish for this session: the button says so and is disabled. */
  published: boolean;
  onPublish: () => void;
}) {
  const t = useTranslations("sessions");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { timeZone } = session.offer.center.country;
  const confirm = useMutation(
    trpc.catalog.confirmSession.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.catalog.sessions.queryKey(),
        });
        toast.success(t("confirmed"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );

  return (
    <Item variant="outline">
      <ItemContent className="min-w-0">
        <ItemTitle>
          {session.offer.center.name} · {session.offer.level}
        </ItemTitle>
        <div>
          {session.verifiedAt ? (
            <Badge variant="secondary">{t("verified")}</Badge>
          ) : (
            <Badge variant="outline">
              {t("unverified", { count: session.confirmationCount })}
            </Badge>
          )}
        </div>
        <ItemDescription className="line-clamp-none">
          {t("examOn", {
            date: format.dateTime(new Date(session.examDate), {
              dateStyle: "long",
              timeZone: "UTC",
            }),
          })}
          <br />
          {t("opensAt", {
            date: format.dateTime(new Date(session.registrationOpensAt), {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone,
              timeZoneName: "short",
            }),
          })}
        </ItemDescription>
      </ItemContent>
      <ItemActions className="w-full justify-end sm:w-auto">
        {session.canConfirm && (
          <Button
            variant="ghost"
            size="sm"
            disabled={confirm.isPending}
            onClick={() => confirm.mutate({ id: session.id })}
          >
            <CheckIcon />
            {t("confirm")}
          </Button>
        )}
        <Button size="sm" disabled={published} onClick={onPublish}>
          {published ? <CheckIcon /> : <SendIcon />}
          {published ? t("published") : t("publish")}
        </Button>
      </ItemActions>
    </Item>
  );
}
