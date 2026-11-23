"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { useTRPC } from "@/trpc/client";

const REFRESH_MS = 30_000;

/** Each number leads to the list behind it; the time of the last update is always shown. */
export function AdminOverview() {
  const t = useTranslations("admin.overview");
  const format = useFormatter();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery({
    ...trpc.admin.overview.queryOptions(),
    refetchInterval: REFRESH_MS,
  });
  const operations = (filter: string) =>
    `${routes.adminOperations}?status=${filter}`;
  const cards = [
    { key: "published", value: data.published, href: routes.adminOperations },
    { key: "active", value: data.active, href: operations("active") },
    { key: "toConfirm", value: data.toConfirm, href: operations("toConfirm") },
    { key: "toPay", value: data.toPay, href: operations("toPay") },
    { key: "disputes", value: data.disputes, href: routes.adminDisputes },
    { key: "unpaid", value: data.unpaid, href: operations("unpaid") },
    { key: "assistants", value: data.assistants, href: routes.adminAssistants },
    { key: "reports", value: data.reports, href: routes.adminReports },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-semibold text-2xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {t("updatedAt", {
            time: format.dateTime(new Date(data.updatedAt), {
              timeStyle: "short",
            }),
          })}
          {" · "}
          {t("week", {
            count: data.requestsThisWeek,
            previous: data.requestsLastWeek,
          })}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="rounded-xl focus-visible:outline-2"
          >
            <Card
              size="sm"
              className="h-full transition-colors hover:bg-muted/50"
            >
              <CardHeader>
                <CardDescription>{t(`cards.${card.key}`)}</CardDescription>
                <CardTitle className="font-semibold text-2xl tabular-nums">
                  {card.value}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-muted-foreground text-xs">
                {t(`hints.${card.key}`)}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
