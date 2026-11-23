import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminOperations, operationFilterParam } from "@/modules/admin";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Data({ searchParams }: PageProps<"/[locale]/admin/operations">) {
  await connection();
  const { status } = await searchParams;
  const filter = operationFilterParam.parseServerSide(status);
  prefetch(trpc.admin.operations.queryOptions({ filter }));
  return (
    <HydrateClient>
      <AdminOperations />
    </HydrateClient>
  );
}

export default function Page(props: PageProps<"/[locale]/admin/operations">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Data {...props} />
    </Suspense>
  );
}
