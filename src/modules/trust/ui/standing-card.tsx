"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { site } from "@/config/site";
import { useTRPC } from "@/trpc/client";

/** Strikes before the suspension ("2 of 3"), each with its reason, and how to contest it. */
export function StandingCard() {
  const t = useTranslations("standing");
  const format = useFormatter();
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.trust.standing.queryOptions());

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        <CardAction>
          <Badge variant={data.count ? "destructive" : "secondary"}>
            {t("count", { count: data.count, threshold: data.threshold })}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {data.suspendedAt && (
          <Alert variant="destructive">
            <AlertTitle>{t("suspended.title")}</AlertTitle>
            <AlertDescription>
              {t("suspended.description", { email: site.contactEmail })}
            </AlertDescription>
          </Alert>
        )}
        {data.strikes.length > 0 && (
          <ItemGroup>
            {data.strikes.map((strike) => (
              <Item key={strike.id} variant="outline" size="sm">
                <ItemContent>
                  <ItemTitle>{t(`reasons.${strike.reason}`)}</ItemTitle>
                  <ItemDescription>
                    {format.dateTime(new Date(strike.createdAt), {
                      dateStyle: "medium",
                    })}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        )}
        {data.strikes.length > 0 && (
          <p className="text-muted-foreground text-sm">
            {t("contest", { email: site.contactEmail })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
