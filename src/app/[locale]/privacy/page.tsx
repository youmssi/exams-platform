import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { LegalPage } from "@/components/legal-page";

export default function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  setRequestLocale(use(params).locale);
  return <LegalPage page="privacy" />;
}
