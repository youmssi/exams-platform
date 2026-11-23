import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { redirect } from "@/i18n/navigation";
import { requireOnboardedUser } from "@/modules/identity";
import { Blacklist } from "@/modules/operations";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function BlacklistData({ params }: PageProps<"/[locale]/blacklist">) {
  await connection();
  const [{ locale }, user] = await Promise.all([
    params,
    requireOnboardedUser(),
  ]);
  if (user.activeRole !== "assistant") redirect({ href: routes.home, locale });
  prefetch(trpc.operations.blacklist.queryOptions());
  return (
    <HydrateClient>
      <Blacklist />
    </HydrateClient>
  );
}

export default function BlacklistPage(props: PageProps<"/[locale]/blacklist">) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <BlacklistData {...props} />
    </Suspense>
  );
}
