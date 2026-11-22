import { setRequestLocale } from "next-intl/server";
import { LandingPage } from "@/modules/landing";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingPage />;
}
