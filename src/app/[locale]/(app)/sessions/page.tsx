import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionsBoard } from "@/modules/requests";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function SessionsData() {
  await connection();
  prefetch(trpc.catalog.sessions.queryOptions());
  prefetch(trpc.catalog.offers.queryOptions());
  prefetch(trpc.beneficiaries.list.queryOptions());
  prefetch(trpc.requests.mine.queryOptions());
  return (
    <HydrateClient>
      <SessionsBoard />
    </HydrateClient>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <SessionsData />
    </Suspense>
  );
}
