"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { BriefcaseIcon, IdCardIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/image-upload";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { useTRPC } from "@/trpc/client";
import { AssistantProfileForm } from "./assistant-profile-form";

/** The assistant profile at a glance, completed or edited in a dialog, then the identity check. */
export function AssistantProfileCard() {
  const t = useTranslations("assistantProfile");
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.assistants.profile.queryOptions());
  const [open, setOpen] = useState(false);
  const ready = data.profile !== null;

  return (
    <>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <BriefcaseIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="flex-wrap">
            {t("title")}
            <Badge variant={ready ? "outline" : "destructive"}>
              {ready ? t("ready") : t("incomplete")}
            </Badge>
          </ItemTitle>
          <ItemDescription>
            {ready
              ? `${data.profile?.operator} · ${data.profile?.momoNumber}`
              : t("why")}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            variant={ready ? "outline" : "default"}
            size="sm"
            onClick={() => setOpen(true)}
          >
            {ready ? t("edit") : t("complete")}
          </Button>
        </ItemActions>
        <ResponsiveDialog open={open} onOpenChange={setOpen} title={t("title")}>
          <AssistantProfileForm data={data} onSaved={() => setOpen(false)} />
        </ResponsiveDialog>
      </Item>
      {data.profile && (
        <IdentityCheck
          userId={data.userId}
          status={data.profile.verification}
          reason={data.profile.rejectionReason}
        />
      )}
    </>
  );
}

const STATUS_BADGE = {
  NONE: "destructive",
  PENDING: "secondary",
  VERIFIED: "outline",
  REJECTED: "destructive",
} as const;

/**
 * What is checked and why, the usual delay, and the upload. A refusal says what to fix and lets
 * the assistant send a new photo.
 */
function IdentityCheck({
  userId,
  status,
  reason,
}: {
  userId: string;
  status: keyof typeof STATUS_BADGE;
  reason: string | null;
}) {
  const t = useTranslations("assistantProfile.identity");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const submit = useMutation(
    trpc.assistants.submitIdentity.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.assistants.profile.queryKey(),
        });
        toast.success(t("sent"));
      },
    }),
  );

  return (
    <Item variant="outline" className="flex-wrap">
      <ItemMedia variant="icon">
        <IdCardIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="flex-wrap">
          {t("title")}
          <Badge variant={STATUS_BADGE[status]}>{t(`status.${status}`)}</Badge>
        </ItemTitle>
        <ItemDescription className="line-clamp-none">
          {status === "REJECTED" && reason
            ? t("rejected", { reason })
            : t(`hint.${status}`)}
        </ItemDescription>
      </ItemContent>
      {status !== "VERIFIED" && (
        <div className="w-full">
          <ImageUpload
            folder={`identity/${userId}`}
            onUploaded={(path) => submit.mutateAsync({ path })}
          />
        </div>
      )}
    </Item>
  );
}
