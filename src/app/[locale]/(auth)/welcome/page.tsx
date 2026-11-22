import { Suspense } from "react";
import { routes } from "@/config/routes";
import { redirect } from "@/i18n/navigation";
import { OnboardingForm, requireUser } from "@/modules/identity";

async function Welcome({ params }: PageProps<"/[locale]/welcome">) {
  const { locale } = await params;
  const user = await requireUser();
  if (user.termsAcceptedAt) redirect({ href: routes.home, locale });
  return <OnboardingForm defaultName={user.name} />;
}

export default function WelcomePage(props: PageProps<"/[locale]/welcome">) {
  return (
    <Suspense>
      <Welcome {...props} />
    </Suspense>
  );
}
