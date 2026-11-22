"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { useTRPC } from "@/trpc/client";

/** The account holder's candidate profile at a glance; it is edited with the other beneficiaries. */
export function SelfProfileCard() {
  const t = useTranslations("candidateProfile");
  const trpc = useTRPC();
  const { data: beneficiaries } = useSuspenseQuery(
    trpc.beneficiaries.list.queryOptions(),
  );
  const self = beneficiaries.find((beneficiary) => beneficiary.isSelf);
  const ready = Boolean(self?.isReady);

  return (
    <Item variant="outline">
      <ItemMedia variant="icon">
        <UserIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="flex-wrap">
          {t("title")}
          <Badge variant={ready ? "outline" : "destructive"}>
            {ready ? t("ready") : t("incomplete")}
          </Badge>
        </ItemTitle>
        <ItemDescription>{ready ? self?.name : t("why")}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant={ready ? "outline" : "default"}
          size="sm"
          render={<Link href={routes.beneficiaries} />}
        >
          {ready ? t("edit") : t("complete")}
        </Button>
      </ItemActions>
    </Item>
  );
}
