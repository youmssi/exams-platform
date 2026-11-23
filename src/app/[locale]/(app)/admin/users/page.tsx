import { connection } from "next/server";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminUsers, userQueryParam } from "@/modules/admin";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

async function Data({ searchParams }: PageProps<"/[locale]/admin/users">) {
  await connection();
  const { q } = await searchParams;
  prefetch(
    trpc.admin.users.queryOptions({ query: userQueryParam.parseServerSide(q) }),
  );
  return (
    <HydrateClient>
      <AdminUsers />
    </HydrateClient>
  );
}

export default function Page(props: PageProps<"/[locale]/admin/users">) {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <Data {...props} />
    </Suspense>
  );
}
