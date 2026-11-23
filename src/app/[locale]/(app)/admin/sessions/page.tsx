import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionReview } from "@/modules/catalog";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Review() {
  await connection();
  prefetch(trpc.catalog.sessionReview.queryOptions());
  return (
    <HydrateClient>
      <SessionReview />
    </HydrateClient>
  );
}

export default function AdminSessionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Review />
    </Suspense>
  );
}
