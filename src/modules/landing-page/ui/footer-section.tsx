import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/brand/logo";
import { routes } from "@/config/routes";
import { site } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { AnimatedWave } from "./animations";

/** Links by audience, legal pages, contact and language, over the dotted wave. */
export function FooterSection() {
  const t = useTranslations("landing");
  const columns = [
    {
      title: t("footer.product"),
      links: [
        { label: t("nav.howItWorks"), href: "#how-it-works" },
        { label: t("nav.pricing"), href: "#pricing" },
        { label: t("nav.faq"), href: "#faq" },
      ],
    },
    {
      title: t("footer.roles"),
      links: [
        { label: t("footer.candidates"), href: "#how-it-works" },
        { label: t("nav.assistants"), href: "#assistants" },
      ],
    },
  ];
  const linkClass =
    "text-muted-foreground text-sm transition-colors hover:text-foreground";

  return (
    <footer className="relative border-foreground/10 border-t">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden opacity-20">
        <AnimatedWave />
      </div>
      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-12 py-16 md:grid-cols-6 lg:gap-8 lg:py-24">
          <div className="col-span-2">
            <a href="#top" className="mb-6 inline-flex items-center gap-2">
              <LogoMark className="size-7" />
              <span className="font-display text-2xl">Exams</span>
            </a>
            <p className="max-w-xs text-muted-foreground leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-6 font-medium text-sm">{column.title}</h3>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="mb-6 font-medium text-sm">{t("footer.legal")}</h3>
            <ul className="space-y-4">
              <li>
                <Link href={routes.terms} className={linkClass}>
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href={routes.privacy} className={linkClass}>
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-6 font-medium text-sm">{t("footer.contact")}</h3>
            <a
              href={`mailto:${site.contactEmail}`}
              className={`${linkClass} break-all`}
            >
              {site.contactEmail}
            </a>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-foreground/10 border-t py-8 md:flex-row">
          <p className="text-muted-foreground text-sm">
            Exams · {t("footer.independent")}
          </p>
          <div className="flex gap-4 font-mono text-sm">
            {routing.locales.map((locale) => (
              <Link key={locale} href="/" locale={locale} className={linkClass}>
                {locale.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
