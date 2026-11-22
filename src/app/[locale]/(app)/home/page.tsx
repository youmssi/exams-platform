import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { requireOnboardedUser } from "@/modules/identity";

async function Home() {
  const user = await requireOnboardedUser();
  const t = await getTranslations("homePage");
  return (
    <>
      <h1 className="font-semibold text-2xl">
        {t("title", { name: user.name })}
      </h1>
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>{t(`${user.activeRole}.title`)}</EmptyTitle>
          <EmptyDescription>
            {t(`${user.activeRole}.description`)}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            render={
              <Link
                href={
                  user.activeRole === "assistant"
                    ? routes.queue
                    : routes.sessions
                }
              />
            }
          >
            {t(`${user.activeRole}.action`)}
          </Button>
        </EmptyContent>
      </Empty>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
