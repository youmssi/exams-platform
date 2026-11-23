import { Suspense } from "react";
import { routes } from "@/config/routes";
import { redirect } from "@/i18n/navigation";
import { requireOnboardedUser } from "@/modules/identity";

/** Entry point after sign-in and role switch: each role lands on its own page. */
async function Home({ params }: PageProps<"/[locale]/home">) {
  const [{ locale }, user] = await Promise.all([
    params,
    requireOnboardedUser(),
  ]);
  return redirect({
    href: user.activeRole === "assistant" ? routes.queue : routes.sessions,
    locale,
  });
}

export default function HomePage(props: PageProps<"/[locale]/home">) {
  return (
    <Suspense>
      <Home {...props} />
    </Suspense>
  );
}
