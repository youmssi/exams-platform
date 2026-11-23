import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminDisputes } from "@/modules/operations";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Disputes() {
  await connection();
  prefetch(trpc.operations.disputes.queryOptions());
  return (
    <HydrateClient>
      <AdminDisputes />
    </HydrateClient>
  );
}

export default function AdminDisputesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Disputes />
    </Suspense>
  );
}
