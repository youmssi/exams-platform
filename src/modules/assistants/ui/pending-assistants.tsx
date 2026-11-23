"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import type { PendingAssistant } from "./types";

/** Identity checks: the photo next to the name and Mobile Money holder, then validate or refuse. */
export function PendingAssistants() {
  const t = useTranslations("admin.assistants");
  const trpc = useTRPC();
  const { data: assistants } = useSuspenseQuery(
    trpc.assistants.pending.queryOptions(),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>
      {assistants.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{t("empty.title")}</EmptyTitle>
            <EmptyDescription>{t("empty.description")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup>
          {assistants.map((assistant) => (
            <AssistantRow key={assistant.userId} assistant={assistant} />
          ))}
        </ItemGroup>
      )}
    </div>
  );
}

function AssistantRow({ assistant }: { assistant: PendingAssistant }) {
  const t = useTranslations("admin.assistants");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [refusing, setRefusing] = useState(false);
  const [reason, setReason] = useState("");
  const review = useMutation(
    trpc.assistants.review.mutationOptions({
      onSuccess: async (_, { approve }) => {
        setRefusing(false);
        await queryClient.invalidateQueries({
          queryKey: trpc.assistants.pending.queryKey(),
        });
        toast.success(approve ? t("verified") : t("rejected"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );

  return (
    <Item variant="outline" className="flex-wrap items-start">
      {assistant.identityUrl && (
        <a href={assistant.identityUrl} target="_blank" rel="noreferrer">
          {/* biome-ignore lint/performance/noImgElement: private file streamed by /api/files */}
          <img
            src={assistant.identityUrl}
            alt={t("documentAlt", { name: assistant.name })}
            className="h-24 w-36 rounded-md border object-cover"
          />
        </a>
      )}
      <ItemContent className="min-w-0">
        <ItemTitle>{assistant.name}</ItemTitle>
        <ItemDescription className="line-clamp-none">
          {assistant.email} · {assistant.phone}
          <br />
          {t("momo", {
            operator: assistant.operator,
            number: assistant.momoNumber,
            name: assistant.momoName,
          })}
          {assistant.submittedAt && (
            <>
              <br />
              {format.dateTime(new Date(assistant.submittedAt), {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </>
          )}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          size="sm"
          variant="outline"
          disabled={review.isPending}
          onClick={() => setRefusing(true)}
        >
          {t("reject")}
        </Button>
        <Button
          size="sm"
          disabled={review.isPending}
          onClick={() =>
            review.mutate({
              userId: assistant.userId,
              approve: true,
              reason: "",
            })
          }
        >
          {t("verify")}
        </Button>
      </ItemActions>
      <ResponsiveDialog
        open={refusing}
        onOpenChange={setRefusing}
        title={t("rejectTitle", { name: assistant.name })}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`reason-${assistant.userId}`}>
              {t("reason")}
            </FieldLabel>
            <Textarea
              id={`reason-${assistant.userId}`}
              maxLength={200}
              placeholder={t("reasonHint")}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
          <Button
            variant="destructive"
            disabled={!reason.trim() || review.isPending}
            onClick={() =>
              review.mutate({
                userId: assistant.userId,
                approve: false,
                reason,
              })
            }
          >
            {t("reject")}
          </Button>
        </FieldGroup>
      </ResponsiveDialog>
    </Item>
  );
}
