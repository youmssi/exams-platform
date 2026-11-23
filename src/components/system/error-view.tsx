"use client";

import * as Sentry from "@sentry/nextjs";
import { TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

/** Says what happened in plain words, offers to try again, and keeps the way home. */
export function ErrorView({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("system.error");
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <Empty className="min-h-[60svh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>{t("title")}</EmptyTitle>
        <EmptyDescription>
          {t("description")}
          {error.digest && (
            <span className="mt-2 block font-mono text-xs">
              {t("code", { code: error.digest })}
            </span>
          )}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button onClick={reset}>{t("retry")}</Button>
        <Button variant="outline" render={<Link href={routes.home} />}>
          {t("home")}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
