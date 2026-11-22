import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Logo } from "@/components/brand/logo";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  setRequestLocale(use(params).locale);
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <Link href={routes.landing} aria-label="Exams">
        <Logo />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
