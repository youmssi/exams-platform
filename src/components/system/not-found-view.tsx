import { CompassIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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

/** A useful 404: two ways back, home and the requests. */
export function NotFoundView() {
  const t = useTranslations("system.notFound");
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Empty className="max-w-md">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CompassIcon />
          </EmptyMedia>
          <EmptyTitle>{t("title")}</EmptyTitle>
          <EmptyDescription>{t("description")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button render={<Link href={routes.requests} />}>
            {t("requests")}
          </Button>
          <Button variant="outline" render={<Link href={routes.landing} />}>
            {t("home")}
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
