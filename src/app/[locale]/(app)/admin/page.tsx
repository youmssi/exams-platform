import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminOverview } from "@/modules/admin";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Data() {
  await connection();
  prefetch(trpc.admin.overview.queryOptions());
  return (
    <HydrateClient>
      <AdminOverview />
    </HydrateClient>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Data />
    </Suspense>
  );
}
