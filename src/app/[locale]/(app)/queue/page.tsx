import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/config/routes";
import { redirect } from "@/i18n/navigation";
import { requireOnboardedUser } from "@/modules/identity";
import {
  AssistantPayments,
  DisputePanel,
  OperationPanel,
} from "@/modules/operations";
import { QueueBoard } from "@/modules/requests";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function QueueData({ params }: PageProps<"/[locale]/queue">) {
  await connection();
  const [{ locale }, user] = await Promise.all([
    params,
    requireOnboardedUser(),
  ]);
  if (user.activeRole !== "assistant") redirect({ href: routes.home, locale });
  prefetch(trpc.requests.queue.queryOptions());
  prefetch(trpc.operations.current.queryOptions());
  prefetch(trpc.operations.payments.queryOptions());
  prefetch(trpc.operations.dispute.queryOptions());
  return (
    <HydrateClient>
      <DisputePanel />
      <AssistantPayments />
      <QueueBoard operation={<OperationPanel />} />
    </HydrateClient>
  );
}

function QueueSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-8 w-48" />
      {[0, 1, 2].map((row) => (
        <Skeleton key={row} className="h-20 w-full" />
      ))}
    </div>
  );
}

export default function QueuePage(props: PageProps<"/[locale]/queue">) {
  return (
    <Suspense fallback={<QueueSkeleton />}>
      <QueueData {...props} />
    </Suspense>
  );
}
