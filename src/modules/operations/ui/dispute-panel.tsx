"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImageUpload } from "@/components/image-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { DisputeSteps } from "./dispute-steps";

/** The assistant's disputed booking: send a capture before the deadline, then wait for the decision. */
export function DisputePanel() {
  const t = useTranslations("dispute");
  const format = useFormatter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: dispute } = useSuspenseQuery(
    trpc.operations.dispute.queryOptions(),
  );
  const submit = useMutation(
    trpc.operations.submitProof.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.operations.dispute.queryKey(),
        });
        toast.success(t("proofSent"));
      },
    }),
  );
  if (!dispute) return null;
  const { offer, examDate } = dispute.operation.request.session;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("assistant.title")}</CardTitle>
        <CardDescription>
          {offer.center.name} · {offer.level} ·{" "}
          {format.dateTime(new Date(examDate), {
            dateStyle: "medium",
            timeZone: "UTC",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DisputeSteps status={dispute.status} />
        {dispute.status === "PROOF_REQUESTED" ? (
          <>
            <p className="text-sm">
              {t("assistant.proof", {
                date: format.dateTime(new Date(dispute.proofDueAt), {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
              })}
            </p>
            <ImageUpload
              folder={`proof/${dispute.id}`}
              onUploaded={(path) =>
                submit.mutateAsync({ id: dispute.id, path })
              }
            />
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t("assistant.review")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
