import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { LegalPage } from "@/components/legal-page";

export default function TermsPage({ params }: PageProps<"/[locale]/terms">) {
  setRequestLocale(use(params).locale);
  return <LegalPage page="terms" />;
}
