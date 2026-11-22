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
import { isAssistantReady } from "@/modules/assistants";
import { isSelfReady } from "@/modules/beneficiaries";
import { requireOnboardedUser } from "@/modules/identity";

/** Each role opens on its next step: complete the profile it needs, then the main task. */
async function Home() {
  const user = await requireOnboardedUser();
  const t = await getTranslations("homePage");
  const role = user.activeRole;
  const ready = await (role === "assistant"
    ? isAssistantReady(user.id)
    : isSelfReady(user.id));
  const step = ready ? "ready" : "setup";
  const href = ready
    ? role === "assistant"
      ? routes.queue
      : routes.sessions
    : role === "assistant"
      ? routes.account
      : routes.beneficiaries;

  return (
    <>
      <h1 className="font-semibold text-2xl">
        {t("title", { name: user.name })}
      </h1>
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>{t(`${role}.${step}.title`)}</EmptyTitle>
          <EmptyDescription>
            {t(`${role}.${step}.description`)}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href={href} />}>
            {t(`${role}.${step}.action`)}
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
