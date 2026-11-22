import { Suspense } from "react";
import { safeNextPath } from "@/config/routes";
import { redirect } from "@/i18n/navigation";
import {
  enabledSocialProviders,
  getSession,
  SignInForm,
} from "@/modules/identity";

async function SignIn({
  params,
  searchParams,
}: PageProps<"/[locale]/sign-in">) {
  const [{ locale }, { next }] = await Promise.all([params, searchParams]);
  const nextPath = safeNextPath(typeof next === "string" ? next : null);
  if (await getSession()) redirect({ href: nextPath, locale });
  return <SignInForm providers={[...enabledSocialProviders]} next={nextPath} />;
}

export default function SignInPage(props: PageProps<"/[locale]/sign-in">) {
  return (
    <Suspense>
      <SignIn {...props} />
    </Suspense>
  );
}
