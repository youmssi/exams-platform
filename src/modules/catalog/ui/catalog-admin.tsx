"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/trpc/client";
import { CenterForm } from "./center-form";
import { CountryForm } from "./country-form";
import { OfferForm } from "./offer-form";
import type { AdminCenter, AdminCountry, AdminOffer } from "./types";

type Editing =
  | { kind: "country"; row?: AdminCountry }
  | { kind: "center"; row?: AdminCenter }
  | { kind: "offer"; row?: AdminOffer };

type Kind = Editing["kind"];
const TABS = [
  { kind: "offer", tab: "offers" },
  { kind: "center", tab: "centers" },
  { kind: "country", tab: "countries" },
] as const;

export function CatalogAdmin() {
  const t = useTranslations("admin.catalog");
  const locale = useLocale();
  const format = useFormatter();
  const trpc = useTRPC();
  const { data: countries } = useSuspenseQuery(
    trpc.catalog.adminList.queryOptions(),
  );
  const [tab, setTab] = useState<(typeof TABS)[number]["tab"]>("offers");
  const [editing, setEditing] = useState<Editing | null>(null);
  const close = () => setEditing(null);

  const countryName = new Intl.DisplayNames([locale], { type: "region" });
  const centers = countries.flatMap((country) =>
    country.centers.map((center) => ({
      ...center,
      currency: country.currency,
    })),
  );
  const offers = centers.flatMap((center) =>
    center.offers.map((offer) => ({
      ...offer,
      centerLabel: `${center.name} · ${center.city}`,
      currency: center.currency,
    })),
  );
  const money = (amount: number, currency: string) =>
    format.number(amount, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });

  const status = (active: boolean) => (
    <Badge variant={active ? "secondary" : "outline"}>
      {active ? t("active") : t("inactive")}
    </Badge>
  );
  const editButton = (label: string, onClick: () => void) => (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={`${t("edit")} ${label}`}
      onClick={onClick}
    >
      <PencilIcon />
    </Button>
  );

  const offerColumns: DataTableColumn<(typeof offers)[number]>[] = [
    { header: t("columns.center"), accessorKey: "centerLabel" },
    { header: t("columns.level"), accessorKey: "level" },
    {
      header: t("columns.price"),
      cell: ({ row }) =>
        money(row.original.standardPrice, row.original.currency),
    },
    {
      header: t("columns.commission"),
      cell: ({ row }) =>
        t("commissionValue", {
          percent: row.original.commissionRateBp / 100,
          min: money(row.original.commissionMin, row.original.currency),
        }),
    },
    {
      header: t("columns.bonusCap"),
      cell: ({ row }) => money(row.original.bonusCap, row.original.currency),
    },
    {
      header: t("columns.status"),
      cell: ({ row }) => status(row.original.active),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("columns.actions")}</span>,
      cell: ({ row }) =>
        editButton(`${row.original.centerLabel} ${row.original.level}`, () =>
          setEditing({ kind: "offer", row: row.original }),
        ),
    },
  ];

  const centerColumns: DataTableColumn<(typeof centers)[number]>[] = [
    { header: t("columns.center"), accessorKey: "name" },
    { header: t("columns.city"), accessorKey: "city" },
    {
      header: t("columns.country"),
      cell: ({ row }) =>
        countryName.of(
          countries.find((c) => c.id === row.original.countryId)?.code ?? "",
        ),
    },
    {
      header: t("columns.status"),
      cell: ({ row }) => status(row.original.active),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("columns.actions")}</span>,
      cell: ({ row }) =>
        editButton(row.original.name, () =>
          setEditing({ kind: "center", row: row.original }),
        ),
    },
  ];

  const countryColumns: DataTableColumn<AdminCountry>[] = [
    {
      header: t("columns.country"),
      cell: ({ row }) => countryName.of(row.original.code),
    },
    { header: t("columns.currency"), accessorKey: "currency" },
    { header: t("columns.timeZone"), accessorKey: "timeZone" },
    {
      header: t("columns.status"),
      cell: ({ row }) => status(row.original.active),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("columns.actions")}</span>,
      cell: ({ row }) =>
        editButton(countryName.of(row.original.code) ?? row.original.code, () =>
          setEditing({ kind: "country", row: row.original }),
        ),
    },
  ];

  const countryItems = countries.map((country) => ({
    value: country.id,
    label: countryName.of(country.code) ?? country.code,
  }));
  const centerItems = centers.map((center) => ({
    value: center.id,
    label: `${center.name} · ${center.city}`,
    currency: center.currency,
  }));

  // A level needs a centre, and a centre needs a country.
  const canAdd: Record<Kind, boolean> = {
    country: true,
    center: countries.length > 0,
    offer: centers.length > 0,
  };
  const current = TABS.find((entry) => entry.tab === tab) ?? TABS[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button
          disabled={!canAdd[current.kind]}
          onClick={() => setEditing({ kind: current.kind })}
        >
          <PlusIcon />
          {t(`add.${current.kind}`)}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          {TABS.map((entry) => (
            <TabsTrigger key={entry.tab} value={entry.tab}>
              {t(`tabs.${entry.tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="offers" className="overflow-x-auto">
          <DataTable
            columns={offerColumns}
            data={offers}
            empty={t("empty.offers")}
          />
        </TabsContent>
        <TabsContent value="centers" className="overflow-x-auto">
          <DataTable
            columns={centerColumns}
            data={centers}
            empty={t("empty.centers")}
          />
        </TabsContent>
        <TabsContent value="countries" className="overflow-x-auto">
          <DataTable
            columns={countryColumns}
            data={countries}
            empty={t("empty.countries")}
          />
        </TabsContent>
      </Tabs>

      <Sheet open={editing !== null} onOpenChange={(open) => !open && close()}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {editing && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {editing.row ? t("edit") : t(`add.${editing.kind}`)}
                </SheetTitle>
                <SheetDescription>
                  {t(`${editing.kind}.title`)}
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6">
                {editing.kind === "country" && (
                  <CountryForm country={editing.row} onSaved={close} />
                )}
                {editing.kind === "center" && (
                  <CenterForm
                    center={editing.row}
                    countries={countryItems}
                    onSaved={close}
                  />
                )}
                {editing.kind === "offer" && (
                  <OfferForm
                    offer={editing.row}
                    centers={centerItems}
                    onSaved={close}
                  />
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
