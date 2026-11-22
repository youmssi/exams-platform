"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { BriefcaseIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ResponsiveDialog } from "@/components/responsive-dialog";
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
import { useTRPC } from "@/trpc/client";
import { AssistantProfileForm } from "./assistant-profile-form";

/** The assistant profile at a glance, completed or edited in a dialog. */
export function AssistantProfileCard() {
  const t = useTranslations("assistantProfile");
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.assistants.profile.queryOptions());
  const [open, setOpen] = useState(false);
  const ready = data.profile !== null;

  return (
    <Item variant="outline">
      <ItemMedia variant="icon">
        <BriefcaseIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="flex-wrap">
          {t("title")}
          <Badge variant={ready ? "outline" : "destructive"}>
            {ready ? t("ready") : t("incomplete")}
          </Badge>
        </ItemTitle>
        <ItemDescription>
          {ready
            ? `${data.profile?.operator} · ${data.profile?.momoNumber}`
            : t("why")}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant={ready ? "outline" : "default"}
          size="sm"
          onClick={() => setOpen(true)}
        >
          {ready ? t("edit") : t("complete")}
        </Button>
      </ItemActions>
      <ResponsiveDialog open={open} onOpenChange={setOpen} title={t("title")}>
        <AssistantProfileForm data={data} onSaved={() => setOpen(false)} />
      </ResponsiveDialog>
    </Item>
  );
}
