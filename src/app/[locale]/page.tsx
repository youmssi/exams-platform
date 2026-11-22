import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { LandingPage } from "@/modules/landing-page";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={null}>
      <LandingPage />
    </Suspense>
  );
}
