"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MonitorSmartphoneIcon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useState } from "react";
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
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { Link, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTRPC } from "@/trpc/client";
import { authClient } from "../auth-client";
import { ROLES, type Role } from "../schemas";

export function AccountSettings({ activeRole }: { activeRole: Role }) {
  const t = useTranslations("account");
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-2xl">{t("title")}</h1>
      <RoleCard activeRole={activeRole} />
      <LanguageCard />
      <DevicesCard />
    </div>
  );
}

function RoleCard({ activeRole }: { activeRole: Role }) {
  const t = useTranslations("account");
  const tWelcome = useTranslations("welcome");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const router = useRouter();
  const [role, setRole] = useState(activeRole);
  const save = useMutation(
    trpc.identity.setActiveRole.mutationOptions({
      onSuccess: () => {
        toast.success(t("roleSaved"));
        router.refresh();
      },
      onError: () => {
        setRole(activeRole);
        toast.error(tCommon("error"));
      },
    }),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("activeRole")}</CardTitle>
        <CardDescription>{t("activeRoleHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={role}
          onValueChange={(value) => {
            setRole(value as Role);
            save.mutate({ role: value as Role });
          }}
          disabled={save.isPending}
        >
          {ROLES.map((value) => (
            <FieldLabel key={value} htmlFor={`role-${value}`}>
              <Field orientation="horizontal">
                <RadioGroupItem value={value} id={`role-${value}`} />
                <FieldContent>
                  <FieldTitle>{tWelcome(`roles.${value}.title`)}</FieldTitle>
                  <FieldDescription>
                    {tWelcome(`roles.${value}.description`)}
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
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
                      {session.userAgent ?? t("unknownDevice")}
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
