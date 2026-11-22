import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

type Section = { title: string; body: string[] };

/** Terms and privacy share one layout; their text lives in `legal.<page>` messages. */
export function LegalPage({ page }: { page: "terms" | "privacy" }) {
  const t = useTranslations(`legal.${page}`);
  const tLegal = useTranslations("legal");
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-12">
      <Link href={routes.landing} aria-label="Exams">
        <Logo />
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-3xl">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">
          {tLegal("updated", { date: tLegal("updatedOn") })}
        </p>
      </header>
      {(t.raw("sections") as Section[]).map((section) => (
        <section key={section.title} className="flex flex-col gap-2">
          <h2 className="font-semibold text-lg">{section.title}</h2>
          {section.body.map((paragraph) => (
            <p
              key={paragraph}
              className="text-muted-foreground leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </section>
      ))}
      <nav className="flex flex-wrap gap-2">
        <Button variant="outline" render={<Link href={routes.landing} />}>
          {tLegal("back")}
        </Button>
        <Button
          variant="ghost"
          render={
            <Link href={page === "terms" ? routes.privacy : routes.terms} />
          }
        >
          {tLegal(page === "terms" ? "seePrivacy" : "seeTerms")}
        </Button>
      </nav>
    </main>
  );
}
