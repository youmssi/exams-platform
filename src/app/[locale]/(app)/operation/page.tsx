import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { redirect } from "@/i18n/navigation";
import { requireOnboardedUser } from "@/modules/identity";
import { OperationPanel } from "@/modules/operations";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function OperationData({ params }: PageProps<"/[locale]/operation">) {
  await connection();
  const [{ locale }, user] = await Promise.all([
    params,
    requireOnboardedUser(),
  ]);
  if (user.activeRole !== "assistant") redirect({ href: routes.home, locale });
  prefetch(trpc.operations.current.queryOptions());
  return (
    <HydrateClient>
      <OperationPanel />
    </HydrateClient>
  );
}

export default function OperationPage(props: PageProps<"/[locale]/operation">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <OperationData {...props} />
    </Suspense>
  );
}
