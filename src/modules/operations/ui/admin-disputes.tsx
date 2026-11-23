"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/confirm-action";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { DisputeSteps } from "./dispute-steps";
import type { DisputeRow } from "./types";

/** Disputes waiting for a decision; each opens a sheet with the timeline, the proof and both parties. */
export function AdminDisputes() {
  const t = useTranslations("dispute.admin");
  const tDispute = useTranslations("dispute");
  const format = useFormatter();
  const trpc = useTRPC();
  const { data: disputes } = useSuspenseQuery(
    trpc.operations.disputes.queryOptions(),
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const open = disputes.find((dispute) => dispute.id === openId);

  const columns: DataTableColumn<DisputeRow>[] = [
    {
      id: "offer",
      header: t("offer"),
      cell: ({ row }) => `${row.original.center} · ${row.original.level}`,
    },
    {
      id: "opened",
      header: t("opened"),
      cell: ({ row }) =>
        format.dateTime(new Date(row.original.createdAt), {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      id: "status",
      header: t("status"),
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "REVIEW" ? "default" : "outline"}
        >
          {tDispute(`steps.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("open")}</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpenId(row.original.id)}
          >
            {t("open")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>
      <DataTable columns={columns} data={disputes} empty={t("empty")} />
      <Sheet
        open={Boolean(open)}
        onOpenChange={(value) => !value && setOpenId(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <DisputeSheet dispute={open} onDecided={() => setOpenId(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DisputeSheet({
  dispute,
  onDecided,
}: {
  dispute: DisputeRow;
  onDecided: () => void;
}) {
  const t = useTranslations("dispute.admin");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const decide = useMutation(
    trpc.operations.decideDispute.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.operations.disputes.queryKey(),
        });
        toast.success(t("decided"));
        onDecided();
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const when = (date: Date | string | null) =>
    date
      ? format.dateTime(new Date(date), {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "—";
  const timeline = [
    { key: "claimed", at: dispute.claimedAt },
    { key: "reserved", at: dispute.reservedAt },
    { key: "disputed", at: dispute.createdAt },
    { key: "proof", at: dispute.proofAt },
  ] as const;
  const decision = (outcome: "BOOKED" | "NOT_BOOKED") =>
    decide.mutate({ id: dispute.id, outcome, note });

  return (
    <>
      <SheetHeader>
        <SheetTitle>
          {dispute.center} · {dispute.level}
        </SheetTitle>
        <SheetDescription>
          {format.dateTime(new Date(dispute.examDate), {
            dateStyle: "long",
            timeZone: "UTC",
          })}{" "}
          ·{" "}
          {format.number(dispute.total, {
            style: "currency",
            currency: dispute.currency,
            maximumFractionDigits: 0,
          })}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-6 px-4 pb-6">
        <DisputeSteps status={dispute.status} />
        <section className="flex flex-col gap-2">
          <h3 className="font-medium text-sm">{t("timeline")}</h3>
          <dl className="grid grid-cols-2 gap-1 text-sm">
            {timeline.map(({ key, at }) => (
              <div key={key} className="contents">
                <dt className="text-muted-foreground">{t(`events.${key}`)}</dt>
                <dd>{when(at)}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground text-sm">
            {t("checklist", { email: dispute.bookingEmail })}
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h3 className="font-medium text-sm">{t("proof")}</h3>
          {dispute.proofUrl ? (
            <a href={dispute.proofUrl} target="_blank" rel="noreferrer">
              {/* biome-ignore lint/performance/noImgElement: private file streamed by /api/files */}
              <img
                src={dispute.proofUrl}
                alt={t("proofAlt")}
                className="max-h-80 w-full rounded-md border object-contain"
              />
            </a>
          ) : (
            <p className="text-muted-foreground text-sm">{t("noProof")}</p>
          )}
        </section>
        <section className="grid gap-3 sm:grid-cols-2">
          {(["candidate", "assistant"] as const).map((role) => (
            <div
              key={role}
              className="flex flex-col gap-1 rounded-md border p-3 text-sm"
            >
              <span className="text-muted-foreground">
                {t(`parties.${role}`)}
              </span>
              <span className="font-medium">{dispute[role].name}</span>
              <span className="break-all">{dispute[role].email}</span>
              <span>{t("strikes", { count: dispute[role].strikes })}</span>
            </div>
          ))}
        </section>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="decision-note">{t("note")}</FieldLabel>
            <Textarea
              id="decision-note"
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <ConfirmAction
              trigger={<Button disabled={decide.isPending} />}
              title={t("booked.title")}
              description={t("booked.body")}
              confirm={t("booked.action")}
              cancel={t("cancel")}
              onConfirm={() => decision("BOOKED")}
            >
              {t("booked.action")}
            </ConfirmAction>
            <ConfirmAction
              trigger={<Button variant="outline" disabled={decide.isPending} />}
              title={t("notBooked.title")}
              description={t("notBooked.body")}
              confirm={t("notBooked.action")}
              cancel={t("cancel")}
              destructive
              onConfirm={() => decision("NOT_BOOKED")}
            >
              {t("notBooked.action")}
            </ConfirmAction>
          </div>
        </FieldGroup>
      </div>
    </>
  );
}
