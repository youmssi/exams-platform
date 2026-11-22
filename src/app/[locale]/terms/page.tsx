import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

type Section = { title: string; body: string };

export default function TermsPage({ params }: PageProps<"/[locale]/terms">) {
  setRequestLocale(use(params).locale);
  const t = useTranslations("legal");
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <h1 className="font-semibold text-3xl">{t("title")}</h1>
      <Alert>
        <AlertDescription>{t("draft")}</AlertDescription>
      </Alert>
      {(t.raw("sections") as Section[]).map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="font-semibold text-xl">{section.title}</h2>
          <p className="text-muted-foreground">{section.body}</p>
        </section>
      ))}
      <Button
        variant="outline"
        className="self-start"
        render={<Link href={routes.landing} />}
      >
        {t("back")}
      </Button>
    </main>
  );
}
