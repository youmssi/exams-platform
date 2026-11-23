import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminInbox } from "@/modules/admin";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Data() {
  await connection();
  prefetch(trpc.admin.inbox.queryOptions());
  return (
    <HydrateClient>
      <AdminInbox />
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
