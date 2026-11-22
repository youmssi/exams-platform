import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ResetPasswordForm } from "@/modules/identity";

export default function ResetPasswordPage({
  params,
}: PageProps<"/[locale]/reset-password">) {
  setRequestLocale(use(params).locale);
  return <ResetPasswordForm />;
}
