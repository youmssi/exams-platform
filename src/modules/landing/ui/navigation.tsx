"use client";

import { MenuIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

const LINKS = [
  { key: "howItWorks", href: "#how-it-works" },
  { key: "assistants", href: "#assistants" },
  { key: "security", href: "#security" },
  { key: "pricing", href: "#pricing" },
  { key: "faq", href: "#faq" },
] as const;

/** Transparent bar that floats into a pill on scroll; a full-height sheet on phones. */
export function Navigation({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("landing.nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primary = signedIn
    ? { href: routes.home, label: t("continue") }
    : { href: routes.signIn, label: t("start") };

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${scrolled ? "inset-x-4 top-4" : "inset-x-0 top-0"}`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          scrolled
            ? "max-w-[1200px] rounded-2xl border border-foreground/10 bg-background/80 shadow-lg backdrop-blur-xl"
            : "max-w-[1400px] bg-transparent"
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 transition-all duration-500 lg:px-8 ${scrolled ? "h-14" : "h-20"}`}
        >
          <a href="#top" className="flex items-center gap-2">
            <LogoMark className={scrolled ? "size-6" : "size-7"} />
            <span
              className={`font-display tracking-tight transition-all duration-500 ${scrolled ? "text-xl" : "text-2xl"}`}
            >
              Exams
            </span>
          </a>

          <div className="hidden items-center gap-10 md:flex">
            {LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="group relative text-foreground/70 text-sm transition-colors hover:text-foreground"
              >
                {t(link.key)}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {!signedIn && (
              <Link
                href={routes.signIn}
                className="text-foreground/70 text-sm transition-colors hover:text-foreground"
              >
                {t("signIn")}
              </Link>
            )}
            <Button
              size="sm"
              className="rounded-full px-5"
              render={<Link href={primary.href} />}
            >
              {primary.label}
            </Button>
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label={t("menu")}
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent
              side="top"
              className="landing h-svh gap-0 px-8 pt-20 pb-8"
            >
              <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
              <div className="flex flex-1 flex-col justify-center gap-8">
                {LINKS.map((link) => (
                  <SheetClose
                    key={link.key}
                    render={
                      // biome-ignore lint/a11y/useAnchorContent: SheetClose renders the label inside the anchor.
                      <a
                        href={link.href}
                        className="text-left font-display text-5xl hover:text-muted-foreground"
                      />
                    }
                  >
                    {t(link.key)}
                  </SheetClose>
                ))}
              </div>
              <div className="flex gap-4 border-foreground/10 border-t pt-8">
                {!signedIn && (
                  <Button
                    variant="outline"
                    className="h-14 flex-1 rounded-full text-base"
                    render={<Link href={routes.signIn} />}
                  >
                    {t("signIn")}
                  </Button>
                )}
                <Button
                  className="h-14 flex-1 rounded-full text-base"
                  render={<Link href={primary.href} />}
                >
                  {primary.label}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
