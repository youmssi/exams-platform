"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DownloadIcon, SearchIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/confirm-action";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTRPC } from "@/trpc/client";
import { userQueryParam } from "../params";
import type { UserAction } from "../schemas";
import type { AdminUser } from "./types";

/** Find a user, see their role and standing, and act on the account with a named confirmation. */
export function AdminUsers() {
  const t = useTranslations("admin.users");
  const trpc = useTRPC();
  const [query, setQuery] = useQueryState(
    "q",
    userQueryParam.withOptions({ throttleMs: 400 }),
  );
  const { data: users = [] } = useQuery({
    ...trpc.admin.users.queryOptions({ query }),
    placeholderData: keepPreviousData,
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const open = users.find((user) => user.id === openId);

  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: "user",
      header: t("user"),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground text-xs">
            {row.original.email}
          </span>
        </div>
      ),
    },
    {
      id: "role",
      header: t("role"),
      cell: ({ row }) => <Standing user={row.original} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{t("manage")}</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpenId(row.original.id)}
          >
            {t("manage")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-2xl">{t("title")}</h1>
      <InputGroup className="max-w-md">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label={t("search")}
          placeholder={t("search")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </InputGroup>
      <DataTable columns={columns} data={users} empty={t("empty")} />
      <Sheet
        open={Boolean(open)}
        onOpenChange={(value) => !value && setOpenId(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {open && <UserSheet user={open} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/** Role, active space and restrictions, as badges readable without colour. */
function Standing({ user }: { user: AdminUser }) {
  const t = useTranslations("admin.users");
  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant="outline">
        {t(`roles.${user.role === "admin" ? "admin" : "user"}`)}
      </Badge>
      {user.verification && (
        <Badge variant="outline">
          {t(`verification.${user.verification}`)}
        </Badge>
      )}
      {user.strikes > 0 && (
        <Badge variant="secondary">
          {t("strikes", { count: user.strikes })}
        </Badge>
      )}
      {user.suspendedAt && (
        <Badge variant="destructive">{t("suspended")}</Badge>
      )}
      {user.banned && <Badge variant="destructive">{t("banned")}</Badge>}
    </div>
  );
}

function UserSheet({ user }: { user: AdminUser }) {
  const t = useTranslations("admin.users");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const act = useMutation(
    trpc.admin.userAction.mutationOptions({
      onSuccess: async (_, { action }) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.admin.users.queryKey(),
        });
        toast.success(t(`done.${action}`));
      },
      onError: () => toast.error(tCommon("error")),
    }),
  );
  const actions: { action: UserAction; show: boolean; destructive: boolean }[] =
    [
      { action: "suspend", show: !user.suspendedAt, destructive: true },
      {
        action: "unsuspend",
        show: Boolean(user.suspendedAt),
        destructive: false,
      },
      { action: "revokeSessions", show: true, destructive: true },
      { action: "ban", show: !user.banned, destructive: true },
      { action: "unban", show: Boolean(user.banned), destructive: false },
      { action: "delete", show: true, destructive: true },
    ];

  return (
    <>
      <SheetHeader>
        <SheetTitle>{user.name}</SheetTitle>
        <SheetDescription className="break-all">{user.email}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-6 px-4 pb-6">
        <Standing user={user} />
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <dt className="text-muted-foreground">{t("since")}</dt>
          <dd>
            {format.dateTime(new Date(user.createdAt), { dateStyle: "medium" })}
          </dd>
          <dt className="text-muted-foreground">{t("activeSpace")}</dt>
          <dd>
            {t(
              `spaces.${user.activeRole === "assistant" ? "assistant" : "candidate"}`,
            )}
          </dd>
          <dt className="text-muted-foreground">{t("permissions")}</dt>
          <dd>
            {user.role === "admin"
              ? t(user.twoFactorEnabled ? "adminWith2fa" : "adminWithout2fa")
              : t("userPermissions")}
          </dd>
          <dt className="text-muted-foreground">{t("activity")}</dt>
          <dd>
            {t("counts", {
              requests: user.requests,
              operations: user.operations,
            })}
          </dd>
        </dl>
        <Button
          variant="outline"
          render={
            // biome-ignore lint/a11y/useAnchorContent: the button renders its children inside the anchor.
            <a href={`/api/admin/export?userId=${user.id}`} download />
          }
        >
          <DownloadIcon />
          {t("export")}
        </Button>
        <div className="flex flex-col gap-2">
          {actions
            .filter((item) => item.show)
            .map(({ action, destructive }) => (
              <ConfirmAction
                key={action}
                trigger={
                  <Button
                    variant={destructive ? "outline" : "default"}
                    disabled={act.isPending}
                  />
                }
                title={t(`confirm.${action}.title`, { name: user.name })}
                description={t(`confirm.${action}.body`)}
                confirm={t(`actions.${action}`)}
                cancel={t("cancel")}
                destructive={destructive}
                onConfirm={() => act.mutate({ userId: user.id, action })}
              >
                {t(`actions.${action}`)}
              </ConfirmAction>
            ))}
        </div>
      </div>
    </>
  );
}
