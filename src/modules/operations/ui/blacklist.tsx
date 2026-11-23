"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { useTRPC } from "@/trpc/client";

/** Accounts with an unpaid booking: public identifier, level and date only. */
export function Blacklist() {
  const t = useTranslations("blacklist");
  const format = useFormatter();
  const trpc = useTRPC();
  const { data: entries } = useSuspenseQuery(
    trpc.operations.blacklist.queryOptions(),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>
      {entries.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>{t("empty.title")}</EmptyTitle>
            <EmptyDescription>{t("empty.description")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup>
          {entries.map((entry) => (
            <Item key={entry.id} variant="outline">
              <ItemContent>
                <ItemTitle className="font-mono">{entry.account}</ItemTitle>
                <ItemDescription>
                  {entry.center} · {entry.level}
                  {entry.since &&
                    ` · ${t("since", {
                      date: format.dateTime(new Date(entry.since), {
                        dateStyle: "medium",
                      }),
                    })}`}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      )}
    </div>
  );
}
