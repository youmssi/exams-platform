"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";
import { operationFilterParam } from "../params";
import { OPERATION_FILTERS } from "../schemas";
import type { AdminOperation } from "./types";

/** Operations by status (filter kept in the URL), each with its complete history in a sheet. */
export function AdminOperations() {
  const t = useTranslations("admin.operations");
  const format = useFormatter();
  const trpc = useTRPC();
  const [filter, setFilter] = useQueryState("status", operationFilterParam);
  const { data: operations } = useSuspenseQuery(
    trpc.admin.operations.queryOptions({ filter }),
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const open = operations.find((operation) => operation.id === openId);
  const when = (date: Date | string) =>
    format.dateTime(new Date(date), { dateStyle: "short", timeStyle: "short" });

  const columns: DataTableColumn<AdminOperation>[] = [
    {
      id: "reference",
      header: t("reference"),
      cell: ({ row }) => row.original.reference,
    },
    {
      id: "offer",
      header: t("offer"),
      cell: ({ row }) => `${row.original.center} · ${row.original.level}`,
    },
    {
      id: "status",
      header: t("status"),
      cell: ({ row }) => (
        <Badge variant="outline">{t(`statuses.${row.original.status}`)}</Badge>
      ),
    },
    {
      id: "claimed",
      header: t("claimed"),
      cell: ({ row }) => when(row.original.claimedAt),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("details")}</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpenId(row.original.id)}
          >
            {t("details")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-2xl">{t("title")}</h1>
      <Tabs value={filter} onValueChange={(value) => setFilter(value)}>
        <TabsList className="h-auto w-full flex-wrap justify-start">
          {OPERATION_FILTERS.map((value) => (
            <TabsTrigger key={value} value={value}>
              {t(`filters.${value}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DataTable columns={columns} data={operations} empty={t("empty")} />
      <Sheet
        open={Boolean(open)}
        onOpenChange={(value) => !value && setOpenId(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {open.reference} · {open.center} · {open.level}
                </SheetTitle>
                <SheetDescription>
                  {format.number(open.total, {
                    style: "currency",
                    currency: open.currency,
                    maximumFractionDigits: 0,
                  })}
                </SheetDescription>
              </SheetHeader>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 pb-6 text-sm">
                <dt className="text-muted-foreground">{t("candidate")}</dt>
                <dd className="break-all">{open.candidate}</dd>
                <dt className="text-muted-foreground">{t("assistant")}</dt>
                <dd className="break-all">{open.assistant}</dd>
                {(
                  [
                    ["claimed", open.claimedAt],
                    ["reserved", open.reservedAt],
                    ["confirmed", open.confirmedAt],
                    ["paymentDue", open.paymentDueAt],
                    ["closed", open.closedAt],
                    ["ended", open.endedAt],
                  ] as const
                )
                  .filter(([, date]) => date)
                  .map(([key, date]) => (
                    <div key={key} className="contents">
                      <dt className="text-muted-foreground">{t(key)}</dt>
                      <dd>{when(date as Date)}</dd>
                    </div>
                  ))}
                {open.payments.map((payment) => (
                  <div key={payment.recipient} className="contents">
                    <dt className="text-muted-foreground">
                      {t(`payments.${payment.recipient}`)}
                    </dt>
                    <dd>{t(`paymentStatus.${payment.status}`)}</dd>
                  </div>
                ))}
                {open.history.map((entry) => (
                  <div
                    key={`${entry.action}-${entry.createdAt}`}
                    className="contents"
                  >
                    <dt className="text-muted-foreground">{entry.action}</dt>
                    <dd>{when(entry.createdAt)}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
