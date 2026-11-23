"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { useTRPC } from "@/trpc/client";
import type { AuditEntry } from "./types";

/** Every admin action and every sensitive read, newest first. */
export function AdminAudit() {
  const t = useTranslations("admin.audit");
  const format = useFormatter();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.admin.audit.queryOptions());
  const columns: DataTableColumn<AuditEntry>[] = [
    {
      id: "when",
      header: t("when"),
      cell: ({ row }) =>
        format.dateTime(new Date(row.original.createdAt), {
          dateStyle: "short",
          timeStyle: "medium",
        }),
    },
    { id: "actor", header: t("actor"), cell: ({ row }) => row.original.actor },
    {
      id: "action",
      header: t("action"),
      cell: ({ row }) => row.original.action,
    },
    {
      id: "target",
      header: t("target"),
      cell: ({ row }) =>
        `${row.original.targetType} · ${row.original.targetId}`,
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>
      <DataTable columns={columns} data={data} empty={t("empty")} />
    </div>
  );
}
