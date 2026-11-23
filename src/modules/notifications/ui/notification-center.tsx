"use client";

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { BellIcon } from "lucide-react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { LiveUpdates } from "@/modules/realtime/client";
import { useTRPC } from "@/trpc/client";

const POLL_MS = 60_000;
const PAGES = {
  requests: routes.requests,
  queue: routes.queue,
  account: routes.account,
} as const;

/** The bell: unread count announced to screen readers, latest notifications, each leading to its page. */
export function NotificationCenter() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: trpc.notifications.list.queryKey(),
      }),
    [queryClient, trpc],
  );
  return (
    <LiveUpdates source="user" onChange={refresh}>
      {(state) => <Bell live={state.live} />}
    </LiveUpdates>
  );
}

function Bell({ live }: { live: boolean }) {
  const t = useTranslations("notifications");
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data } = useSuspenseQuery({
    ...trpc.notifications.list.queryOptions(),
    refetchInterval: live ? false : POLL_MS,
  });
  const markAll = useMutation(
    trpc.notifications.markAllRead.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.notifications.list.queryKey(),
        }),
    }),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={t("label", { count: data.unread })}
          />
        }
      >
        <BellIcon />
        {data.unread > 0 && (
          <Badge className="-top-1 -right-1 absolute h-4 min-w-4 px-1 text-[10px] tabular-nums">
            {data.unread > 9 ? "9+" : data.unread}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(22rem,calc(100vw-2rem))] p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <span className="font-medium text-sm">{t("title")}</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            disabled={!data.unread || markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            {t("markAllRead")}
          </Button>
        </div>
        {data.items.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>{t("empty.title")}</EmptyTitle>
              <EmptyDescription>{t("empty.description")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup className="max-h-96 gap-0 overflow-y-auto">
            {data.items.map((item) => (
              <Item
                key={item.id}
                size="sm"
                className="rounded-none border-b last:border-b-0"
                render={
                  <Link href={PAGES[item.to]} onClick={() => setOpen(false)} />
                }
              >
                <ItemContent>
                  <ItemTitle
                    className={item.readAt ? "font-normal" : undefined}
                  >
                    {!item.readAt && (
                      <span className="sr-only">{t("unread")}</span>
                    )}
                    {t(`types.${item.type}.title`, item.values)}
                  </ItemTitle>
                  <ItemDescription className="line-clamp-none">
                    {t(`types.${item.type}.body`, item.values)}
                  </ItemDescription>
                  <span className="text-muted-foreground text-xs">
                    {format.relativeTime(new Date(item.createdAt), now)}
                  </span>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        )}
      </PopoverContent>
    </Popover>
  );
}
