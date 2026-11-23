import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PendingAssistants } from "@/modules/assistants";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Pending() {
  await connection();
  prefetch(trpc.assistants.pending.queryOptions());
  return (
    <HydrateClient>
      <PendingAssistants />
    </HydrateClient>
  );
}

export default function AdminAssistantsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Pending />
    </Suspense>
  );
}
