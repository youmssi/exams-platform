"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MonitorSmartphoneIcon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { authClient } from "../auth-client";
import { deviceLabel } from "../domain/device";
import { TwoFactorCard } from "./two-factor-card";

type AccountSettingsProps = {
  /** Per-role profiles, composed by the page from their modules. */
  profiles: React.ReactNode;
  /** Admins manage their second factor here. */
  admin?: { twoFactorEnabled: boolean };
};

export function AccountSettings({ profiles, admin }: AccountSettingsProps) {
  const t = useTranslations("account");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-2xl">{t("title")}</h1>
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium">{t("profiles")}</h2>
          <p className="text-muted-foreground text-sm">{t("profilesHint")}</p>
        </div>
        <ItemGroup>{profiles}</ItemGroup>
      </section>
      {admin && <TwoFactorCard enabled={admin.twoFactorEnabled} />}
      <LanguageCard />
      <DevicesCard />
    </div>
  );
}

function LanguageCard() {
  const t = useTranslations("account");
  const current = useLocale();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("language")}</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        {routing.locales.map((locale) => (
          <Button
            key={locale}
            variant={locale === current ? "default" : "outline"}
            aria-current={locale === current ? "true" : undefined}
            render={<Link href={routes.account} locale={locale} />}
          >
            {t(`languages.${locale}`)}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function DevicesCard() {
  const t = useTranslations("account");
  const format = useFormatter();
  const queryClient = useQueryClient();
  const { data: current } = authClient.useSession();
  const sessions = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: async () => {
      const { data, error } = await authClient.listSessions();
      if (error) throw error;
      return data;
    },
  });
  const revoke = useMutation({
    mutationFn: (token: string) => authClient.revokeSession({ token }),
    onSuccess: () => {
      toast.success(t("deviceSignedOut"));
      queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("devices")}</CardTitle>
        <CardDescription>{t("devicesHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.isPending ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <ItemGroup>
            {sessions.data?.map((session) => {
              const isCurrent = session.token === current?.session.token;
              return (
                <Item key={session.id} variant="outline">
                  <ItemMedia variant="icon">
                    <MonitorSmartphoneIcon />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      {deviceLabel(session.userAgent) ?? t("unknownDevice")}
                      {isCurrent && (
                        <Badge variant="secondary">{t("thisDevice")}</Badge>
                      )}
                    </ItemTitle>
                    <ItemDescription>
                      {t("lastActive", {
                        date: format.dateTime(new Date(session.updatedAt), {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }),
                      })}
                    </ItemDescription>
                  </ItemContent>
                  {!isCurrent && (
                    <ItemActions>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={<Button variant="outline" size="sm" />}
                        >
                          {t("signOutDevice")}
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("confirmTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("confirmBody")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => revoke.mutate(session.token)}
                            >
                              {t("signOutDevice")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </ItemActions>
                  )}
                </Item>
              );
            })}
          </ItemGroup>
        )}
      </CardContent>
    </Card>
  );
}
