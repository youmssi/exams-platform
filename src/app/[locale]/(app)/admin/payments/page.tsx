import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PlatformPayments } from "@/modules/operations";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Payments() {
  await connection();
  prefetch(trpc.operations.platformPayments.queryOptions());
  return (
    <HydrateClient>
      <PlatformPayments />
    </HydrateClient>
  );
}

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Payments />
    </Suspense>
  );
}
