import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { getSession } from "@/modules/identity";

/** Signed-in visitors go straight back to the app (home sends them on to onboarding if needed). */
async function StartButton() {
  const session = await getSession();
  const t = await getTranslations("home");
  return session ? (
    <Button size="lg" render={<Link href={routes.home} />}>
      {t("continue")}
    </Button>
  ) : (
    <Button size="lg" render={<Link href={routes.signIn} />}>
      {t("cta")}
    </Button>
  );
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-6 px-4 py-16">
      <Logo />
      <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      <Suspense
        fallback={
          <Button size="lg" render={<Link href={routes.signIn} />}>
            {t("cta")}
          </Button>
        }
      >
        <StartButton />
      </Suspense>
    </main>
  );
}
