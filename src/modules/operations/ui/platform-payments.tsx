"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { track } from "@/shared/analytics";
import { useTRPC } from "@/trpc/client";
import { PaymentAnswer } from "./payment-answer";
import type { PaymentRow } from "./types";

/** Commissions still to receive: the admin confirms each declared one. */
export function PlatformPayments() {
  const t = useTranslations("payment");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: payments } = useSuspenseQuery(
    trpc.operations.platformPayments.queryOptions(),
  );
  const answer = useMutation(
    trpc.operations.answerPlatformPayment.mutationOptions({
      onSuccess: async (_, { received }) => {
        track({ name: received ? "payment_confirmed" : "payment_rejected" });
        await queryClient.invalidateQueries({
          queryKey: trpc.operations.platformPayments.queryKey(),
        });
        toast.success(received ? t("answer.thanks") : t("answer.sentBack"));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const columns: DataTableColumn<PaymentRow>[] = [
    {
      id: "reference",
      header: t("reference"),
      cell: ({ row }) => row.original.reference,
    },
    {
      id: "amount",
      header: t("amount"),
      cell: ({ row }) =>
        format.number(row.original.amount, {
          style: "currency",
          currency: row.original.currency,
          maximumFractionDigits: 0,
        }),
    },
    {
      id: "offer",
      header: t("offer"),
      cell: ({ row }) => `${row.original.center} · ${row.original.level}`,
    },
    {
      id: "due",
      header: t("dueAt"),
      cell: ({ row }) =>
        row.original.paymentDueAt &&
        format.dateTime(new Date(row.original.paymentDueAt), {
          dateStyle: "short",
          timeStyle: "short",
        }),
    },
    {
      id: "status",
      header: t("statusLabel"),
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.operationStatus === "UNPAID"
              ? "destructive"
              : "outline"
          }
        >
          {row.original.operationStatus === "UNPAID"
            ? t("unpaid.title")
            : t(`assistantStatus.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("actions")}</span>,
      cell: ({ row }) =>
        row.original.status === "DECLARED" && (
          <div className="flex justify-end gap-2">
            <PaymentAnswer
              pending={answer.isPending}
              onAnswer={(received) =>
                answer.mutate({ id: row.original.id, received })
              }
            />
          </div>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">{t("adminTitle")}</h1>
        <p className="text-muted-foreground text-sm">{t("adminSubtitle")}</p>
      </div>
      <DataTable columns={columns} data={payments} empty={t("adminEmpty")} />
    </div>
  );
}
