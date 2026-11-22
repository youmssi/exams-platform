import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
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
