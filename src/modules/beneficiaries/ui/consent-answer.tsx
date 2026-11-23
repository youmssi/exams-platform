"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { useTRPC } from "@/trpc/client";

/** The friend reads who asks and what for, then confirms or refuses in one tap. */
export function ConsentAnswer({ token }: { token: string }) {
  const t = useTranslations("consent");
  const tCommon = useTranslations("common");
  const trpc = useTRPC();
  const info = useQuery({
    ...trpc.beneficiaries.consentInfo.queryOptions({ token }),
    enabled: token.length > 0,
  });
  const answer = useMutation(
    trpc.beneficiaries.answerConsent.mutationOptions({
      onError: () => toast.error(tCommon("error")),
    }),
  );

  if (answer.isSuccess)
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle2Icon />
          </EmptyMedia>
          <EmptyTitle>
            {answer.variables.accept ? t("accepted.title") : t("refused.title")}
          </EmptyTitle>
          <EmptyDescription>
            {answer.variables.accept
              ? t("accepted.description")
              : t("refused.description")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  if (token && info.isPending) return <Skeleton className="h-64 w-full" />;
  if (!info.data)
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>{t("invalid.title")}</EmptyTitle>
          <EmptyDescription>{t("invalid.description")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );

  const { holder, name } = info.data;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title", { holder })}</CardTitle>
        <CardDescription>{t("description", { name })}</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        {t("data")}{" "}
        <Link href={routes.privacy} className="underline">
          {t("privacy")}
        </Link>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          className="w-full"
          disabled={answer.isPending}
          onClick={() => answer.mutate({ token, accept: true })}
        >
          {t("accept")}
        </Button>
        <ConfirmAction
          trigger={
            <Button
              variant="ghost"
              className="w-full"
              disabled={answer.isPending}
            />
          }
          title={t("refuseTitle")}
          description={t("refuseBody", { holder })}
          confirm={t("refuse")}
          cancel={t("back")}
          destructive
          onConfirm={() => answer.mutate({ token, accept: false })}
        >
          {t("refuse")}
        </ConfirmAction>
      </CardFooter>
    </Card>
  );
}
