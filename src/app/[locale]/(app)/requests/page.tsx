import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MyRequests } from "@/modules/requests";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function RequestsData() {
  await connection();
  prefetch(trpc.requests.mine.queryOptions());
  return (
    <HydrateClient>
      <MyRequests />
    </HydrateClient>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <RequestsData />
    </Suspense>
  );
}
